/**
 * scene6.js — Manganese Dioxide Test Lab Scene (Experiment 6)
 *
 * Features:
 *  - Mixture bottle, MnO₂ powder jar, Con. H₂SO₄ acid bottle on shelf
 *  - Test tube on retort stand + Bunsen burner
 *  - Starch iodide paper strip (turns blue for Cl₂)
 *  - Moist fluorescence paper (turns red for Br₂)
 *  - Limewater beaker (turns milky for CO₂)
 *  - Greenish-yellow fume particles for Cl₂, reddish-brown for Br₂, white for CO₂
 */

// ── Label helper ──────────────────────────────────────────────────────────
function makeLabel(text, opts = {}) {
  const {
    fontSize = 20, bgColor = 'rgba(10,20,40,0.65)',
    textColor = '#e2f4ff', borderColor = '#9f7aea',
    width = 180, height = 40
  } = opts;
  const cv  = document.createElement('canvas');
  cv.width  = width; cv.height = height;
  const ctx = cv.getContext('2d');
  const r = height / 2;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(width - r, 0);
  ctx.arc(width - r, r, r, -Math.PI/2, Math.PI/2);
  ctx.lineTo(r, height);
  ctx.arc(r, r, r, Math.PI/2, -Math.PI/2);
  ctx.closePath();
  ctx.fillStyle = bgColor; ctx.fill();
  ctx.strokeStyle = borderColor; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  const tex = new THREE.CanvasTexture(cv);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set((width / height) * 0.18, 0.18, 1);
  return sprite;
}

// ── Renderer ──────────────────────────────────────────────────────────────
const canvas   = document.getElementById('lab-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
if (renderer.outputColorSpace !== undefined) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
} else {
  renderer.outputEncoding = THREE.sRGBEncoding;
}
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

// ── Scene ─────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x4a4260); // slight purple tint for MnO₂ experiment
scene.fog        = new THREE.FogExp2(0x3a3250, 0.038);

function createCanvasElement(color, size = 128) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = color; ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size, size);
  ctx.moveTo(size, 0); ctx.lineTo(0, size); ctx.stroke();
  return cv;
}
function createCanvasTexture(color, size = 128) {
  return new THREE.CanvasTexture(createCanvasElement(color, size));
}
function applyTextureSettings(texture, repeatX = 1, repeatY = 1) {
  if (!texture) return;
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  if (THREE.sRGBEncoding !== undefined) texture.encoding = THREE.sRGBEncoding;
  else texture.colorSpace = THREE.SRGBColorSpace;
}
function createEnvironmentMap(renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const colors = ['#dce6ff', '#b8c6e6', '#f0f4ff', '#d9e2ff', '#e8ecff', '#b5c0dd'];
  const faces = colors.map(color => createCanvasElement(color, 256));
  const cubeTexture = new THREE.CubeTexture(faces);
  cubeTexture.needsUpdate = true;
  return pmremGenerator.fromCubemap(cubeTexture).texture;
}
const environmentMap = createEnvironmentMap(renderer);
scene.environment = environmentMap;

// ── Camera ────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 60);
window.camera = camera;
camera.position.set(0, 3.2, 7.0);
camera.lookAt(0, 0.5, 0);

setupLighting(scene);
const controls = new OrbitControls(camera, canvas);

// ── Textures ──────────────────────────────────────────────────────────────
function createLabFloorTex(size) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#2a2a3a'; ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(80,80,120,0.4)'; ctx.lineWidth = 1;
  for (let i = 0; i <= size; i += size / 8) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
  }
  return new THREE.CanvasTexture(cv);
}
function createLabWallTex() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#2a2540'); g.addColorStop(1, '#1a1530');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(cv);
}
function createSharedBenchWoodTex() {
  const W = 512, H = 256;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#2a120a'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * W;
    const w = 0.5 + Math.random() * 3.5;
    const l = Math.random() > 0.5 ? 1 : -1;
    const a = 0.04 + Math.random() * 0.1;
    const col = l > 0 ? `rgba(200,140,80,${a})` : `rgba(30,10,0,${a})`;
    ctx.beginPath(); ctx.moveTo(x, 0);
    for (let y = 0; y <= H; y += 20) ctx.lineTo(x + Math.sin(y * 0.05 + i) * 4, y);
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
}

// ── Lab Environment ───────────────────────────────────────────────────────
const floorMat = new THREE.MeshStandardMaterial({ map: createLabFloorTex(64), roughness: 0.38, metalness: 0.08 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMat);
floor.rotation.x = -Math.PI / 2; floor.position.y = -3.25; floor.receiveShadow = true;
scene.add(floor);

const wallMat = new THREE.MeshStandardMaterial({ map: createLabWallTex(), roughness: 0.85 });
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), wallMat);
wall.position.set(0, 10 - 3.25, -10); wall.receiveShadow = true; scene.add(wall);
const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), wallMat);
leftWall.position.set(-20, 10 - 3.25, 0); leftWall.rotation.y = Math.PI / 2; scene.add(leftWall);
const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), wallMat);
rightWall.position.set(20, 10 - 3.25, 0); rightWall.rotation.y = -Math.PI / 2; scene.add(rightWall);
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
ceiling.rotation.x = Math.PI / 2; ceiling.position.y = 12 - 3.25; scene.add(ceiling);

// Bench top
const woodMat = new THREE.MeshStandardMaterial({ map: createSharedBenchWoodTex(), color: 0x5a3010, roughness: 0.80, metalness: 0.02 });
const benchTop = new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 5), woodMat);
benchTop.position.set(0, -0.25, 0.3); benchTop.receiveShadow = benchTop.castShadow = true; scene.add(benchTop);

const blackMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f });
const border = new THREE.Mesh(new THREE.BoxGeometry(18.2, 0.2, 5.2), blackMat);
border.position.set(0, -0.5, 0.3); scene.add(border);

// Cabinets
const greyMat = new THREE.MeshStandardMaterial({ color: 0xbcbcbc, roughness: 0.4 });
function createCabinet(x, z) {
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3, 2.2), greyMat);
  cab.position.set(x, 1.3 - 3.25, z); cab.castShadow = cab.receiveShadow = true; scene.add(cab);
}
createCabinet(-7, 0.3); createCabinet(-4.3, 0.3); createCabinet(4.3, 0.3); createCabinet(7, 0.3);

// ── SHELF ─────────────────────────────────────────────────────────────────
function makeBenchWoodTex6() {
  const W = 512, H = 256;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#2a120a'; ctx.fillRect(0, 0, W, H);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(4, 2);
  return tex;
}
const shelfMat6 = new THREE.MeshStandardMaterial({ map: makeBenchWoodTex6(), color: 0x5a4020, roughness: 0.8, metalness: 0.1 });
const shelfGroup = new THREE.Group(); scene.add(shelfGroup);

