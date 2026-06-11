/**
 * scene.js — Three.js scene, renderer, camera, lab environment
 *
 * Fixes:
 *  • outputEncoding → outputColorSpace (r134 compatible)
 *  • Proper bench/wall materials with roughness maps
 *  • Reagent bottles with correct label keys matching SaltDatabase
 *  • Test tubes positioned correctly on rack
 *  • Dropper home position set properly
 *  • Professional lab bench color + apparatus labels
 */

// ── Label helper: creates canvas texture sprite ───────────────────────────
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
// r134 uses outputEncoding; r152+ uses outputColorSpace — handle both
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
camera.position.set(0, 3.5, 7.5);
camera.lookAt(0, 0.5, 0);

// ── Lighting ──────────────────────────────────────────────────────────────
setupLighting(scene);

// ── Orbit Controls ────────────────────────────────────────────────────────
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
ceiling.position.set(0, 12 - 3.25, 0);
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
    const col = lightness > 0
      ? `rgba(200,140,80,${alpha})`
      : `rgba(30,10,0,${alpha})`;
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


// ── MULTI-TIER WOODEN SHELF CABINET ──────────────────────────────────────────
const shelfMat = new THREE.MeshStandardMaterial({ map: makeBenchWoodTex(), color: 0x5a4020, roughness: 0.8, metalness: 0.1 });
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

// ── Reagent bottles on Shelf 1 ──────────────────────────────────────────────
const reagentBottleData = [
  { key: 'NaOH',  label: 'NaOH',   colour: 0xd0eeff, capColour: 0x2244aa, x: -1.5 },
  { key: 'NH3',   label: 'NH₃',    colour: 0xd8f8d0, capColour: 0x226622, x: -0.5 },
  { key: 'HCl',   label: 'HCl',    colour: 0xfffce0, capColour: 0xaaaa22, x:  0.5 },
  { key: 'H2SO4', label: 'H₂SO₄', colour: 0xffe8e8, capColour: 0xaa2222, x:  1.5 }
];

const reagentLabels = [];
const reagentBottleMeshes = {};
reagentBottleData.forEach(d => {
  const g = new THREE.Group();

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: d.colour, transparent: true, opacity: 0.55,
    roughness: 0.08, transmission: 0.65, thickness: 0.3
  });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 20), bodyMat));

  const liqMat = new THREE.MeshStandardMaterial({
    color: d.colour, transparent: true, opacity: 0.72
  });
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.3, 20), liqMat);
  liq.position.y = -0.08;
  g.add(liq);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.09, 0.1, 16), bodyMat);
  neck.position.y = 0.3;
  g.add(neck);

  const capMat = new THREE.MeshStandardMaterial({ color: d.capColour, roughness: 0.5 });
  const cap    = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 16), capMat);
  cap.position.y = 0.385;
  g.add(cap);

  g.position.set(d.x, 1.79, -1.35);
  g.userData = { initX: d.x, initY: 1.79, initZ: -1.35, key: d.key, type: 'reagent' };
  scene.add(g);
  reagentBottleMeshes[d.key] = g;
  
  const lbl = makeLabel(d.label, { fontSize: 18, width: 140, height: 36 });
  lbl.position.set(0, 0.55, 0.1);
  g.add(lbl);
  reagentLabels.push(lbl);
});

// ── Sample bottles on Shelf 2 (unknown samples) ─────────────────────────────
const sampleLabels = [];
const sampleBottleGroups = [];
const sampleData = [
  { id: 'copper',    label: 'CuSO₄',  colour: 0x1a7fff },
  { id: 'nickel',    label: 'NiSO₄',  colour: 0x00aa44 },
  { id: 'cobalt',    label: 'CoCl₂',  colour: 0xff5fa0 },
  { id: 'manganese', label: 'MnSO₄',  colour: 0xc8a27d },
  { id: 'iron',      label: 'FeCl₃',  colour: 0xcc6600 },
  { id: 'random',    label: '?',       colour: 0xffffff }
];

