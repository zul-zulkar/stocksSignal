#!/usr/bin/env python3
"""
ai_provider.py
==============
Antarmuka tipis ke model bahasa, supaya ai_brief.py tidak pernah menyentuh
SDK mana pun secara langsung.

Alasannya konkret, bukan abstraksi spekulatif: rencana jangka menengahnya
adalah memindahkan pembuatan brief massal ke LLM lokal (Ollama) supaya biaya
marginal per ticker jadi nol. Dengan lapisan ini, perpindahan itu cuma
menambah satu kelas di berkas ini — bukan membongkar pipeline.

Provider yang ada sekarang:
    anthropic  – Claude lewat SDK resmi (Haiku 4.5 massal, Sonnet 5 top-N)
    null       – tidak memanggil apa pun; dipakai pengujian dan saat tidak
                 ada API key, sehingga pipeline tetap jalan dan UI jatuh ke
                 narasi deterministik js/narrate.js

Kontrak yang wajib dipenuhi setiap provider: memulangkan dict yang SUDAH
cocok dengan schema, atau None. Tidak pernah prosa mentah, tidak pernah JSON
setengah jadi. Pemanggil tidak boleh perlu tahu model mana yang menjawab.
"""

from __future__ import annotations

import json
import os
import sys
import time
from typing import Optional

# Model default per tingkat. Haiku menangani volume (984 ticker), Sonnet
# menangani saham yang benar-benar dipertimbangkan pengguna. Tugasnya adalah
# merangkum angka yang SUDAH disodorkan — bukan menalar dari nol — dan itu
# pekerjaan yang paling ekonomis di model kecil.
BULK_MODEL = "claude-haiku-4-5"
TOP_MODEL = "claude-sonnet-5"

MAX_TOKENS = 1400          # brief terstruktur; bukan esai
BATCH_POLL_SECONDS = 20
BATCH_MAX_WAIT_SECONDS = 60 * 60


class ProviderError(RuntimeError):
    pass


class NullProvider:
    """
    Tidak memanggil apa pun. Bukan sekadar test double: inilah yang membuat
    pipeline tetap berjalan mulus tanpa API key, alih-alih gagal.
    """

    name = "null"
    available = True

    def brief(self, payload: dict, schema: dict, model: Optional[str] = None) -> Optional[dict]:
        return None

    def batch(self, payloads: dict, schema: dict, model: Optional[str] = None) -> dict:
        return {}