const backboard = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.0, 0.04), shelfMat6);
backboard.position.set(0, 1.97, -1.52); shelfGroup.add(backboard);
const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.4), shelfMat6);
leftPillar.position.set(-2.04, 1.97, -1.32); shelfGroup.add(leftPillar);
const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.4), shelfMat6);
rightPillar.position.set(2.04, 1.97, -1.32); shelfGroup.add(rightPillar);
const topPanel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 0.4), shelfMat6);
topPanel.position.set(0, 3.47, -1.32); shelfGroup.add(topPanel);
const bottomPanel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 0.4), shelfMat6);
bottomPanel.position.set(0, 0.53, -1.32); shelfGroup.add(bottomPanel);
const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(4.08, 0.04, 0.38), shelfMat6);
shelf1.position.set(0, 1.5, -1.32); shelfGroup.add(shelf1);
const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(4.08, 0.04, 0.38), shelfMat6);
shelf2.position.set(0, 2.5, -1.32); shelfGroup.add(shelf2);

// ── MIXTURE BOTTLE ────────────────────────────────────────────────────────
const mixtureBottleGroup = new THREE.Group();
const bottleBodyMat = new THREE.MeshPhysicalMaterial({ color: 0xf5f5dc, transparent: true, opacity: 0.45, roughness: 0.1, transmission: 0.5 });
const bottleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 20), bottleBodyMat);
mixtureBottleGroup.add(bottleMesh);
const bottleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 }));
bottleCap.position.y = 0.19; mixtureBottleGroup.add(bottleCap);
const bottlePowder = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.076, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0xefefe7, roughness: 0.95 }));
bottlePowder.position.y = -0.09; mixtureBottleGroup.add(bottlePowder);
mixtureBottleGroup.position.set(-1.3, 2.68, -1.25); scene.add(mixtureBottleGroup);
const bottleLabelSprite = makeLabel('Mixture', { fontSize: 16, width: 120, height: 36 });
bottleLabelSprite.position.set(0, 0.38, 0.15);
mixtureBottleGroup.add(bottleLabelSprite);

// ── MnO₂ POWDER JAR ──────────────────────────────────────────────────────
const mno2JarGroup = new THREE.Group();
const mno2JarBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.095, 0.095, 0.28, 20),
  new THREE.MeshPhysicalMaterial({ color: 0x2a2a2a, transparent: true, opacity: 0.82, roughness: 0.4 })
);
mno2JarGroup.add(mno2JarBody);
const mno2Powder = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16),
  new THREE.MeshStandardMaterial({ color: 0x2d1a0d, roughness: 0.95 }) // dark brown/black for MnO₂
);
mno2Powder.position.y = -0.07; mno2JarGroup.add(mno2Powder);
const mno2JarLid = new THREE.Mesh(
  new THREE.CylinderGeometry(0.1, 0.1, 0.04, 20),
  new THREE.MeshStandardMaterial({ color: 0xcc8800, roughness: 0.5 }) // amber/orange lid
);
mno2JarLid.position.y = 0.16; mno2JarGroup.add(mno2JarLid);
mno2JarGroup.position.set(-0.7, 2.68, -1.25); scene.add(mno2JarGroup);
const mno2Lbl = makeLabel('MnO₂ Powder', { fontSize: 15, width: 145, height: 36, borderColor: '#f6ad55' });
mno2Lbl.position.set(0, 0.38, 0.15);
mno2JarGroup.add(mno2Lbl);

// ── CON. H₂SO₄ ACID BOTTLE ────────────────────────────────────────────────
const acidBottleGroup = new THREE.Group();
const acidBottleMat = new THREE.MeshPhysicalMaterial({ color: 0x5a3d28, transparent: true, opacity: 0.75, roughness: 0.1, metalness: 0.1 });
const acidBottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 20), acidBottleMat);
acidBottleGroup.add(acidBottleBody);
const acidBottleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.6 }));
acidBottleCap.position.y = 0.19; acidBottleGroup.add(acidBottleCap);
const acidLiquidInner = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.076, 0.18, 16), new THREE.MeshStandardMaterial({ color: 0xeedda8, transparent: true, opacity: 0.65, roughness: 0.1 }));
acidLiquidInner.position.y = -0.06; acidBottleGroup.add(acidLiquidInner);
acidBottleGroup.position.set(-0.1, 2.68, -1.25); scene.add(acidBottleGroup);
const acidLbl = makeLabel('Con. H₂SO₄', { fontSize: 15, width: 145, height: 36 });
acidLbl.position.set(0, 0.38, 0.15);
acidBottleGroup.add(acidLbl);

// ── DROPPER ───────────────────────────────────────────────────────────────
const DROPPER_HOME = { x: -0.1, y: 3.2, z: -1.25 };
const dropper = new Dropper(scene, DROPPER_HOME);
dropper._innerMesh.visible = false;
dropper._innerMesh.scale.y = 0.01;

// ── RETORT STAND + TEST TUBE ──────────────────────────────────────────────
const retortGroup = new THREE.Group();
const retortBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.4), new THREE.MeshStandardMaterial({ color: 0x252525, roughness: 0.6 }));
retortBase.castShadow = retortBase.receiveShadow = true;
retortGroup.add(retortBase);
const retortRod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.3, 12), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 }));
retortRod.position.set(0.2, 0.65, -0.1); retortGroup.add(retortRod);
const clampBoss = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 }));
clampBoss.position.set(0.2, 0.7, -0.1); retortGroup.add(clampBoss);
const clampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 }));
clampArm.rotation.z = Math.PI / 2; clampArm.position.set(0.1, 0.7, -0.1); retortGroup.add(clampArm);

const testTubeGroup = new THREE.Group();
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xe5f6ff, transparent: true, opacity: 0.22, roughness: 0.05, transmission: 0.9, side: THREE.DoubleSide, depthWrite: false });
const heatingGlassMat = new THREE.MeshPhysicalMaterial({ color: 0xe5f6ff, transparent: true, opacity: 0.22, roughness: 0.05, transmission: 0.9, side: THREE.DoubleSide, depthWrite: false, emissive: 0x000000, emissiveIntensity: 0.0 });
const tubeCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 24, 1, true), glassMat);
tubeCyl.position.y = 0.31; testTubeGroup.add(tubeCyl);
const tubeSph = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), heatingGlassMat);
tubeSph.rotation.x = Math.PI; testTubeGroup.add(tubeSph);
const rim = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.005, 8, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0xaaccff, emissiveIntensity: 0.1 }));
rim.position.y = 0.62; rim.rotation.x = Math.PI / 2; testTubeGroup.add(rim);
const substanceMat = new THREE.MeshStandardMaterial({ color: 0xefefe7, roughness: 0.95 });
const substance = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.09, 20), substanceMat);
substance.position.y = 0.05; substance.visible = false; testTubeGroup.add(substance);
// Dark MnO₂ layer on top of substance
const mno2Layer = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.05, 20), new THREE.MeshStandardMaterial({ color: 0x2d1a0d, roughness: 0.95 }));
mno2Layer.position.y = 0.12; mno2Layer.visible = false; testTubeGroup.add(mno2Layer);
const liquidMat = new THREE.MeshStandardMaterial({ color: 0xeedda8, transparent: true, opacity: 0.0, roughness: 0.1 });
const acidLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.15, 20), liquidMat);
acidLiquid.position.y = 0.125; acidLiquid.visible = false; testTubeGroup.add(acidLiquid);
testTubeGroup.position.set(-0.06, 0.7, -0.1);
testTubeGroup.rotation.z = -Math.PI / 6;
retortGroup.add(testTubeGroup);
retortGroup.position.set(-0.4, 0.015, 0.3);
scene.add(retortGroup);

