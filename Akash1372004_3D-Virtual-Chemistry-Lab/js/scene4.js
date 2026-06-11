/**
 * scene4.js — Action of Heat Lab Scene (Experiment 4)
 * Premium 3D experience with Bunsen burner, test tube, gas fumes, and chemical tests.
 */

// ── Label Helper ───────────────────────────────────────────────────────────
function makeLabel(text, opts = {}) {
  const {
    fontSize = 20, bgColor = 'rgba(10,20,40,0.65)',
    textColor = '#e2f4ff', borderColor = '#63b3ed',
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
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
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
scene.background = new THREE.Color(0x4a5260);
scene.fog        = new THREE.FogExp2(0x3a4250, 0.038);

// PMREM Environment Map Setup
function createCanvasElement(color, size = 128) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(size, size);
  ctx.moveTo(size, 0); ctx.lineTo(0, size);
  ctx.stroke();
  return cv;
}

function createCanvasTexture(color, size = 128) {
  const cv = createCanvasElement(color, size);
  return new THREE.CanvasTexture(cv);
}

function applyTextureSettings(texture, repeatX = 1, repeatY = 1) {
  if (!texture) return;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  if (THREE.sRGBEncoding !== undefined) {
    texture.encoding = THREE.sRGBEncoding;
  } else {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
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
camera.position.set(0, 2.6, 5.8);
camera.lookAt(0, 0.7, 0);

setupLighting(scene);
const controls = new OrbitControls(camera, canvas);
controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go under floor

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT SETUP
// ═══════════════════════════════════════════════════════════════════════════

// Floor (tiled)
const floorMat = new THREE.MeshStandardMaterial({
  map: createLabFloorTex(64),
  roughness: 0.38,
  metalness: 0.08
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -3.25;
floor.receiveShadow = true;
scene.add(floor);

// Wall
const wallMat = new THREE.MeshStandardMaterial({
  map: createLabWallTex(),
  roughness: 0.85
});

// Back Wall
const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), wallMat);
wall.position.set(0, 10 - 3.25, -10);
wall.receiveShadow = true;
scene.add(wall);

// Left Wall
const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), wallMat);
leftWall.position.set(-20, 10 - 3.25, 0);
leftWall.rotation.y = Math.PI / 2;
scene.add(leftWall);

// Right Wall
const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), wallMat);
rightWall.position.set(20, 10 - 3.25, 0);
rightWall.rotation.y = -Math.PI / 2;
scene.add(rightWall);

// Ceiling
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.set(0, 20 - 3.25, 0);
scene.add(ceiling);

// Main Table
const woodMat = new THREE.MeshStandardMaterial({
  map: createSharedBenchWoodTex(),
  color: 0x5a3010,
  roughness: 0.80,
  metalness: 0.02
});
const tableGeo = new THREE.BoxGeometry(18, 0.5, 5);
const benchTop = new THREE.Mesh(tableGeo, woodMat);
benchTop.position.set(0, -0.25, 0.2);
benchTop.receiveShadow = true;
benchTop.castShadow    = true;
scene.add(benchTop);

// Black border
const blackMat = new THREE.MeshStandardMaterial({
  color: 0x1f1f1f
});
const borderGeo = new THREE.BoxGeometry(18.2, 0.2, 5.2);
const border = new THREE.Mesh(borderGeo, blackMat);
border.position.set(0, -0.5, 0.2);
scene.add(border);

// Cabinets
const greyMat = new THREE.MeshStandardMaterial({
  color: 0xbcbcbc,
  roughness: 0.4
});
function createCabinet(x, z) {
  const geo = new THREE.BoxGeometry(2.5, 3, 2.2);
  const cabinet = new THREE.Mesh(geo, greyMat);
  cabinet.position.set(x, 1.3 - 3.25, z); // Shifted
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  scene.add(cabinet);
}
createCabinet(-7, 0.2);
createCabinet(-4.3, 0.2);
createCabinet(4.3, 0.2);
createCabinet(7, 0.2);

// Drawers
function createDrawer(y) {
  const geo = new THREE.BoxGeometry(2.5, 0.8, 2.2);
  const drawer = new THREE.Mesh(geo, woodMat);
  drawer.position.set(0, y - 3.25, 0.2); // Shifted
  drawer.castShadow = true;
  drawer.receiveShadow = true;
  scene.add(drawer);
}
createDrawer(2.1);
createDrawer(1.1);
createDrawer(0.1);