sampleData.forEach((d, idx) => {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: d.colour, transparent: true, opacity: 0.5,
    roughness: 0.1, transmission: 0.5
  });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.32, 16), mat));

  const capMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
  const cap    = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.055, 16), capMat);
  cap.position.y = 0.188;
  g.add(cap);

  const initX = -1.5 + idx * 0.6;
  g.position.set(initX, 2.66, -1.35);
  g.userData = { initX: initX, initY: 2.66, initZ: -1.35, id: d.id, type: 'sample' };
  scene.add(g);
  sampleBottleGroups.push(g);

  const lbl = makeLabel(d.label, { fontSize: 17, width: 120, height: 34 });
  lbl.position.set(0, 0.36, 0.1);
  g.add(lbl);
  sampleLabels.push(lbl);
});

// ── Test tube rack ────────────────────────────────────────────────────────
const rack = new Rack(scene, { x: 0, y: 0, z: 0.5 });

// ── Test tubes (5 slots) ──────────────────────────────────────────────────
// Slot positions match rack hole positions
const TUBE_SLOT_X = [-1.0, -0.5, 0.0, 0.5, 1.0];
const testTubes   = TUBE_SLOT_X.map((x, i) =>
  new TestTube(scene, { x, y: 0.62, z: 0.5 }, i)
);

// ── Beaker (wash water) ───────────────────────────────────────────────────
const beaker = new Beaker(scene, { x: 1.8, y: 0.35, z: 0.4 });
const beakerLabel = makeLabel('Wash Beaker', { fontSize: 17, width: 150, height: 34 });
beakerLabel.position.set(1.8, 0.77, 0.55);
scene.add(beakerLabel);

// ── Dropper — home position is above the beaker ───────────────────────────
const DROPPER_HOME = { x: 1.8, y: 1.4, z: 0.4 };
const dropper      = new Dropper(scene, DROPPER_HOME);
const dropperLabel = makeLabel('Reagent Dropper', { fontSize: 17, width: 165, height: 34 });
dropperLabel.position.set(1.8, 1.92, 0.4);
scene.add(dropperLabel);

// ── Observation sheet on bench ────────────────────────────────────────────
const sheetMat2 = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.95 });
const sheet     = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), sheetMat2);
sheet.rotation.x = -Math.PI / 2;
sheet.position.set(-3.2, 0.01, 0.6);
sheet.receiveShadow = true;
scene.add(sheet);
const sheetLabel = makeLabel('Observation Sheet', { fontSize: 16, width: 175, height: 34 });
sheetLabel.position.set(-3.2, 0.36, 0.6);
scene.add(sheetLabel);

// Pencil on sheet
const pencilMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.7 });
const pencil    = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), pencilMat);
pencil.rotation.z = Math.PI / 2;
pencil.position.set(-3.2, 0.02, 0.9);
scene.add(pencil);


// ── Resize handler ────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Render loop ───────────────────────────────────────────────────────────
let _clock = { t: 0 };

// ── Lab Sinks (left and right side of bench) ───────────────────────────────
const labSinkLeft = new LabSink(scene, { x: -8, y: 0, z: -1.7 });
const labSinkRight = new LabSink(scene, { x: 8, y: 0, z: -1.7 });

function animate() {
  requestAnimationFrame(animate);
  _clock.t = Date.now() * 0.001;

  // Subtle idle sway on reagent bottles
  Object.values(reagentBottleMeshes).forEach((b, i) => {
    b.rotation.y = Math.sin(_clock.t * 0.4 + i * 1.2) * 0.025;
  });

  // Sink water animations
  labSinkLeft.update(_clock.t);
  labSinkRight.update(_clock.t);

  renderer.render(scene, camera);
}
animate();