const retortLabel = makeLabel('Heating Tube', { fontSize: 17, width: 150, height: 36 });
retortLabel.position.set(-0.4, 1.48, 0.42); scene.add(retortLabel);

// ── BUNSEN BURNER ─────────────────────────────────────────────────────────
const bunsen = new THREE.Group();
const bunsenBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0x282828, roughness: 0.48, metalness: 0.78 }));
bunsenBase.position.y = 0.025; bunsen.add(bunsenBase);
const barrelMat = new THREE.MeshStandardMaterial({ color: 0x383838, roughness: 0.36, metalness: 0.88 });
const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.52, 24), barrelMat);
barrel.position.y = 0.31; bunsen.add(barrel);
const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.05, 0.06, 20), barrelMat);
nozzle.position.y = 0.60; bunsen.add(nozzle);
const tipRing = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 8, 20), new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.18, metalness: 1.0 }));
tipRing.position.y = 0.63; tipRing.rotation.x = Math.PI / 2; bunsen.add(tipRing);
const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.95 }));
hose.rotation.z = Math.PI / 2.5; hose.position.set(-0.2, 0.03, 0); bunsen.add(hose);
bunsen.position.set(-0.72, 0, 0.48); scene.add(bunsen);
const bunsenLabel = makeLabel('Bunsen Burner', { fontSize: 17, width: 155, height: 36 });
bunsenLabel.position.set(-0.72, 0.76, 0.60); scene.add(bunsenLabel);

// Flame
const flameGroup = new THREE.Group(); flameGroup.position.set(0, 0.63, 0); bunsen.add(flameGroup);
const innerCone = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.18, 16, 4, true), new THREE.MeshStandardMaterial({ color: 0x99ccff, emissive: 0x3388ff, emissiveIntensity: 3.0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
innerCone.rotation.x = Math.PI; innerCone.position.y = 0.09; flameGroup.add(innerCone);
const glowTex6 = (function() {
  const s = 128, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0.0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.3, 'rgba(255,160,50,0.65)');
  g.addColorStop(0.65, 'rgba(255,80,0,0.18)'); g.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,s,s);
  return new THREE.CanvasTexture(cv);
})();
const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex6, color: 0xffaa44, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
glowSprite.scale.set(0.35, 0.55, 1.0); glowSprite.position.y = 0.22; flameGroup.add(glowSprite);
const flameLight = new THREE.PointLight(0xffaa44, 0, 3.5);
flameLight.position.y = 0.25; flameGroup.add(flameLight);
let flameActive6 = false;
function startBunsenFlame6() {
  flameActive6 = true;
  gsap.to(innerCone.material, { opacity: 0.85, duration: 0.4 });
  gsap.to(glowSprite.material, { opacity: 0.45, duration: 0.5 });
  gsap.to(flameLight, { intensity: 2.2, duration: 0.5 });
}
function stopBunsenFlame6() {
  flameActive6 = false;
  gsap.to(innerCone.material, { opacity: 0, duration: 0.4 });
  gsap.to(glowSprite.material, { opacity: 0, duration: 0.5 });
  gsap.to(flameLight, { intensity: 0, duration: 0.5 });
}

// ── GAS LIGHTER ───────────────────────────────────────────────────────────
const lighterGroup = new THREE.Group();
const lighterBody = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.03), new THREE.MeshStandardMaterial({ color: 0x8833cc, roughness: 0.5 }));
lighterGroup.add(lighterBody);
const lighterNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 }));
lighterNozzle.position.y = 0.25; lighterGroup.add(lighterNozzle);
lighterGroup.position.set(1.4, 1.66, -1.25);
lighterGroup.rotation.set(Math.PI / 2, 0, Math.PI / 6);
scene.add(lighterGroup);
const lighterLbl = makeLabel('Gas Lighter', { fontSize: 16, width: 135, height: 36 });
lighterLbl.position.set(0, 0.35, 0);
lighterGroup.add(lighterLbl);

// ── STARCH IODIDE PAPER STRIP (shelf 1 left) ──────────────────────────────
const starchPaperGroup = new THREE.Group();
const starchHolderMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x888888 }));
starchHolderMesh.rotation.x = Math.PI / 2; starchPaperGroup.add(starchHolderMesh);
const starchPaperMat = new THREE.MeshStandardMaterial({ color: 0xf0f0ee, roughness: 0.95, side: THREE.DoubleSide });
const starchPaperMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.22), starchPaperMat);
starchPaperMesh.position.set(0, 0, 0.24); starchPaperGroup.add(starchPaperMesh);
starchPaperGroup.position.set(-1.6, 1.66, -1.25);
starchPaperGroup.rotation.set(Math.PI / 2, 0, Math.PI / 4);
scene.add(starchPaperGroup);
const starchLbl = makeLabel('Starch Iodide Paper', { fontSize: 13, width: 178, height: 34 });
starchLbl.position.set(0, 0.38, 0);
starchPaperGroup.add(starchLbl);

// ── FLUORESCENCE PAPER (shelf 1 mid-left) ─────────────────────────────────
const fluorescencePaperGroup = new THREE.Group();
const fluorHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x555555 }));
fluorHolder.rotation.x = Math.PI / 2; fluorescencePaperGroup.add(fluorHolder);
const fluorPaperMat = new THREE.MeshStandardMaterial({ color: 0xe2f35d, roughness: 0.95, side: THREE.DoubleSide });
const fluorPaperMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.22), fluorPaperMat);
fluorPaperMesh.position.set(0, 0, 0.26); fluorescencePaperGroup.add(fluorPaperMesh);
fluorescencePaperGroup.position.set(-0.9, 1.66, -1.25);
fluorescencePaperGroup.rotation.set(Math.PI / 2, 0, Math.PI / 4);
scene.add(fluorescencePaperGroup);
const fluorLbl = makeLabel('Fluorescence Paper', { fontSize: 14, width: 175, height: 34 });
fluorLbl.position.set(0, 0.38, 0);
fluorescencePaperGroup.add(fluorLbl);