// Procedural wood texture generator for the shelf cabinet
function makeBenchWoodTex() {
  const W = 512, H = 256;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#2a120a';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * W;
    const w = 0.5 + Math.random() * 3.0;
    const isLight = Math.random() > 0.5;
    const alpha = 0.03 + Math.random() * 0.08;
    ctx.strokeStyle = isLight ? `rgba(200,140,80,${alpha})` : `rgba(30,10,0,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= H; y += 20) {
      ctx.lineTo(x + Math.sin(y * 0.04 + i) * 3, y);
    }
    ctx.lineWidth = w;
    ctx.stroke();
  }
  return new THREE.CanvasTexture(cv);
}

const woodTex = makeBenchWoodTex();
woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
woodTex.repeat.set(4, 2);


// ── MULTI-TIER WOODEN SHELF ────────────────────────────────────────────────
const shelfMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0x5a4020, roughness: 0.8, metalness: 0.1 });
const shelfGroup = new THREE.Group();
scene.add(shelfGroup);

// Backboard
const backboard = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.0, 0.04), shelfMat);
backboard.position.set(0, 2.0, -1.52);
backboard.receiveShadow = true;
shelfGroup.add(backboard);

// Left side panel
const leftSide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.4), shelfMat);
leftSide.position.set(-1.87, 2.0, -1.32);
leftSide.castShadow = leftSide.receiveShadow = true;
shelfGroup.add(leftSide);

// Right side panel
const rightSide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.4), shelfMat);
rightSide.position.set(1.87, 2.0, -1.32);
rightSide.castShadow = rightSide.receiveShadow = true;
shelfGroup.add(rightSide);

// Top panel
const topPanel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.4), shelfMat);
topPanel.position.set(0, 3.47, -1.32);
topPanel.castShadow = topPanel.receiveShadow = true;
shelfGroup.add(topPanel);

// Bottom panel
const bottomPanel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.4), shelfMat);
bottomPanel.position.set(0, 0.53, -1.32);
bottomPanel.castShadow = bottomPanel.receiveShadow = true;
shelfGroup.add(bottomPanel);

// Shelf 1 (Middle Lower)
const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.04, 0.38), shelfMat);
shelf1.position.set(0, 1.5, -1.32);
shelf1.castShadow = shelf1.receiveShadow = true;
shelfGroup.add(shelf1);

// Shelf 2 (Middle Upper)
const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.04, 0.38), shelfMat);
shelf2.position.set(0, 2.5, -1.32);
shelf2.castShadow = shelf2.receiveShadow = true;
shelfGroup.add(shelf2);

// ── ACTIVE MIXTURE BOTTLE (initially on shelf top tier) ─────────────────────
const mixtureBottleGroup = new THREE.Group();
const bottleBodyMat = new THREE.MeshPhysicalMaterial({
  color: 0xf5f5dc, transparent: true, opacity: 0.45, roughness: 0.1, transmission: 0.5
});
mixtureBottleGroup.add(new THREE.Mesh(
  new THREE.CylinderGeometry(0.09, 0.09, 0.32, 20), bottleBodyMat
));
const bottleCap = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16),
  new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 })
);
bottleCap.position.y = 0.19;
mixtureBottleGroup.add(bottleCap);

const bottlePowder = new THREE.Mesh(
  new THREE.CylinderGeometry(0.076, 0.076, 0.12, 16),
  new THREE.MeshStandardMaterial({ color: 0xefefe7, roughness: 0.95 })
);
bottlePowder.position.y = -0.09;
mixtureBottleGroup.add(bottlePowder);

mixtureBottleGroup.position.set(-1.0, 2.68, -1.25);
scene.add(mixtureBottleGroup);

// Bottle label
const bottleLabel = makeLabel('Mixture Bottle', { fontSize: 16, width: 155, height: 36 });
bottleLabel.position.set(0, 0.38, 0.15);
mixtureBottleGroup.add(bottleLabel);

// ── SPATULA (initially on shelf top tier) ──────────────────────────────────
const spatulaGroup = new THREE.Group();
const spatulaHandle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.006, 0.006, 0.5, 8),
  new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 })
);
spatulaHandle.position.y = 0.25;
spatulaGroup.add(spatulaHandle);

const spatulaSpoon = new THREE.Mesh(
  new THREE.BoxGeometry(0.04, 0.008, 0.08),
  new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 })
);
spatulaSpoon.position.y = 0.0;
spatulaGroup.add(spatulaSpoon);

const spatulaPowder = new THREE.Mesh(
  new THREE.CylinderGeometry(0.015, 0.018, 0.01, 10),
  new THREE.MeshStandardMaterial({ color: 0xefefe7, roughness: 0.9 })
);
spatulaPowder.position.y = 0.008;
spatulaPowder.visible = false;
spatulaGroup.add(spatulaPowder);

spatulaGroup.position.set(-0.2, 2.524, -1.25); // rest position on top shelf
spatulaGroup.rotation.set(Math.PI / 2, 0, -Math.PI / 4); // lie flat
scene.add(spatulaGroup);

// Spatula label
const spatulaLabel = makeLabel('Spatula', { fontSize: 16, width: 120, height: 36 });
spatulaLabel.position.set(0, 0.35, 0);
spatulaGroup.add(spatulaLabel);

// ── GAS LIGHTER (initially on shelf middle tier) ───────────────────────────
const lighterGroup = new THREE.Group();
const lighterBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.05, 0.28, 0.03),
  new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.5 })
);
lighterGroup.add(lighterBody);
const lighterNozzle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8),
  new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 })
);
lighterNozzle.position.y = 0.25;
lighterGroup.add(lighterNozzle);
lighterGroup.position.set(0.6, 1.66, -1.25);
lighterGroup.rotation.set(Math.PI / 2, 0, Math.PI / 6);
scene.add(lighterGroup);

const lighterLabel = makeLabel('Gas Lighter', { fontSize: 16, width: 135, height: 36 });
lighterLabel.position.set(0, 0.35, 0);
lighterGroup.add(lighterLabel);

// ═══════════════════════════════════════════════════════════════════════════
// APPARATUS SETUP
// ═══════════════════════════════════════════════════════════════════════════

// Retort Stand (holding heated test tube)
const retortGroup = new THREE.Group();
const retortBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.4), new THREE.MeshStandardMaterial({ color: 0x252525, roughness: 0.6 }));
retortBase.castShadow = retortBase.receiveShadow = true;
retortGroup.add(retortBase);

const retortRod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.3, 12), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 }));
retortRod.position.set(0.2, 0.65, -0.1);
retortRod.castShadow = true;
retortGroup.add(retortRod);

// Retort Clamp Bosshead
const clampBoss = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 }));
clampBoss.position.set(0.2, 0.7, -0.1);
retortGroup.add(clampBoss);

const clampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 }));
clampArm.rotation.z = Math.PI / 2;
clampArm.position.set(0.1, 0.7, -0.1);
retortGroup.add(clampArm);

// Heated Test Tube Group
const testTubeGroup = new THREE.Group();

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xe5f6ff, transparent: true, opacity: 0.22,
  roughness: 0.05, transmission: 0.9, side: THREE.DoubleSide, depthWrite: false
});

const heatingGlassMat = new THREE.MeshPhysicalMaterial({
  color: 0xe5f6ff, transparent: true, opacity: 0.22,
  roughness: 0.05, transmission: 0.9, side: THREE.DoubleSide, depthWrite: false,
  emissive: 0x000000, emissiveIntensity: 0.0
});

// Test tube body (tilted in real setups)
const tubeCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 24, 1, true), glassMat);
tubeCyl.position.y = 0.31;
testTubeGroup.add(tubeCyl);

const tubeSph = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), heatingGlassMat);
tubeSph.rotation.x = Math.PI;
testTubeGroup.add(tubeSph);

// Rim
const rim = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.005, 8, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0xaaccff, emissiveIntensity: 0.1 }));
rim.position.y = 0.62;
rim.rotation.x = Math.PI / 2;
testTubeGroup.add(rim);

// Substance at bottom
const substanceMat = new THREE.MeshStandardMaterial({ color: 0xefefe7, roughness: 0.95 });
const substance = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.09, 20), substanceMat);
substance.position.y = 0.05;
testTubeGroup.add(substance);

// Position heated tube group relative to clamp
testTubeGroup.position.set(-0.06, 0.7, -0.1);
testTubeGroup.rotation.z = -Math.PI / 6; // 30 degree heating angle
retortGroup.add(testTubeGroup);

retortGroup.position.set(-0.4, 0.015, 0.3);
scene.add(retortGroup);

const retortLabel = makeLabel('Heating Tube', { fontSize: 17, width: 150, height: 36 });
retortLabel.position.set(-0.4, 1.48, 0.42);
scene.add(retortLabel);

// ── Bunsen Burner ──────────────────────────────────────────────────────────
const bunsen = new THREE.Group();
const bunsenBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.4 }));
bunsenBase.position.y = 0.025;
bunsen.add(bunsenBase);

const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.52, 24), new THREE.MeshStandardMaterial({ color: 0x4f4f4f, metalness: 0.9, roughness: 0.2 }));
barrel.position.y = 0.31;
bunsen.add(barrel);

const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.05, 0.06, 20), barrel.material);
nozzle.position.y = 0.60;
bunsen.add(nozzle);

const tipRing = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 8, 20), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1.0 }));
tipRing.position.y = 0.63;
tipRing.rotation.x = Math.PI / 2;
bunsen.add(tipRing);

const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0x202020, roughness: 0.9 }));
hose.rotation.z = Math.PI / 2.5;
hose.position.set(-0.2, 0.03, 0);
bunsen.add(hose);

bunsen.position.set(-0.72, 0, 0.48); // slightly in front/left of stand
scene.add(bunsen);

const bunsenLabel = makeLabel('Bunsen Burner', { fontSize: 17, width: 155, height: 36 });
bunsenLabel.position.set(-0.72, 0.76, 0.60);
scene.add(bunsenLabel);

// ── Bunsen Flame ───────────────────────────────────────────────────────────
const flameGroup = new THREE.Group();
flameGroup.position.set(0, 0.63, 0); // local to bunsen nozzle tip
bunsen.add(flameGroup);

// Emissive inner cone
const innerCone = new THREE.Mesh(
  new THREE.ConeGeometry(0.018, 0.18, 16, 4, true),
  new THREE.MeshStandardMaterial({
    color: 0x99ccff, emissive: 0x3388ff, emissiveIntensity: 3.0,
    transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
  })
);
innerCone.rotation.x = Math.PI; // point up
innerCone.position.y = 0.09;
flameGroup.add(innerCone);

// Outer glow billboard
const glowTex = (function() {
  const s = 128, cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0.0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.3, 'rgba(255,160,50,0.65)');
  g.addColorStop(0.65, 'rgba(255,80,0,0.18)');
  g.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,s,s);
  return new THREE.CanvasTexture(cv);
})();

const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowTex, color: 0xffaa44, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
}));
glowSprite.scale.set(0.35, 0.55, 1.0);
glowSprite.position.y = 0.22;
flameGroup.add(glowSprite);

// Flame dynamic light
const flameLight = new THREE.PointLight(0xffaa44, 0, 3.5);
flameLight.position.y = 0.25;
flameGroup.add(flameLight);

let flameActive = false;

function startBunsenFlame() {
  flameActive = true;
  gsap.to(innerCone.material, { opacity: 0.85, duration: 0.4 });
  gsap.to(glowSprite.material, { opacity: 0.45, duration: 0.5 });
  gsap.to(flameLight, { intensity: 2.2, duration: 0.5 });
}

function stopBunsenFlame() {
  flameActive = false;
  gsap.to(innerCone.material, { opacity: 0, duration: 0.4 });
  gsap.to(glowSprite.material, { opacity: 0, duration: 0.5 });
  gsap.to(flameLight, { intensity: 0, duration: 0.5 });
}


// ═══════════════════════════════════════════════════════════════════════════
// GAS FUMES SYSTEM (particles rising from tilted test tube mouth)
// ═══════════════════════════════════════════════════════════════════════════
const FUME_COUNT = 85;
const fumesGroup = new THREE.Group();
scene.add(fumesGroup);

const fumeParticles = [];

const fumeTex = (function() {
  const s = 64, cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.7)');
  g.addColorStop(0.7, 'rgba(240,240,240,0.2)');
  g.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,s,s);
  return new THREE.CanvasTexture(cv);
})();

// Create pool of sprites
for (let i = 0; i < FUME_COUNT; i++) {
  const mat = new THREE.SpriteMaterial({
    map: fumeTex, color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false
  });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(0.08, 0.08, 1.0);
  
  sp.userData = {
    vx: 0, vy: 0, vz: 0,
    life: 0, maxLife: 1.0,
    phase: Math.random() * Math.PI * 2,
    speed: 0.18 + Math.random() * 0.15,
    delay: Math.random() * 0.8,
    active: false,
    type: 'white' // 'white', 'brown', 'both'
  };

  fumesGroup.add(sp);
  fumeParticles.push(sp);
}

let fumesActive = false;
let currentFumeType = 'white'; // 'white', 'brown', 'both'

function getTubeMouthWorldPos() {
  // World position of test tube mouth
  const localPos = new THREE.Vector3(-0.06, 0.62, -0.1);
  localPos.applyMatrix4(testTubeGroup.matrixWorld);
  return localPos;
}

function startFumes(type) {
  fumesActive = true;
  currentFumeType = type || 'white';
}

function stopFumes() {
  fumesActive = false;
  fumeParticles.forEach(p => gsap.to(p.material, { opacity: 0, duration: 0.6 }));
}

function updateFumes(dt, time) {
  if (!fumesActive) return;

  const mouthPos = getTubeMouthWorldPos();

  fumeParticles.forEach(p => {
    const ud = p.userData;
    if (!ud.active) {
      ud.delay -= dt;
      if (ud.delay > 0) return;
      
      // Spawn at mouth
      ud.active = true;
      ud.life = 0;
      ud.maxLife = 0.8 + Math.random() * 0.6;
      p.position.copy(mouthPos);
      p.position.x += (Math.random() - 0.5) * 0.02;
      p.position.y += (Math.random() - 0.5) * 0.02;
      p.position.z += (Math.random() - 0.5) * 0.02;

      // Velocity: rises up with slight angle drift matching test tube angle
      // tube tilt is to the left (-x), so fumes drift slightly left/up
      ud.vx = -0.05 + (Math.random() - 0.5) * 0.04;
      ud.vy = 0.28 + Math.random() * 0.15;
      ud.vz = (Math.random() - 0.5) * 0.04;

      // Color mapping
      let col = 0xffffff; // white
      if (currentFumeType === 'brown') {
        col = 0xc35a10; // vibrant orange-brown for NO2
      } else if (currentFumeType === 'both') {
        col = Math.random() > 0.5 ? 0xc35a10 : 0xffffff;
      }
      p.material.color.setHex(col);
      p.scale.set(0.08, 0.08, 1.0);
      return;
    }

    // Update active particle
    ud.life += dt;
    if (ud.life >= ud.maxLife) {
      ud.active = false;
      ud.delay = Math.random() * 0.12;
      p.material.opacity = 0;
      return;
    }

    const t = ud.life / ud.maxLife;

    // Movement
    p.position.x += ud.vx * dt + Math.sin(time * 6 + ud.phase) * 0.04 * dt;
    p.position.y += ud.vy * dt;
    p.position.z += ud.vz * dt + Math.cos(time * 5 + ud.phase) * 0.04 * dt;

    // Scale grows as it disperses
    const s = 0.08 + t * 0.38;
    p.scale.set(s, s, 1.0);

    // Alpha curve: fade in quickly, fade out slowly
    p.material.opacity = t < 0.25 ? (t / 0.25) * 0.92 : (1.0 - t) * 0.92;
  });
}


// ═══════════════════════════════════════════════════════════════════════════
// GAS CONFIRMATORY TEST APPARATUSES
// ═══════════════════════════════════════════════════════════════════════════

// 1. Limewater Test Tube (clamped on right)
const limewaterGroup = new THREE.Group();
const standClBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.3), retortBase.material);
limewaterGroup.add(standClBase);

const standClRod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.8, 8), retortRod.material);
standClRod.position.set(0.1, 0.4, 0);
limewaterGroup.add(standClRod);

const clampCl = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 8, 16, Math.PI*1.5), new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7 }));
clampCl.rotation.x = Math.PI / 2;
clampCl.position.set(0, 0.45, 0);
limewaterGroup.add(clampCl);

const lwGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 20, 1, true), glassMat);
lwGlass.position.y = 0.35;
limewaterGroup.add(lwGlass);

const lwGlassBottom = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 10, 0, Math.PI*2, 0, Math.PI/2), glassMat);
lwGlassBottom.rotation.x = Math.PI;
lwGlassBottom.position.y = 0.1;
limewaterGroup.add(lwGlassBottom);

const lwLiquidMat = new THREE.MeshStandardMaterial({
  color: 0xeeffee, transparent: true, opacity: 0.52, roughness: 0.04, depthWrite: false
});
const lwLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.28, 20), lwLiquidMat);
lwLiquid.position.y = 0.24;
limewaterGroup.add(lwLiquid);

limewaterGroup.position.set(0.85, 0.01, 0.38);
scene.add(limewaterGroup);

const limewaterLabel = makeLabel('Limewater Ca(OH)₂', { fontSize: 16, width: 190, height: 36 });
limewaterLabel.position.set(0.85, 0.84, 0.50);
scene.add(limewaterLabel);

// Evolved Gas Delivery Tube (connects heated tube mouth to limewater tube)
const delTubeMat = new THREE.MeshPhysicalMaterial({ color: 0xc8eeff, transparent: true, opacity: 0.38, transmission: 0.7, roughness: 0.05 });
const delTubeH = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 1.25, 8), delTubeMat);
delTubeH.rotation.z = Math.PI / 2.3;
delTubeH.position.set(0.18, 0.88, 0.2);
delTubeH.visible = false;
scene.add(delTubeH);

const delTubeV = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.42, 8), delTubeMat);
delTubeV.position.set(0.81, 0.56, 0.38);
delTubeV.visible = false;
scene.add(delTubeV);

// Bubbles in Limewater
const bubbleGroup = new THREE.Group();
limewaterGroup.add(bubbleGroup);
const BUBBLE_COUNT = 15;
const bubbles = [];
for (let i = 0; i < BUBBLE_COUNT; i++) {
  const bMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.004 + Math.random()*0.006, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0xccffea, transparent: true, opacity: 0 })
  );
  bMesh.userData = {
    vy: 0.12 + Math.random()*0.1,
    phase: Math.random()*10,
    active: false
  };
  bubbleGroup.add(bMesh);
  bubbles.push(bMesh);
}
let bubblesActive = false;

function startLimewaterBubbling() {
  bubblesActive = true;
  bubbles.forEach((b, idx) => {
    b.material.opacity = 0.65;
    b.position.set((Math.random()-0.5)*0.03, 0.12, (Math.random()-0.5)*0.03);
    b.userData.active = true;
  });
}

function stopLimewaterBubbling() {
  bubblesActive = false;
  bubbles.forEach(b => { b.material.opacity = 0; b.userData.active = false; });
}

function updateBubbles(dt) {
  if (!bubblesActive) return;
  bubbles.forEach(b => {
    if (!b.userData.active) return;
    b.position.y += b.userData.vy * dt;
    b.position.x += Math.sin(b.position.y * 30 + b.userData.phase) * 0.006 * dt;
    if (b.position.y > 0.38) {
      b.position.y = 0.12;
      b.position.x = (Math.random()-0.5)*0.03;
    }
  });
}


// 2. FeSO4 Paper Test (Exposed to mouth)
const feso4PaperGroup = new THREE.Group();
const paperHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x555555 }));
paperHolder.rotation.x = Math.PI / 2;
feso4PaperGroup.add(paperHolder);

const paperMat = new THREE.MeshStandardMaterial({ color: 0xeeffe0, roughness: 0.95, side: THREE.DoubleSide }); // starts light green
const paperMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.22), paperMat);
paperMesh.position.set(0, 0, 0.26); // offset from holder tip
feso4PaperGroup.add(paperMesh);

feso4PaperGroup.position.set(-1.0, 1.66, -1.25); // middle shelf
feso4PaperGroup.rotation.set(Math.PI / 2, 0, Math.PI / 4);
scene.add(feso4PaperGroup);

const feso4Label = makeLabel('FeSO₄ Paper', { fontSize: 16, width: 135, height: 36 });
feso4Label.position.set(0, 0.35, 0);
feso4PaperGroup.add(feso4Label);


// 3. Glass Rod dipped in HCl
const glassRodGroup = new THREE.Group();
const rodMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.008, 0.008, 0.68, 12),
  new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.48, transmission: 0.9, roughness: 0.05 })
);
glassRodGroup.add(rodMesh);

// Liquid droplet on rod tip
const rodTipMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.72, roughness: 0.05 });
const rodTip = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), rodTipMat);
rodTip.position.y = -0.34;
glassRodGroup.add(rodTip);

glassRodGroup.position.set(0.6, 0.66, -1.25); // bottom shelf
glassRodGroup.rotation.set(Math.PI / 2, 0, -Math.PI / 4);
scene.add(glassRodGroup);

const hclRodLabel = makeLabel('HCl Glass Rod', { fontSize: 16, width: 155, height: 36 });
hclRodLabel.position.set(0, 0.42, 0);
glassRodGroup.add(hclRodLabel);


// HCl Dense Fumes Particle System (generated near rod tip when active)
const rodFumeGroup = new THREE.Group();
scene.add(rodFumeGroup);
const RFUME_COUNT = 32;
const rodFumes = [];
for (let i = 0; i < RFUME_COUNT; i++) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: fumeTex, color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false
  }));
  sp.scale.set(0.03, 0.03, 1);
  sp.userData = {
    vx: 0, vy: 0, vz: 0,
    life: 0, maxLife: 0.8,
    delay: Math.random() * 1.5,
    active: false
  };
  rodFumeGroup.add(sp);
  rodFumes.push(sp);
}
let rodFumesActive = false;

function startRodFumes() {
  rodFumesActive = true;
}

function stopRodFumes() {
  rodFumesActive = false;
  rodFumes.forEach(p => gsap.to(p.material, { opacity: 0, duration: 0.4 }));
}

function updateRodFumes(dt, time) {
  if (!rodFumesActive) return;
  // Get rod tip world position
  const tipPos = new THREE.Vector3(0, -0.34, 0);
  tipPos.applyMatrix4(glassRodGroup.matrixWorld);

  rodFumes.forEach(p => {
    const ud = p.userData;
    if (!ud.active) {
      ud.delay -= dt;
      if (ud.delay > 0) return;
      ud.active = true;
      ud.life = 0;
      ud.maxLife = 0.5 + Math.random()*0.5;
      p.position.copy(tipPos);
      p.position.x += (Math.random()-0.5)*0.01;
      p.position.y += (Math.random()-0.5)*0.01;
      p.position.z += (Math.random()-0.5)*0.01;
      ud.vx = (Math.random()-0.5)*0.06;
      ud.vy = 0.08 + Math.random()*0.06;
      ud.vz = (Math.random()-0.5)*0.06;
      p.scale.set(0.03, 0.03, 1);
      return;
    }

    ud.life += dt;
    if (ud.life >= ud.maxLife) {
      ud.active = false;
      ud.delay = Math.random()*0.5;
      p.material.opacity = 0;
      return;
    }

    const t = ud.life / ud.maxLife;
    p.position.x += ud.vx * dt;
    p.position.y += ud.vy * dt;
    p.position.z += ud.vz * dt;
    const s = 0.03 + t * 0.09;
    p.scale.set(s, s, 1.0);
    p.material.opacity = t < 0.2 ? (t / 0.2) * 0.75 : (1.0 - t) * 0.75;
  });
}


// ═══════════════════════════════════════════════════════════════════════════
// SINK + WATER ENVIRONMENT (Standard virtual lab details)
// ═══════════════════════════════════════════════════════════════════════════
const labSinkLeft = new LabSink(scene, { x: -8, y: 0, z: -1.7 });
const labSinkRight = new LabSink(scene, { x: 8, y: 0, z: -1.7 });
labSinkLeft.turnOn();
labSinkRight.turnOn();

const sinkLabel = makeLabel('Lab Sink', { fontSize: 17, width: 130, height: 36 });
sinkLabel.position.set(8, 0.52, -1.2);
scene.add(sinkLabel);



// Observation Sheet & Pencil on Bench
const obsSheet = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.95 }));
obsSheet.rotation.x = -Math.PI / 2;
obsSheet.position.set(-3.2, 0.01, 0.6);
scene.add(obsSheet);

const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7 }));
pencil.rotation.z = Math.PI / 2;
pencil.position.set(-3.2, 0.02, 0.9);
scene.add(pencil);

const sheetLabel = makeLabel('Observation Sheet', { fontSize: 16, width: 175, height: 36 });
sheetLabel.position.set(-3.2, 0.36, 0.6);
scene.add(sheetLabel);


// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION & STATE CONTROL FLOWS
// ═══════════════════════════════════════════════════════════════════════════

// ── STATE TRACKERS ────────────────────────────────────────────────────────
let selectedSampleId = "";
let powderPlaced = false;
let burnerPlaced = false;
let flameLit = false;
let wafted = false;

// Spatula powder puff particle effect
function triggerPowderPuff() {
  const particleCount = 20;
  const particles = [];
  const pGroup = new THREE.Group();
  scene.add(pGroup);

  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  const geo = new THREE.SphereGeometry(0.008, 4, 4);

  for (let i = 0; i < particleCount; i++) {
    const p = new THREE.Mesh(geo, mat.clone());
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.05 + Math.random() * 0.1;
    p.userData = {
      vx: Math.cos(angle) * speed,
      vy: 0.1 + Math.random() * 0.15,
      vz: Math.sin(angle) * speed,
      life: 1.0
    };
    p.position.set(-0.46 + (Math.random() - 0.5) * 0.05, 1.32 + (Math.random() - 0.5) * 0.05, 0.2 + (Math.random() - 0.5) * 0.05);
    pGroup.add(p);
    particles.push(p);
  }

  const anim = () => {
    let active = false;
    particles.forEach(p => {
      if (p.userData.life > 0) {
        p.position.x += p.userData.vx * 0.016;
        p.position.y += p.userData.vy * 0.016;
        p.position.z += p.userData.vz * 0.016;
        p.userData.vy -= 0.2 * 0.016; // gravity
        p.userData.life -= 0.025;
        p.material.opacity = p.userData.life;
        active = true;
      } else {
        pGroup.remove(p);
      }
    });
    if (active) {
      requestAnimationFrame(anim);
    } else {
      scene.remove(pGroup);
    }
  };
  anim();
}

function loadSubstanceInTube() {
  substanceMat.color.setHex(0xefefe7); // standard white powder
  substance.scale.set(1, 1, 1);
  substance.position.y = 0.05;
  if (typeof heatingGlassMat !== 'undefined') {
    heatingGlassMat.emissive.setRGB(0, 0, 0);
    heatingGlassMat.emissiveIntensity = 0;
  }
}

// 1. Spatula scoop animation
let spatulaAnimationActive = false;
function runSpatulaScoopAnimation() {
  if (spatulaAnimationActive || !selectedSampleId) return;
  spatulaAnimationActive = true;
  
  // Hide labels to prevent visual clutter
  gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 0, duration: 0.3 });

  // Move mixture bottle cap up and aside
  gsap.timeline()
    .to(bottleCap.position, { y: 0.38, z: 0.15, duration: 0.5, ease: 'power2.out' })
    // Animate Spatula to take sample
    .to(spatulaGroup.position, { x: -0.2, y: 2.8, z: -1.25, duration: 0.6, ease: 'power2.out' })
    .to(spatulaGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.5 }, "<")
    .to(spatulaGroup.position, { x: mixtureBottleGroup.position.x, y: 0.6, z: mixtureBottleGroup.position.z, duration: 0.7, ease: 'power2.out' })
    .to(spatulaGroup.position, { y: 0.3, duration: 0.4, ease: 'power1.inOut' }) // dip
    .add(() => {
      spatulaPowder.visible = true;
    })
    .to(spatulaGroup.position, { y: 0.6, duration: 0.4, ease: 'power1.out' })
    // Move spatula to dry test tube mouth
    .to(spatulaGroup.position, { x: -0.52, y: 1.38, z: 0.26, duration: 0.9, ease: 'power2.inOut' })
    .to(spatulaGroup.rotation, { z: -Math.PI / 3, duration: 0.4 }) // tilt to deposit
    .add(() => {
      spatulaPowder.visible = false;
      substance.visible = true;
      if (typeof loadSubstanceInTube === 'function') {
        loadSubstanceInTube();
      }
      triggerPowderPuff();
    })
    .to(spatulaGroup.rotation, { z: 0, duration: 0.3 })
    // Return spatula and mixture bottle to shelf
    .to(spatulaGroup.position, { x: -0.2, y: 2.524, z: -1.25, duration: 1.0, ease: 'power2.inOut' })
    .to(spatulaGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 0.8 }, "<")
    .to(mixtureBottleGroup.position, { x: -1.0, y: 2.68, z: -1.25, duration: 1.0, ease: 'power2.inOut' }, "<")
    // Close cap
    .to(bottleCap.position, { y: 0.19, z: 0, duration: 0.5, ease: 'power2.in' })
    .add(() => {
      spatulaAnimationActive = false;
      powderPlaced = true;
      // Restore labels
      gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 1, duration: 0.3 });
      
      updateKeyboardGuideText();
      if (typeof HeatTest !== 'undefined') {
        HeatTest.samplePlaced();
      }
    });
}

// 2. Bunsen burner placement
let burnerAnimationActive = false;
function runBurnerPlaceAnimation() {
  if (burnerAnimationActive) return;
  burnerAnimationActive = true;

  // Hide labels to prevent visual clutter
  gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 0, duration: 0.3 });
  
  // Zoom camera profile
  gsap.to(controls.target, { x: -0.52, y: 0.72, z: 0.32, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 1.8,
    phi: Math.PI / 2.3,
    theta: -Math.PI / 6,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => controls._update()
  });

  // Move Bunsen under the test tube
  gsap.to(bunsen.position, {
    x: -0.57, y: 0, z: 0.22,
    duration: 1.2,
    ease: 'power2.inOut',
    onComplete: () => {
      burnerAnimationActive = false;
      burnerPlaced = true;
      // Restore labels
      gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 1, duration: 0.3 });
      updateKeyboardGuideText();
      if (typeof HeatTest !== 'undefined') {
        HeatTest.burnerPlaced();
      }
    }
  });
}

// 3. Bunsen burner light
let lightAnimationActive = false;
function runBurnerLightAnimation() {
  if (lightAnimationActive) return;
  lightAnimationActive = true;

  // Hide labels to prevent visual clutter
  gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 0, duration: 0.3 });

  // Take gas lighter, strike it near burner nozzle tip, and ignite flame
  gsap.timeline()
    .to(lighterGroup.position, { x: -0.57, y: 0.88, z: 0.22, duration: 0.8, ease: 'power2.out' })
    .to(lighterGroup.rotation, { x: 0, y: 0, z: Math.PI / 4, duration: 0.6 }, "<")
    .add(() => {
      startBunsenFlame();
      flameLit = true;
      
      // Heat the tube
      gsap.to(retortGroup.position, { y: -0.06, duration: 1.5, ease: 'power1.inOut' });

      // Glow glass red-hot
      gsap.to(heatingGlassMat.emissive, { r: 1.0, g: 0.15, b: 0, duration: 3.5 });
      gsap.to(heatingGlassMat, { emissiveIntensity: 1.8, duration: 3.5 });

      const sample = typeof HeatTest !== 'undefined' ? HeatTest.getSample() : null;
      if (sample) {
        const doesDecompose = !sample.reaction.includes("No visible decomposition") && !sample.reaction.includes("No significant decomposition");
        if (doesDecompose) {
          gsap.to(substance.scale, { x: 0.86, y: 0.62, z: 0.86, duration: 4.0, ease: 'power1.inOut' });
          gsap.to(substance.position, { y: 0.05 * 0.62, duration: 4.0, ease: 'power1.inOut' });
        }

        setTimeout(() => {
          if (sample.hasZinc) {
            gsap.to(substanceMat.color, { r: 0.90, g: 0.78, b: 0.27, duration: 2.2 }); // Yellow
          }
          if (sample.hasNitrate && sample.hasCarbonate) startFumes('both');
          else if (sample.hasNitrate && sample.hasAmmonium) startFumes('both');
          else if (sample.hasNitrate) startFumes('brown');
          else if (sample.hasCarbonate || sample.hasAmmonium) startFumes('white');
        }, 2500);
      }
    })
    .to(lighterGroup.position, { x: 0.6, y: 1.66, z: -1.25, duration: 0.8, delay: 0.5, ease: 'power2.inOut' })
    .to(lighterGroup.rotation, { x: Math.PI / 2, y: 0, z: Math.PI / 6, duration: 0.8 }, "<")
    .add(() => {
      lightAnimationActive = false;
      // Restore labels
      gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 1, duration: 0.3 });
      updateKeyboardGuideText();
      
      if (typeof HeatTest !== 'undefined') {
        HeatTest.igniteBurner();
      }
    });
}

// 4. Waft gas animation
let waftAnimationActive = false;
function runWaftAnimation() {
  if (waftAnimationActive) return;
  waftAnimationActive = true;
  if (typeof HeatTest !== 'undefined') {
    HeatTest.waftGas();
  }
}

// 5. Select sample animation
function animateTakeSample(sampleId, onComplete) {
  selectedSampleId = sampleId;
  powderPlaced = false;
  burnerPlaced = false;
  flameLit = false;
  wafted = false;

  // Zoom camera to table center
  gsap.to(controls.target, { x: -0.3, y: 0.5, z: 0.3, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 3.0,
    phi: Math.PI / 3,
    theta: -Math.PI / 8,
    duration: 1.5,
    onUpdate: () => controls._update()
  });

  // Hide labels to prevent visual clutter
  gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 0, duration: 0.3 });

  // Move mixture bottle to table
  gsap.to(mixtureBottleGroup.position, {
    x: -0.9, y: 0.2, z: 0.2,
    duration: 1.2,
    ease: 'power2.out',
    onComplete: () => {
      // Restore labels
      gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 1, duration: 0.3 });
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    }
  });
}

function animateHeating(sample, onComplete) {
  // Deprecated, step is controlled via manual burner and lighter trigger
  if (onComplete) onComplete();
}

function stopHeating() {
  stopBunsenFlame();
  stopFumes();
  
  gsap.to(bunsen.position, { x: -0.72, y: 0, z: 0.48, duration: 1.0 });
  gsap.to(retortGroup.position, { y: 0.015, duration: 1.0 });
  
  // Solid cools down back to white
  gsap.to(substanceMat.color, { r: 0.94, g: 0.94, b: 0.91, duration: 2.0 });

  // Cool glass back to normal
  gsap.to(heatingGlassMat.emissive, { r: 0, g: 0, b: 0, duration: 2.0 });
  gsap.to(heatingGlassMat, { emissiveIntensity: 0, duration: 2.0 });

  // Hide substance
  substance.visible = false;

  // Return mixture bottle, spatula, lighter, FeSO4 paper and glass rod to shelf
  gsap.to(mixtureBottleGroup.position, { x: -1.0, y: 2.68, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(spatulaGroup.position, { x: -0.2, y: 2.524, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(spatulaGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 1.0 });
  gsap.to(lighterGroup.position, { x: 0.6, y: 1.66, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(lighterGroup.rotation, { x: Math.PI / 2, y: 0, z: Math.PI / 6, duration: 1.0 });
  gsap.to(feso4PaperGroup.position, { x: -1.0, y: 1.66, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(feso4PaperGroup.rotation, { x: Math.PI / 2, y: 0, z: Math.PI / 4, duration: 1.0 });
  gsap.to(glassRodGroup.position, { x: 0.6, y: 0.66, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(glassRodGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 1.0 });

  // Reset state trackers
  selectedSampleId = "";
  powderPlaced = false;
  burnerPlaced = false;
  flameLit = false;
  wafted = false;

  stopGasTestAnimations();
}

// conf tests
function animateLimewaterTest(sample, onComplete) {
  // Hide labels during test
  gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 0, duration: 0.5 });

  // Camera zoom-in on the limewater test tube on the right
  gsap.to(controls.target, { x: 0.85, y: 0.35, z: 0.38, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 1.4,
    phi: Math.PI / 2.3,
    theta: Math.PI / 6,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => controls._update()
  });

  // Show delivery tube
  delTubeH.visible = true;
  delTubeV.visible = true;
  
  // Start bubbling
  startLimewaterBubbling();

  // If carbonate: cloud limewater
  if (sample.hasCarbonate) {
    gsap.to(lwLiquidMat.color, { r: 0.91, g: 0.91, b: 0.89, duration: 2.5 });
    gsap.to(lwLiquidMat, { opacity: 0.85, duration: 2.5 });
  }

  setTimeout(onComplete, 2500);
}

function animateFeso4Test(sample, onComplete) {
  // Hide labels during test
  gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 0, duration: 0.5 });

  const mouthWorld = getTubeMouthWorldPos();

  // Camera zoom-in on the heated test tube mouth
  gsap.to(controls.target, { x: mouthWorld.x, y: mouthWorld.y, z: mouthWorld.z, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 1.2,
    phi: Math.PI / 2.3,
    theta: -Math.PI / 6,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => controls._update()
  });

  // Move paper to mouth of test tube
  // position feso4 group just above mouth
  gsap.timeline()
    .set(feso4PaperGroup.rotation, { x: 0, y: 0, z: 0 }) // correct testing angle
    .set(feso4PaperGroup.position, { x: mouthWorld.x + 0.35, y: mouthWorld.y + 0.35, z: mouthWorld.z })
    .to(feso4PaperGroup.position, { x: mouthWorld.x + 0.09, y: mouthWorld.y + 0.12, z: mouthWorld.z, duration: 1.2, ease: 'power2.out' })
    .add(() => {
      // If nitrate: turn paper brown
      if (sample.hasNitrate) {
        gsap.to(paperMat.color, { r: 0.54, g: 0.27, b: 0.07, duration: 1.8 }); // brown
      }
      setTimeout(onComplete, 1800);
    });
}

function animateHClRodTest(sample, onComplete) {
  // Hide labels during test
  gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material, feso4Label.material, hclRodLabel.material], { opacity: 0, duration: 0.5 });

  const mouthWorld = getTubeMouthWorldPos();

  // Camera zoom-in on the heated test tube mouth
  gsap.to(controls.target, { x: mouthWorld.x, y: mouthWorld.y, z: mouthWorld.z, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 1.2,
    phi: Math.PI / 2.3,
    theta: -Math.PI / 6,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => controls._update()
  });
  
  gsap.timeline()
    .set(glassRodGroup.rotation, { x: 0, y: 0, z: Math.PI / 3 }) // correct testing angle
    .set(glassRodGroup.position, { x: mouthWorld.x + 0.28, y: mouthWorld.y + 0.45, z: mouthWorld.z })
    .to(glassRodGroup.position, { x: mouthWorld.x + 0.03, y: mouthWorld.y + 0.09, z: mouthWorld.z, duration: 1.0, ease: 'power2.out' })
    .add(() => {
      // If ammonium: start rod white fuming
      if (sample.hasAmSpecial || sample.hasAmmonium) {
        startRodFumes();
      }
      setTimeout(onComplete, 1500);
    });
}

function animateWaft(sample, onComplete) {
  gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material], { opacity: 0, duration: 0.4 });

  const mouthWorld = getTubeMouthWorldPos();
  const originalRadius = controls.radius;
  const originalTheta = controls.theta;

  // Wobble / tilt camera
  gsap.timeline()
    .to(controls, {
      radius: Math.max(1.0, originalRadius - 0.22),
      theta: originalTheta + 0.08,
      duration: 0.9,
      ease: 'power1.inOut',
      onUpdate: () => controls._update()
    })
    .to(controls, {
      theta: originalTheta - 0.08,
      duration: 0.9,
      ease: 'power1.inOut',
      onUpdate: () => controls._update()
    })
    .to(controls, {
      radius: originalRadius,
      theta: originalTheta,
      duration: 0.6,
      ease: 'power2.inOut',
      onUpdate: () => controls._update()
    })
    .add(() => {
      gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material], { opacity: 1, duration: 0.4 });
      if (onComplete) onComplete();
    });

}

function stopGasTestAnimations() {
  // Hide delivery tubes, stop bubbling, reset limewater
  delTubeH.visible = false;
  delTubeV.visible = false;
  stopLimewaterBubbling();
  
  gsap.to(lwLiquidMat.color, { r: 0.93, g: 1.0, b: 0.93, duration: 1.0 }); // clear greenish
  gsap.to(lwLiquidMat, { opacity: 0.52, duration: 1.0 });

  // Move paper back to shelf
  gsap.to(feso4PaperGroup.position, { x: -1.0, y: 1.66, z: -1.25, duration: 0.8 });
  gsap.to(feso4PaperGroup.rotation, { x: Math.PI / 2, y: 0, z: Math.PI / 4, duration: 0.8 });
  gsap.to(paperMat.color, { r: 0.93, g: 1.0, b: 0.88, duration: 0.8 }); // back to light green

  // Move rod back to shelf
  stopRodFumes();
  gsap.to(glassRodGroup.position, { x: 0.6, y: 0.66, z: -1.25, duration: 0.8 });
  gsap.to(glassRodGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 0.8 });

  // Restore camera overview perspective
  gsap.to(controls.target, { x: 0, y: 0.5, z: 0, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 7,
    phi: Math.PI / 4,
    theta: 0,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => controls._update()
  });

  // Restore all labels
  gsap.to([retortLabel.material, bunsenLabel.material, limewaterLabel.material, sinkLabel.material, sheetLabel.material], { opacity: 1, duration: 0.5 });
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER LOOP & WINDOW EVENTS
// ═══════════════════════════════════════════════════════════════════════════
let lastT = performance.now() * 0.001;

function loop() {
  requestAnimationFrame(loop);
  
  const now = performance.now() * 0.001;
  const dt = Math.min(now - lastT, 0.05); // cap lag spikes
  lastT = now;

  // Gentle burner/tube sway
  if (flameActive) {
    innerCone.rotation.z = Math.sin(now * 15) * 0.015;
    glowSprite.scale.set(0.35 + Math.sin(now * 12)*0.015, 0.55 + Math.cos(now * 10)*0.015, 1.0);
    flameLight.intensity = 2.2 + Math.sin(now * 22) * 0.35;
  }

  updateFumes(dt, now);
  updateBubbles(dt);
  updateRodFumes(dt, now);
  
  labSinkLeft.update(now);
  labSinkRight.update(now);

  renderer.render(scene, camera);
}
loop();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// ═══════════════════════════════════════════════════════════════════════════
// OBSERVATION COUNTDOWN OVERLAY
// ═══════════════════════════════════════════════════════════════════════════
function setLabelsOpacity(opacity) {
  scene.traverse(child => {
    if (child.isSprite && child.material) {
      gsap.to(child.material, { opacity: opacity, duration: 0.3 });
    }
  });
}

let countdownOverlayEl = null;

function showReactionCountdown(seconds, onDone) {
  if (countdownOverlayEl) { countdownOverlayEl.remove(); }
  setLabelsOpacity(0);

  const div = document.createElement('div');
  div.id = 'reaction-countdown';
  div.style.cssText = `
    position: fixed; bottom: 154px; left: 50%; transform: translateX(-50%);
    background: rgba(12, 18, 30, 0.9);
    border: 2px solid #63b3ed;
    border-radius: 12px;
    padding: 12px 24px;
    color: #e2f4ff;
    font-size: 1rem;
    z-index: 200;
    text-align: center;
    pointer-events: none;
    backdrop-filter: blur(4px);
    box-shadow: 0 0 20px rgba(99,179,237,0.3);
  `;
  document.body.appendChild(div);
  countdownOverlayEl = div;

  let remaining = seconds;
  function tick() {
    if (!countdownOverlayEl) return;
    div.innerHTML = `Heating sample… <b style="color:#f6e05e;font-size:1.25em">${remaining}s</b><br>
      <span style="font-size:0.8rem;color:#a0aec0">Observe test tube changes and gas evolution</span>`;
    
    if (remaining <= 0) {
      div.remove();
      countdownOverlayEl = null;
      setLabelsOpacity(1);
      if (onDone) onDone();
      return;
    }
    remaining--;
    setTimeout(tick, 1000);
  }
  tick();
}


// ═══════════════════════════════════════════════════════════════════════════
// INTERACTIVE RAYCASTING (Hover outline / Click selections)
// ═══════════════════════════════════════════════════════════════════════════
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

function highlightGroup(group, active) {
  if (!group) return;
  group.traverse(child => {
    if (child.isMesh && child.material) {
      if (child.userData.originalEmissive === undefined) {
        child.userData.originalEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0,0,0);
        child.userData.originalIntensity = child.material.emissiveIntensity || 0;
      }
      if (active) {
        if (child.material.emissive) {
          child.material.emissive.setHex(0x224488);
          child.material.emissiveIntensity = 0.9;
        }
      } else {
        if (child.material.emissive) {
          child.material.emissive.copy(child.userData.originalEmissive);
          child.material.emissiveIntensity = child.userData.originalIntensity;
        }
      }
    }
  });
}

function getIntersectedInteractive(intersects) {
  for (let intersect of intersects) {
    let obj = intersect.object;
    while (obj && obj !== scene) {
      if (obj.userData && obj.userData.isSinkKnob) return { type: 'sinkKnob', group: obj };

      if (obj === mixtureBottleGroup) return { type: 'bottle', group: obj };
      if (obj === spatulaGroup) return { type: 'spatula', group: obj };
      if (obj === bunsen) return { type: 'burner', group: obj };
      if (obj === testTubeGroup || obj === retortGroup) return { type: 'testtube', group: obj };
      if (obj === limewaterGroup) return { type: 'limewater', group: obj };
      if (obj === feso4PaperGroup) return { type: 'feso4', group: obj };
      if (obj === glassRodGroup) return { type: 'hclrod', group: obj };
      obj = obj.parent;
    }
  }
  return null;
}

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const intersected = getIntersectedInteractive(intersects);

  let isInteractive = false;
  if (intersected) {
    const state = typeof HeatTest !== 'undefined' ? HeatTest.getState() : 'IDLE';
    if (intersected.type === 'sinkKnob') isInteractive = true;
    if (intersected.type === 'bottle' && state === 'IDLE') isInteractive = true;
    if (intersected.type === 'spatula' && state === 'SAMPLE_SELECTED' && !powderPlaced) isInteractive = true;
    if (intersected.type === 'burner' && state === 'SAMPLE_SELECTED' && powderPlaced && !burnerPlaced) isInteractive = true;
    if (intersected.type === 'burner' && state === 'SAMPLE_SELECTED' && powderPlaced && burnerPlaced && !flameLit) isInteractive = true;
    if (intersected.type === 'testtube' && state === 'HEATED') isInteractive = true;
    if (intersected.type === 'limewater' && (state === 'OBSERVED' || state === 'TESTED_GAS')) isInteractive = true;
    if (intersected.type === 'feso4' && (state === 'OBSERVED' || state === 'TESTED_GAS')) isInteractive = true;
    if (intersected.type === 'hclrod' && (state === 'OBSERVED' || state === 'TESTED_GAS')) isInteractive = true;
  }

  if (isInteractive) {
    document.body.style.cursor = 'pointer';
    if (hoveredObject !== intersected.group) {
      highlightGroup(hoveredObject, false);
      hoveredObject = intersected.group;
      highlightGroup(hoveredObject, true);
    }
  } else {
    document.body.style.cursor = 'default';
    if (hoveredObject) {
      highlightGroup(hoveredObject, false);
      hoveredObject = null;
    }
  }
});

window.addEventListener('click', () => {
  if (!hoveredObject) return;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const intersected = getIntersectedInteractive(intersects);
  if (!intersected) return;

  if (intersected.type === 'sinkKnob') {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    return;
  }

  const state = typeof HeatTest !== 'undefined' ? HeatTest.getState() : 'IDLE';

  if (intersected.type === 'bottle' && state === 'IDLE') {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof HeatTest !== 'undefined') {
      HeatTest.selectSample('random');
    }
  } else if (intersected.type === 'spatula' && state === 'SAMPLE_SELECTED' && !powderPlaced) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    runSpatulaScoopAnimation();
  } else if (intersected.type === 'burner' && state === 'SAMPLE_SELECTED' && powderPlaced && !burnerPlaced) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    runBurnerPlaceAnimation();
  } else if (intersected.type === 'burner' && state === 'SAMPLE_SELECTED' && powderPlaced && burnerPlaced && !flameLit) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    runBurnerLightAnimation();
  } else if (intersected.type === 'testtube' && state === 'HEATED') {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (!wafted) {
      runWaftAnimation();
    } else {
      if (typeof HeatTest !== 'undefined') {
        HeatTest.showObservationsFromKey();
      }
    }
  } else if (intersected.type === 'limewater' && (state === 'OBSERVED' || state === 'TESTED_GAS')) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof HeatTest !== 'undefined') {
      HeatTest.conductGasTest('limewater');
    }
  } else if (intersected.type === 'feso4' && (state === 'OBSERVED' || state === 'TESTED_GAS')) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof HeatTest !== 'undefined') {
      HeatTest.conductGasTest('feso4');
    }
  } else if (intersected.type === 'hclrod' && (state === 'OBSERVED' || state === 'TESTED_GAS')) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof HeatTest !== 'undefined') {
      HeatTest.conductGasTest('hclrod');
    }
  }
});


// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD CONTROLS LISTENERS
// ═══════════════════════════════════════════════════════════════════════════
window.addEventListener('keydown', (event) => {
  const key = event.key.toUpperCase();
  const state = typeof HeatTest !== 'undefined' ? HeatTest.getState() : 'IDLE';

  if (state === 'IDLE') {
    if (key >= '1' && key <= '9') {
      const idx = parseInt(key);
      const sampleId = 'sample' + idx;
      if (typeof HeatTest !== 'undefined') {
        document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
        const targetBtn = document.querySelector(`.salt-btn[data-sample="${sampleId}"]`);
        if (targetBtn) {
          targetBtn.classList.add('active');
        }
        HeatTest.selectSample(sampleId);
      }
    }
  } else if (state === 'SAMPLE_SELECTED') {
    if (!powderPlaced && key === 'S') {
      runSpatulaScoopAnimation();
    } else if (powderPlaced && !burnerPlaced && key === 'H') {
      runBurnerPlaceAnimation();
    } else if (powderPlaced && burnerPlaced && !flameLit && key === 'L') {
      runBurnerLightAnimation();
    }
  } else if (state === 'HEATED') {
    if (key === 'W') {
      runWaftAnimation();
    } else if (key === 'O') {
      if (typeof HeatTest !== 'undefined') {
        HeatTest.showObservationsFromKey();
      }
    }
  } else if (state === 'OBSERVED' || state === 'TESTED_GAS') {
    if (key === '1') {
      if (typeof HeatTest !== 'undefined') {
        HeatTest.conductGasTest('limewater');
      }
    } else if (key === '2') {
      if (typeof HeatTest !== 'undefined') {
        HeatTest.conductGasTest('feso4');
      }
    } else if (key === '3') {
      if (typeof HeatTest !== 'undefined') {
        HeatTest.conductGasTest('hclrod');
      }
    } else if (key === 'I') {
      if (typeof HeatTest !== 'undefined') {
        HeatTest.showIdentificationPanel();
      }
    }
  }

  // Global reset key
  if (key === 'R') {
    if (typeof HeatTest !== 'undefined') {
      HeatTest.reset();
    }
  }
});


// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD GUIDE TEXT UPDATE
// ═══════════════════════════════════════════════════════════════════════════
function updateKeyboardGuideText() {
  const el = document.getElementById('keyboard-guide-text');
  if (!el) return;

  const state = typeof HeatTest !== 'undefined' ? HeatTest.getState() : 'IDLE';

  let html = "";
  if (state === 'IDLE') {
    html = `Select a mixture from the shelf (1-25) or press keys <span class="key-btn">1</span>-<span class="key-btn">9</span> to select Mixtures 1-9.`;
  } else if (state === 'SAMPLE_SELECTED') {
    if (!powderPlaced) {
      html = `Press <span class="key-btn">S</span> or click the Spatula to scoop mixture powder into the test tube.`;
    } else if (!burnerPlaced) {
      html = `Press <span class="key-btn">H</span> or click the Bunsen Burner to place it under the test tube.`;
    } else if (!flameLit) {
      html = `Press <span class="key-btn">L</span> or click the Lighter / Burner to light the flame and start heating.`;
    }
  } else if (state === 'HEATING') {
    html = `Heating sample... Observe solid colour changes and evolved fumes.`;
  } else if (state === 'HEATED') {
    if (!wafted) {
      html = `Press <span class="key-btn">W</span> or click the Test Tube to waft and check gas odour.`;
    } else {
      html = `Press <span class="key-btn">O</span> or click the Test Tube to open the observation recording panel.`;
    }
  } else if (state === 'OBSERVED' || state === 'TESTED_GAS') {
    html = `Gas tests: Press <span class="key-btn">1</span> for Limewater, <span class="key-btn">2</span> for FeSO₄ paper, <span class="key-btn">3</span> for HCl rod. Press <span class="key-btn">I</span> to Identify Ions.`;
  } else if (state === 'TESTING_GAS') {
    html = `Gas test in progress... Fill the results in the pop-up modal.`;
  } else if (state === 'IDENTIFYING') {
    html = `Select all active ions in the checklist, then click Submit.`;
  } else if (state === 'DONE') {
    html = `Analysis complete. View report, then press <span class="key-btn">R</span> or click Reset to start over.`;
  }

  // Always append global reset guide unless IDLE or DONE
  if (state !== 'IDLE' && state !== 'DONE') {
    html += ` | Press <span class="key-btn">R</span> to Reset.`;
  }

  el.innerHTML = html;
}

// Initialize guide
setTimeout(updateKeyboardGuideText, 500);
