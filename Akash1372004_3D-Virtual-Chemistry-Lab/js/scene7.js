/**
 * scene7.js — Copper Turnings Test Lab Scene (Experiment 7)
 * Setup for copper turnings, concentrated sulphuric acid reaction and confirmatory tests:
 *  - Nitrate (FeSO4 paper turning brown, green solution, and NO2 brown fumes)
 *  - Chloride (NH4OH rod white fumes)
 *  - Bromide (Fluorescence paper turning red)
 */

// ── Label helper: creates a canvas texture sprite ─────────────────────────
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
scene.background = new THREE.Color(0x2a1d17); // warm brown background matching table color
scene.fog        = new THREE.FogExp2(0x201511, 0.038);

// Environment map setup
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

function createEnvironmentMap(renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const colors = ['#dcf6ff', '#b8e6c4', '#f0fff4', '#d9ffd9', '#e8ffec', '#b5ddc0'];
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

// ═══════════════════════════════════════════════════════════════════════════
// LAB ENVIRONMENT
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

// Wall Materials
const wallMat = new THREE.MeshStandardMaterial({
  map: createLabWallTex(),
  color: 0x4e382d, // match the dark brown desk color
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
ceiling.position.y = 12 - 3.25;
scene.add(ceiling);

// Table Benchtop
const woodMat = new THREE.MeshStandardMaterial({
  map: createSharedBenchWoodTex(),
  color: 0x5a3010,
  roughness: 0.80,
  metalness: 0.02
});
const benchTop = new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 5), woodMat);
benchTop.position.set(0, -0.25, 0.3);
benchTop.receiveShadow = true;
benchTop.castShadow = true;
scene.add(benchTop);

const blackMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f });
const border = new THREE.Mesh(new THREE.BoxGeometry(18.2, 0.2, 5.2), blackMat);
border.position.set(0, -0.5, 0.3);
border.receiveShadow = true;
border.castShadow = true;
scene.add(border);

// Cabinets & Drawers under table
const greyMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6 });
function createCabinet(x, z) {
  const geo = new THREE.BoxGeometry(2.5, 3, 2.2);
  const cabinet = new THREE.Mesh(geo, greyMat);
  cabinet.position.set(x, 1.3 - 3.25, z);
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  scene.add(cabinet);
}
createCabinet(-7, 0.3);
createCabinet(-4.3, 0.3);
createCabinet(4.3, 0.3);
createCabinet(7, 0.3);

function createDrawer(y) {
  const geo = new THREE.BoxGeometry(2.5, 0.8, 2.2);
  const drawer = new THREE.Mesh(geo, woodMat);
  drawer.position.set(0, y - 3.25, 0.3);
  drawer.castShadow = true;
  drawer.receiveShadow = true;
  scene.add(drawer);
}
createDrawer(2.1);
createDrawer(1.1);
createDrawer(0.1);