// ── LIMEWATER BEAKER (shelf 1 right) ─────────────────────────────────────
const limewaterGroup = new THREE.Group();
const beakerGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.22, 24, 1, true);
const beakerMat = new THREE.MeshPhysicalMaterial({ color: 0xe0f4ff, transparent: true, opacity: 0.25, roughness: 0.05, transmission: 0.9, side: THREE.DoubleSide, depthWrite: false });
const beakerMesh = new THREE.Mesh(beakerGeo, beakerMat);
beakerMesh.position.y = 0.11; limewaterGroup.add(beakerMesh);
const beakerBottom = new THREE.Mesh(new THREE.CircleGeometry(0.065, 24), beakerMat.clone());
beakerBottom.rotation.x = -Math.PI / 2; limewaterGroup.add(beakerBottom);
const limewaterMat = new THREE.MeshStandardMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.35, roughness: 0.05 });
const limewaterLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.058, 0.14, 20), limewaterMat);
limewaterLiquid.position.y = 0.09; limewaterGroup.add(limewaterLiquid);
limewaterGroup.position.set(0.6, 1.62, -1.25);
scene.add(limewaterGroup);
const limewaterLbl = makeLabel('Limewater', { fontSize: 15, width: 130, height: 34 });
limewaterLbl.position.set(0, 0.42, 0.15);
limewaterGroup.add(limewaterLbl);

// Limewater bubbling effect
const lwBubbles = [];
const lwBubbleGroup = new THREE.Group();
limewaterGroup.add(lwBubbleGroup);
for (let i = 0; i < 12; i++) {
  const b = new THREE.Mesh(
    new THREE.SphereGeometry(0.004, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, roughness: 0.1, metalness: 0.1, depthWrite: false })
  );
  b.userData = { vy: 0.15, phase: Math.random() * 10, active: false, size: 0.004 };
  lwBubbleGroup.add(b);
  lwBubbles.push(b);
}
let lwBubblingActive = false;

function startLwBubbling() {
  lwBubblingActive = true;
  lwBubbles.forEach(b => {
    b.material.opacity = 0.65;
    b.position.set(
      (Math.random() - 0.5) * 0.08,
      0.02 + Math.random() * 0.08,
      (Math.random() - 0.5) * 0.08
    );
    b.userData.active = true;
    b.userData.vy = 0.12 + Math.random() * 0.12;
  });
}

function stopLwBubbling() {
  lwBubblingActive = false;
  lwBubbles.forEach(b => {
    b.material.opacity = 0;
    b.userData.active = false;
  });
}

function updateLwBubbling(dt) {
  if (!lwBubblingActive) return;
  const limitY = 0.16; // liquid surface height in beaker
  lwBubbles.forEach(b => {
    if (!b.userData.active) return;
    b.position.y += b.userData.vy * dt;
    b.position.x += Math.sin(b.position.y * 40 + b.userData.phase) * 0.005 * dt;
    if (b.position.y > limitY) {
      b.position.y = 0.02;
      b.position.x = (Math.random() - 0.5) * 0.08;
      b.position.z = (Math.random() - 0.5) * 0.08;
    }
  });
}

// ── OBSERVATION SHEET ──────────────────────────────────────────────────────
const obsSheet = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.95 }));
obsSheet.rotation.x = -Math.PI / 2; obsSheet.position.set(-3.2, 0.01, 0.6); scene.add(obsSheet);
const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7 }));
pencil.rotation.z = Math.PI / 2; pencil.position.set(-3.2, 0.02, 0.9); scene.add(pencil);

// ── PARTICLE SYSTEMS ──────────────────────────────────────────────────────

// 1. Main gas fumes (rises from tube mouth)
const FUME_COUNT = 85;
const fumesGroup = new THREE.Group(); scene.add(fumesGroup);
const fumeParticles6 = [];
const fumeTex6 = (function() {
  const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0.0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.7)');
  g.addColorStop(0.7, 'rgba(240,240,240,0.2)'); g.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,s,s);
  return new THREE.CanvasTexture(cv);
})();
for (let i = 0; i < FUME_COUNT; i++) {
  const mat = new THREE.SpriteMaterial({ map: fumeTex6, color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(0.08, 0.08, 1.0);
  sp.userData = { vx:0, vy:0, vz:0, life:0, maxLife:1.0, phase: Math.random()*Math.PI*2, speed: 0.18+Math.random()*0.15, delay: Math.random()*0.8, active: false };
  fumesGroup.add(sp); fumeParticles6.push(sp);
}
let fumesActive6 = false;
let currentFumeType6 = 'white';

function getTubeMouthWorldPos6() {
  const lp = new THREE.Vector3(-0.06, 0.62, -0.1);
  lp.applyMatrix4(testTubeGroup.matrixWorld);
  return lp;
}

function startFumes6(type) { fumesActive6 = true; currentFumeType6 = type || 'white'; }
function stopFumes6() {
  fumesActive6 = false;
  fumeParticles6.forEach(p => gsap.to(p.material, { opacity: 0, duration: 0.6 }));
}

function updateFumes6(dt, time) {
  if (!fumesActive6) return;
  const mouthPos = getTubeMouthWorldPos6();
  fumeParticles6.forEach(p => {
    const ud = p.userData;
    if (!ud.active) {
      ud.delay -= dt; if (ud.delay > 0) return;
      ud.active = true; ud.life = 0;
      ud.maxLife = 0.8 + Math.random() * 0.6;
      p.position.copy(mouthPos);
      p.position.x += (Math.random()-0.5)*0.02;
      p.position.y += (Math.random()-0.5)*0.02;
      p.position.z += (Math.random()-0.5)*0.02;
      ud.vx = -0.05 + (Math.random()-0.5)*0.04;
      ud.vy = 0.28 + Math.random()*0.15;
      ud.vz = (Math.random()-0.5)*0.04;
      
      // Mix CO2 bubble particles if sample has effervescence
      const sample = typeof MnO2Test !== 'undefined' ? MnO2Test.getSample() : null;
      if (sample && sample.hasEffervescence && Math.random() < 0.4) {
        p.material.map = co2BubbleTex;
        p.material.color.setHex(0xffffff);
        p.scale.set(0.045, 0.045, 1.0);
        ud.opacityTarget = 0.6;
        ud.isCO2 = true;
      } else {
        p.material.map = fumeTex6;
        let col = 0xffffff, opT = 0.25;
        if (currentFumeType6 === 'brown') { col = 0x9a4e10; opT = 0.85; }
        else if (currentFumeType6 === 'greenish') { col = 0x88dd44; opT = 0.70; }
        else { col = 0xe2efff; opT = 0.35; }
        p.material.color.setHex(col);
        p.scale.set(0.08, 0.08, 1.0);
        ud.opacityTarget = opT;
        ud.isCO2 = false;
      }
      return;
    }
    ud.life += dt;
    if (ud.life >= ud.maxLife) { ud.active = false; ud.delay = Math.random()*0.12; p.material.opacity = 0; return; }
    const t = ud.life / ud.maxLife;
    
    if (ud.isCO2) {
      // CO2 bubbles rise faster and straighter
      p.position.x += ud.vx * 0.35 * dt;
      p.position.y += ud.vy * 1.4 * dt;
      p.position.z += ud.vz * 0.35 * dt;
      const s = 0.045 + t * 0.12; p.scale.set(s, s, 1.0);
    } else {
      p.position.x += ud.vx * dt + Math.sin(time*6+ud.phase)*0.04*dt;
      p.position.y += ud.vy * dt;
      p.position.z += ud.vz * dt + Math.cos(time*5+ud.phase)*0.04*dt;
      const s = 0.08 + t * 0.38; p.scale.set(s, s, 1.0);
    }
    
    const maxOp = ud.opacityTarget || 0.35;
    p.material.opacity = t < 0.25 ? (t/0.25)*maxOp : (1.0-t)*maxOp;
  });
}

// 2. Boiling bubbles inside tube
// Dynamic glassy CO2 bubble texture generator
const co2BubbleTex = (function() {
  const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, s, s);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(s/2, s/2, s/2 - 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(s/2 - 8, s/2 - 8, 4, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(cv);
})();

// Surface foam layer for Oxalate effervescence
const foamGroup = new THREE.Group();
foamGroup.position.set(0, 0.20, 0); // Liquid surface height inside test tube
testTubeGroup.add(foamGroup);
const foamBubbles = [];
const foamMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.1,
  metalness: 0.1,
  transparent: true,
  opacity: 0.0,
  depthWrite: false
});
for (let i = 0; i < 20; i++) {
  const r = 0.01 + Math.random() * 0.015;
  const f = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 6), foamMat);
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * 0.045; // fit inside test tube (radius ~0.065)
  f.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 0.012, Math.sin(angle) * dist);
  foamGroup.add(f);
  foamBubbles.push(f);
}

