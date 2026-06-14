// =====================================================================
// scene.js — the living golden-hour world (three.js, postprocessed).
// Builds terrain, sun, atmosphere, drifting geometric entities, and the
// monolith casts for each scene. Camera travels a smooth path driven by
// scroll progress (0..1). Real stock data shapes the monoliths.
// =====================================================================
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// ---- palette -------------------------------------------------------
const C = {
  sand: 0xd99f5c,
  sandDeep: 0x6e4421,
  horizon: 0xffe6b0,
  skyTop: 0xd99452,
  fog: 0xd99a5e,
  sun: 0xfff2cf,
  clean: 0x8fd6a0,      // jade — luminous / sovereignty
  cleanDeep: 0x4f9e6a,
  gold: 0xffce7a,       // opportunity glow
  shadow: 0x342b33,     // flagged
  warn: 0xc98a5b,
};

// terrain height — a flat-ish central avenue flanked by dunes
function dune(x, z) {
  return (
    Math.sin(x * 0.028) * 4 +
    Math.cos(z * 0.022) * 5 +
    Math.sin((x + z) * 0.011) * 6 +
    Math.sin(x * 0.07 + z * 0.04) * 1.6
  );
}
function groundY(x, z) {
  const d = Math.min(1, Math.max(0, (Math.abs(x) - 16) / 46)); // 0 near path, 1 far
  // oasis depression
  let oasis = 0;
  const oz = z + 380;
  const r = Math.sqrt(x * x + oz * oz);
  if (r < 60) oasis = -((60 - r) / 60) * 7;
  return dune(x, z) * (0.18 + 0.82 * d) + oasis;
}