function zoomOnTube(tubeGroup, onComplete) {
  const allLabels = [beakerLabel, dropperLabel, sheetLabel, ...reagentLabels, ...sampleLabels];
  gsap.to(allLabels.map(l => l.material), { opacity: 0, duration: 0.4 });
  
  const tubeWorld = new THREE.Vector3();
  tubeGroup.getWorldPosition(tubeWorld);
  
  gsap.to(controls.target, { x: tubeWorld.x, y: tubeWorld.y + 0.1, z: tubeWorld.z, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 1.25,
    phi: Math.PI / 2.3,
    theta: 0.05,
    duration: 1.5,
    onUpdate: () => controls._update()
  });
  if (onComplete) setTimeout(onComplete, 1500);
}

function resetCamera(onComplete) {
  gsap.to(controls.target, { x: 0, y: 0.5, z: 0, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(controls, {
    radius: 7.5,
    phi: Math.PI / 2.6,
    theta: 0,
    duration: 1.5,
    onUpdate: () => controls._update()
  });
  
  const allLabels = [beakerLabel, dropperLabel, sheetLabel, ...reagentLabels, ...sampleLabels];
  gsap.to(allLabels.map(l => l.material), { opacity: 1, duration: 0.4 });
  if (onComplete) setTimeout(onComplete, 1500);
}

// ── MANUAL LABORATORY INTERACTIONS ──────────────────────────────────────────
let selectedSampleIdx = -1;
let selectedReagentId = null;
let waterTaken = false;
let waterPoured = false;
let reagentTaken = false;
let reagentPoured = false;
let reactionCountdownActive = false;

// Attach raycasting identifiers
beaker.group.userData = { type: 'beaker' };
sheet.userData = { type: 'sheet' };

function animateTakeSalt(saltId, onComplete) {
  const idx = sampleData.findIndex(s => s.id === saltId);
  if (idx < 0) return;
  selectedSampleIdx = idx;
  const bottleGroup = sampleBottleGroups[idx];

  // Return any other sample bottle back to its shelf position
  sampleBottleGroups.forEach((g, i) => {
    if (i !== idx) {
      if (g.position.x !== g.userData.initX || g.position.y !== g.userData.initY || g.position.z !== g.userData.initZ) {
        gsap.to(g.position, {
          x: g.userData.initX,
          y: g.userData.initY,
          z: g.userData.initZ,
          duration: 0.8,
          ease: 'power2.inOut'
        });
      }
    }
  });

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
  const allLabels = [beakerLabel, dropperLabel, sheetLabel, ...reagentLabels, ...sampleLabels];
  gsap.to(allLabels.map(l => l.material), { opacity: 0, duration: 0.3 });

  // Move selected sample bottle to table
  gsap.to(bottleGroup.position, {
    x: -1.6, y: 0.22, z: 0.5,
    duration: 1.2,
    ease: 'power2.out',
    onComplete: () => {
      // Re-show labels, except for the selected sample bottle
      gsap.to(allLabels.filter((lbl, i) => i - 3 !== idx).map(l => l.material), { opacity: 1, duration: 0.3 });
      setLabelsOpacity(1);
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    }
  });
}

function animateTakeReagent(reagentId, onComplete) {
  selectedReagentId = reagentId;
  const bottleGroup = reagentBottleMeshes[reagentId];
  if (!bottleGroup) return;

  // Return any other reagent bottle back to its shelf position
  Object.keys(reagentBottleMeshes).forEach(key => {
    if (key !== reagentId) {
      const g = reagentBottleMeshes[key];
      if (g.position.x !== g.userData.initX || g.position.y !== g.userData.initY || g.position.z !== g.userData.initZ) {
        gsap.to(g.position, {
          x: g.userData.initX,
          y: g.userData.initY,
          z: g.userData.initZ,
          duration: 0.8,
          ease: 'power2.inOut'
        });
      }
    }
  });

  // Hide labels to prevent visual clutter
  const allLabels = [beakerLabel, dropperLabel, sheetLabel, ...reagentLabels, ...sampleLabels];
  gsap.to(allLabels.map(l => l.material), { opacity: 0, duration: 0.3 });

  // Move selected reagent bottle to table
  gsap.to(bottleGroup.position, {
    x: 0.5, y: 0.24, z: 0.5,
    duration: 1.2,
    ease: 'power2.out',
    onComplete: () => {
      // Re-show labels, except for the selected reagent bottle
      const reagentIdx = reagentBottleData.findIndex(r => r.key === reagentId);
      gsap.to(allLabels.filter((lbl, i) => i - 3 - sampleData.length !== reagentIdx).map(l => l.material), { opacity: 1, duration: 0.3 });
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    }
  });
}

let dropperAnimationActive = false;

function runTakeWaterAnimation(onComplete) {
  if (dropperAnimationActive) return;
  dropperAnimationActive = true;

  // Move dropper to beaker (wash water)
  gsap.timeline()
    .to(dropper.group.position, { x: 1.8, y: 0.72, z: 0.4, duration: 0.7, ease: 'power2.inOut' })
    .to(dropper._body.scale, { y: 0.88, duration: 0.15, yoyo: true, repeat: 1 })
    .add(() => {
      // Fill dropper inner liquid with water (clear light blue)
      dropper._innerMat.color.setHex(0x88ccff);
      dropper._innerMesh.scale.y = 0.01;
      dropper._innerMesh.visible = true;
      gsap.to(dropper._innerMesh.scale, { y: 1.0, duration: 0.4 });
    })
    .to(dropper.group.position, { x: 1.8, y: 1.4, z: 0.4, duration: 0.5, ease: 'power2.out' })
    .add(() => {
      dropperAnimationActive = false;
      waterTaken = true;
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    });
}

function runPourWaterAnimation(onComplete) {
  if (dropperAnimationActive) return;
  dropperAnimationActive = true;

  const tubePos = activeTube.group.position;
  // Zoom camera to tube
  zoomOnTube(activeTube.group);

  // Move dropper to active tube
  gsap.to(dropper.group.position, {
    x: tubePos.x, y: tubePos.y + 1.0, z: tubePos.z,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      // Squeeze bulb animation
      gsap.to(dropper._body.scale, { y: 0.92, duration: 0.1, yoyo: true, repeat: 5 });

      // Drop water
      let drops = 0;
      const fireNext = () => {
        if (drops >= 3) {
          // Empty dropper inner liquid
          gsap.to(dropper._innerMesh.scale, {
            y: 0.01, duration: 0.3, onComplete: () => {
              dropper._innerMesh.visible = false;
            }
          });

          // Return selected sample bottle back to shelf
          if (selectedSampleIdx >= 0) {
            const sb = sampleBottleGroups[selectedSampleIdx];
            gsap.to(sb.position, {
              x: sb.userData.initX,
              y: sb.userData.initY,
              z: sb.userData.initZ,
              duration: 1.0,
              ease: 'power2.inOut'
            });
          }

          // Return dropper home
          dropper.returnHome(() => {
            dropperAnimationActive = false;
            waterPoured = true;
            updateKeyboardGuideText();
            if (onComplete) onComplete();
          });
          return;
        }
        dropper.drop('#88ccff', () => {
          drops++;
          fireNext();
        });
      };
      setTimeout(fireNext, 200);
    }
  });
}

function runTakeReagentAnimation(onComplete) {
  if (dropperAnimationActive || !selectedReagentId) return;
  dropperAnimationActive = true;

  const reagentPos = reagentBottleMeshes[selectedReagentId].position;

  // Move dropper to selected reagent bottle on table
  gsap.timeline()
    .to(dropper.group.position, { x: reagentPos.x, y: reagentPos.y + 0.45, z: reagentPos.z, duration: 0.8, ease: 'power2.inOut' })
    .to(dropper._body.scale, { y: 0.88, duration: 0.15, yoyo: true, repeat: 1 })
    .add(() => {
      // Fill dropper inner liquid with reagent colour
      const rData = reagentBottleData.find(r => r.key === selectedReagentId);
      dropper._innerMat.color.setHex(rData.colour);
      dropper._innerMesh.scale.y = 0.01;
      dropper._innerMesh.visible = true;
      gsap.to(dropper._innerMesh.scale, { y: 1.0, duration: 0.4 });
    })
    .to(dropper.group.position, { x: reagentPos.x, y: reagentPos.y + 1.0, z: reagentPos.z, duration: 0.5, ease: 'power2.out' })
    .add(() => {
      dropperAnimationActive = false;
      reagentTaken = true;
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    });
}

function runPourReagentAnimation(onComplete) {
  if (dropperAnimationActive || !selectedReagentId) return;
  dropperAnimationActive = true;

  const tubePos = activeTube.group.position;
  const rData = reagentBottleData.find(r => r.key === selectedReagentId);

  // Move dropper to active tube
  gsap.to(dropper.group.position, {
    x: tubePos.x, y: tubePos.y + 1.0, z: tubePos.z,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      // Squeeze bulb animation
      gsap.to(dropper._body.scale, { y: 0.92, duration: 0.1, yoyo: true, repeat: 7 });

      let drops = 0;
      const fireNext = () => {
        if (drops >= 4) {
          // Empty dropper inner liquid
          gsap.to(dropper._innerMesh.scale, {
            y: 0.01, duration: 0.3, onComplete: () => {
              dropper._innerMesh.visible = false;
            }
          });

          // Return selected reagent bottle back to shelf
          if (selectedReagentId) {
            const rb = reagentBottleMeshes[selectedReagentId];
            gsap.to(rb.position, {
              x: rb.userData.initX,
              y: rb.userData.initY,
              z: rb.userData.initZ,
              duration: 1.0,
              ease: 'power2.inOut'
            });
          }

          // Return dropper home
          dropper.returnHome(() => {
            dropperAnimationActive = false;
            reagentPoured = true;
            updateKeyboardGuideText();
            if (onComplete) onComplete();
          });
          return;
        }
        dropper.drop(rData.colour, () => {
          drops++;
          fireNext();
        });
      };
      setTimeout(fireNext, 200);
    }
  });
}