function updateFoam6(dt, time) {
  if (!boilingActive6 || !foamGroup.visible) return;
  foamBubbles.forEach((f, i) => {
    f.position.y = Math.sin(time * 8 + i) * 0.003;
    const s = 1.0 + Math.sin(time * 12 + i) * 0.15;
    f.scale.set(s, s, s);
  });
}

const boilBubbles6 = [];
const boilBubbleGroup6 = new THREE.Group(); testTubeGroup.add(boilBubbleGroup6);
for (let i = 0; i < 35; i++) {
  const b = new THREE.Mesh(
    new THREE.SphereGeometry(0.005, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, roughness: 0.1, metalness: 0.1, depthWrite: false })
  );
  b.userData = { vy: 0.2, phase: Math.random() * 10, active: false, size: 0.005 };
  boilBubbleGroup6.add(b); boilBubbles6.push(b);
}

let boilingActive6 = false;

function startBoiling6() {
  boilingActive6 = true;
  const sample = typeof MnO2Test !== 'undefined' ? MnO2Test.getSample() : null;
  const isBrisk = sample && sample.hasEffervescence;

  // Show foam if brisk (oxalate present)
  if (isBrisk) {
    foamGroup.visible = true;
    gsap.to(foamMat, { opacity: 0.85, duration: 1.0 });
  } else {
    foamGroup.visible = false;
    foamMat.opacity = 0.0;
  }

  boilBubbles6.forEach((b, i) => {
    let size, speed, opacity;
    if (isBrisk) {
      // Brisk effervescence: lots of bubbles, larger, rising fast
      size = 0.012 + Math.random() * 0.012; // size 0.012 to 0.024
      speed = 0.4 + Math.random() * 0.4;   // speed 0.4 to 0.8
      opacity = 0.75 + Math.random() * 0.15;
    } else {
      // Gentle boiling: fewer bubbles (only activate first 12), smaller, slower
      if (i >= 12) {
        b.userData.active = false;
        b.material.opacity = 0.0;
        return;
      }
      size = 0.005 + Math.random() * 0.007; // size 0.005 to 0.012
      speed = 0.15 + Math.random() * 0.15;  // speed 0.15 to 0.3
      opacity = 0.4 + Math.random() * 0.2;
    }

    b.scale.setScalar(size / 0.005);
    b.material.opacity = opacity;

    // Position bubbles in the front half of the cylinder so they are visible on top of opaque solids
    const angle = -Math.PI / 2 + Math.random() * Math.PI; // front 180 degrees
    const dist = 0.052 + Math.random() * 0.012;         // close to glass wall
    b.position.set(
      Math.sin(angle) * dist,
      0.02 + Math.random() * 0.15,                      // start heights
      Math.cos(angle) * dist                            // positive Z faces camera
    );

    b.userData.vy = speed;
    b.userData.size = size;
    b.userData.active = true;
  });
}

function stopBoiling6() {
  boilingActive6 = false;
  boilBubbles6.forEach(b => {
    b.material.opacity = 0;
    b.userData.active = false;
  });
  gsap.to(foamMat, { opacity: 0, duration: 0.5, onComplete: () => { foamGroup.visible = false; } });
}

function updateBoiling6(dt) {
  if (!boilingActive6) return;
  const sample = typeof MnO2Test !== 'undefined' ? MnO2Test.getSample() : null;
  const isBrisk = sample && sample.hasEffervescence;
  const limitY = 0.20; // liquid surface height

  boilBubbles6.forEach((b, i) => {
    if (!b.userData.active) return;
    b.position.y += b.userData.vy * dt;
    b.position.x += Math.sin(b.position.y * 30 + b.userData.phase) * 0.008 * dt;

    if (b.position.y > limitY) {
      if (isBrisk) {
        // Recycle bubble to bottom of liquid (y = 0.02)
        b.position.y = 0.02 + Math.random() * 0.03;
        const angle = -Math.PI / 2 + Math.random() * Math.PI;
        const dist = 0.052 + Math.random() * 0.012;
        b.position.x = Math.sin(angle) * dist;
        b.position.z = Math.cos(angle) * dist;
        
        const size = 0.012 + Math.random() * 0.012;
        b.scale.setScalar(size / 0.005);
        b.userData.vy = 0.4 + Math.random() * 0.4;
      } else {
        // Recycle bubble with gentle parameters
        b.position.y = 0.04 + Math.random() * 0.03;
        const angle = -Math.PI / 2 + Math.random() * Math.PI;
        const dist = 0.052 + Math.random() * 0.012;
        b.position.x = Math.sin(angle) * dist;
        b.position.z = Math.cos(angle) * dist;
      }
    }
  });
}