class AnthropicProvider:
    """
    Claude lewat SDK resmi.

    Dua jalur: ``batch()`` untuk volume (Batch API, harga separuh, dan
    pipeline ini memang tidak sensitif latensi) dan ``brief()`` untuk satuan.
    """

    name = "anthropic"

    def __init__(self, system_prompt: str, api_key: Optional[str] = None):
        self.system_prompt = system_prompt
        self._client = None
        self._key = api_key or os.environ.get("ANTHROPIC_API_KEY")

    @property
    def available(self) -> bool:
        return bool(self._key)

    def _get_client(self):
        if self._client is None:
            try:
                import anthropic
            except ImportError as exc:
                raise ProviderError(
                    "SDK anthropic belum terpasang — pip install -r requirements.txt"
                ) from exc
            self._client = anthropic.Anthropic(api_key=self._key)
        return self._client

    def _request_params(self, payload: dict, schema: dict, model: str) -> dict:
        params = {
            "model": model,
            "max_tokens": MAX_TOKENS,
            # System prompt identik di seluruh request, jadi di-cache: ia
            # dikirim 984 kali per run dan hanya perlu dibayar penuh sekali.
            "system": [{
                "type": "text",
                "text": self.system_prompt,
                "cache_control": {"type": "ephemeral"},
            }],
            "messages": [{"role": "user", "content": json.dumps(payload, ensure_ascii=False)}],
            # Bentuk keluaran dipaksa schema, bukan diminta lewat prosa.
            # Tanpa ini, parsing JSON dari teks bebas jadi sumber kegagalan
            # yang paling sering dan paling membosankan.
            "output_config": {"format": {"type": "json_schema", "schema": schema}},
        }
        # Sonnet 5 menjalankan adaptive thinking secara default. Untuk tugas
        # merangkum angka yang sudah lengkap, itu biaya dan latensi tanpa
        # imbalan — jadi dimatikan dan effort diturunkan.
        if model.startswith("claude-sonnet-5") or model.startswith("claude-opus"):
            params["thinking"] = {"type": "disabled"}
            params["output_config"]["effort"] = "low"
        return params

    def brief(self, payload: dict, schema: dict, model: Optional[str] = None) -> Optional[dict]:
        client = self._get_client()
        model = model or BULK_MODEL
        try:
            resp = client.messages.create(**self._request_params(payload, schema, model))
        except Exception as exc:  # noqa: BLE001 — satu ticker gagal jangan jatuhkan run
            print(f"  ! AI gagal: {exc}", file=sys.stderr)
            return None
        return _parse_response(resp)

    def batch(self, payloads: dict, schema: dict, model: Optional[str] = None) -> dict:
        """
        Kirim banyak ticker sekaligus lewat Batch API (diskon 50%).

        Memulangkan {ticker: brief}. Ticker yang gagal cukup dihilangkan —
        pemanggil sudah menyiapkan narasi deterministik sebagai cadangan.
        """
        if not payloads:
            return {}
        client = self._get_client()
        model = model or BULK_MODEL

        from anthropic.types.message_create_params import MessageCreateParamsNonStreaming
        from anthropic.types.messages.batch_create_params import Request

        requests = [
            Request(
                custom_id=ticker,
                params=MessageCreateParamsNonStreaming(
                    **self._request_params(payload, schema, model)
                ),
            )
            for ticker, payload in payloads.items()
        ]

        batch = client.messages.batches.create(requests=requests)
        print(f"  Batch {batch.id} dikirim ({len(requests)} ticker, model {model})…")

        waited = 0
        while True:
            state = client.messages.batches.retrieve(batch.id)
            if state.processing_status == "ended":
                break
            if waited >= BATCH_MAX_WAIT_SECONDS:
                print(f"  ! batch {batch.id} melewati batas tunggu; dilewati", file=sys.stderr)
                return {}
            time.sleep(BATCH_POLL_SECONDS)
            waited += BATCH_POLL_SECONDS

        out = {}
        for result in client.messages.batches.results(batch.id):
            # Hasil batch datang dalam urutan acak — selalu dikunci custom_id,
            # tidak pernah posisi.
            if result.result.type != "succeeded":
                continue
            parsed = _parse_response(result.result.message)
            if parsed is not None:
                out[result.custom_id] = parsed
        print(f"  Batch selesai: {len(out)}/{len(requests)} berhasil.")
        return out


def _parse_response(message) -> Optional[dict]:
    """Ambil blok teks pertama dan uraikan sebagai JSON."""
    if message is None:
        return None
    # Klasifikator keamanan bisa menolak; cek stop_reason sebelum membaca isi,
    # kalau tidak indexing content[0] akan meledak.
    if getattr(message, "stop_reason", None) == "refusal":
        return None
    try:
        text = next(b.text for b in message.content if b.type == "text")
        return json.loads(text)
    except (StopIteration, AttributeError, json.JSONDecodeError, TypeError):
        return None


def get_provider(name: str, system_prompt: str) -> object:
    """
    Pilih provider berdasar nama.

    Di sinilah LocalProvider (Ollama) akan menyambung nanti — satu cabang
    tambahan, tanpa menyentuh ai_brief.py sama sekali.
    """
    name = (name or "").lower()
    if name in ("null", "none", "off"):
        return NullProvider()
    if name in ("", "anthropic", "claude"):
        return AnthropicProvider(system_prompt)
    raise ProviderError(f"provider tidak dikenal: {name}")