function resetScene1() {
  selectedSampleIdx = -1;
  selectedReagentId = null;
  waterTaken = false;
  waterPoured = false;
  reagentTaken = false;
  reagentPoured = false;
  reactionCountdownActive = false;

  // Return sample bottles to shelf
  sampleBottleGroups.forEach((g, i) => {
    gsap.to(g.position, {
      x: g.userData.initX,
      y: g.userData.initY,
      z: g.userData.initZ,
      duration: 1.0,
      ease: 'power2.inOut'
    });
  });

  // Return reagent bottles to shelf
  Object.keys(reagentBottleMeshes).forEach(key => {
    const g = reagentBottleMeshes[key];
    gsap.to(g.position, {
      x: g.userData.initX,
      y: g.userData.initY,
      z: g.userData.initZ,
      duration: 1.0,
      ease: 'power2.inOut'
    });
  });

  // Reset dropper
  dropper._innerMesh.visible = false;
  dropper._innerMesh.scale.y = 0.01;
  dropper.group.position.set(dropper.homePos.x, dropper.homePos.y, dropper.homePos.z);

  // Restore camera
  resetCamera();
  setLabelsOpacity(1);
  updateKeyboardGuideText();
}

// ── INTERACTIVE RAYCASTING ──────────────────────────────────────────────────
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
      
      const rKey = Object.keys(reagentBottleMeshes).find(k => reagentBottleMeshes[k] === obj);
      if (rKey) return { type: 'reagent', key: rKey, group: obj };
      
      if (obj === beaker.group) return { type: 'beaker', group: obj };
      if (activeTube && obj === activeTube.group) return { type: 'tube', group: obj };
      if (obj === dropper.group) return { type: 'dropper', group: obj };
      if (obj === sheet) return { type: 'sheet', group: obj };
      
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
    const state = typeof currentState !== 'undefined' ? currentState : 'IDLE';
    if (intersected.type === 'sinkKnob') isInteractive = true;
    if (intersected.type === 'sample' && state === 'IDLE') isInteractive = true;
    if (intersected.type === 'beaker' && state === 'SALT_SELECTED' && !waterTaken) isInteractive = true;
    if ((intersected.type === 'tube' || intersected.type === 'dropper') && state === 'SALT_SELECTED' && waterTaken && !waterPoured) isInteractive = true;
    if (intersected.type === 'reagent' && state === 'WATER_ADDED') isInteractive = true;
    if (intersected.type === 'reagent' && state === 'REAGENT_CHOSEN' && intersected.key === selectedReagentId && !reagentTaken) isInteractive = true;
    if ((intersected.type === 'tube' || intersected.type === 'dropper') && state === 'REAGENT_CHOSEN' && reagentTaken && !reagentPoured) isInteractive = true;
    if ((intersected.type === 'sheet' || intersected.type === 'tube') && state === 'POURED' && !reactionCountdownActive) isInteractive = true;
    if (intersected.type === 'sheet' && state === 'COLOUR_SUBMITTED') isInteractive = true;
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

  const state = typeof currentState !== 'undefined' ? currentState : 'IDLE';

  if (intersected.type === 'sample' && state === 'IDLE') {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    
    const saltId = sampleData[intersected.index].id;
    if (saltId === 'random') {
      selectSalt(SaltDatabase.randomSaltId());
    } else {
      selectSalt(saltId);
    }
  } else if (intersected.type === 'beaker' && state === 'SALT_SELECTED' && !waterTaken) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    takeWater();
  } else if ((intersected.type === 'tube' || intersected.type === 'dropper') && state === 'SALT_SELECTED' && waterTaken && !waterPoured) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    pourWater();
  } else if (intersected.type === 'reagent' && state === 'WATER_ADDED') {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    selectReagent(intersected.key);
  } else if (intersected.type === 'reagent' && state === 'REAGENT_CHOSEN' && intersected.key === selectedReagentId && !reagentTaken) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    takeReagent();
  } else if ((intersected.type === 'tube' || intersected.type === 'dropper') && state === 'REAGENT_CHOSEN' && reagentTaken && !reagentPoured) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    pourReagent();
  } else if ((intersected.type === 'sheet' || intersected.type === 'tube') && state === 'POURED' && !reactionCountdownActive) {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    QuizPanel.showColourSubmit();
  } else if (intersected.type === 'sheet' && state === 'COLOUR_SUBMITTED') {
    highlightGroup(hoveredObject, false);
    hoveredObject = null;
    document.body.style.cursor = 'default';
    QuizPanel.show(handleIdentification);
  }
});