// Procedural wood for shelf
function makeBenchWoodTex() {
  const W = 512, H = 256;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#2a120a';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * W;
    const width = 0.5 + Math.random() * 3.5;
    const lightness = Math.random() > 0.5 ? 1 : -1;
    const alpha = 0.04 + Math.random() * 0.10;
    const col = lightness > 0 ? `rgba(200,140,80,${alpha})` : `rgba(30,10,0,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= H; y += 20) {
      const dx = Math.sin(y * 0.05 + i) * 4;
      ctx.lineTo(x + dx, y);
    }
    ctx.strokeStyle = col;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
}

const woodTex = makeBenchWoodTex();
const shelfMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0x5a4020, roughness: 0.8, metalness: 0.1 });
const shelfGroup = new THREE.Group();
scene.add(shelfGroup);

const backboard = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.0, 0.04), shelfMat);
backboard.position.set(0, 1.97, -1.52);
backboard.receiveShadow = true;
shelfGroup.add(backboard);

const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.4), shelfMat);
leftPillar.position.set(-1.84, 1.97, -1.32);
leftPillar.castShadow = leftPillar.receiveShadow = true;
shelfGroup.add(leftPillar);

const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.4), shelfMat);
rightPillar.position.set(1.84, 1.97, -1.32);
rightPillar.castShadow = rightPillar.receiveShadow = true;
shelfGroup.add(rightPillar);

const topPanel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.4), shelfMat);
topPanel.position.set(0, 3.47, -1.32);
topPanel.castShadow = topPanel.receiveShadow = true;
shelfGroup.add(topPanel);

const bottomPanel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.4), shelfMat);
bottomPanel.position.set(0, 0.53, -1.32);
bottomPanel.castShadow = bottomPanel.receiveShadow = true;
shelfGroup.add(bottomPanel);

const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.04, 0.38), shelfMat);
shelf1.position.set(0, 1.5, -1.32);
shelf1.castShadow = shelf1.receiveShadow = true;
shelfGroup.add(shelf1);

const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.04, 0.38), shelfMat);
shelf2.position.set(0, 2.5, -1.32);
shelf2.castShadow = shelf2.receiveShadow = true;
shelfGroup.add(shelf2);

// ── ACTIVE MIXTURE BOTTLE (shelf top tier left) ──────────────────────────
const mixtureBottleGroup = new THREE.Group();
const bottleBodyMat = new THREE.MeshPhysicalMaterial({
  color: 0xf5f5dc, transparent: true, opacity: 0.45, roughness: 0.1, transmission: 0.5
});
const bottleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 20), bottleBodyMat);
mixtureBottleGroup.add(bottleMesh);

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

const bottleLabel = makeLabel('Mixture Bottle', { fontSize: 16, width: 155, height: 36 });
bottleLabel.position.set(0, 0.38, 0.15);
mixtureBottleGroup.add(bottleLabel);

// ── CONC. H2SO4 ACID BOTTLE (shelf top tier center) ─────────────────────────
const acidBottleGroup = new THREE.Group();
const acidBottleMat = new THREE.MeshPhysicalMaterial({
  color: 0x5a3d28, transparent: true, opacity: 0.75, roughness: 0.1, metalness: 0.1
});
const acidBottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 20), acidBottleMat);
acidBottleGroup.add(acidBottleBody);

const acidBottleCap = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16),
  new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.6 })
);
acidBottleCap.position.y = 0.19;
acidBottleGroup.add(acidBottleCap);

const acidLiquidInner = new THREE.Mesh(
  new THREE.CylinderGeometry(0.076, 0.076, 0.18, 16),
  new THREE.MeshStandardMaterial({ color: 0xeedda8, transparent: true, opacity: 0.65, roughness: 0.1 })
);
acidLiquidInner.position.y = -0.06;
acidBottleGroup.add(acidLiquidInner);

acidBottleGroup.position.set(0.0, 2.68, -1.25);
scene.add(acidBottleGroup);

const acidBottleLabel = makeLabel('Con. H₂SO₄ Acid', { fontSize: 15, width: 155, height: 36 });
acidBottleLabel.position.set(0, 0.38, 0.15);
acidBottleGroup.add(acidBottleLabel);

// ── COPPER TURNINGS BOTTLE (shelf top tier right) ──────────────────────────
const copperBottleGroup = new THREE.Group();
const copperBottleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 20), bottleBodyMat);
copperBottleGroup.add(copperBottleMesh);

const copperBottleCap = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16),
  new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 })
);
copperBottleCap.position.y = 0.19;
copperBottleGroup.add(copperBottleCap);

// Internal copper turnings mesh representation
const copperFill = new THREE.Group();
const copperMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.1 }); // metallic copper
for (let i = 0; i < 6; i++) {
  const piece = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.06, 8), copperMat);
  piece.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  piece.position.set((Math.random() - 0.5) * 0.08, -0.1 + (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.08);
  copperFill.add(piece);
}
copperBottleGroup.add(copperFill);

copperBottleGroup.position.set(1.0, 2.68, -1.25);
scene.add(copperBottleGroup);

const copperBottleLabel = makeLabel('Copper Turnings', { fontSize: 15, width: 155, height: 36 });
copperBottleLabel.position.set(0, 0.38, 0.15);
copperBottleGroup.add(copperBottleLabel);

// ── SPATULA (shelf middle upper) ─────────────────────────────────────────
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

spatulaGroup.position.set(-0.8, 1.524, -1.25);
spatulaGroup.rotation.set(Math.PI / 2, 0, -Math.PI / 4);
scene.add(spatulaGroup);

const spatulaLabel = makeLabel('Spatula', { fontSize: 16, width: 120, height: 36 });
spatulaLabel.position.set(0, 0.35, 0);
spatulaGroup.add(spatulaLabel);

// ── TWEEZERS / FORCEPS (shelf middle right) ────────────────────────────────
const tweezersGroup = new THREE.Group();
const metalMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.1 });
const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.003, 0.45, 8), metalMat);
leg1.position.set(-0.015, 0.22, 0);
leg1.rotation.z = -0.05;
const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.003, 0.45, 8), metalMat);
leg2.position.set(0.015, 0.22, 0);
leg2.rotation.z = 0.05;
const head = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.015), metalMat);
head.position.set(0, 0.44, 0);

tweezersGroup.add(leg1);
tweezersGroup.add(leg2);
tweezersGroup.add(head);

// Copper turning held by tweezers (initially invisible)
const tweezersCopper = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.05, 8), copperMat);
tweezersCopper.position.y = 0.0;
tweezersCopper.rotation.x = Math.PI / 2;
tweezersCopper.visible = false;
tweezersGroup.add(tweezersCopper);

tweezersGroup.position.set(0.0, 1.524, -1.25);
tweezersGroup.rotation.set(Math.PI / 2, 0, -Math.PI / 4);
scene.add(tweezersGroup);

const tweezersLabel = makeLabel('Tweezers', { fontSize: 16, width: 120, height: 36 });
tweezersLabel.position.set(0, 0.35, 0);
tweezersGroup.add(tweezersLabel);

// ── GAS LIGHTER (shelf middle lower) ─────────────────────────────────────
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
lighterGroup.position.set(0.8, 1.66, -1.25);
lighterGroup.rotation.set(Math.PI / 2, 0, Math.PI / 6);
scene.add(lighterGroup);

const lighterLabel = makeLabel('Gas Lighter', { fontSize: 16, width: 135, height: 36 });
lighterLabel.position.set(0, 0.35, 0);
lighterGroup.add(lighterLabel);

// ── RETORT STAND & HEATING TEST TUBE ───────────────────────────────────────
const retortGroup = new THREE.Group();
const retortBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.4), new THREE.MeshStandardMaterial({ color: 0x252525, roughness: 0.6 }));
retortBase.castShadow = retortBase.receiveShadow = true;
retortGroup.add(retortBase);

const retortRod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.3, 12), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 }));
retortRod.position.set(0.2, 0.65, -0.1);
retortRod.castShadow = true;
retortGroup.add(retortRod);

const clampBoss = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 }));
clampBoss.position.set(0.2, 0.7, -0.1);
retortGroup.add(clampBoss);

const clampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.26, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 }));
clampArm.rotation.z = Math.PI / 2;
clampArm.position.set(0.07, 0.7, -0.1);
retortGroup.add(clampArm);

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

const tubeCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 24, 1, true), glassMat);
tubeCyl.position.y = 0.31;
testTubeGroup.add(tubeCyl);

const tubeSph = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), heatingGlassMat);
tubeSph.rotation.x = Math.PI;
testTubeGroup.add(tubeSph);

const rim = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.005, 8, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0xaaccff, emissiveIntensity: 0.1 }));
rim.position.y = 0.62;
rim.rotation.x = Math.PI / 2;
testTubeGroup.add(rim);

// Substance powder inside tube
const substanceMat = new THREE.MeshStandardMaterial({ color: 0xefefe7, roughness: 0.95 });
const substance = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.09, 20), substanceMat);
substance.position.y = 0.05;
substance.visible = false;
testTubeGroup.add(substance);

// Copper piece placed inside the tube
const copperPiece = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), copperMat);
copperPiece.position.set(-0.015, 0.06, 0);
copperPiece.rotation.set(Math.PI/3, 0, Math.PI/4);
copperPiece.visible = false;
testTubeGroup.add(copperPiece);

// Liquid layer inside tube
const liquidMat = new THREE.MeshStandardMaterial({
  color: 0xeedda8, transparent: true, opacity: 0.0, roughness: 0.1
});
const acidLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.15, 20), liquidMat);
acidLiquid.position.y = 0.125;
acidLiquid.visible = false;
testTubeGroup.add(acidLiquid);

testTubeGroup.position.set(-0.06, 0.7, -0.1);
testTubeGroup.rotation.z = -Math.PI / 6; // tilted
retortGroup.add(testTubeGroup);

retortGroup.position.set(-0.4, 0.015, 0.3);
scene.add(retortGroup);

const retortLabel = makeLabel('Heating Tube', { fontSize: 17, width: 150, height: 36 });
retortLabel.position.set(-0.4, 1.48, 0.42);
scene.add(retortLabel);

// ── BUNSEN BURNER ──────────────────────────────────────────────────────────
const bunsen = new THREE.Group();
const bunsenBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0x282828, roughness: 0.48, metalness: 0.78 }));
bunsenBase.position.y = 0.025;
bunsen.add(bunsenBase);

const barrelMat = new THREE.MeshStandardMaterial({ color: 0x383838, roughness: 0.36, metalness: 0.88 });
const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.52, 24), barrelMat);
barrel.position.y = 0.31;
bunsen.add(barrel);

const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.05, 0.06, 20), barrelMat);
nozzle.position.y = 0.60;
bunsen.add(nozzle);

const tipRing = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 8, 20), new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.18, metalness: 1.0 }));
tipRing.position.y = 0.63;
tipRing.rotation.x = Math.PI / 2;
bunsen.add(tipRing);

const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.95 }));
hose.rotation.z = Math.PI / 2.5;
hose.position.set(-0.2, 0.03, 0);
bunsen.add(hose);

bunsen.position.set(-0.72, 0, 0.48);
scene.add(bunsen);

const bunsenLabel = makeLabel('Bunsen Burner', { fontSize: 17, width: 155, height: 36 });
bunsenLabel.position.set(-0.72, 0.76, 0.60);
scene.add(bunsenLabel);

// Bunsen Flame
const flameGroup = new THREE.Group();
flameGroup.position.set(0, 0.63, 0);
bunsen.add(flameGroup);

const innerCone = new THREE.Mesh(
  new THREE.ConeGeometry(0.018, 0.18, 16, 4, true),
  new THREE.MeshStandardMaterial({
    color: 0x99ccff, emissive: 0x3388ff, emissiveIntensity: 3.0,
    transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
  })
);
innerCone.rotation.x = Math.PI;
innerCone.position.y = 0.09;
flameGroup.add(innerCone);

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

// ── DRIPPER FOR CONC. H2SO4 ACID ──────────────────────────────────────────
const DROPPER_HOME = { x: 0.0, y: 3.2, z: -1.25 };
const dropper = new Dropper(scene, DROPPER_HOME);
dropper._innerMesh.visible = false;
dropper._innerMesh.scale.y = 0.01;

// ── NH4OH GLASS ROD (shelf middle right) ──────────────────────────────────
const nh4ohRodGroup = new THREE.Group();
const nh4ohRodMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.008, 0.008, 0.68, 12),
  new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.48, transmission: 0.9, roughness: 0.05 })
);
nh4ohRodGroup.add(nh4ohRodMesh);

const nh4ohRodTipMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.72, roughness: 0.05 });
const nh4ohRodTip = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), nh4ohRodTipMat);
nh4ohRodTip.position.y = -0.34;
nh4ohRodGroup.add(nh4ohRodTip);

nh4ohRodGroup.position.set(0.9, 0.70, -1.25);
nh4ohRodGroup.rotation.set(Math.PI / 2, 0, -Math.PI / 4);
scene.add(nh4ohRodGroup);

const nh4ohRodLabel = makeLabel('NH₄OH Glass Rod', { fontSize: 16, width: 165, height: 36 });
nh4ohRodLabel.position.set(0, 0.42, 0);
nh4ohRodGroup.add(nh4ohRodLabel);

// ── MOIST FLUORESCENCE PAPER (shelf left) ─────────────────────────────────
const fluorescencePaperGroup = new THREE.Group();
const paperHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x555555 }));
paperHolder.rotation.x = Math.PI / 2;
fluorescencePaperGroup.add(paperHolder);

const paperMat = new THREE.MeshStandardMaterial({ color: 0xe2f35d, roughness: 0.95, side: THREE.DoubleSide });
const paperMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.22), paperMat);
paperMesh.position.set(0, 0, 0.26);
fluorescencePaperGroup.add(paperMesh);

fluorescencePaperGroup.position.set(-0.9, 0.70, -1.25);
fluorescencePaperGroup.rotation.set(Math.PI / 2, 0, Math.PI / 4);
scene.add(fluorescencePaperGroup);

const fluorescenceLabel = makeLabel('Fluorescence Paper', { fontSize: 16, width: 175, height: 36 });
fluorescenceLabel.position.set(0, 0.35, 0);
fluorescencePaperGroup.add(fluorescenceLabel);

// ── MOIST FeSO4 PAPER (shelf middle left) ──────────────────────────────────
const feso4PaperGroup = new THREE.Group();
const feso4Holder = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x555555 }));
feso4Holder.rotation.x = Math.PI / 2;
feso4PaperGroup.add(feso4Holder);

const feso4PaperMat = new THREE.MeshStandardMaterial({ color: 0xddffdd, roughness: 0.95, side: THREE.DoubleSide }); // pale green/white
const feso4PaperMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.22), feso4PaperMat);
feso4PaperMesh.position.set(0, 0, 0.26);
feso4PaperGroup.add(feso4PaperMesh);

feso4PaperGroup.position.set(0.0, 0.70, -1.25);
feso4PaperGroup.rotation.set(Math.PI / 2, 0, -Math.PI / 4);
scene.add(feso4PaperGroup);

const feso4Label = makeLabel('FeSO₄ Paper', { fontSize: 16, width: 155, height: 36 });
feso4Label.position.set(0, 0.35, 0);
feso4PaperGroup.add(feso4Label);

// ═══════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════

// 1. Gas Fumes System (rising from test tube mouth)
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
    active: false
  };

  fumesGroup.add(sp);
  fumeParticles.push(sp);
}

let fumesActive = false;
let currentFumeType = 'white';

function getTubeMouthWorldPos() {
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
      
      ud.active = true;
      ud.life = 0;
      ud.maxLife = 0.8 + Math.random() * 0.6;
      p.position.copy(mouthPos);
      p.position.x += (Math.random() - 0.5) * 0.02;
      p.position.y += (Math.random() - 0.5) * 0.02;
      p.position.z += (Math.random() - 0.5) * 0.02;

      ud.vx = -0.05 + (Math.random() - 0.5) * 0.04;
      ud.vy = 0.28 + Math.random() * 0.15;
      ud.vz = (Math.random() - 0.5) * 0.04;

      let col = 0xffffff;
      let opacityTarget = 0.25;
      if (currentFumeType === 'brown') {
        col = 0xa04e1c; // orange-brown NO2/Br2
        opacityTarget = 0.8;
      } else if (currentFumeType === 'white') {
        col = 0xe2efff; // HCl
        opacityTarget = 0.35;
      }
      p.material.color.setHex(col);
      p.scale.set(0.08, 0.08, 1.0);
      ud.opacityTarget = opacityTarget;
      return;
    }

    ud.life += dt;
    if (ud.life >= ud.maxLife) {
      ud.active = false;
      ud.delay = Math.random() * 0.12;
      p.material.opacity = 0;
      return;
    }

    const t = ud.life / ud.maxLife;

    p.position.x += ud.vx * dt + Math.sin(time * 6 + ud.phase) * 0.04 * dt;
    p.position.y += ud.vy * dt;
    p.position.z += ud.vz * dt + Math.cos(time * 5 + ud.phase) * 0.04 * dt;

    const s = 0.08 + t * 0.38;
    p.scale.set(s, s, 1.0);

    const maxOp = ud.opacityTarget || 0.35;
    p.material.opacity = t < 0.25 ? (t / 0.25) * maxOp : (1.0 - t) * maxOp;
  });
}

// 2. NH4OH Rod dense fumes system
const rodFumeGroup = new THREE.Group();
scene.add(rodFumeGroup);
const RFUME_COUNT = 45;
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
  const tipPos = new THREE.Vector3(0, -0.34, 0);
  tipPos.applyMatrix4(nh4ohRodGroup.matrixWorld);

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
    p.material.opacity = t < 0.2 ? (t / 0.2) * 0.85 : (1.0 - t) * 0.85;
  });
}

// 3. Boiling Visual inside test tube liquid
const BOIL_BUBBLE_COUNT = 8;
const boilBubbles = [];
const boilBubbleGroup = new THREE.Group();
testTubeGroup.add(boilBubbleGroup);

for (let i = 0; i < BOIL_BUBBLE_COUNT; i++) {
  const bubble = new THREE.Mesh(
    new THREE.SphereGeometry(0.005 + Math.random()*0.006, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 })
  );
  bubble.userData = {
    vy: 0.2 + Math.random() * 0.15,
    phase: Math.random() * 10,
    active: false
  };
  boilBubbleGroup.add(bubble);
  boilBubbles.push(bubble);
}

let boilingActive = false;

function startBoilingVisual() {
  boilingActive = true;
  boilBubbles.forEach(b => {
    b.material.opacity = 0.7;
    b.position.set((Math.random() - 0.5) * 0.05, 0.08, (Math.random() - 0.5) * 0.05);
    b.userData.active = true;
  });
}

function stopBoilingVisual() {
  boilingActive = false;
  boilBubbles.forEach(b => {
    b.material.opacity = 0.0;
    b.userData.active = false;
  });
}

function updateBoiling(dt) {
  if (!boilingActive) return;
  boilBubbles.forEach(b => {
    if (!b.userData.active) return;
    b.position.y += b.userData.vy * dt;
    b.position.x += Math.sin(b.position.y * 40 + b.userData.phase) * 0.008 * dt;
    if (b.position.y > 0.20) {
      b.position.y = 0.06;
      b.position.x = (Math.random() - 0.5) * 0.05;
    }
  });
}

// ── LAB SINK PLACEMENT ─────────────────────────────────────────────────────
const labSinkLeft = new LabSink(scene, { x: -8, y: 0, z: -1.7 });
const labSinkRight = new LabSink(scene, { x: 8, y: 0, z: -1.7 });
labSinkLeft.turnOn();
labSinkRight.turnOn();

const sinkLabel = makeLabel('Lab Sink', { fontSize: 17, width: 130, height: 36 });
sinkLabel.position.set(8, 0.52, -1.2);
scene.add(sinkLabel);

// Observation sheet on the table
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
let selectedSampleId = "";
let powderPlaced = false;
let copperPlaced = false;
let acidAdded = false;
let burnerPlaced = false;
let flameLit = false;
let wafted = false;

function getSceneBurnerPlaced() { return burnerPlaced; }
function getSceneFlameLit()     { return flameLit; }
function getScenePowderPlaced() { return powderPlaced; }

function setLabelsOpacity(opacity) {
  const labels = [
    retortLabel, bunsenLabel, acidBottleLabel, copperBottleLabel,
    nh4ohRodLabel, fluorescenceLabel, feso4Label,
    sinkLabel, sheetLabel, bottleLabel, spatulaLabel, tweezersLabel, lighterLabel
  ];
  labels.forEach(label => {
    if (label && label.material) {
      gsap.to(label.material, { opacity: opacity, duration: 0.3 });
    }
  });
}

function loadSubstanceInTube() {
  substanceMat.color.setHex(0xefefe7);
  substance.scale.set(1, 1, 1);
  substance.position.y = 0.05;
  
  glassMat.roughness = 0.05;
  glassMat.metalness = 0.1;
  heatingGlassMat.emissive.setRGB(0, 0, 0);
  heatingGlassMat.emissiveIntensity = 0;
  
  acidLiquid.visible = false;
  liquidMat.opacity = 0.0;
  liquidMat.color.setHex(0xeedda8); // Reset to standard amber
  copperPiece.visible = false;
}

// 1. Spatula scoop animation
let spatulaAnimationActive = false;
function runSpatulaScoopAnimation() {
  if (spatulaAnimationActive || !selectedSampleId || powderPlaced) return;
  spatulaAnimationActive = true;
  
  setLabelsOpacity(0);

  gsap.timeline()
    .to(bottleCap.position, { y: 0.38, z: 0.15, duration: 0.5, ease: 'power2.out' })
    .to(spatulaGroup.position, { x: -1.0, y: 2.8, z: -1.25, duration: 0.6, ease: 'power2.out' })
    .to(spatulaGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.5 }, "<")
    .to(spatulaGroup.position, { x: mixtureBottleGroup.position.x, y: 0.6, z: mixtureBottleGroup.position.z, duration: 0.7, ease: 'power2.out' })
    .to(spatulaGroup.position, { y: 0.3, duration: 0.4, ease: 'power1.inOut' })
    .add(() => {
      spatulaPowder.visible = true;
    })
    .to(spatulaGroup.position, { y: 0.6, duration: 0.4, ease: 'power1.out' })
    .to(spatulaGroup.position, { x: -0.52, y: 1.38, z: 0.26, duration: 0.9, ease: 'power2.inOut' })
    .to(spatulaGroup.rotation, { z: -Math.PI / 3, duration: 0.4 })
    .add(() => {
      spatulaPowder.visible = false;
      substance.visible = true;
      loadSubstanceInTube();
      triggerPowderPuff();
    })
    .to(spatulaGroup.rotation, { z: 0, duration: 0.3 })
    .to(spatulaGroup.position, { x: -0.8, y: 1.524, z: -1.25, duration: 1.0, ease: 'power2.inOut' })
    .to(spatulaGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 0.8 }, "<")
    .to(mixtureBottleGroup.position, { x: -1.0, y: 2.68, z: -1.25, duration: 1.0, ease: 'power2.inOut' }, "<")
    .to(bottleCap.position, { y: 0.19, z: 0, duration: 0.5, ease: 'power2.in' })
    .add(() => {
      spatulaAnimationActive = false;
      powderPlaced = true;
      setLabelsOpacity(1);
      updateKeyboardGuideText();
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.onSamplePlaced();
      }
    });
}

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
        p.userData.vy -= 0.2 * 0.016;
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

// 2. Tweezers copper scoop animation
let copperAnimationActive = false;
function runCopperAddAnimation(onComplete) {
  if (copperAnimationActive || !powderPlaced || copperPlaced) return;
  copperAnimationActive = true;

  setLabelsOpacity(0);

  gsap.timeline()
    .to(copperBottleCap.position, { y: 0.38, z: 0.15, duration: 0.5, ease: 'power2.out' })
    // Move tweezers to copper turnings bottle
    .to(tweezersGroup.position, { x: 1.0, y: 2.8, z: -1.25, duration: 0.6, ease: 'power2.out' })
    .to(tweezersGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.5 }, "<")
    .to(tweezersGroup.position, { x: copperBottleGroup.position.x, y: 0.6, z: copperBottleGroup.position.z, duration: 0.7, ease: 'power2.out' })
    .to(tweezersGroup.position, { y: 0.3, duration: 0.4, ease: 'power1.inOut' }) // dip
    .add(() => {
      tweezersCopper.visible = true; // pick up copper
    })
    .to(tweezersGroup.position, { y: 0.6, duration: 0.4, ease: 'power1.out' })
    // Move tweezers to test tube mouth
    .to(tweezersGroup.position, { x: -0.52, y: 1.38, z: 0.26, duration: 0.9, ease: 'power2.inOut' })
    .to(tweezersGroup.rotation, { z: -Math.PI / 3, duration: 0.4 })
    .add(() => {
      tweezersCopper.visible = false;
      copperPiece.visible = true; // copper falls to bottom
    })
    .to(tweezersGroup.rotation, { z: 0, duration: 0.3 })
    // Return tweezers and bottle cap
    .to(tweezersGroup.position, { x: 0.0, y: 1.524, z: -1.25, duration: 1.0, ease: 'power2.inOut' })
    .to(tweezersGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 0.8 }, "<")
    .to(copperBottleCap.position, { y: 0.19, z: 0, duration: 0.5, ease: 'power2.in' })
    .add(() => {
      copperAnimationActive = false;
      copperPlaced = true;
      setLabelsOpacity(1);
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    });
}

// 3. Add Acid animation
let acidAnimationActive = false;
function animateAddAcid(onComplete) {
  if (acidAnimationActive || !copperPlaced || acidAdded) return;
  acidAnimationActive = true;

  setLabelsOpacity(0);

  gsap.timeline()
    .to(acidBottleCap.position, { y: 0.38, z: 0.15, duration: 0.5, ease: 'power2.out' })
    .to(acidBottleGroup.position, { x: -0.7, y: 0.2, z: 0.2, duration: 1.0, ease: 'power2.out' })
    .add(() => {
      const tubeMouth = getTubeMouthWorldPos();
      const targetPos = { x: tubeMouth.x, y: tubeMouth.y + 0.55, z: tubeMouth.z };
      
      dropper.dispense(targetPos, '#eedda8', 4, () => {
        acidLiquid.visible = true;
        gsap.to(liquidMat, { opacity: 0.65, duration: 1.0 });
        gsap.to(acidLiquid.scale, { y: 1.0, duration: 1.0 });

        gsap.timeline()
          .to(acidBottleGroup.position, { x: 0.0, y: 2.68, z: -1.25, duration: 1.0, ease: 'power2.inOut' })
          .to(acidBottleCap.position, { y: 0.19, z: 0, duration: 0.5, ease: 'power2.in' })
          .add(() => {
            acidAnimationActive = false;
            acidAdded = true;
            setLabelsOpacity(1);
            updateKeyboardGuideText();
            if (onComplete) onComplete();
          });
      });
    });
}

// 4. Bunsen burner placement
let burnerAnimationActive = false;
function runBurnerPlaceAnimation() {
  if (burnerAnimationActive || !acidAdded || burnerPlaced) return;
  burnerAnimationActive = true;

  setLabelsOpacity(0);
  
  gsap.to(controls.target, { x: -0.52, y: 0.72, z: 0.32, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 1.8,
    phi: Math.PI / 2.3,
    theta: -Math.PI / 6,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => controls._update()
  });

  gsap.to(bunsen.position, {
    x: -0.46, y: 0, z: 0.2,
    duration: 1.2,
    ease: 'power2.inOut',
    onComplete: () => {
      burnerAnimationActive = false;
      burnerPlaced = true;
      setLabelsOpacity(1);
      updateKeyboardGuideText();
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.onBurnerPlaced();
      }
    }
  });
}

// 5. Bunsen burner light & heating
let lightAnimationActive = false;
function runBurnerLightAnimation() {
  if (lightAnimationActive || !burnerPlaced || flameLit) return;
  lightAnimationActive = true;

  setLabelsOpacity(0);

  gsap.timeline()
    .to(lighterGroup.position, { x: -0.46, y: 0.88, z: 0.2, duration: 0.8, ease: 'power2.out' })
    .to(lighterGroup.rotation, { x: 0, y: 0, z: Math.PI / 4, duration: 0.6 }, "<")
    .add(() => {
      startBunsenFlame();
      flameLit = true;
      
      // Heat the tube
      gsap.to(retortGroup.position, { y: -0.06, duration: 1.5, ease: 'power1.inOut' });

      // Glow glass red-hot
      gsap.to(heatingGlassMat.emissive, { r: 1.0, g: 0.15, b: 0, duration: 3.5 });
      gsap.to(heatingGlassMat, { emissiveIntensity: 1.8, duration: 3.5 });

      const sample = typeof CopperTurningsTest !== 'undefined' ? CopperTurningsTest.getSample() : null;
      if (sample) {
        startBoilingVisual();

        setTimeout(() => {
          if (sample.hasNitrate) {
            // Solution turns emerald green
            gsap.to(liquidMat.color, { r: 0.1, g: 0.5, b: 0.25, duration: 3.5 }); // rich green Cu(NO3)2
            startFumes('brown'); // brown NO2 fumes
          } else if (sample.hasBromide) {
            // Solution turns slightly amber-brown
            gsap.to(liquidMat.color, { r: 0.62, g: 0.32, b: 0.06, duration: 3.5 });
            startFumes('brown'); // brown Br2 fumes
          } else if (sample.hasChloride) {
            // Solution remains clear amber
            startFumes('white'); // white HCl fumes
          }
        }, 2200);
      }
    })
    .to(lighterGroup.position, { x: 0.8, y: 1.66, z: -1.25, duration: 0.8, delay: 0.5, ease: 'power2.inOut' })
    .to(lighterGroup.rotation, { x: Math.PI / 2, y: 0, z: Math.PI / 6, duration: 0.8 }, "<")
    .add(() => {
      lightAnimationActive = false;
      setLabelsOpacity(1);
      updateKeyboardGuideText();
      
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.igniteBurner();
      }
    });
}

// 6. Waft gas animation
let waftAnimationActive = false;
function runWaftAnimation() {
  if (waftAnimationActive) return;
  waftAnimationActive = true;
  if (typeof CopperTurningsTest !== 'undefined') {
    CopperTurningsTest.waftGas();
  }
}

function animateTakeSample(sampleId, onComplete) {
  selectedSampleId = sampleId;
  powderPlaced = false;
  copperPlaced = false;
  acidAdded = false;
  burnerPlaced = false;
  flameLit = false;
  wafted = false;

  gsap.to(controls.target, { x: -0.3, y: 0.5, z: 0.3, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 3.0,
    phi: Math.PI / 3,
    theta: -Math.PI / 8,
    duration: 1.5,
    onUpdate: () => controls._update()
  });

  setLabelsOpacity(0);

  gsap.to(mixtureBottleGroup.position, {
    x: -0.9, y: 0.2, z: 0.2,
    duration: 1.2,
    ease: 'power2.out',
    onComplete: () => {
      setLabelsOpacity(1);
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    }
  });
}

function animateWaft(sample, onComplete) {
  setLabelsOpacity(0);

  const originalRadius = controls.radius;
  const originalTheta = controls.theta;

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
      setLabelsOpacity(1);
      waftAnimationActive = false;
      wafted = true;
      if (onComplete) onComplete();
    });
}

// 7. Confirmatory Vapour Tests
function animateNH4OHTest(sample, onComplete) {
  setLabelsOpacity(0);
  const mouthWorld = getTubeMouthWorldPos();

  gsap.to(controls.target, { x: mouthWorld.x, y: mouthWorld.y, z: mouthWorld.z, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, { radius: 1.2, phi: Math.PI / 2.3, theta: -Math.PI / 6, duration: 1.5, ease: 'power2.inOut', onUpdate: () => controls._update() });
  
  gsap.timeline()
    .set(nh4ohRodGroup.rotation, { x: 0, y: 0, z: Math.PI / 3 })
    .set(nh4ohRodGroup.position, { x: mouthWorld.x + 0.28, y: mouthWorld.y + 0.45, z: mouthWorld.z })
    .to(nh4ohRodGroup.position, { x: mouthWorld.x + 0.03, y: mouthWorld.y + 0.09, z: mouthWorld.z, duration: 1.0, ease: 'power2.out' })
    .add(() => {
      if (sample.hasChloride) {
        startRodFumes();
      }
      setTimeout(onComplete, 1800);
    });
}

function animateFluorescenceTest(sample, onComplete) {
  setLabelsOpacity(0);
  const mouthWorld = getTubeMouthWorldPos();

  gsap.to(controls.target, { x: mouthWorld.x, y: mouthWorld.y, z: mouthWorld.z, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, { radius: 1.2, phi: Math.PI / 2.3, theta: -Math.PI / 6, duration: 1.5, ease: 'power2.inOut', onUpdate: () => controls._update() });
  
  gsap.timeline()
    .set(fluorescencePaperGroup.rotation, { x: 0, y: 0, z: 0 })
    .set(fluorescencePaperGroup.position, { x: mouthWorld.x + 0.35, y: mouthWorld.y + 0.35, z: mouthWorld.z })
    .to(fluorescencePaperGroup.position, { x: mouthWorld.x + 0.09, y: mouthWorld.y + 0.12, z: mouthWorld.z, duration: 1.2, ease: 'power2.out' })
    .add(() => {
      if (sample.hasBromide) {
        gsap.to(paperMat.color, { r: 1.0, g: 0.1, b: 0.1, duration: 1.5 });
      }
      setTimeout(onComplete, 1800);
    });
}

function animateFeSO4Test(sample, onComplete) {
  setLabelsOpacity(0);
  const mouthWorld = getTubeMouthWorldPos();

  gsap.to(controls.target, { x: mouthWorld.x, y: mouthWorld.y, z: mouthWorld.z, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, { radius: 1.2, phi: Math.PI / 2.3, theta: -Math.PI / 6, duration: 1.5, ease: 'power2.inOut', onUpdate: () => controls._update() });

  gsap.timeline()
    .set(feso4PaperGroup.rotation, { x: 0, y: 0, z: Math.PI / 3 })
    .set(feso4PaperGroup.position, { x: mouthWorld.x + 0.28, y: mouthWorld.y + 0.45, z: mouthWorld.z })
    .to(feso4PaperGroup.position, { x: mouthWorld.x + 0.03, y: mouthWorld.y + 0.09, z: mouthWorld.z, duration: 1.0, ease: 'power2.out' })
    .add(() => {
      if (sample.hasNitrate) {
        gsap.to(feso4PaperMat.color, { r: 0.36, g: 0.25, b: 0.20, duration: 1.5 }); // Turns brown complex
      }
      setTimeout(onComplete, 1800);
    });
}

function stopGasTestAnimations() {
  stopRodFumes();
  
  gsap.to(controls.target, { x: -0.3, y: 0.5, z: 0.3, duration: 1.2, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 3.0,
    phi: Math.PI / 3,
    theta: -Math.PI / 8,
    duration: 1.2,
    onUpdate: () => controls._update()
  });

  gsap.to(nh4ohRodGroup.position, { x: 0.9, y: 0.70, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(nh4ohRodGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 1.0 });

  gsap.to(fluorescencePaperGroup.position, { x: -0.9, y: 0.70, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(fluorescencePaperGroup.rotation, { x: Math.PI / 2, y: 0, z: Math.PI / 4, duration: 1.0 });

  gsap.to(feso4PaperGroup.position, { x: 0.0, y: 0.70, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(feso4PaperGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 1.0 });

  setLabelsOpacity(1);
}

function stopHeating() {
  stopBunsenFlame();
  stopFumes();
  stopBoilingVisual();
  
  gsap.to(bunsen.position, { x: -0.72, y: 0, z: 0.48, duration: 1.0 });
  gsap.to(retortGroup.position, { y: 0.015, duration: 1.0 });
  
  gsap.to(heatingGlassMat.emissive, { r: 0, g: 0, b: 0, duration: 2.0 });
  gsap.to(heatingGlassMat, { emissiveIntensity: 0, duration: 2.0 });

  gsap.to(glassMat, { roughness: 0.05, metalness: 0.1, duration: 2.0 });
  gsap.to(heatingGlassMat, { roughness: 0.05, metalness: 0.1, duration: 2.0 });

  substance.visible = false;
  acidLiquid.visible = false;
  liquidMat.opacity = 0.0;
  copperPiece.visible = false;

  // Return shelf objects to shelf
  gsap.to(mixtureBottleGroup.position, { x: -1.0, y: 2.68, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(spatulaGroup.position, { x: -0.8, y: 1.524, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(spatulaGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 1.0 });
  gsap.to(tweezersGroup.position, { x: 0.0, y: 1.524, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(tweezersGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 1.0 });
  gsap.to(lighterGroup.position, { x: 0.8, y: 1.66, z: -1.25, duration: 1.0, ease: 'power2.out' });
  gsap.to(lighterGroup.rotation, { x: Math.PI / 2, y: 0, z: Math.PI / 6, duration: 1.0 });

  // Reset paper colors
  const yellowGreen = new THREE.Color(0xe2f35d);
  gsap.to(paperMat.color, { r: yellowGreen.r, g: yellowGreen.g, b: yellowGreen.b, duration: 1.0 });
  const lightGreen = new THREE.Color(0xddffdd);
  gsap.to(feso4PaperMat.color, { r: lightGreen.r, g: lightGreen.g, b: lightGreen.b, duration: 1.0 });

  selectedSampleId = "";
  powderPlaced = false;
  copperPlaced = false;
  acidAdded = false;
  burnerPlaced = false;
  flameLit = false;
  wafted = false;

  stopGasTestAnimations();
}

let countdownOverlayEl = null;

function showReactionCountdown(seconds, onDone) {
  if (countdownOverlayEl) { countdownOverlayEl.remove(); }
  setLabelsOpacity(0);

  const div = document.createElement('div');
  div.id = 'reaction-countdown';
  div.style.cssText = `
    position: fixed; bottom: 215px; left: 50%; transform: translateX(-50%);
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
      <span style="font-size:0.8rem;color:#a0aec0">Observe solution changes and gas evolution</span>`;
    
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

// ── INTERACTIVE RAYCASTING (Hover outline / Click selections) ──────────────────
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
      if (obj === copperBottleGroup) return { type: 'copperBottle', group: obj };
      if (obj === tweezersGroup) return { type: 'tweezers', group: obj };
      if (obj === acidBottleGroup) return { type: 'acidBottle', group: obj };
      if (obj === bunsen) return { type: 'burner', group: obj };
      if (obj === testTubeGroup || obj === retortGroup) return { type: 'testtube', group: obj };
      if (obj === nh4ohRodGroup) return { type: 'nh4ohrod', group: obj };
      if (obj === fluorescencePaperGroup) return { type: 'fluorescence', group: obj };
      if (obj === feso4PaperGroup) return { type: 'feso4', group: obj };
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
    const state = typeof CopperTurningsTest !== 'undefined' ? CopperTurningsTest.getState() : 'IDLE';
    if (intersected.type === 'sinkKnob') isInteractive = true;
    if (intersected.type === 'bottle' && state === 'IDLE') isInteractive = true;
    if (intersected.type === 'spatula' && state === 'SAMPLE_SELECTED' && !powderPlaced) isInteractive = true;
    if (intersected.type === 'copperBottle' && state === 'POWDER_ADDED' && !copperPlaced) isInteractive = true;
    if (intersected.type === 'tweezers' && state === 'POWDER_ADDED' && !copperPlaced) isInteractive = true;
    if (intersected.type === 'acidBottle' && state === 'COPPER_ADDED' && !acidAdded) isInteractive = true;
    if (intersected.type === 'burner' && state === 'ACID_ADDED' && !burnerPlaced) isInteractive = true;
    if (intersected.type === 'burner' && state === 'ACID_ADDED' && burnerPlaced && !flameLit) isInteractive = true;
    if (intersected.type === 'testtube' && state === 'HEATED') isInteractive = true;
    if (intersected.type === 'nh4ohrod' && (state === 'OBSERVED' || state === 'TESTED_GAS')) isInteractive = true;
    if (intersected.type === 'fluorescence' && (state === 'OBSERVED' || state === 'TESTED_GAS')) isInteractive = true;
    if (intersected.type === 'feso4' && (state === 'OBSERVED' || state === 'TESTED_GAS')) isInteractive = true;
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

  const state = typeof CopperTurningsTest !== 'undefined' ? CopperTurningsTest.getState() : 'IDLE';

  if (intersected.type === 'bottle' && state === 'IDLE') {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof CopperTurningsTest !== 'undefined') {
      CopperTurningsTest.selectSample('random');
    }
  } else if (intersected.type === 'spatula' && state === 'SAMPLE_SELECTED' && !powderPlaced) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    runSpatulaScoopAnimation();
  } else if ((intersected.type === 'tweezers' || intersected.type === 'copperBottle') && state === 'POWDER_ADDED' && !copperPlaced) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof CopperTurningsTest !== 'undefined') {
      CopperTurningsTest.addCopper();
    }
  } else if (intersected.type === 'acidBottle' && state === 'COPPER_ADDED' && !acidAdded) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof CopperTurningsTest !== 'undefined') {
      CopperTurningsTest.addAcid();
    }
  } else if (intersected.type === 'burner' && state === 'ACID_ADDED' && !burnerPlaced) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    runBurnerPlaceAnimation();
  } else if (intersected.type === 'burner' && state === 'ACID_ADDED' && burnerPlaced && !flameLit) {
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
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.showObservationsFromKey();
      }
    }
  } else if (intersected.type === 'nh4ohrod' && (state === 'OBSERVED' || state === 'TESTED_GAS')) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof CopperTurningsTest !== 'undefined') {
      CopperTurningsTest.conductGasTest('nh4oh');
    }
  } else if (intersected.type === 'fluorescence' && (state === 'OBSERVED' || state === 'TESTED_GAS')) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof CopperTurningsTest !== 'undefined') {
      CopperTurningsTest.conductGasTest('fluorescence');
    }
  } else if (intersected.type === 'feso4' && (state === 'OBSERVED' || state === 'TESTED_GAS')) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof CopperTurningsTest !== 'undefined') {
      CopperTurningsTest.conductGasTest('feso4');
    }
  }
});

// ── KEYBOARD CONTROLS LISTENERS ──────────────────────────────────────────────
window.addEventListener('keydown', (event) => {
  const key = event.key.toUpperCase();
  const state = typeof CopperTurningsTest !== 'undefined' ? CopperTurningsTest.getState() : 'IDLE';

  if (state === 'IDLE') {
    if (key >= '1' && key <= '3') {
      const idx = parseInt(key);
      const sampleId = 'sample' + idx;
      if (typeof CopperTurningsTest !== 'undefined') {
        document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
        const targetBtn = document.querySelector(`.salt-btn[data-sample="${sampleId}"]`);
        if (targetBtn) {
          targetBtn.classList.add('active');
        }
        CopperTurningsTest.selectSample(sampleId);
      }
    }
  } else if (state === 'SAMPLE_SELECTED') {
    if (!powderPlaced && key === 'S') {
      runSpatulaScoopAnimation();
    }
  } else if (state === 'POWDER_ADDED') {
    if (!copperPlaced && key === 'C') {
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.addCopper();
      }
    }
  } else if (state === 'COPPER_ADDED') {
    if (!acidAdded && key === 'A') {
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.addAcid();
      }
    }
  } else if (state === 'ACID_ADDED') {
    if (!burnerPlaced && key === 'H') {
      runBurnerPlaceAnimation();
    } else if (burnerPlaced && !flameLit && key === 'L') {
      runBurnerLightAnimation();
    }
  } else if (state === 'HEATED') {
    if (key === 'W') {
      runWaftAnimation();
    } else if (key === 'O') {
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.showObservationsFromKey();
      }
    }
  } else if (state === 'OBSERVED' || state === 'TESTED_GAS') {
    if (key === '1') {
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.conductGasTest('nh4oh');
      }
    } else if (key === '2') {
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.conductGasTest('fluorescence');
      }
    } else if (key === '3') {
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.conductGasTest('feso4');
      }
    } else if (key === 'I') {
      if (typeof CopperTurningsTest !== 'undefined') {
        CopperTurningsTest.showIdentificationPanel();
      }
    }
  }

  if (key === 'R') {
    if (typeof CopperTurningsTest !== 'undefined') {
      CopperTurningsTest.reset();
    }
  }
});

// ── KEYBOARD GUIDE TEXT UPDATE ───────────────────────────────────────────────
function updateKeyboardGuideText() {
  const el = document.getElementById('keyboard-guide-text');
  if (!el) return;

  const state = typeof CopperTurningsTest !== 'undefined' ? CopperTurningsTest.getState() : 'IDLE';

  let html = "";
  if (state === 'IDLE') {
    html = `Select a substance from shelf (1-3) or press keys <span class="key-btn">1</span>-<span class="key-btn">3</span>.`;
  } else if (state === 'SAMPLE_SELECTED') {
    html = `Press <span class="key-btn">S</span> or click Spatula to scoop mixture powder into the test tube.`;
  } else if (state === 'POWDER_ADDED') {
    html = `Press <span class="key-btn">C</span> or click tweezers to add a piece of copper turning.`;
  } else if (state === 'COPPER_ADDED') {
    html = `Press <span class="key-btn">A</span> or click Con. H₂SO₄ bottle to add concentrated acid.`;
  } else if (state === 'ACID_ADDED') {
    if (!burnerPlaced) {
      html = `Press <span class="key-btn">H</span> or click Bunsen Burner to place it under the test tube.`;
    } else if (!flameLit) {
      html = `Press <span class="key-btn">L</span> or click Lighter to light the flame and start warming.`;
    }
  } else if (state === 'HEATING') {
    html = `Heating sample... Observe solution changes and evolved fumes.`;
  } else if (state === 'HEATED') {
    if (!wafted) {
      html = `Press <span class="key-btn">W</span> or click Test Tube to waft and detect odour.`;
    } else {
      html = `Press <span class="key-btn">O</span> or click Test Tube to open observations panel.`;
    }
  } else if (state === 'OBSERVED' || state === 'TESTED_GAS') {
    html = `Gas tests: Press <span class="key-btn">1</span> for NH₄OH rod, <span class="key-btn">2</span> for Fluorescence paper, <span class="key-btn">3</span> for FeSO₄ paper. Press <span class="key-btn">I</span> to Identify Anions.`;
  } else if (state === 'TESTING_GAS') {
    html = `Gas test in progress... Fill the results in the pop-up modal.`;
  } else if (state === 'IDENTIFYING') {
    html = `Select all active anions in the checklist, then click Submit.`;
  } else if (state === 'DONE') {
    html = `Analysis complete. View report, then press <span class="key-btn">R</span> or click Reset to start over.`;
  }

  if (state !== 'IDLE' && state !== 'DONE') {
    html += ` | Press <span class="key-btn">R</span> to Reset.`;
  }

  el.innerHTML = html;
}

// ── RENDER LOOP & WINDOW EVENTS ──────────────────────────────────────────────
let lastT = performance.now() * 0.001;

function loop() {
  requestAnimationFrame(loop);
  
  const now = performance.now() * 0.001;
  const dt = Math.min(now - lastT, 0.05);
  lastT = now;

  if (flameActive) {
    innerCone.rotation.z = Math.sin(now * 15) * 0.015;
    glowSprite.scale.set(0.35 + Math.sin(now * 12)*0.015, 0.55 + Math.cos(now * 10)*0.015, 1.0);
    flameLight.intensity = 2.2 + Math.sin(now * 22) * 0.35;
  }

  updateFumes(dt, now);
  updateBoiling(dt);
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