// ── LAB SINKS ─────────────────────────────────────────────────────────────
const labSinkLeft  = new LabSink(scene, { x: -8, y: 0, z: -1.7 });
const labSinkRight = new LabSink(scene, { x: 8, y: 0, z: -1.7 });
labSinkLeft.turnOn(); labSinkRight.turnOn();

// ── ANIMATION STATE ───────────────────────────────────────────────────────
let selectedSampleId6 = '';
let mno2Added6 = false;
let acid6Added = false;
let burner6Placed = false;
let flame6Lit = false;

function setLabelsOpacity6(opacity) {
  const labels = [retortLabel, bunsenLabel, mno2Lbl, acidLbl, starchLbl, fluorLbl, limewaterLbl, lighterLbl, bottleLabelSprite];
  labels.forEach(l => { if (l && l.material) gsap.to(l.material, { opacity, duration: 0.3 }); });
}

function loadSubstanceInTube6() {
  substanceMat.color.setHex(0xefefe7);
  substance.scale.set(1,1,1); substance.position.y = 0.05;
  glassMat.roughness = 0.05; glassMat.metalness = 0.1;
  heatingGlassMat.emissive.setRGB(0,0,0); heatingGlassMat.emissiveIntensity = 0;
  acidLiquid.visible = false; liquidMat.opacity = 0.0;
}

// ── ANIMATION FUNCTIONS ───────────────────────────────────────────────────