// ── KEYBOARD CONTROLS LISTENERS ───────────────────────────────────────────
window.addEventListener('keydown', (event) => {
  const key = event.key.toUpperCase();
  const state = typeof currentState !== 'undefined' ? currentState : 'IDLE';

  if (state === 'IDLE') {
    if (key >= '1' && key <= '5') {
      const idx = parseInt(key) - 1;
      selectSalt(sampleData[idx].id);
    } else if (key === '6') {
      selectSalt(SaltDatabase.randomSaltId());
    }
  } else if (state === 'SALT_SELECTED') {
    if (key === 'W' && !waterTaken) {
      takeWater();
    } else if (key === 'P' && waterTaken && !waterPoured) {
      pourWater();
    }
  } else if (state === 'WATER_ADDED') {
    if (key >= '1' && key <= '4') {
      const idx = parseInt(key) - 1;
      const reagentKeys = ['NaOH', 'NH3', 'HCl', 'H2SO4'];
      selectReagent(reagentKeys[idx]);
    }
  } else if (state === 'REAGENT_CHOSEN') {
    if (key === 'T' && !reagentTaken) {
      takeReagent();
    } else if (key === 'P' && reagentTaken && !reagentPoured) {
      pourReagent();
    }
  } else if (state === 'POURED') {
    if (key === 'O' && !reactionCountdownActive) {
      QuizPanel.showColourSubmit();
    }
  } else if (state === 'COLOUR_SUBMITTED') {
    if (key === 'I') {
      QuizPanel.show(handleIdentification);
    }
  }

  // Global reset key
  if (key === 'R') {
    resetExperiment();
  }
});