export function createWorld(canvas, data) {
  const { topOpps, flagged, cleanRising, forever, ambient, tieRole } = data;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(C.fog, 0.0019);

  const camera = new THREE.PerspectiveCamera(56, innerWidth / innerHeight, 0.1, 2000);
  camera.position.set(0, 22, 70);

  // ---- lights ------------------------------------------------------
  const sunDir = new THREE.Vector3(58, 86, -640);
  const key = new THREE.DirectionalLight(0xffdca0, 1.7);
  key.position.copy(sunDir);
  scene.add(key);
  const hemi = new THREE.HemisphereLight(C.skyTop, C.sandDeep, 0.7);
  scene.add(hemi);
  scene.add(new THREE.AmbientLight(0xffe9c8, 0.25));
  const fill = new THREE.DirectionalLight(0xffb877, 0.5);
  fill.position.set(-40, 30, 60);
  scene.add(fill);

  // ---- sky dome (vertical gradient) --------------------------------
  const skyGeo = new THREE.SphereGeometry(1400, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      top: { value: new THREE.Color(C.skyTop) },
      mid: { value: new THREE.Color(C.horizon) },
      bot: { value: new THREE.Color(0xf4d9a8) },
    },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 bot;
      void main(){
        float h = normalize(vP).y;            // -1..1
        vec3 c = mix(mid, top, smoothstep(0.0, 0.55, h));
        c = mix(bot, c, smoothstep(-0.25, 0.08, h));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  // ---- sun + glow --------------------------------------------------
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 32),
    new THREE.MeshBasicMaterial({ color: C.sun, fog: false })
  );
  sun.position.copy(sunDir);
  scene.add(sun);
  const glowTex = radialTexture();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffcf86, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  glow.scale.set(200, 200, 1);
  glow.position.copy(sunDir);
  scene.add(glow);

  // ---- terrain -----------------------------------------------------
  const segW = 240, segD = 380;
  const tg = new THREE.PlaneGeometry(900, 1400, segW, segD);
  tg.rotateX(-Math.PI / 2);
  const pos = tg.attributes.position;
  const colors = [];
  const cSand = new THREE.Color(C.sand), cDeep = new THREE.Color(C.sandDeep), cWet = new THREE.Color(0x7a8a5a);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i) - 480; // shift so terrain spans the journey
    const y = groundY(x, z);
    pos.setY(i, y);
    pos.setZ(i, z);
    const t = THREE.MathUtils.clamp((y + 8) / 16, 0, 1);
    const col = cDeep.clone().lerp(cSand, t);
    // tint oasis banks greenish
    const oz = z + 380, r = Math.sqrt(x * x + oz * oz);
    if (r < 70) col.lerp(cWet, THREE.MathUtils.clamp((70 - r) / 70, 0, 1) * 0.5);
    colors.push(col.r, col.g, col.b);
  }
  tg.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
  terrain.position.z = 0;
  scene.add(terrain);

  // ---- oasis water -------------------------------------------------
  const waterGeo = new THREE.PlaneGeometry(150, 110, 60, 44);
  waterGeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(
    waterGeo,
    new THREE.MeshStandardMaterial({ color: 0x2e5a52, roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.9, emissive: 0x123028, emissiveIntensity: 0.4 })
  );
  water.position.set(0, -3.4, -380);
  scene.add(water);
  const waterBase = waterGeo.attributes.position.array.slice();

  // ---- group of monoliths ------------------------------------------
  const labels = []; // {ticker, anchor:Vector3, kind, range:[a,b], el, sub}
  const risers = []; // animated meshes {mesh, baseY, riseFrom, range}
  const clickable = []; // meshes carrying userData.stock
  const flaggedBodies = []; // for ethics-mode visual link
  const flaggedGroups = []; // full groups for dramatic sink animation
  let currentMode = "balanced"; let focusTarget = null; let focusedBody = null;
  const monoGroup = new THREE.Group();
  scene.add(monoGroup);

  function ringTex() { return glowTex; }

  function makeMonolith(o, x, z, opts) {
    const role = tieRole(o.tie);
    const g = new THREE.Group();
    const score = opts.score ?? o.adjB ?? o.comp ?? 40;
    const h = opts.height ?? (16 + (score / 100) * 42);
    const w = opts.w ?? 7;
    const sunk = opts.sunk ?? 0;
    const by = groundY(x, z);

    let bodyColor, emiss, emI, rough;
    if (opts.palette === "gold") { bodyColor = 0x4a3416; emiss = C.gold; emI = 1.4; rough = 0.4; }
    else if (opts.palette === "clean") { bodyColor = 0x153a25; emiss = C.clean; emI = 1.7; rough = 0.34; }
    else if (opts.palette === "shadow") { bodyColor = 0x241620; emiss = 0x2a1826; emI = 0.35; rough = 0.92; }
    else { bodyColor = 0x2c2722; emiss = C.warn; emI = 0.8; rough = 0.6; }

    const geo = new THREE.BoxGeometry(w, h, w);
    geo.translate(0, h / 2, 0);
    const mat = new THREE.MeshStandardMaterial({ color: bodyColor, emissive: emiss, emissiveIntensity: emI, roughness: rough, metalness: 0.2 });
    const body = new THREE.Mesh(geo, mat);
    g.add(body);
    body.userData.baseEmissive = emI;
    body.userData.stock = o;
    clickable.push(body);
    if (opts.palette === "shadow") {
      flaggedBodies.push(body);
      flaggedGroups.push({ g, baseY: by - sunk, h });
    }

    // top cap glow
    if (opts.palette !== "shadow") {
      const cap = new THREE.Mesh(
        new THREE.OctahedronGeometry(w * 0.5, 0),
        new THREE.MeshStandardMaterial({ color: emiss, emissive: emiss, emissiveIntensity: 1.9, roughness: 0.2 })
      );
      cap.position.y = h + w * 0.45;
      cap.userData.spin = 0.4;
      g.add(cap);
      // base ring
      const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex(), color: emiss, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.7 }));
      ring.scale.set(w * 6, w * 6, 1);
      ring.position.y = 1;
      g.add(ring);
    } else {
      // flagged: a faint cold haze + tilt
      g.rotation.z = (Math.random() - 0.5) * 0.18;
      g.rotation.x = (Math.random() - 0.5) * 0.1;
    }

    g.position.set(x, by - sunk, z);
    monoGroup.add(g);

    if (opts.label) {
      labels.push({ ticker: o.t, sub: opts.subFn ? opts.subFn(o) : "", kind: opts.palette, anchor: new THREE.Vector3(x, by - sunk + h + w, z), range: opts.range, data: o });
    }
    if (opts.rise) {
      g.position.y = by - sunk - h - 4; // start below
      risers.push({ g, target: by - sunk, from: by - sunk - h - 4, range: opts.range });
    }
    return g;
  }

  // SCENE 2 — Top Opportunities: rising luminous avenue
  topOpps.forEach((o, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (17 + (i % 3) * 7);
    const z = -40 - i * 13;
    makeMonolith(o, x, z, {
      palette: "gold", score: o.adjB, w: 7.5, label: true, rise: true,
      range: [0.20, 0.50],
      subFn: (s) => `${s.act === "STRONG_BUY" ? "BELI KUAT" : "BELI"} · +${s.upside}%`,
    });
  });

  // SCENE 3 — Ethical core. Flagged giants sink into shadow (right), clean rise (left).
  flagged.forEach((o, i) => {
    const x = 14 + (i % 4) * 7;
    const z = -188 - Math.floor(i / 4) * 16 - (i % 4) * 4;
    makeMonolith(o, x, z, {
      palette: "shadow", height: 14 + (o.cap > 1000 ? 12 : 4), w: 8, sunk: 9 + (i % 3) * 3,
      label: i < 6, range: [0.50, 0.72], subFn: () => "DIKECUALIKAN",
    });
  });
  cleanRising.forEach((o, i) => {
    const x = -12 - (i % 3) * 7;
    const z = -190 - i * 10;
    makeMonolith(o, x, z, {
      palette: "clean", score: o.comp, w: 6.5, label: i < 5, rise: true,
      range: [0.50, 0.72], subFn: (s) => `${s.t} · skor ${s.comp}`,
    });
  });

  // Sovereignty beacon — a tall luminous shaft at the heart of the basin
  const beacon = new THREE.Group();
  const bz = -228, bx = -1;
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 2.6, 120, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: C.clean, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, fog: false })
  );
  shaft.position.y = groundY(bx, bz) + 60;
  beacon.add(shaft);
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 120, 16),
    new THREE.MeshBasicMaterial({ color: 0xeafff0, fog: false })
  );
  core.position.y = groundY(bx, bz) + 60;
  beacon.add(core);
  const beaconGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: C.clean, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.85, fog: false }));
  beaconGlow.scale.set(70, 70, 1);
  beaconGlow.position.set(bx, groundY(bx, bz) + 120, bz);
  beacon.add(beaconGlow);
  beacon.position.set(bx, 0, bz);
  scene.add(beacon);

  // SCENE 4 — Forever Pocket sanctuary: tall serene pale pillars around the oasis
  const lanterns = [];
  forever.forEach((o, i) => {
    const row = i % 2 === 0 ? -1 : 1;
    const x = row * (16 + (i % 3) * 6);
    const z = -340 - Math.floor(i / 2) * 20;
    const h = 30 + (o.adjS ? o.adjS / 4 : 8);
    const by = groundY(x, z);
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 3.4, h, 6),
      new THREE.MeshStandardMaterial({ color: 0xe9d9b8, emissive: C.clean, emissiveIntensity: 0.35, roughness: 0.5, metalness: 0.1 })
    );
    pillar.position.set(x, by + h / 2, z);
    pillar.userData.stock = o;
    clickable.push(pillar);
    scene.add(pillar);
    const top = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.2, 0),
      new THREE.MeshStandardMaterial({ color: C.clean, emissive: C.clean, emissiveIntensity: 1.8, roughness: 0.2 })
    );
    top.position.set(x, by + h + 3, z);
    top.userData.spin = 0.3;
    scene.add(top);
    monoGroup.add(top);
    labels.push({ ticker: o.t, sub: `dividen ${o.dy.toFixed(1)}% · ${o.sec}`, kind: "forever", anchor: new THREE.Vector3(x, by + h + 8, z), range: [0.80, 1.001], data: o });
    // lantern
    const lan = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffe2a0, fog: false })
    );
    const lx = x * 0.4 + (Math.random() - 0.5) * 30, lz = -380 + (Math.random() - 0.5) * 60;
    lan.position.set(lx, 2 + Math.random() * 6, lz);
    scene.add(lan);
    lanterns.push({ m: lan, base: lan.position.y, sp: 4 + Math.random() * 6, ph: Math.random() * 9, x: lx, z: lz });
  });

  // ---- drifting geometric entities (instanced) ---------------------
  const N = 150;
  const entGeo = new THREE.OctahedronGeometry(1, 0);
  const entMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.1, emissive: 0xffffff, emissiveIntensity: 0.25, flatShading: true });
  const ents = new THREE.InstancedMesh(entGeo, entMat, N);
  ents.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
  const eState = [];
  const cAmber = new THREE.Color(0xf0b878), cJade = new THREE.Color(C.clean), cGoldE = new THREE.Color(C.gold);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < N; i++) {
    const x = (Math.random() - 0.5) * 320;
    const z = 60 - Math.random() * 540;
    const y = 8 + Math.random() * 78;
    const s = 1.1 + Math.random() * 3.4;
    const st = { x, y, z, s, ph: Math.random() * Math.PI * 2, sp: 0.2 + Math.random() * 0.6, amp: 2 + Math.random() * 5, rot: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(), rs: (Math.random() - 0.5) * 0.5 };
    eState.push(st);
    const r = Math.random();
    const col = r < 0.18 ? cJade : r < 0.32 ? cGoldE : cAmber;
    ents.setColorAt(i, col);
  }
  scene.add(ents);

  // ---- glowing motes (additive, catch bloom) -----------------------
  const M = 60;
  const moteGeo = new THREE.TetrahedronGeometry(1.1, 0);
  const moteMat = new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: true });
  const motes = new THREE.InstancedMesh(moteGeo, moteMat, M);
  const mState = [];
  for (let i = 0; i < M; i++) {
    mState.push({ x: (Math.random() - 0.5) * 280, y: 6 + Math.random() * 70, z: 50 - Math.random() * 520, ph: Math.random() * 9, sp: 0.3 + Math.random() * 0.7, amp: 3 + Math.random() * 6, s: 0.6 + Math.random() * 1.6, rs: (Math.random() - 0.5) });
  }
  scene.add(motes);

  // ---- dust ---------------------------------------------------------
  const DUST = 1400;
  const dgeo = new THREE.BufferGeometry();
  const dpos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dpos[i * 3] = (Math.random() - 0.5) * 500;
    dpos[i * 3 + 1] = Math.random() * 120;
    dpos[i * 3 + 2] = 80 - Math.random() * 600;
  }
  dgeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ color: 0xffe6b0, size: 0.7, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  scene.add(dust);

  // ---- camera path -------------------------------------------------
  const pPts = [
    [0, 22, 70], [2, 18, 16], [-16, 17, -50], [14, 19, -110],
    [-2, 18, -178], [10, 15, -255], [-4, 13, -332], [0, 16, -405], [0, 30, -442],
  ].map((p) => new THREE.Vector3(...p));
  const lPts = [
    [0, 22, -30], [-4, 20, -72], [12, 22, -120], [-8, 24, -180],
    [-2, 22, -252], [-6, 18, -332], [2, 16, -420], [0, 20, -470], [0, 56, -680],
  ].map((p) => new THREE.Vector3(...p));
  const posCurve = new THREE.CatmullRomCurve3(pPts, false, "catmullrom", 0.5);
  const lookCurve = new THREE.CatmullRomCurve3(lPts, false, "catmullrom", 0.5);

  // ---- postprocessing ----------------------------------------------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.42, 0.45, 0.9);
  composer.addPass(bloom);
  composer.setSize(innerWidth, innerHeight);
  composer.setPixelRatio(Math.min(devicePixelRatio, 2));

  // ---- state -------------------------------------------------------
  let progress = 0, shown = 0, motion = 1;
  const clock = new THREE.Clock();
  const tmpV = new THREE.Vector3();

  function smooth(a, b, t) { return a + (b - a) * (1 - Math.pow(1 - t, 3)); }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    shown += (progress - shown) * 0.06; // eased follow for buttery scroll
    const p = THREE.MathUtils.clamp(shown, 0, 1);

    // camera along path + idle drift (gated by focus mode)
    if (!focusTarget?.active) {
      posCurve.getPoint(p, tmpV);
      const driftX = Math.sin(t * 0.32) * 2.4 * motion;
      const driftY = Math.sin(t * 0.21 + 1) * 1.3 * motion;
      camera.position.set(tmpV.x + driftX, tmpV.y + driftY, tmpV.z);
      lookCurve.getPoint(p, tmpV);
      tmpV.x += Math.sin(t * 0.26) * 5 * motion;
      tmpV.y += Math.cos(t * 0.19) * 2.2 * motion;
      camera.lookAt(tmpV);
    } else {
      const fp = focusTarget.pos.clone().add(new THREE.Vector3(0, 8, 32));
      camera.position.lerp(fp, 0.05);
      camera.lookAt(focusTarget.pos.clone().add(new THREE.Vector3(0, 5, 0)));
    }

    // entities
    for (let i = 0; i < N; i++) {
      const s = eState[i];
      dummy.position.set(s.x + Math.sin(t * s.sp + s.ph) * s.amp, s.y + Math.cos(t * s.sp * 0.8 + s.ph) * s.amp * 0.6, s.z);
      dummy.scale.setScalar(s.s);
      dummy.rotation.set(t * s.rs + s.ph, t * s.rs * 0.7, t * s.rs * 1.2);
      dummy.updateMatrix();
      ents.setMatrixAt(i, dummy.matrix);
    }
    ents.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < M; i++) {
      const s = mState[i];
      dummy.position.set(s.x + Math.cos(t * s.sp + s.ph) * s.amp, s.y + Math.sin(t * s.sp + s.ph) * s.amp, s.z);
      dummy.scale.setScalar(s.s);
      dummy.rotation.set(t * s.rs, t * s.rs * 1.3, 0);
      dummy.updateMatrix();
      motes.setMatrixAt(i, dummy.matrix);
    }
    motes.instanceMatrix.needsUpdate = true;

    // spinning caps
    monoGroup.children.forEach((c) => { if (c.userData.spin) c.rotation.y += dt * c.userData.spin; else c.children?.forEach((cc) => { if (cc.userData.spin) cc.rotation.y += dt * cc.userData.spin; }); });

    // risers — animate up while their scene is approaching/active
    risers.forEach((r) => {
      const a = THREE.MathUtils.clamp((p - r.range[0]) / 0.12, 0, 1);
      const ease = a * a * (3 - 2 * a);
      r.g.position.y = r.from + (r.target - r.from) * ease;
    });

    // beacon pulse — intensifies in strict mode (sovereignty wins)
    const baseOp = currentMode === "strict" ? 0.72 : 0.38;
    shaft.material.opacity = baseOp + Math.sin(t * 1.4) * 0.12;
    beaconGlow.material.opacity = (currentMode === "strict" ? 0.94 : 0.68) + Math.sin(t * 1.4) * 0.16;

    // flagged monoliths sink in strict, float back in loose
    flaggedGroups.forEach((sg) => {
      const tgt = currentMode === "strict" ? sg.baseY - sg.h - 10 : sg.baseY;
      sg.g.position.y += (tgt - sg.g.position.y) * 0.05;
    });
    // focused-body pulse for deep-dive mode
    if (focusedBody) {
      focusedBody.material.emissiveIntensity =
        focusedBody.userData.baseEmissive + Math.sin(t * 3.5) * 0.7;
    }

    // lanterns rise & recycle
    lanterns.forEach((l) => {
      l.m.position.y += dt * l.sp * 0.4;
      l.m.position.x = l.x + Math.sin(t * 0.4 + l.ph) * 2;
      if (l.m.position.y > 60) l.m.position.y = 2;
      const fl = 0.7 + Math.sin(t * 3 + l.ph) * 0.3;
      l.m.material.color.setRGB(1, 0.85 * fl + 0.1, 0.5 * fl);
    });

    // water ripple
    const wp = water.geometry.attributes.position;
    for (let i = 0; i < wp.count; i++) {
      const x = waterBase[i * 3], z = waterBase[i * 3 + 2];
      wp.setY(i, Math.sin(x * 0.2 + t * 1.3) * 0.5 + Math.cos(z * 0.25 + t) * 0.5);
    }
    wp.needsUpdate = true;

    // dust drift
    dust.rotation.y = t * 0.005;

    if (onLabels) onLabels(labels, camera, p);

    composer.render();
    requestAnimationFrame(frame);
  }

  let onLabels = null;
  requestAnimationFrame(frame);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setSize(innerWidth, innerHeight);
    bloom.setSize(innerWidth, innerHeight);
  });

  const raycaster = new THREE.Raycaster();
  function pick(cx, cy) {
    raycaster.setFromCamera(new THREE.Vector2((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1), camera);
    const hits = raycaster.intersectObjects(clickable, false);
    return hits.length ? hits[0].object.userData.stock : null;
  }
  function setEthicsMode(mode) {
    currentMode = mode;
    const loose = mode === "loose"; const strict = mode === "strict";
    flaggedBodies.forEach((b) => {
      b.material.emissive.set(loose ? 0x6a4226 : strict ? 0x030103 : 0x1a0e14);
      b.material.emissiveIntensity = loose ? 0.75 : strict ? 0.02 : 0.2;
    });
    // sinker targets + beacon are updated each frame via currentMode
  }

  return {
    setProgress: (v) => { progress = THREE.MathUtils.clamp(v, 0, 1); },
    setMotion: (v) => { motion = v; },
    onLabels: (fn) => { onLabels = fn; },
    pick, setEthicsMode,
    getMonolithPos: (t) => labels.find((l) => l.ticker === t)?.anchor ?? null,
    focusMonolith: (worldPos, ticker) => {
      focusTarget = { pos: worldPos.clone(), active: true };
      focusedBody = clickable.find((b) => b.userData.stock?.t === ticker) ?? null;
    },
    clearFocus: () => {
      if (focusedBody) focusedBody.material.emissiveIntensity = focusedBody.userData.baseEmissive;
      focusedBody = null; focusTarget = null;
    },
    camera, scene,
  };
}

// radial gradient sprite texture (sun/ring glow)
function radialTexture() {
  const s = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const ctx = cv.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,240,200,0.8)");
  g.addColorStop(0.6, "rgba(255,210,140,0.25)");
  g.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