// 1. Take sample
function animateTakeSample6(sampleId, onComplete) {
  selectedSampleId6 = sampleId;
  mno2Added6 = false; acid6Added = false; burner6Placed = false; flame6Lit = false;

  gsap.to(controls.target, { x: -0.3, y: 0.5, z: 0.3, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, { radius: 3.0, phi: Math.PI/3, theta: -Math.PI/8, duration: 1.5, onUpdate: () => controls._update() });
  setLabelsOpacity6(0);

  gsap.to(mixtureBottleGroup.position, {
    x: -0.9, y: 0.2, z: 0.2, duration: 1.2, ease: 'power2.out',
    onComplete: () => {
      // Simulate scooping into tube
      substance.visible = true;
      loadSubstanceInTube6();
      setLabelsOpacity6(1);
      if (onComplete) onComplete();
    }
  });
}

// 2. Add MnO₂
function animateAddMnO2(onComplete) {
  setLabelsOpacity6(0);
  gsap.timeline()
    .to(mno2JarGroup.position, { x: -0.5, y: 0.2, z: 0.2, duration: 1.0, ease: 'power2.out' })
    .to(mno2JarLid.position, { y: 0.32, duration: 0.4 })
    .add(() => {
      // Show MnO₂ dark layer on substance
      mno2Layer.visible = true;
      gsap.to(mno2Layer.material, { opacity: 1, duration: 0.5 });
    })
    .to(mno2JarLid.position, { y: 0.16, duration: 0.4 })
    .to(mno2JarGroup.position, { x: -0.7, y: 2.68, z: -1.25, duration: 1.0, ease: 'power2.inOut' })
    .add(() => {
      mno2Added6 = true;
      setLabelsOpacity6(1);
      if (onComplete) onComplete();
    });
}

// 3. Add Acid
function animateAddAcid6(onComplete) {
  setLabelsOpacity6(0);
  gsap.timeline()
    .to(acidBottleCap.position, { y: 0.38, z: 0.15, duration: 0.5, ease: 'power2.out' })
    .to(acidBottleGroup.position, { x: -0.7, y: 0.2, z: 0.2, duration: 1.0, ease: 'power2.out' })
    .add(() => {
      const tubeMouth = getTubeMouthWorldPos6();
      const targetPos = { x: tubeMouth.x, y: tubeMouth.y + 0.55, z: tubeMouth.z };
      dropper.dispense(targetPos, '#eedda8', 4, () => {
        acidLiquid.visible = true;
        gsap.to(liquidMat, { opacity: 0.65, duration: 1.0 });
        gsap.timeline()
          .to(acidBottleGroup.position, { x: -0.1, y: 2.68, z: -1.25, duration: 1.0, ease: 'power2.inOut' })
          .to(acidBottleCap.position, { y: 0.19, z: 0, duration: 0.5, ease: 'power2.in' })
          .add(() => {
            acid6Added = true;
            setLabelsOpacity6(1);
            if (onComplete) onComplete();
          });
      });
    });
}

// 4. Countdown overlay for warming
let countdownEl6 = null;
let countdownTimerId = null;
function showReactionCountdown6(seconds, onDone) {
  if (countdownEl6) countdownEl6.remove();
  if (countdownTimerId) {
    clearTimeout(countdownTimerId);
    countdownTimerId = null;
  }
  setLabelsOpacity6(0);
  const div = document.createElement('div');
  div.style.cssText = `
    position: fixed; bottom: 154px; left: 50%; transform: translateX(-50%);
    background: rgba(12,18,30,0.9); border: 2px solid #9f7aea; border-radius: 12px;
    padding: 12px 24px; color: #e2f4ff; font-size: 1rem; z-index: 200;
    text-align: center; pointer-events: none; backdrop-filter: blur(4px);
    box-shadow: 0 0 20px rgba(159,122,234,0.3);
  `;
  document.body.appendChild(div);
  countdownEl6 = div;

  // Move burner under tube
  gsap.to(bunsen.position, { x: -0.57, y: 0, z: 0.22, duration: 0.8, ease: 'power2.inOut' });
  setTimeout(() => {
    startBunsenFlame6();
    flame6Lit = true;
    gsap.to(retortGroup.position, { y: -0.06, duration: 1.5, ease: 'power1.inOut' });
    gsap.to(heatingGlassMat.emissive, { r: 1.0, g: 0.15, b: 0, duration: 3.5 });
    gsap.to(heatingGlassMat, { emissiveIntensity: 1.8, duration: 3.5 });
    startBoiling6();
  }, 500);

  let remaining = seconds;
  function tick() {
    if (!countdownEl6) return;
    let effInfo = "";
    const sample = typeof MnO2Test !== 'undefined' ? MnO2Test.getSample() : null;
    if (sample && sample.hasEffervescence) {
      effInfo = `<br><span style="color:#68d391; font-weight:bold; font-size:0.82rem; display:block; margin-top:4px;">⚠ Brisk Effervescence: Colourless CO₂ gas is bubbling vigorously!</span>`;
    }
    div.innerHTML = `Warming with MnO₂ + H₂SO₄… <b style="color:#f6e05e;font-size:1.25em">${remaining}s</b><br>
      <span style="font-size:0.8rem;color:#a0aec0">Observe evolved gas &amp; effervescence (bubbling)</span>${effInfo}`;
    if (remaining <= 0) {
      div.remove(); countdownEl6 = null;
      countdownTimerId = null;
      setLabelsOpacity6(1);
      if (onDone) onDone();
      return;
    }
    remaining--;
    countdownTimerId = setTimeout(tick, 1000);
  }
  tick();
}

// 5. Waft animation
function animateWaft6(sample, onComplete) {
  setLabelsOpacity6(0);
  const origRadius = controls.radius, origTheta = controls.theta;
  gsap.timeline()
    .to(controls, { radius: Math.max(1.0, origRadius-0.22), theta: origTheta+0.08, duration: 0.9, ease: 'power1.inOut', onUpdate: () => controls._update() })
    .to(controls, { theta: origTheta-0.08, duration: 0.9, ease: 'power1.inOut', onUpdate: () => controls._update() })
    .to(controls, { radius: origRadius, theta: origTheta, duration: 0.6, ease: 'power2.inOut', onUpdate: () => controls._update() })
    .add(() => { setLabelsOpacity6(1); if (onComplete) onComplete(); });
}

// 6. Starch iodide paper test
function animateStarchTest(sample, onComplete) {
  setLabelsOpacity6(0);
  const mouthWorld = getTubeMouthWorldPos6();
  gsap.to(controls.target, { x: mouthWorld.x, y: mouthWorld.y, z: mouthWorld.z, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, { radius: 1.2, phi: Math.PI/2.3, theta: -Math.PI/6, duration: 1.5, ease: 'power2.inOut', onUpdate: () => controls._update() });
  gsap.timeline()
    .set(starchPaperGroup.rotation, { x: 0, y: 0, z: 0 })
    .set(starchPaperGroup.position, { x: mouthWorld.x+0.35, y: mouthWorld.y+0.35, z: mouthWorld.z })
    .to(starchPaperGroup.position, { x: mouthWorld.x+0.09, y: mouthWorld.y+0.12, z: mouthWorld.z, duration: 1.2, ease: 'power2.out' })
    .add(() => {
      if (sample.hasChloride) {
        // Paper turns blue for Cl₂
        gsap.to(starchPaperMat.color, { r: 0.1, g: 0.15, b: 0.9, duration: 1.5 });
      }
      setTimeout(onComplete, 1800);
    });
}

// 7. Fluorescence paper test
function animateFluorescenceTest6(sample, onComplete) {
  setLabelsOpacity6(0);
  const mouthWorld = getTubeMouthWorldPos6();
  gsap.to(controls.target, { x: mouthWorld.x, y: mouthWorld.y, z: mouthWorld.z, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, { radius: 1.2, phi: Math.PI/2.3, theta: -Math.PI/6, duration: 1.5, ease: 'power2.inOut', onUpdate: () => controls._update() });
  gsap.timeline()
    .set(fluorescencePaperGroup.rotation, { x: 0, y: 0, z: 0 })
    .set(fluorescencePaperGroup.position, { x: mouthWorld.x+0.35, y: mouthWorld.y+0.35, z: mouthWorld.z })
    .to(fluorescencePaperGroup.position, { x: mouthWorld.x+0.09, y: mouthWorld.y+0.12, z: mouthWorld.z, duration: 1.2, ease: 'power2.out' })
    .add(() => {
      if (sample.hasBromide) {
        gsap.to(fluorPaperMat.color, { r: 1.0, g: 0.1, b: 0.1, duration: 1.5 });
      }
      setTimeout(onComplete, 1800);
    });
}

// 8. Limewater test
function animateLimewaterTest(sample, onComplete) {
  setLabelsOpacity6(0);
  const mouthWorld = getTubeMouthWorldPos6();
  const beakerTarget = new THREE.Vector3(mouthWorld.x, mouthWorld.y - 0.15, mouthWorld.z + 0.05);
  gsap.to(controls.target, { x: beakerTarget.x, y: beakerTarget.y, z: beakerTarget.z, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, { radius: 1.0, phi: Math.PI / 2.2, theta: Math.PI / 4, duration: 1.5, ease: 'power2.inOut', onUpdate: () => controls._update() });
  
  // Animate limewater beaker to below tube mouth to "collect" gas
  gsap.timeline()
    .to(limewaterGroup.position, { x: mouthWorld.x, y: mouthWorld.y - 0.25, z: mouthWorld.z + 0.1, duration: 1.2, ease: 'power2.out' })
    .add(() => {
      startLwBubbling();
      if (sample.hasOxalate) {
        // Turns milky — change to opaque white
        gsap.to(limewaterMat.color, { r: 1.0, g: 1.0, b: 1.0, duration: 1.8 });
        gsap.to(limewaterMat, { opacity: 0.96, duration: 1.8 });
      }
      setTimeout(onComplete, 1800);
    });
}

// 9. Stop gas test animations
function stopGasTestAnimations6() {
  gsap.to(controls.target, { x: -0.3, y: 0.5, z: 0.3, duration: 1.2, ease: 'power2.inOut' });
  gsap.to(controls, { radius: 3.0, phi: Math.PI/3, theta: -Math.PI/8, duration: 1.2, onUpdate: () => controls._update() });

  gsap.to(starchPaperGroup.position, { x: -1.6, y: 1.66, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(starchPaperGroup.rotation, { x: Math.PI/2, y: 0, z: Math.PI/4, duration: 1.0 });

  gsap.to(fluorescencePaperGroup.position, { x: -0.9, y: 1.66, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(fluorescencePaperGroup.rotation, { x: Math.PI/2, y: 0, z: Math.PI/4, duration: 1.0 });

  gsap.to(limewaterGroup.position, { x: 0.6, y: 1.62, z: -1.25, duration: 1.0, ease: 'power2.out' });

  stopLwBubbling();
  setLabelsOpacity6(1);
}

// 10. stopHeating6
function stopHeating6() {
  if (countdownEl6) { countdownEl6.remove(); countdownEl6 = null; }
  if (countdownTimerId) { clearTimeout(countdownTimerId); countdownTimerId = null; }
  stopBunsenFlame6(); stopFumes6(); stopBoiling6(); stopLwBubbling();
  gsap.to(bunsen.position, { x: -0.72, y: 0, z: 0.48, duration: 1.0 });
  gsap.to(retortGroup.position, { y: 0.015, duration: 1.0 });
  gsap.to(heatingGlassMat.emissive, { r: 0, g: 0, b: 0, duration: 2.0 });
  gsap.to(heatingGlassMat, { emissiveIntensity: 0, duration: 2.0 });
  gsap.to(glassMat, { roughness: 0.05, metalness: 0.1, duration: 2.0 });
  substance.visible = false; mno2Layer.visible = false;
  acidLiquid.visible = false; liquidMat.opacity = 0.0;
  gsap.to(mixtureBottleGroup.position, { x: -1.3, y: 2.68, z: -1.25, duration: 1.0 });
  // Reset paper colours
  const white = new THREE.Color(0xf0f0ee);
  gsap.to(starchPaperMat.color, { r: white.r, g: white.g, b: white.b, duration: 1.0 });
  const yg = new THREE.Color(0xe2f35d);
  gsap.to(fluorPaperMat.color, { r: yg.r, g: yg.g, b: yg.b, duration: 1.0 });
  const lw = new THREE.Color(0xd8f0ff);
  gsap.to(limewaterMat.color, { r: lw.r, g: lw.g, b: lw.b, duration: 1.0 });
  gsap.to(limewaterMat, { opacity: 0.35, duration: 1.0 });
  mno2Added6 = false; acid6Added = false; burner6Placed = false; flame6Lit = false;
  stopGasTestAnimations6();
}

// ── KEYBOARD GUIDE TEXT (required by MnO2Test.js) ─────────────────────────
function updateKeyboardGuideText() {
  // delegated to MnO2Test via updateKeyGuide() — this stub prevents errors from other shared modules
}

// ── RAYCASTING ────────────────────────────────────────────────────────────
const raycaster6 = new THREE.Raycaster();
const mouse6 = new THREE.Vector2();
let hoveredObject6 = null;

function highlightGroup6(group, active) {
  if (!group) return;
  group.traverse(child => {
    if (child.isMesh && child.material) {
      if (child.userData.originalEmissive6 === undefined) {
        child.userData.originalEmissive6 = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0,0,0);
        child.userData.originalIntensity6 = child.material.emissiveIntensity || 0;
      }
      if (active) { if (child.material.emissive) { child.material.emissive.setHex(0x442288); child.material.emissiveIntensity = 0.9; } }
      else { if (child.material.emissive) { child.material.emissive.copy(child.userData.originalEmissive6); child.material.emissiveIntensity = child.userData.originalIntensity6; } }
    }
  });
}

function getIntersectedInteractive6(intersects) {
  for (const intersect of intersects) {
    let obj = intersect.object;
    while (obj && obj !== scene) {
      if (obj.userData && obj.userData.isSinkKnob) return { type: 'sinkKnob', group: obj };
      if (obj === mixtureBottleGroup) return { type: 'bottle', group: obj };
      if (obj === mno2JarGroup) return { type: 'mno2jar', group: obj };
      if (obj === acidBottleGroup) return { type: 'acidbottle', group: obj };
      if (obj === bunsen) return { type: 'burner', group: obj };
      if (obj === testTubeGroup || obj === retortGroup) return { type: 'testtube', group: obj };
      if (obj === starchPaperGroup) return { type: 'starch', group: obj };
      if (obj === fluorescencePaperGroup) return { type: 'fluorescence', group: obj };
      if (obj === limewaterGroup) return { type: 'limewater', group: obj };
      obj = obj.parent;
    }
  }
  return null;
}

window.addEventListener('mousemove', (event) => {
  mouse6.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse6.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster6.setFromCamera(mouse6, camera);
  const intersects = raycaster6.intersectObjects(scene.children, true);
  const intersected = getIntersectedInteractive6(intersects);
  let isInteractive = false;
  if (intersected) {
    if (intersected.type === 'sinkKnob') {
      isInteractive = true;
    } else if (typeof MnO2Test !== 'undefined') {
      const state = MnO2Test.getState();
      if (intersected.type === 'bottle' && state === 'IDLE') isInteractive = true;
      if (intersected.type === 'mno2jar' && state === 'SAMPLE_SELECTED') isInteractive = true;
      if (intersected.type === 'acidbottle' && state === 'MNO2_ADDED') isInteractive = true;
      if (intersected.type === 'burner' && state === 'ACID_ADDED') isInteractive = true;
      if (intersected.type === 'testtube' && state === 'HEATED') isInteractive = true;
      if ((state === 'OBSERVED' || state === 'TESTED_GAS') && ['starch', 'fluorescence', 'limewater'].includes(intersected.type)) isInteractive = true;
    }
  }
  if (isInteractive) {
    document.body.style.cursor = 'pointer';
    if (hoveredObject6 !== intersected.group) { highlightGroup6(hoveredObject6, false); hoveredObject6 = intersected.group; highlightGroup6(hoveredObject6, true); }
  } else {
    document.body.style.cursor = 'default';
    if (hoveredObject6) { highlightGroup6(hoveredObject6, false); hoveredObject6 = null; }
  }
});

window.addEventListener('click', () => {
  if (!hoveredObject6) return;
  raycaster6.setFromCamera(mouse6, camera);
  const intersects = raycaster6.intersectObjects(scene.children, true);
  const intersected = getIntersectedInteractive6(intersects);
  if (!intersected) return;
  if (intersected.type === 'sinkKnob') {
    highlightGroup6(hoveredObject6, false); hoveredObject6 = null; document.body.style.cursor = 'default';
    return;
  }
  if (typeof MnO2Test === 'undefined') return;
  const state = MnO2Test.getState();
  highlightGroup6(hoveredObject6, false); hoveredObject6 = null; document.body.style.cursor = 'default';
  if (intersected.type === 'bottle' && state === 'IDLE') MnO2Test.selectSample('random');
  else if (intersected.type === 'mno2jar' && state === 'SAMPLE_SELECTED') MnO2Test.addMnO2();
  else if (intersected.type === 'acidbottle' && state === 'MNO2_ADDED') MnO2Test.addAcid();
  else if (intersected.type === 'burner' && state === 'ACID_ADDED') MnO2Test.warmTube();
  else if (intersected.type === 'testtube' && state === 'HEATED') MnO2Test.waftGas();
  else if (intersected.type === 'starch' && (state === 'OBSERVED' || state === 'TESTED_GAS')) MnO2Test.conductGasTest('starch');
  else if (intersected.type === 'fluorescence' && (state === 'OBSERVED' || state === 'TESTED_GAS')) MnO2Test.conductGasTest('fluorescence');
  else if (intersected.type === 'limewater' && (state === 'OBSERVED' || state === 'TESTED_GAS')) MnO2Test.conductGasTest('limewater');
});

// ── RESIZE ────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── RENDER LOOP ───────────────────────────────────────────────────────────
let prevTime6 = performance.now();
function animate6() {
  requestAnimationFrame(animate6);
  const now = performance.now();
  const dt = Math.min((now - prevTime6) / 1000, 0.05);
  prevTime6 = now;
  const time = now / 1000;
  controls._update();
  updateFumes6(dt, time);
  updateBoiling6(dt);
  updateFoam6(dt, time);
  updateLwBubbling(dt);
  if (typeof labSinkLeft !== 'undefined' && labSinkLeft.update) labSinkLeft.update(time);
  if (typeof labSinkRight !== 'undefined' && labSinkRight.update) labSinkRight.update(time);
  renderer.render(scene, camera);
}
animate6();
