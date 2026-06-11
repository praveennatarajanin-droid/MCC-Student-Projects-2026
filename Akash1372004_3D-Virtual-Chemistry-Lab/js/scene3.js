/**
 * scene3.js — Carbonate Test Lab Scene (Experiment 3)
 * Fully rebuilt: better watch glass, apparatus labels, fixed water effect,
 * observation panel timing fix via overlay countdown.
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
  for (let i = 0; i < 10; i++) {
    const cx = Math.random() * W;
    const cy = H * 0.5 + (Math.random() - 0.5) * H * 0.6;
    const rx = 80 + Math.random() * 160;
    const ry = 18 + Math.random() * 22;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(30,10,0,${0.04 + Math.random() * 0.06})`;
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
}

const _woodTex = makeBenchWoodTex();



// ═══════════════════════════════════════════════════════════════════════════
// MULTI-TIER WOODEN SHELF
// ═══════════════════════════════════════════════════════════════════════════
const shelfMat = new THREE.MeshStandardMaterial({ map: _woodTex, color: 0x5a4020, roughness: 0.8, metalness: 0.1 });

const shelfGroup = new THREE.Group();
scene.add(shelfGroup);

// Backboard
const backboard = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.0, 0.04), shelfMat);
backboard.position.set(0, 2.0, -1.62);
backboard.receiveShadow = true;
shelfGroup.add(backboard);

// Left side panel
const leftSide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.4), shelfMat);
leftSide.position.set(-1.87, 2.0, -1.42);
leftSide.castShadow = leftSide.receiveShadow = true;
shelfGroup.add(leftSide);

// Right side panel
const rightSide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.4), shelfMat);
rightSide.position.set(1.87, 2.0, -1.42);
rightSide.castShadow = rightSide.receiveShadow = true;
shelfGroup.add(rightSide);

// Top panel
const topPanel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.4), shelfMat);
topPanel.position.set(0, 3.47, -1.42);
topPanel.castShadow = topPanel.receiveShadow = true;
shelfGroup.add(topPanel);

// Bottom panel
const bottomPanel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.4), shelfMat);
bottomPanel.position.set(0, 0.53, -1.42);
bottomPanel.castShadow = bottomPanel.receiveShadow = true;
shelfGroup.add(bottomPanel);

// Shelf 1 (Middle Lower)
const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.04, 0.38), shelfMat);
shelf1.position.set(0, 1.5, -1.42);
shelf1.castShadow = shelf1.receiveShadow = true;
shelfGroup.add(shelf1);

// Shelf 2 (Middle Upper)
const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.04, 0.38), shelfMat);
shelf2.position.set(0, 2.5, -1.42);
shelf2.castShadow = shelf2.receiveShadow = true;
shelfGroup.add(shelf2);

// ── HCl bottle on shelf ──────────────────────────────────────────────────
const hclGroup = new THREE.Group();
const hclBodyMat = new THREE.MeshPhysicalMaterial({
  color: 0xfffce0, transparent: true, opacity: 0.55, roughness: 0.08, transmission: 0.62
});
hclGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.46, 20), hclBodyMat));
const hclLiquid = new THREE.Mesh(
  new THREE.CylinderGeometry(0.076, 0.076, 0.26, 20),
  new THREE.MeshStandardMaterial({ color: 0xfffce0, transparent: true, opacity: 0.6 })
);
hclLiquid.position.y = -0.06; hclGroup.add(hclLiquid);
const hclNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.085, 0.10, 16), hclBodyMat);
hclNeck.position.y = 0.28; hclGroup.add(hclNeck);
const hclCap = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.07, 16),
  new THREE.MeshStandardMaterial({ color: 0xddcc00, roughness: 0.5 }));
hclCap.position.y = 0.365; hclGroup.add(hclCap);
hclGroup.position.set(-1.0, 1.73, -1.35);
scene.add(hclGroup);

// HCl label (now a child of hclGroup for automatic movement)
const hclLabel = makeLabel('HCl (dil.)', { fontSize: 17, width: 140, height: 36 });
hclLabel.position.set(0, 0.49, 0.14);
hclGroup.add(hclLabel);

// ── Limewater bottle on shelf ────────────────────────────────────────────
const limeGroup = new THREE.Group();
const limeMat_shelf = new THREE.MeshPhysicalMaterial({
  color: 0xe0ffe0, transparent: true, opacity: 0.5, roughness: 0.08, transmission: 0.65
});
limeGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.46, 20), limeMat_shelf));
const limeLiquid_shelf = new THREE.Mesh(
  new THREE.CylinderGeometry(0.076, 0.076, 0.28, 20),
  new THREE.MeshStandardMaterial({ color: 0xddffdd, transparent: true, opacity: 0.55 })
);
limeLiquid_shelf.position.y = -0.05; limeGroup.add(limeLiquid_shelf);
const limeNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.085, 0.10, 16), limeMat_shelf);
limeNeck.position.y = 0.28; limeGroup.add(limeNeck);
const limeCap_shelf = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.07, 16),
  new THREE.MeshStandardMaterial({ color: 0x228822, roughness: 0.5 }));
limeCap_shelf.position.y = 0.365; limeGroup.add(limeCap_shelf);
limeGroup.position.set(0.0, 1.73, -1.35);
scene.add(limeGroup);

// Limewater label (now a child of limeGroup)
const limeShelfLabel = makeLabel('Ca(OH)₂ Limewater', { fontSize: 16, width: 200, height: 36 });
limeShelfLabel.position.set(0, 0.49, 0.14);
limeGroup.add(limeShelfLabel);


// ═══════════════════════════════════════════════════════════════════════════
// UNKNOWN SAMPLE BOTTLES (initially on shelf top tier)
// ═══════════════════════════════════════════════════════════════════════════
const sampleLetters = ['A', 'B', 'C', 'D', 'E'];
const sampleColours = [0xffffff, 0xf5f5dc, 0xe8e8e0, 0xf0ede0, 0xfafafa];
const sampleBottleGroups = [];
const sampleBottleCaps = [];

sampleColours.forEach((col, i) => {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.28, 16),
    new THREE.MeshPhysicalMaterial({ color: col, transparent: true, opacity: 0.45, roughness: 0.1, transmission: 0.5 })
  ));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 }));
  cap.position.y = 0.165; g.add(cap);
  sampleBottleCaps.push(cap);

  const powder = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: col, roughness: 0.95 }));
  powder.position.y = -0.08; g.add(powder);
  
  const px = -1.2 + i * 0.6;
  g.position.set(px, 2.64, -1.35);
  scene.add(g);
  sampleBottleGroups.push(g);

  // Sample label (child of bottle group)
  const lbl = makeLabel('Sample ' + sampleLetters[i], { fontSize: 17, width: 150, height: 36 });
  lbl.position.set(0, 0.32, 0.18);
  g.add(lbl);
});


// ═══════════════════════════════════════════════════════════════════════════
// WATCH GLASS (initially on shelf bottom tier)
// ═══════════════════════════════════════════════════════════════════════════
const watchGlassGroup = new THREE.Group();

// Rim — thick enough to see clearly
const wgRimMat = new THREE.MeshPhysicalMaterial({
  color: 0xd0eeff, transparent: true, opacity: 0.55,
  roughness: 0.04, metalness: 0.0, transmission: 0.5,
  side: THREE.DoubleSide
});
const wgRim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 14, 60), wgRimMat);
watchGlassGroup.add(wgRim);

// Curved bowl — sphere cap, visible from above
const wgBowlMat = new THREE.MeshPhysicalMaterial({
  color: 0xb8d8f8, transparent: true, opacity: 0.38,
  roughness: 0.02, transmission: 0.7, side: THREE.DoubleSide
});
const wgBowlGeo = new THREE.SphereGeometry(0.23, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.28);
const wgBowl = new THREE.Mesh(wgBowlGeo, wgBowlMat);
wgBowl.position.y = -0.045;
watchGlassGroup.add(wgBowl);

// Edge highlight ring (makes it look like real lab glass)
const wgEdge = new THREE.Mesh(new THREE.TorusGeometry(0.218, 0.004, 8, 60),
  new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaccff, emissiveIntensity: 0.4 }));
wgEdge.position.y = -0.002;
watchGlassGroup.add(wgEdge);

watchGlassGroup.position.set(-0.8, 0.56, -1.35);
scene.add(watchGlassGroup);

// Watch glass label (child of watchGlassGroup)
const wgLabel = makeLabel('Watch Glass', { fontSize: 17, width: 150, height: 36 });
wgLabel.position.set(0, 0.32, 0.18);
watchGlassGroup.add(wgLabel);

// ── White powder substance on watch glass (starts invisible, child of watchGlassGroup)
const substanceMat = new THREE.MeshStandardMaterial({
  color: 0xf0f0e8, roughness: 0.96, metalness: 0.0
});
const substanceMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.10, 0.12, 0.024, 24),
  substanceMat
);
substanceMesh.position.set(0, 0.012, 0);
substanceMesh.visible = false;
watchGlassGroup.add(substanceMesh);

// ── HCl dropper (pipette, initially on shelf middle tier)
const DROPPER_HOME = { x: 0.8, y: 1.4, z: 0.4 };
const dropper      = new Dropper(scene, { x: 1.0, y: 1.95, z: -1.35 });
// Dropper label (child of dropper.group)
const dropperLabel = makeLabel('HCl Dropper', { fontSize: 17, width: 148, height: 36 });
dropperLabel.position.set(0, 0.52, 0.0);
dropper.group.add(dropperLabel);


// ═══════════════════════════════════════════════════════════════════════════
// LIMEWATER TEST TUBE STAND (grouped, initially on shelf bottom tier)
// ═══════════════════════════════════════════════════════════════════════════
const limewaterStandGroup = new THREE.Group();
limewaterStandGroup.position.set(0.8, 0.54, -1.35);
scene.add(limewaterStandGroup);

const limewaterGroup = new THREE.Group();
limewaterGroup.position.set(0, 0.55, 0);
limewaterStandGroup.add(limewaterGroup);

const lwGlassMat = new THREE.MeshPhysicalMaterial({
  color: 0xc8eeff, transparent: true, opacity: 0.25,
  roughness: 0.04, transmission: 0.88, side: THREE.DoubleSide, depthWrite: false
});
const lwTube = new THREE.Mesh(
  new THREE.CylinderGeometry(0.07, 0.07, 0.65, 28, 1, true), lwGlassMat
);
lwTube.castShadow = true;
limewaterGroup.add(lwTube);

// Round bottom
const lwBottom = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), lwGlassMat
);
lwBottom.position.y = -0.325;
limewaterGroup.add(lwBottom);

// Glass rim at top
const lwRimTop = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.006, 8, 28),
  new THREE.MeshStandardMaterial({ color: 0xd0eeff, emissive: 0x88bbff, emissiveIntensity: 0.2 }));
lwRimTop.position.y = 0.325;
limewaterGroup.add(lwRimTop);

// Limewater liquid (starts clear green-tinted, scale.y starts at 0.01 - empty)
const lwLiquidMat = new THREE.MeshStandardMaterial({
  color: 0xeeffee, transparent: true, opacity: 0.60,
  roughness: 0.05, depthWrite: false
});
const lwLiquid = new THREE.Mesh(
  new THREE.CylinderGeometry(0.062, 0.062, 0.40, 28), lwLiquidMat
);
lwLiquid.position.y = -0.10;
lwLiquid.scale.y = 0.01; // starts empty
limewaterGroup.add(lwLiquid);

// Stand
const lwStandMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.6 });
const lwClamp = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.014, 8, 24, Math.PI * 1.5), lwStandMat);
lwClamp.rotation.x = Math.PI / 2;
lwClamp.position.set(0, 0.55, 0);
limewaterStandGroup.add(lwClamp);

const lwRod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.9, 8), lwStandMat);
lwRod.position.set(0.15, 0.35, 0);
limewaterStandGroup.add(lwRod);

const lwBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.025, 0.25), lwStandMat);
lwBase.position.set(0.15, -0.1, 0);
limewaterStandGroup.add(lwBase);

// Limewater label (child of limewaterStandGroup)
const lwLabel = makeLabel('Limewater Ca(OH)₂', { fontSize: 16, width: 195, height: 36 });
lwLabel.position.set(0, 1.06, 0.18);
limewaterStandGroup.add(lwLabel);


// ═══════════════════════════════════════════════════════════════════════════
// GAS DELIVERY TUBE
// ═══════════════════════════════════════════════════════════════════════════
const tubeMat = new THREE.MeshPhysicalMaterial({
  color: 0xc8e8ff, transparent: true, opacity: 0.40,
  roughness: 0.05, transmission: 0.75
});
const gasHoriz = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.0, 10), tubeMat);
gasHoriz.rotation.z = Math.PI / 2;
gasHoriz.position.set(0.7, 0.38, 0.4);
gasHoriz.visible = false;
scene.add(gasHoriz);

const gasDip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.38, 10), tubeMat);
gasDip.rotation.z = -Math.PI / 12;
gasDip.position.set(1.32, 0.26, 0.4);
gasDip.visible = false;
scene.add(gasDip);

// Gas tube label (shown only when tube visible)
const gasTubeLabel = makeLabel('CO₂ Delivery Tube', { fontSize: 16, width: 185, height: 36 });
gasTubeLabel.position.set(0.7, 0.60, 0.58);
gasTubeLabel.visible = false;
scene.add(gasTubeLabel);

// ═══════════════════════════════════════════════════════════════════════════
// EFFERVESCENCE BUBBLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
const bubbleGroup = new THREE.Group();
scene.add(bubbleGroup);
const BUBBLE_COUNT = 55;
const bubbles = [];

for (let i = 0; i < BUBBLE_COUNT; i++) {
  const size = 0.005 + Math.random() * 0.011;
  const mat  = new THREE.MeshStandardMaterial({
    color: 0xccddff, transparent: true, opacity: 0.0,
    roughness: 0.05, emissive: new THREE.Color(0x224488), emissiveIntensity: 0.35
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 6), mat);
  const r = Math.random() * 0.10;
  const a = Math.random() * Math.PI * 2;
  mesh.userData = {
    r, a, speed: 0.20 + Math.random() * 0.25,
    baseX: -0.2, baseZ: 0.4,
    phase: Math.random() * Math.PI * 2
  };
  mesh.position.set(-0.2 + Math.cos(a) * r, 0.08, 0.4 + Math.sin(a) * r);
  bubbleGroup.add(mesh);
  bubbles.push(mesh);
}

let bubblesActive = false;

function startEffervescence() {
  bubblesActive = true;
  bubbles.forEach((b, i) => gsap.to(b.material, { opacity: 0.72, duration: 0.25, delay: i * 0.03 }));
}
function stopEffervescence() {
  bubblesActive = false;
  bubbles.forEach(b => gsap.to(b.material, { opacity: 0, duration: 0.5 }));
}


// ═══════════════════════════════════════════════════════════════════════════
// SPATULA (used for scooping powder)
// ═══════════════════════════════════════════════════════════════════════════
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
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
);
spatulaPowder.position.y = 0.008;
spatulaPowder.visible = false;
spatulaGroup.add(spatulaPowder);

spatulaGroup.position.set(1.4, 1.52, -1.35); // rest position on middle shelf
spatulaGroup.rotation.set(Math.PI / 2, 0, -Math.PI / 4); // lie flat
scene.add(spatulaGroup);

// Spatula label
const spatulaLabel = makeLabel('Spatula', { fontSize: 16, width: 120, height: 36 });
spatulaLabel.position.set(0, 0.35, 0);
spatulaGroup.add(spatulaLabel);


// ── Spatula powder puff particle effect ───────────────────────────────────
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
    p.position.set(-0.2 + (Math.random() - 0.5) * 0.05, 0.08, 0.4 + (Math.random() - 0.5) * 0.05);
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
        p.userData.life -= 0.02;
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


// ── Limewater pour stream animation ───────────────────────────────────────
function triggerLimewaterPourStream(onDone) {
  const streamGroup = new THREE.Group();
  scene.add(streamGroup);
  
  const droplets = [];
  const mat = new THREE.MeshBasicMaterial({ color: 0xeeffee, transparent: true, opacity: 0.7 });
  const geo = new THREE.SphereGeometry(0.006, 4, 4);

  let active = true;
  let count = 0;

  const spawn = () => {
    if (!active || count > 30) return;
    const p = new THREE.Mesh(geo, mat.clone());
    p.position.set(1.4, 0.7, 0.4); // above the tube mouth
    p.userData = {
      vy: -0.3,
      life: 1.0
    };
    streamGroup.add(p);
    droplets.push(p);
    count++;
    setTimeout(spawn, 30);
  };
  spawn();

  const anim = () => {
    let hasActive = false;
    droplets.forEach(p => {
      if (p.userData.life > 0) {
        p.position.y += p.userData.vy * 0.016;
        p.userData.vy -= 0.5 * 0.016; // gravity
        if (p.position.y < 0.55) { // inside the tube
          p.userData.life = 0;
          streamGroup.remove(p);
        } else {
          p.userData.life -= 0.03;
          p.material.opacity = p.userData.life;
          hasActive = true;
        }
      }
    });
    if (hasActive || count <= 30) {
      requestAnimationFrame(anim);
    } else {
      scene.remove(streamGroup);
      if (onDone) onDone();
    }
  };
  anim();
}


// ═══════════════════════════════════════════════════════════════════════════
// ANIMATIONS & STATE TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════

let selectedSampleIdx = -1;
let powderPlaced = false;
let hclTaken = false;
let hclDropsCount = 0;
let limewaterTaken = false;
let limewaterPoured = false;
let tubeConnected = false;

// ── Keyboard Guide Updater ────────────────────────────────────────────────
function updateKeyboardGuideText() {
  const guideEl = document.getElementById('keyboard-guide-text');
  if (!guideEl) return;

  const state = typeof CarbonateTest !== 'undefined' ? CarbonateTest.getState() : 'IDLE';

  let html = "";
  if (state === 'IDLE') {
    html = "Step 1: Press <span class='key-btn'>1</span> to <span class='key-btn'>5</span> to select Unknown Sample A - E on the shelf";
  } else if (state === 'SAMPLE_SELECTED') {
    if (!powderPlaced) {
      html = "Step 2: Press <span class='key-btn'>S</span> to scoop sample powder onto the watch glass";
    } else if (!hclTaken) {
      html = "Step 3: Press <span class='key-btn'>H</span> to take Dilute HCl bottle and dropper from the shelf";
    }
  } else if (state === 'HCl_ADDED' || (state === 'SAMPLE_SELECTED' && hclTaken)) {
    if (hclDropsCount < 5) {
      html = `Step 3: Press <span class='key-btn'>Space</span> or <span class='key-btn'>D</span> to squeeze dropper and release drop - Drops added: <span class='key-btn' style='color:#fff;background:#3182ce;border-color:#3182ce;'>${hclDropsCount}/5</span>`;
    } else {
      html = "Step 4: Observe reaction. Press <span class='key-btn'>W</span> to Waft Gas (test odour) | Press <span class='key-btn'>O</span> to open Observation Panel";
    }
  } else if (state === 'EFFERVESCENCE_OBSERVED') {
    if (!limewaterTaken) {
      html = "Step 5: Press <span class='key-btn'>L</span> to take Limewater tube stand and reagent bottle from the shelf";
    } else if (!limewaterPoured) {
      html = "Step 5: Press <span class='key-btn'>P</span> to pour limewater reagent into the test tube";
    } else if (!tubeConnected) {
      html = "Step 5: Press <span class='key-btn'>T</span> to connect the gas delivery tube and pass the gas";
    } else {
      html = "Step 5: Observe test. Press <span class='key-btn'>O</span> to open the Limewater Observation Panel";
    }
  } else if (state === 'LIMEWATER_TESTED') {
    html = "Step 6: Press <span class='key-btn'>I</span> to open the Anion Identification Panel";
  } else if (state === 'IDENTIFYING') {
    html = "Step 6: Select the identified anion in the panel on the left";
  } else if (state === 'DONE') {
    html = "Experiment Complete. Press <span class='key-btn'>R</span> to reset and run a new experiment";
  }

  const testGasBtn = document.getElementById('btn-test-gas');
  if (testGasBtn) {
    if (state === 'EFFERVESCENCE_OBSERVED') {
      testGasBtn.disabled = false;
      if (!limewaterTaken) {
        testGasBtn.textContent = "Place Limewater";
      } else if (!limewaterPoured) {
        testGasBtn.textContent = "Pour Limewater";
      } else if (!tubeConnected) {
        testGasBtn.textContent = "Connect Tube";
      } else {
        testGasBtn.textContent = "Observe Limewater";
      }
    } else {
      testGasBtn.textContent = "Test Gas with Limewater";
      testGasBtn.disabled = true;
    }
  }

  guideEl.innerHTML = html;
}

// Spatula animation
let spatulaAnimationActive = false;
function runSpatulaScoopAnimation() {
  if (spatulaAnimationActive || selectedSampleIdx < 0) return;
  spatulaAnimationActive = true;
  
  const bottleGroup = sampleBottleGroups[selectedSampleIdx];
  const cap = sampleBottleCaps[selectedSampleIdx];

  // 1. Move cap up and aside
  gsap.timeline()
    .to(cap.position, { y: 0.38, z: 0.15, duration: 0.5, ease: 'power2.out' })
    // 2. Animate Spatula to take sample
    .to(spatulaGroup.position, { x: 1.0, y: 2.8, z: -1.35, duration: 0.6, ease: 'power2.out' })
    .to(spatulaGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.5 }, "<")
    .to(spatulaGroup.position, { x: bottleGroup.position.x, y: 0.6, z: 0.2, duration: 0.7, ease: 'power2.out' })
    .to(spatulaGroup.position, { y: 0.28, duration: 0.4, ease: 'power1.inOut' }) // dip
    .add(() => {
      spatulaPowder.visible = true;
    })
    .to(spatulaGroup.position, { y: 0.6, duration: 0.4, ease: 'power1.out' })
    // 3. Move spatula to watch glass
    .to(spatulaGroup.position, { x: -0.2, y: 0.35, z: 0.4, duration: 0.8, ease: 'power2.inOut' })
    .to(spatulaGroup.rotation, { z: -Math.PI / 3, duration: 0.4 }) // tilt to deposit
    .add(() => {
      spatulaPowder.visible = false;
      substanceMesh.visible = true;
      substanceMesh.scale.set(0.01, 0.01, 0.01);
      gsap.to(substanceMesh.scale, { x: 1, y: 1, z: 1, duration: 0.6 });
      triggerPowderPuff();
    })
    .to(spatulaGroup.rotation, { z: 0, duration: 0.3 })
    // 4. Return spatula to shelf
    .to(spatulaGroup.position, { x: 1.4, y: 1.52, z: -1.35, duration: 1.0, ease: 'power2.inOut' })
    .to(spatulaGroup.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 0.8 }, "<")
    // 5. Close cap
    .to(cap.position, { y: 0.165, z: 0, duration: 0.5, ease: 'power2.in' })
    .add(() => {
      spatulaAnimationActive = false;
      powderPlaced = true;
      updateKeyboardGuideText();
      // Restore labels
      gsap.to([
        hclLabel.material, limeShelfLabel.material, wgLabel.material, 
        dropperLabel.material, lwLabel.material, sinkLabel.material, 
        sheetLabel.material, spatulaLabel.material
      ], { opacity: 1, duration: 0.3 });
      
      // Let logic know that sample is fully placed
      if (typeof CarbonateTest !== 'undefined') {
        CarbonateTest.samplePlaced();
      }
    });
}

function animateTakeSample(sampleIdx, onComplete) {
  selectedSampleIdx = sampleIdx;
  const bottleGroup = sampleBottleGroups[sampleIdx];

  // Zoom camera slightly to the bench center
  gsap.to(controls.target, { x: -0.5, y: 0.3, z: 0.3, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 3.2,
    phi: Math.PI / 3,
    theta: -Math.PI / 6,
    duration: 1.5,
    onUpdate: () => controls._update()
  });

  // Hide labels to prevent visual clutter
  gsap.to([
    hclLabel.material, limeShelfLabel.material, wgLabel.material, 
    dropperLabel.material, lwLabel.material, sinkLabel.material, 
    sheetLabel.material, spatulaLabel.material
  ], { opacity: 0, duration: 0.3 });

  // Move watch glass to table center
  gsap.to(watchGlassGroup.position, { x: -0.2, y: 0.06, z: 0.4, duration: 1.0, ease: 'power2.out' });

  // Move selected sample bottle to table
  gsap.to(bottleGroup.position, {
    x: -0.9, y: 0.2, z: 0.2,
    duration: 1.2,
    ease: 'power2.out',
    onComplete: () => {
      powderPlaced = false;
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    }
  });
}

let hclAnimationActive = false;
function runHClTakeAnimation() {
  if (hclAnimationActive) return;
  hclAnimationActive = true;

  // Move HCl bottle and dropper to table
  gsap.timeline()
    .to(hclGroup.position, { x: 0.4, y: 0.23, z: 0.2, duration: 0.8, ease: 'power2.out' })
    .to(dropper.group.position, { x: 0.8, y: 1.4, z: 0.4, duration: 0.8, ease: 'power2.out' }, "<")
    .add(() => {
      dropper.homePos = { x: 0.8, y: 1.4, z: 0.4 };
      // Animate dropper taking liquid from HCl bottle on the table
      gsap.timeline()
        .to(dropper.group.position, { x: 0.4, y: 0.65, z: 0.2, duration: 0.6, ease: 'power2.inOut' })
        .to(dropper._body.scale, { y: 0.88, duration: 0.15, yoyo: true, repeat: 1 })
        .add(() => {
          // Fill dropper inner liquid
          dropper._innerMat.color.setHex(0xfffce0);
          dropper._innerMesh.scale.y = 0.01;
          dropper._innerMesh.visible = true;
          gsap.to(dropper._innerMesh.scale, { y: 1.0, duration: 0.4 });
        })
        .to(dropper.group.position, { x: 0.8, y: 1.4, z: 0.4, duration: 0.5, ease: 'power2.out' })
        .add(() => {
          hclAnimationActive = false;
          // Set active position for dropper above watch glass
          dropper.moveTo({ x: -0.2, y: 1.1, z: 0.4 }, () => {
            updateKeyboardGuideText();
          });
        });
    });
}

let dropAnimationActive = false;
function animateDispenseSingleDrop(onDone) {
  if (dropAnimationActive) return;
  dropAnimationActive = true;

  // Squeeze bulb slightly
  gsap.to(dropper._body.scale, { y: 0.94, duration: 0.1, yoyo: true, repeat: 1 });

  // Animate the single drop falling
  dropper._fireDrop('#fffce0', () => {
    // Shrink liquid inside dropper
    gsap.to(dropper._innerMesh.scale, { y: 1.0 - (hclDropsCount * 0.18), duration: 0.2 });

    dropAnimationActive = false;
    if (onDone) onDone();

    // If 5 drops added, return dropper home
    if (hclDropsCount === 5) {
      dropper.returnHome();
    }
  });
}

function animateHClReaction() {
  // Hide labels
  gsap.to([
    hclLabel.material, limeShelfLabel.material, wgLabel.material, 
    dropperLabel.material, lwLabel.material, sinkLabel.material, 
    sheetLabel.material, spatulaLabel.material
  ], { opacity: 0, duration: 0.4 });

  // Camera zoom in on watch glass
  gsap.to(controls.target, { x: -0.2, y: 0.1, z: 0.4, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 1.3,
    phi: Math.PI / 3,
    theta: 0,
    duration: 1.5,
    onUpdate: () => controls._update()
  });

  // Automatically take HCl if not taken yet
  if (!hclTaken) {
    hclTaken = true;
    runHClTakeAnimation();
  }
}

let limewaterAnimationActive = false;
function runLimewaterTakeAnimation() {
  if (limewaterAnimationActive) return;
  limewaterAnimationActive = true;

  // Bring limewater stand and bottle to table
  gsap.timeline()
    .to(limewaterStandGroup.position, { x: 1.4, y: 0.0, z: 0.4, duration: 1.0, ease: 'power2.out' })
    .to(limeGroup.position, { x: 1.9, y: 0.23, z: 0.2, duration: 1.0, ease: 'power2.out' }, "<")
    .add(() => {
      limewaterAnimationActive = false;
      updateKeyboardGuideText();
    });
}

let pourAnimationActive = false;
function runLimewaterPourAnimation() {
  if (pourAnimationActive) return;
  pourAnimationActive = true;

  // Pour limewater bottle into test tube
  gsap.timeline()
    .to(limeGroup.position, { x: 1.4, y: 0.9, z: 0.4, duration: 0.8, ease: 'power2.inOut' })
    .to(limeGroup.rotation, { z: -Math.PI / 2.5, duration: 0.6, ease: 'power2.inOut' })
    .add(() => {
      // Trigger pour particles and rise liquid scale
      triggerLimewaterPourStream(() => {
        gsap.to(lwLiquid.scale, { y: 1.0, duration: 1.0, ease: 'power1.inOut' });
      });
    })
    .to(limeGroup.rotation, { z: 0, duration: 0.6, delay: 1.2, ease: 'power2.inOut' })
    .to(limeGroup.position, { x: 1.9, y: 0.23, z: 0.2, duration: 0.6, ease: 'power2.out' })
    .add(() => {
      pourAnimationActive = false;
      limewaterPoured = true;
      updateKeyboardGuideText();
    });
}

let connectAnimationActive = false;
function runConnectTubeAnimation() {
  if (connectAnimationActive) return;
  connectAnimationActive = true;

  // Bring delivery tube
  gasHoriz.visible = true;
  gasDip.visible   = true;
  gasTubeLabel.visible = true;

  // Animate camera target
  gsap.to(controls.target, { x: 1.4, y: 0.45, z: 0.4, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 1.2,
    phi: Math.PI / 2.3,
    theta: 0,
    duration: 1.5,
    onUpdate: () => controls._update(),
    onComplete: () => {
      connectAnimationActive = false;
      tubeConnected = true;
      updateKeyboardGuideText();
      
      // Trigger limewater test milky reaction in logic
      if (typeof CarbonateTest !== 'undefined') {
        CarbonateTest.triggerLimewaterMilkyEffect();
      }
    }
  });
}

function animateTakeLimewater(onComplete) {
  // Hide labels
  gsap.to([
    hclLabel.material, limeShelfLabel.material, wgLabel.material, 
    dropperLabel.material, lwLabel.material, sinkLabel.material, 
    sheetLabel.material, spatulaLabel.material
  ], { opacity: 0, duration: 0.4 });

  // Zoom on limewater test tube
  gsap.to(controls.target, { x: 1.4, y: 0.45, z: 0.4, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 1.5,
    phi: Math.PI / 2.3,
    theta: 0,
    duration: 1.5,
    onUpdate: () => controls._update()
  });

  // Automatically take limewater if not taken yet
  if (!limewaterTaken) {
    limewaterTaken = true;
    runLimewaterTakeAnimation();
  }
  if (onComplete) onComplete();
}

function makeLimewaterMilky() {
  // Zoom on limewater test tube
  gsap.to(controls.target, { x: 1.4, y: 0.45, z: 0.4, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 1.2,
    phi: Math.PI / 2.3,
    theta: 0,
    duration: 1.5,
    onUpdate: () => controls._update()
  });

  gasHoriz.visible = true;
  gasDip.visible   = true;
  gasTubeLabel.visible = true;

  gsap.to(lwLiquidMat.color, {
    r: 0.93, g: 0.93, b: 0.91,
    duration: 2.5, ease: 'power1.inOut',
    onUpdate: () => { lwLiquidMat.needsUpdate = true; }
  });
  gsap.to(lwLiquidMat, { opacity: 0.88, duration: 2.5 });

  for (let i = 0; i < 22; i++) {
    const geo  = new THREE.SphereGeometry(0.005 + Math.random() * 0.009, 6, 4);
    const mat  = new THREE.MeshStandardMaterial({
      color: 0xddddd8, transparent: true, opacity: 0.0, roughness: 0.9
    });
    const mesh = new THREE.Mesh(geo, mat);
    const r = Math.random() * 0.055, a = Math.random() * Math.PI * 2;
    mesh.position.set(1.4 + Math.cos(a) * r, 0.25 + Math.random() * 0.28, 0.4 + Math.sin(a) * r);
    scene.add(mesh);
    gsap.to(mat, { opacity: 0.78, duration: 0.4, delay: i * 0.07 });
    gsap.to(mesh.position, {
      y: mesh.position.y - 0.18, duration: 2.2 + Math.random() * 1.5,
      delay: 0.3 + Math.random() * 0.4, ease: 'power1.in'
    });
  }
}

function stopReaction() {
  stopEffervescence();
  gasHoriz.visible = false;
  gasDip.visible   = false;
  gasTubeLabel.visible = false;
  substanceMesh.visible = false;
  substanceMat.color.setHex(0xf0f0e8);
  gsap.killTweensOf(lwLiquidMat.color);
  gsap.killTweensOf(lwLiquidMat);
  lwLiquidMat.color.setHex(0xeeffee);
  lwLiquidMat.opacity = 0.60;
  lwLiquidMat.needsUpdate = true;

  lwLiquid.scale.y = 0.01; // empty test tube
  dropper._innerMesh.visible = false;

  // Reset keyboard state variables
  powderPlaced = false;
  hclTaken = false;
  hclDropsCount = 0;
  limewaterTaken = false;
  limewaterPoured = false;
  tubeConnected = false;

  // Move watch glass back to shelf
  gsap.to(watchGlassGroup.position, { x: -0.8, y: 0.56, z: -1.35, duration: 1.0, ease: 'power2.out' });

  // Move selected sample bottle back to shelf
  if (selectedSampleIdx >= 0) {
    const bottleGroup = sampleBottleGroups[selectedSampleIdx];
    const originalPx = -1.2 + selectedSampleIdx * 0.6;
    gsap.to(bottleGroup.position, { x: originalPx, y: 2.64, z: -1.35, duration: 1.0, ease: 'power2.out' });
    selectedSampleIdx = -1;
  }

  // Move HCl and Limewater bottles and stand back to shelf
  gsap.to(hclGroup.position, { x: -1.0, y: 1.73, z: -1.35, duration: 1.0, ease: 'power2.out' });
  gsap.to(limeGroup.position, { x: 0.0, y: 1.73, z: -1.35, duration: 1.0, ease: 'power2.out' });
  gsap.to(limewaterStandGroup.position, { x: 0.8, y: 0.54, z: -1.35, duration: 1.0, ease: 'power2.out' });

  // Return dropper to shelf
  dropper.homePos = { x: 1.0, y: 1.95, z: -1.35 };
  dropper.returnHome();

  // Reset camera to default overview
  setLabelsOpacity(1);
  gsap.to(controls.target, { x: 0, y: 0.5, z: 0, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 7.0,
    phi: Math.PI / 2.6,
    theta: 0,
    duration: 1.5,
    onUpdate: () => controls._update()
  });

  // Restore labels
  gsap.to([
    hclLabel.material, limeShelfLabel.material, wgLabel.material, 
    dropperLabel.material, lwLabel.material, sinkLabel.material, 
    sheetLabel.material, spatulaLabel.material
  ], { opacity: 1, duration: 0.4 });

  updateKeyboardGuideText();
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

      const sIdx = sampleBottleGroups.indexOf(obj);
      if (sIdx >= 0) return { type: 'sample', index: sIdx, group: obj };
      if (obj === hclGroup || obj === dropper.group) return { type: 'hcl', group: obj };
      if (obj === limewaterStandGroup || obj === limeGroup) return { type: 'limewater', group: obj };
      if (obj === spatulaGroup) return { type: 'spatula', group: obj };
      if (obj === watchGlassGroup) return { type: 'watchglass', group: obj };
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
    const state = typeof CarbonateTest !== 'undefined' ? CarbonateTest.getState() : 'IDLE';
    if (intersected.type === 'sinkKnob') isInteractive = true;
    if (intersected.type === 'sample' && state === 'IDLE') isInteractive = true;
    if (intersected.type === 'spatula' && state === 'SAMPLE_SELECTED' && !powderPlaced) isInteractive = true;
    if (intersected.type === 'hcl' && state === 'SAMPLE_SELECTED' && powderPlaced && !hclTaken) isInteractive = true;
    if (intersected.type === 'hcl' && state === 'HCl_ADDED' && hclTaken && hclDropsCount < 5) isInteractive = true;
    if (intersected.type === 'watchglass' && state === 'HCl_ADDED' && hclDropsCount === 5) isInteractive = true;
    if (intersected.type === 'limewater' && state === 'EFFERVESCENCE_OBSERVED') isInteractive = true;
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

  const state = typeof CarbonateTest !== 'undefined' ? CarbonateTest.getState() : 'IDLE';

  if (intersected.type === 'sample' && state === 'IDLE') {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    
    if (typeof CarbonateTest !== 'undefined') {
      const sampleNames = ['sodiumCarbonate', 'sodiumBicarbonate', 'potassiumCarbonate', 'calciumCarbonate', 'sodiumSulphide'];
      CarbonateTest.selectSample(sampleNames[intersected.index]);
    }
  } else if (intersected.type === 'spatula' && state === 'SAMPLE_SELECTED' && !powderPlaced) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    runSpatulaScoopAnimation();
  } else if (intersected.type === 'hcl' && state === 'SAMPLE_SELECTED' && powderPlaced && !hclTaken) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof CarbonateTest !== 'undefined') {
      CarbonateTest.addHCl();
    }
  } else if (intersected.type === 'hcl' && state === 'HCl_ADDED' && hclTaken && hclDropsCount < 5) {
    // Squeeze dropper and add a drop (equivalent to Space/D)
    hclDropsCount++;
    updateKeyboardGuideText();
    animateDispenseSingleDrop(() => {
      if (hclDropsCount === 5) {
        if (typeof CarbonateTest !== 'undefined') {
          CarbonateTest.triggerHClReaction();
        }
      }
    });
  } else if (intersected.type === 'watchglass' && state === 'HCl_ADDED' && hclDropsCount === 5) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    if (typeof CarbonateTest !== 'undefined') {
      CarbonateTest.showEffervescencePanel();
    }
  } else if (intersected.type === 'limewater' && state === 'EFFERVESCENCE_OBSERVED') {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';

    if (!limewaterTaken) {
      if (typeof CarbonateTest !== 'undefined') {
        CarbonateTest.showLimewaterPanel();
      }
    } else if (!limewaterPoured) {
      runLimewaterPourAnimation();
    } else if (!tubeConnected) {
      runConnectTubeAnimation();
    } else {
      if (typeof CarbonateTest !== 'undefined') {
        CarbonateTest.showLimewaterPanelFromKey();
      }
    }
  }
});

// ── KEYBOARD CONTROLS LISTENERS ───────────────────────────────────────────
window.addEventListener('keydown', (event) => {
  const key = event.key.toUpperCase();
  const state = typeof CarbonateTest !== 'undefined' ? CarbonateTest.getState() : 'IDLE';

  if (state === 'IDLE') {
    if (key >= '1' && key <= '5') {
      const idx = parseInt(key) - 1;
      const sampleNames = ['sodiumCarbonate', 'sodiumBicarbonate', 'potassiumCarbonate', 'calciumCarbonate', 'sodiumSulphide'];
      if (typeof CarbonateTest !== 'undefined') {
        CarbonateTest.selectSample(sampleNames[idx]);
      }
    }
  } else if (state === 'SAMPLE_SELECTED') {
    if (!powderPlaced && key === 'S') {
      runSpatulaScoopAnimation();
    } else if (powderPlaced && !hclTaken && key === 'H') {
      if (typeof CarbonateTest !== 'undefined') {
        CarbonateTest.addHCl();
      }
    }
  } else if (state === 'HCl_ADDED' || (state === 'SAMPLE_SELECTED' && hclTaken)) {
    if (hclTaken && hclDropsCount < 5 && (key === 'D' || event.key === ' ')) {
      hclDropsCount++;
      updateKeyboardGuideText();
      animateDispenseSingleDrop(() => {
        if (hclDropsCount === 5) {
          if (typeof CarbonateTest !== 'undefined') {
            CarbonateTest.triggerHClReaction();
          }
        }
      });
    } else if (state === 'HCl_ADDED' && key === 'W') {
      if (typeof CarbonateTest !== 'undefined' && typeof CarbonateTest.waftGas === 'function') {
        CarbonateTest.waftGas();
      }
    } else if (state === 'HCl_ADDED' && key === 'O') {
      if (typeof CarbonateTest !== 'undefined') {
        CarbonateTest.showEffervescencePanel();
      }
    }
  } else if (state === 'EFFERVESCENCE_OBSERVED') {
    if (!limewaterTaken && key === 'L') {
      if (typeof CarbonateTest !== 'undefined') {
        CarbonateTest.showLimewaterPanel();
      }
    } else if (limewaterTaken && !limewaterPoured && key === 'P') {
      runLimewaterPourAnimation();
    } else if (limewaterPoured && !tubeConnected && key === 'T') {
      runConnectTubeAnimation();
    } else if (tubeConnected && key === 'O') {
      if (typeof CarbonateTest !== 'undefined') {
        CarbonateTest.showLimewaterPanelFromKey();
      }
    }
  } else if (state === 'LIMEWATER_TESTED') {
    if (key === 'I') {
      if (typeof CarbonateTest !== 'undefined') {
        CarbonateTest.showIdentificationPanel();
      }
    }
  }

  // Global reset key
  if (key === 'R') {
    if (typeof CarbonateTest !== 'undefined') {
      CarbonateTest.reset();
    }
  }
});

// Initialize keyboard guide on load
setTimeout(updateKeyboardGuideText, 500);


// ═══════════════════════════════════════════════════════════════════════════
// OBSERVATION COUNTDOWN OVERLAY (blocks the panel until student has watched)
// ═══════════════════════════════════════════════════════════════════════════
// Creates a semi-transparent overlay on top of the 3D scene (not a floating panel)
// that counts down, then dismisses itself — leaving the 3D canvas fully visible.

// ═══════════════════════════════════════════════════════════════════════════
// WAFT GAS ANIMATION (camera tilt to simulate sniffing)
// ═══════════════════════════════════════════════════════════════════════════
function runWaftAnimation(onComplete) {
  const origTheta = controls.theta || 0;
  const origPhi   = controls.phi   || Math.PI / 2.6;
  // Gentle wobble: tilt left, then right, then back
  gsap.timeline()
    .to(controls, { theta: origTheta + 0.18, duration: 0.3, ease: 'sine.inOut',
        onUpdate: () => controls._update() })
    .to(controls, { theta: origTheta - 0.18, duration: 0.3, ease: 'sine.inOut',
        onUpdate: () => controls._update() })
    .to(controls, { theta: origTheta, phi: origPhi - 0.06, duration: 0.25, ease: 'sine.inOut',
        onUpdate: () => controls._update() })
    .to(controls, { phi: origPhi, duration: 0.25, ease: 'sine.inOut',
        onUpdate: () => controls._update(),
        onComplete: () => { if (onComplete) onComplete(); } });
}

function setLabelsOpacity(opacity) {
  scene.traverse(child => {
    if (child.isSprite && child.material) {
      gsap.to(child.material, { opacity: opacity, duration: 0.3 });
    }
  });
}

let _countdownEl = null;

function showReactionCountdown(seconds, onDone) {
  // Remove any existing
  if (_countdownEl) { _countdownEl.remove(); _countdownEl = null; }
  setLabelsOpacity(0);

  const overlay = document.createElement('div');
  overlay.id = 'reaction-countdown';
  overlay.style.cssText = `
    position: fixed; bottom: 154px; left: 50%; transform: translateX(-50%);
    background: rgba(10,20,40,0.88);
    border: 2px solid #63b3ed;
    border-radius: 14px;
    padding: 14px 28px;
    color: #e2f4ff;
    font-size: 1.05rem;
    font-family: Arial, sans-serif;
    z-index: 200;
    text-align: center;
    pointer-events: none;
    backdrop-filter: blur(4px);
    box-shadow: 0 0 24px rgba(99,179,237,0.35);
  `;
  document.body.appendChild(overlay);
  _countdownEl = overlay;

  let remaining = seconds;
  function tick() {
    if (!_countdownEl) return;
    overlay.innerHTML = `Observe the reaction... <b style="color:#63b3ed;font-size:1.3em">${remaining}s</b><br>
      <span style="font-size:0.82rem;color:#90cdf4">Watch for effervescence, gas colour and odour</span>`;
    if (remaining <= 0) {
      overlay.remove();
      _countdownEl = null;
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
// ENHANCED LAB SINK + WATER EFFECT
// ═══════════════════════════════════════════════════════════════════════════
const labSinkLeft = new LabSink(scene, { x: -8, y: 0, z: -1.7 });
const labSinkRight = new LabSink(scene, { x: 8, y: 0, z: -1.7 });
labSinkLeft.turnOn();
labSinkRight.turnOn();

// Sink label
const sinkLabel = makeLabel('Lab Sink', { fontSize: 17, width: 130, height: 36 });
sinkLabel.position.set(8, 0.52, -1.2);
scene.add(sinkLabel);




// ═══════════════════════════════════════════════════════════════════════════
// OBSERVATION SHEET + PENCIL
// ═══════════════════════════════════════════════════════════════════════════
const sheet = new THREE.Mesh(
  new THREE.PlaneGeometry(1.4, 0.9),
  new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.95 })
);
sheet.rotation.x = -Math.PI / 2;
sheet.position.set(-3.2, 0.01, 0.6);
sheet.receiveShadow = true;
scene.add(sheet);

const pencil = new THREE.Mesh(
  new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8),
  new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7 })
);
pencil.rotation.z = Math.PI / 2;
pencil.position.set(-3.2, 0.02, 0.9);
scene.add(pencil);

const sheetLabel = makeLabel('Observation Sheet', { fontSize: 16, width: 175, height: 36 });
sheetLabel.position.set(-3.2, 0.36, 0.6);
scene.add(sheetLabel);

// ═══════════════════════════════════════════════════════════════════════════
// RESIZE HANDLER
// ═══════════════════════════════════════════════════════════════════════════
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ═══════════════════════════════════════════════════════════════════════════
// RENDER LOOP
// ═══════════════════════════════════════════════════════════════════════════
let _t = 0;

function animate() {
  requestAnimationFrame(animate);
  _t = Date.now() * 0.001;

  // Bubbles
  if (bubblesActive) {
    bubbles.forEach(b => {
      const d = b.userData;
      b.position.y += d.speed * 0.009;
      b.position.x = d.baseX + Math.cos(d.a) * d.r + Math.sin(_t * 3.2 + d.phase) * 0.009;
      b.position.z = d.baseZ + Math.sin(d.a) * d.r + Math.cos(_t * 2.6 + d.phase) * 0.009;
      if (b.position.y > 0.50) {
        const r = Math.random() * 0.10, a = Math.random() * Math.PI * 2;
        d.r = r; d.a = a; d.phase = Math.random() * Math.PI * 2;
        b.position.set(d.baseX + Math.cos(a) * r, 0.08, d.baseZ + Math.sin(a) * r);
      }
    });
  }

  // Gentle shelf bottle sway
  hclGroup.rotation.y  = Math.sin(_t * 0.4) * 0.02;
  limeGroup.rotation.y = Math.sin(_t * 0.5 + 1) * 0.02;

  labSinkLeft.update(_t);
  labSinkRight.update(_t);

  renderer.render(scene, camera);
}
animate();

