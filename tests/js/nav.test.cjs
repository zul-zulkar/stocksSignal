// Uji js/nav.js — sumber tunggal daftar view.
//
// Yang diuji di sini adalah hal yang dulu bisa rusak diam-diam: sebelum
// berkas ini ada, segmented tab dan bottom-nav adalah dua markup terpisah
// yang disinkronkan manual, jadi keduanya bisa menyorot view yang berbeda
// tanpa satu pun error muncul.

const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load } = require("./_loader.cjs");

function lib() {
  const c = makeWindow();
  load(c, "js/nav.js");
  return c.window.NAV_LIB;
}

// ── config ───────────────────────────────────────────────────────────

test("keempat view punya semua bidang yang dipakai UI", () => {
  const N = lib();
  assert.strictEqual(N.VIEWS.length, 4);
  for (const v of N.VIEWS) {
    for (const k of ["id", "ico", "label", "info", "sort"]) {
      assert.ok(v[k], `view ${v.id} kehilangan ${k}`);
    }
    assert.ok(v.sort.key && v.sort.dir, `view ${v.id}: sort tidak lengkap`);
  }
});

test("id-nya unik", () => {
  const N = lib();
  assert.strictEqual(new Set(N.ids()).size, N.VIEWS.length);
});

test("has() menolak view yang tidak ada", () => {
  const N = lib();
  assert.ok(N.has("watchlist"));
  assert.ok(!N.has("tidakada"));
  assert.ok(!N.has(""));
  assert.ok(!N.has(undefined));
});

test("info dan sort dipulangkan per view, dengan default yang aman", () => {
  const N = lib();
  assert.match(N.infoFor("dividen"), /dividen|yield/i);
  assert.deepStrictEqual({ ...N.sortFor("peluang") }, { key: "action", dir: "desc" });
  // View tak dikenal tidak boleh membuat pemanggil meledak.
  assert.strictEqual(N.infoFor("tidakada"), "");
  assert.deepStrictEqual({ ...N.sortFor("tidakada") }, { key: "adjScore", dir: "desc" });
});

// ── dua navigasi, satu sumber ────────────────────────────────────────

test("kedua navigasi menghasilkan view yang sama dengan urutan sama", () => {
  const N = lib();
  const tabs = [...N.tabSpecs("all").map((s) => s.id)];
  const bn = [...N.navSpecs("all").map((s) => s.id)];
  assert.deepStrictEqual(tabs, bn);
  assert.deepStrictEqual(tabs, [...N.ids()]);
});

test("view aktif tersorot di kedua navigasi sekaligus", () => {
  // Inti berkas ini. Dulu dua markup terpisah bisa menyorot view berbeda.
  const N = lib();
  for (const id of N.ids()) {
    const tab = N.tabSpecs(id).filter((s) => s.active);
    const nav = N.navSpecs(id).filter((s) => s.active);
    assert.strictEqual(tab.length, 1, id);
    assert.strictEqual(nav.length, 1, id);
    assert.strictEqual(tab[0].id, id);
    assert.strictEqual(nav[0].id, id);
  }
});

test("view tak dikenal tidak menyorot apa pun, bukan menyorot yang pertama", () => {
  const N = lib();
  assert.strictEqual(N.tabSpecs("tidakada").filter((s) => s.active).length, 0);
  assert.strictEqual(N.navSpecs("tidakada").filter((s) => s.active).length, 0);
});

// ── aksesibilitas ────────────────────────────────────────────────────

test("hanya tab aktif yang bisa dicapai Tab (roving tabindex)", () => {
  const N = lib();
  const specs = N.tabSpecs("watchlist");
  assert.deepStrictEqual(
    [...specs.map((s) => s.tabindex)],
    ["-1", "-1", "0", "-1"]
  );
});

test("aria-selected mengikuti status aktif", () => {
  const N = lib();
  for (const s of N.tabSpecs("dividen")) {
    assert.strictEqual(s.ariaSelected, s.active ? "true" : "false", s.id);
  }
});

// ── navigasi panah ───────────────────────────────────────────────────

test("panah berpindah satu langkah ke arah yang diminta", () => {
  const N = lib();
  assert.strictEqual(N.neighbor("all", 1), "peluang");
  assert.strictEqual(N.neighbor("peluang", -1), "all");
});

test("panah membungkus di kedua ujung", () => {
  const N = lib();
  const first = N.ids()[0], last = N.ids()[N.ids().length - 1];
  assert.strictEqual(N.neighbor(last, 1), first);
  assert.strictEqual(N.neighbor(first, -1), last);
});

test("panah dari view tak dikenal jatuh ke view pertama", () => {
  const N = lib();
  assert.strictEqual(N.neighbor("tidakada", 1), N.ids()[0]);
});