// ── KEYBOARD GUIDE PANEL ────────────────────────────────────────────────────
function updateKeyboardGuideText() {
  const guideEl = document.getElementById('keyboard-guide-text');
  if (!guideEl) return;

  const state = typeof currentState !== 'undefined' ? currentState : 'IDLE';

  let html = "";
  if (state === 'IDLE') {
    html = "Step 1: Press <span class='key-btn'>1</span>-<span class='key-btn'>5</span> or click a sample bottle on the top shelf (or <span class='key-btn'>6</span> for random)";
  } else if (state === 'SALT_SELECTED') {
    if (!waterTaken) {
      html = "Step 2: Press <span class='key-btn'>W</span> or click the Beaker to load water in the dropper";
    } else {
      html = "Step 2: Press <span class='key-btn'>P</span> or click the active Test Tube to pour water";
    }
  } else if (state === 'WATER_ADDED') {
    html = "Step 3: Press <span class='key-btn'>1</span>-<span class='key-btn'>4</span> or click a Reagent bottle on the middle shelf (NaOH, NH₃, HCl, H₂SO₄)";
  } else if (state === 'REAGENT_CHOSEN') {
    if (!reagentTaken) {
      html = "Step 3: Press <span class='key-btn'>T</span> or click the reagent bottle on the table to load dropper";
    } else {
      html = "Step 3: Press <span class='key-btn'>P</span> or click the active Test Tube to pour reagent";
    }
  } else if (state === 'POURED') {
    if (reactionCountdownActive) {
      html = "Observing reaction... Please wait";
    } else {
      html = "Step 4: Observe reaction. Press <span class='key-btn'>O</span> or click the Observation Sheet to open the Colour Observation Panel";
    }
  } else if (state === 'COLOUR_SUBMITTED') {
    html = "Step 5: Press <span class='key-btn'>I</span> or click the Observation Sheet to open the Identification Panel";
  } else if (state === 'IDENTIFYING') {
    html = "Step 5: Select the identified metal ion on the panel";
  } else if (state === 'DONE') {
    html = "Experiment Complete. Press <span class='key-btn'>R</span> or click New Experiment to reset";
  }

  guideEl.innerHTML = html;
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
  if (_countdownEl) { _countdownEl.remove(); _countdownEl = null; }
  setLabelsOpacity(0);

  const overlay = document.createElement('div');
  overlay.id = 'reaction-countdown';
  overlay.style.cssText = `
    position: fixed; bottom: 154px; left: 50%; transform: translateX(-50%);
    background: rgba(14, 22, 40, 0.9);
    border: 2px solid #63b3ed;
    border-radius: 12px;
    padding: 12px 24px;
    color: #e2f4ff;
    font-size: 1.0rem;
    font-family: monospace;
    z-index: 200;
    text-align: center;
    pointer-events: none;
    backdrop-filter: blur(4px);
    box-shadow: 0 0 20px rgba(99,179,237,0.3);
  `;
  document.body.appendChild(overlay);
  _countdownEl = overlay;

  let remaining = seconds;
  function tick() {
    if (!_countdownEl) return;
    overlay.innerHTML = `Observe the reaction... <b style="color:#63b3ed;font-size:1.2em">${remaining}s</b><br>
      <span style="font-size:0.8rem;color:#90cdf4">Watch for solution colour changes and precipitates</span>`;
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

setTimeout(updateKeyboardGuideText, 500);
