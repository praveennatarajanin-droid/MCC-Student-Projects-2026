/**
 * FlameScene.js — Realistic Bunsen Flame Test Lab
 *
 * FLAME SYSTEM — 4-layer approach:
 *  1. PARTICLE STREAM  — 200 sprites rising from nozzle
 *  2. INNER CONE MESH  — solid blue-white emissive cone
 *  3. OUTER GLOW SPRITE — large additive billboard for bloom
 *  4. DYNAMIC POINT LIGHTS — 3 flicker lights
 */

// ── Label helper: creates canvas texture sprite ───────────────────────────
function ftMakeLabel(text, width, height, fontSize) {
  width = width || 180;
  height = height || 40;
  fontSize = fontSize || 20;
  var bgColor = 'rgba(10,20,40,0.65)';
  var textColor = '#e2f4ff';
  var borderColor = '#63b3ed';
  
  var cv  = document.createElement('canvas');
  cv.width  = width; cv.height = height;
  var ctx = cv.getContext('2d');
  var r = height / 2;
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
  ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  var tex = new THREE.CanvasTexture(cv);
  var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  var sprite = new THREE.Sprite(mat);
  sprite.scale.set((width / height) * 0.18, 0.18, 1);
  return sprite;
}

// ── Renderer ──────────────────────────────────────────────────────────────
var ftCanvas   = document.getElementById('ft-canvas');
var ftRenderer = new THREE.WebGLRenderer({ canvas: ftCanvas, antialias: true, alpha: false });
ftRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
ftRenderer.setSize(window.innerWidth, window.innerHeight);
ftRenderer.shadowMap.enabled = true;
ftRenderer.shadowMap.type    = THREE.PCFSoftShadowMap;
if (ftRenderer.outputColorSpace !== undefined) {
  ftRenderer.outputColorSpace = THREE.SRGBColorSpace;
} else {
  ftRenderer.outputEncoding = THREE.sRGBEncoding;
}
ftRenderer.toneMapping         = THREE.ACESFilmicToneMapping;
ftRenderer.toneMappingExposure = 1.15;

// ── Scene ─────────────────────────────────────────────────────────────────
var ftScene = new THREE.Scene();
ftScene.background = new THREE.Color(0x4a5260);
ftScene.fog        = new THREE.FogExp2(0x3a4250, 0.038);

// PMREM Environment Map Setup
function ftCreateCanvasTexture(color, size) {
  size = size || 128;
  var cv = document.createElement('canvas');
  cv.width = cv.height = size;
  var ctx = cv.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(size, size);
  ctx.moveTo(size, 0); ctx.lineTo(0, size);
  ctx.stroke();
  return new THREE.CanvasTexture(cv);
}

function ftApplyTextureSettings(texture, repeatX, repeatY) {
  repeatX = repeatX || 1;
  repeatY = repeatY || 1;
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

function ftCreateEnvironmentMap(renderer) {
  var pmremGenerator = new THREE.PMREMGenerator(renderer);
  var colors = ['#dce6ff', '#b8c6e6', '#f0f4ff', '#d9e2ff', '#e8ecff', '#b5c0dd'];
  var faces = colors.map(function(color) { return ftCreateCanvasTexture(color, 256); });
  var cubeTexture = new THREE.CubeTexture(faces);
  cubeTexture.needsUpdate = true;
  return pmremGenerator.fromCubemap(cubeTexture).texture;
}

var ftEnvironmentMap = ftCreateEnvironmentMap(ftRenderer);
ftScene.environment = ftEnvironmentMap;

// ── Camera ────────────────────────────────────────────────────────────────
var ftCamera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 60);
window.ftCamera = ftCamera;
ftCamera.position.set(0, 2.6, 6.2);
ftCamera.lookAt(0, 0.9, 0);

// ── Lighting ──────────────────────────────────────────────────────────────
setupLighting(ftScene);

// Three dynamic flame lights (preserved for flame test)
var flameLightBase = new THREE.PointLight(0x4488ff, 0, 1.5);  // blue — inner cone
flameLightBase.position.set(0, 0.75, 0.5);
ftScene.add(flameLightBase);

var flameLightMid = new THREE.PointLight(0xff7700, 0, 3.5);   // orange — mid flame
flameLightMid.position.set(0, 1.05, 0.5);
ftScene.add(flameLightMid);

var flameLight = new THREE.PointLight(0xff7700, 0, 5.0);       // characteristic — tip
flameLight.position.set(0, 1.35, 0.5);
ftScene.add(flameLight);

// ── Orbit Controls ────────────────────────────────────────────────────────
var ftControls = new OrbitControls(ftCamera, ftCanvas);
ftCamera.position.set(0, 2.6, 6.2);
ftCamera.lookAt(0, 0.9, 0);

// ═══════════════════════════════════════════════════════════════════════════
// LAB ENVIRONMENT
// ═══════════════════════════════════════════════════════════════════════════

// Floor (tiled)
var ftFloorMat = new THREE.MeshStandardMaterial({
  map: createLabFloorTex(64),
  roughness: 0.38,
  metalness: 0.08
});
var ftFloor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), ftFloorMat);
ftFloor.rotation.x = -Math.PI / 2;
ftFloor.position.y = -3.25;
ftFloor.receiveShadow = true;
ftScene.add(ftFloor);

// Wall
var ftWallMat = new THREE.MeshStandardMaterial({
  map: createLabWallTex(),
  roughness: 0.85
});

// Back Wall
var ftWall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), ftWallMat);
ftWall.position.set(0, 10 - 3.25, -10);
ftWall.receiveShadow = true;
ftScene.add(ftWall);

// Left Wall
var leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), ftWallMat);
leftWall.position.set(-20, 10 - 3.25, 0);
leftWall.rotation.y = Math.PI / 2;
ftScene.add(leftWall);

// Right Wall
var rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), ftWallMat);
rightWall.position.set(20, 10 - 3.25, 0);
rightWall.rotation.y = -Math.PI / 2;
ftScene.add(rightWall);

// Ceiling
var ceiling = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), ftFloorMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.set(0, 12 - 3.25, 0);
ftScene.add(ceiling);

// Main Table
var woodMat = new THREE.MeshStandardMaterial({
  map: createSharedBenchWoodTex(),
  color: 0x5a3010,
  roughness: 0.80,
  metalness: 0.02
});
var tableGeo = new THREE.BoxGeometry(18, 0.5, 5);
var ftBench = new THREE.Mesh(tableGeo, woodMat);
ftBench.position.set(0, -0.25, 0.2);
ftBench.receiveShadow = true;
ftBench.castShadow    = true;
ftScene.add(ftBench);

// Black border
var blackMat = new THREE.MeshStandardMaterial({
  color: 0x1f1f1f
});
var borderGeo = new THREE.BoxGeometry(18.2, 0.2, 5.2);
var border = new THREE.Mesh(borderGeo, blackMat);
border.position.set(0, -0.5, 0.2);
ftScene.add(border);

// Cabinets
var greyMat = new THREE.MeshStandardMaterial({
  color: 0xbcbcbc,
  roughness: 0.4
});
function createCabinet(x, z) {
  var geo = new THREE.BoxGeometry(2.5, 3, 2.2);
  var cabinet = new THREE.Mesh(geo, greyMat);
  cabinet.position.set(x, 1.3 - 3.25, z); // Shifted
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  ftScene.add(cabinet);
}
createCabinet(-7, 0.2);
createCabinet(-4.3, 0.2);
createCabinet(4.3, 0.2);
createCabinet(7, 0.2);

// Drawers
function createDrawer(y) {
  var geo = new THREE.BoxGeometry(2.5, 0.8, 2.2);
  var drawer = new THREE.Mesh(geo, woodMat);
  drawer.position.set(0, y - 3.25, 0.2); // Shifted
  drawer.castShadow = true;
  drawer.receiveShadow = true;
  ftScene.add(drawer);
}
createDrawer(2.1);
createDrawer(1.1);
createDrawer(0.1);


// ═══════════════════════════════════════════════════════════════════════════
// BUNSEN BURNER
// ═══════════════════════════════════════════════════════════════════════════
var bunsen = new THREE.Group();

var bunsenBase = new THREE.Mesh(
  new THREE.CylinderGeometry(0.18, 0.22, 0.06, 32),
  new THREE.MeshStandardMaterial({ color: 0x282828, roughness: 0.48, metalness: 0.78 })
);
bunsenBase.position.set(0, 0.03, 0);
bunsen.add(bunsenBase);

var barrelMat = new THREE.MeshStandardMaterial({ color: 0x383838, roughness: 0.36, metalness: 0.88 });
var barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.088, 0.58, 24), barrelMat);
barrel.position.y = 0.35;
bunsen.add(barrel);

var collar = new THREE.Mesh(
  new THREE.CylinderGeometry(0.092, 0.092, 0.055, 24),
  new THREE.MeshStandardMaterial({ color: 0x484848, roughness: 0.5, metalness: 0.72 })
);
collar.position.y = 0.13;
bunsen.add(collar);

var nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.065, 0.075, 20), barrelMat);
nozzle.position.y = 0.655;
bunsen.add(nozzle);

var tipRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.022, 0.005, 8, 20),
  new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.18, metalness: 1.0 })
);
tipRing.position.y = 0.695;
bunsen.add(tipRing);

var hose = new THREE.Mesh(
  new THREE.CylinderGeometry(0.022, 0.022, 0.55, 12),
  new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.95 })
);
hose.rotation.z = Math.PI / 2.4;
hose.position.set(-0.24, 0.04, 0);
bunsen.add(hose);

bunsen.position.set(0, 0, 0.5);
ftScene.add(bunsen);

// Nozzle Y/Z
var NOZZLE_Y = 0.695;
var NOZZLE_Z = 0.5;

// ═══════════════════════════════════════════════════════════════════════════
// FLAME PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
function makeFlameSpriteTex() {
  var size = 128;
  var cv   = document.createElement('canvas');
  cv.width = cv.height = size;
  var ctx  = cv.getContext('2d');
  var grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0.0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
  grad.addColorStop(0.7, 'rgba(255,200,100,0.3)');
  grad.addColorStop(1.0, 'rgba(255,100,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  var tex = new THREE.CanvasTexture(cv);
  return tex;
}

var _spriteTex = makeFlameSpriteTex();
var FP_COUNT = 220;

var fp_pos    = new Float32Array(FP_COUNT * 3);
var fp_col    = new Float32Array(FP_COUNT * 3);
var fp_size   = new Float32Array(FP_COUNT);
var fp_alpha  = new Float32Array(FP_COUNT);

var fp_life   = new Float32Array(FP_COUNT);
var fp_maxL   = new Float32Array(FP_COUNT);
var fp_vx     = new Float32Array(FP_COUNT);
var fp_vy     = new Float32Array(FP_COUNT);
var fp_vz     = new Float32Array(FP_COUNT);
var fp_seed   = new Float32Array(FP_COUNT);

var _fpColBase = new THREE.Color(0x4488ff);
var _fpColMid  = new THREE.Color(0xff7700);
var _fpColTip  = new THREE.Color(0xff7700);

function _fpReset(i) {
  var angle = Math.random() * Math.PI * 2;
  var r     = Math.random() * 0.018;
  fp_pos[i*3]   = Math.cos(angle) * r;
  fp_pos[i*3+1] = 0;
  fp_pos[i*3+2] = Math.sin(angle) * r;
  fp_vx[i]  = (Math.random() - 0.5) * 0.012;
  fp_vy[i]  = 0.18 + Math.random() * 0.22;
  fp_vz[i]  = (Math.random() - 0.5) * 0.012;
  fp_life[i] = Math.random();
  fp_maxL[i] = 0.55 + Math.random() * 0.45;
  fp_seed[i] = Math.random() * 100;
  fp_size[i] = 0.0;
  fp_alpha[i] = 0.0;
}

for (var _pi = 0; _pi < FP_COUNT; _pi++) { _fpReset(_pi); }

var fpGeo = new THREE.BufferGeometry();
fpGeo.setAttribute('position', new THREE.BufferAttribute(fp_pos, 3).setUsage(THREE.DynamicDrawUsage));
fpGeo.setAttribute('color',    new THREE.BufferAttribute(fp_col, 3).setUsage(THREE.DynamicDrawUsage));
fpGeo.setAttribute('size',     new THREE.BufferAttribute(fp_size, 1).setUsage(THREE.DynamicDrawUsage));

var fpMatSimple = new THREE.PointsMaterial({
  size:            0.12,
  map:             _spriteTex,
  vertexColors:    true,
  transparent:     true,
  opacity:         0.0,
  depthWrite:      false,
  blending:        THREE.AdditiveBlending,
  sizeAttenuation: true
});

var fpPoints = new THREE.Points(fpGeo, fpMatSimple);
fpPoints.position.set(0, NOZZLE_Y, NOZZLE_Z);
ftScene.add(fpPoints);

// ── Inner cone ────────────────────────────────────────────────────────────
var innerConeGeo = new THREE.ConeGeometry(0.022, 0.22, 16, 8, true);
var _icOrigPos = innerConeGeo.attributes.position.array.slice();

var innerConeMat = new THREE.MeshStandardMaterial({
  color:             0x99ccff,
  emissive:          0x6699ff,
  emissiveIntensity: 3.5,
  transparent:       true,
  opacity:           0.0,
  side:              THREE.DoubleSide,
  depthWrite:        false,
  blending:          THREE.AdditiveBlending
});
var innerConeMesh = new THREE.Mesh(innerConeGeo, innerConeMat);
innerConeMesh.rotation.x = Math.PI;
innerConeMesh.position.set(0, NOZZLE_Y + 0.11, NOZZLE_Z);
ftScene.add(innerConeMesh);

// ── Glow sprite ───────────────────────────────────────────────────────────
function makeGlowTex() {
  var s = 256, cv = document.createElement('canvas');
  cv.width = cv.height = s;
  var ctx = cv.getContext('2d');
  var g = ctx.createRadialGradient(s/2,s/2,0, s/2,s/2,s/2);
  g.addColorStop(0.0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.25,'rgba(255,200,80,0.6)');
  g.addColorStop(0.6, 'rgba(255,100,0,0.2)');
  g.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,s,s);
  return new THREE.CanvasTexture(cv);
}

var glowSpriteMat = new THREE.SpriteMaterial({
  map:         makeGlowTex(),
  color:       0xff7700,
  transparent: true,
  opacity:     0.0,
  blending:    THREE.AdditiveBlending,
  depthWrite:  false
});
var glowSprite = new THREE.Sprite(glowSpriteMat);
glowSprite.scale.set(0.55, 0.75, 1.0);
glowSprite.position.set(0, NOZZLE_Y + 0.28, NOZZLE_Z);
ftScene.add(glowSprite);

// Flame state variables
var flameActive  = false;
var _wireInFlame = false;
var _charColour  = new THREE.Color(0xff7700);
var _dt          = 0;
var _lastTime    = 0;

function igniteFlame(hexColour) {
  flameActive  = true;
  _wireInFlame = false;
  _charColour.set(hexColour || '#ff7700');
  _fpColTip.set(0xff7700);

  gsap.killTweensOf(fpMatSimple);
  gsap.killTweensOf(innerConeMat);
  gsap.killTweensOf(glowSpriteMat);
  gsap.killTweensOf(flameLightBase);
  gsap.killTweensOf(flameLightMid);
  gsap.killTweensOf(flameLight);

  gsap.to(fpMatSimple,   { opacity: 0.92, duration: 0.5 });
  gsap.to(innerConeMat,  { opacity: 0.80, duration: 0.4 });
  gsap.to(glowSpriteMat, { opacity: 0.35, duration: 0.6 });
  gsap.to(flameLightBase,{ intensity: 1.2, duration: 0.4 });
  gsap.to(flameLightMid, { intensity: 2.8, duration: 0.5 });
  gsap.to(flameLight,    { intensity: 1.5, duration: 0.6 });
}

function extinguishFlame(onComplete) {
  gsap.killTweensOf(fpMatSimple);
  gsap.killTweensOf(innerConeMat);
  gsap.killTweensOf(glowSpriteMat);
  gsap.killTweensOf(flameLightBase);
  gsap.killTweensOf(flameLightMid);
  gsap.killTweensOf(flameLight);

  gsap.to(fpMatSimple,   { opacity: 0, duration: 0.7 });
  gsap.to(innerConeMat,  { opacity: 0, duration: 0.5 });
  gsap.to(glowSpriteMat, { opacity: 0, duration: 0.8, onComplete: onComplete || null });
  gsap.to(flameLightBase,{ intensity: 0, duration: 0.6 });
  gsap.to(flameLightMid, { intensity: 0, duration: 0.7 });
  gsap.to(flameLight,    { intensity: 0, duration: 0.8 });

  flameActive  = false;
  _wireInFlame = false;
}

function setFlameColour(hexColour, duration) {
  duration = duration || 2.0;
  _wireInFlame = true;
  _charColour.set(hexColour);
  _fpColTip.set(hexColour);

  var gc = new THREE.Color(hexColour);
  gsap.to(glowSpriteMat.color, { r: gc.r, g: gc.g, b: gc.b, duration: duration,
    onUpdate: function() { glowSpriteMat.needsUpdate = true; } });
  gsap.to(glowSpriteMat, { opacity: 0.65, duration: duration * 0.5 });

  gsap.to(flameLight.color, { r: gc.r, g: gc.g, b: gc.b, duration: duration });
  gsap.to(flameLight, { intensity: 3.5, duration: duration * 0.5 });
}

function flameMatsReady() { return typeof fpMatSimple !== 'undefined'; }

// ── MULTI-TIER WOODEN SHELF CABINET ──────────────────────────────────────────
var shelfWoodTex = (function() {
  var W = 512, H = 256;
  var cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  var ctx = cv.getContext('2d');
  ctx.fillStyle = '#2a120a';
  ctx.fillRect(0, 0, W, H);
  for (var i = 0; i < 120; i++) {
    var x = Math.random() * W;
    var lw = 0.5 + Math.random() * 3.5;
    var lt = Math.random() > 0.5 ? 1 : -1;
    var al = 0.04 + Math.random() * 0.10;
    var col = lt > 0 ? 'rgba(200,140,80,' + al + ')' : 'rgba(30,10,0,' + al + ')';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (var y = 0; y <= H; y += 20) {
      ctx.lineTo(x + Math.sin(y * 0.05 + i) * 4, y);
    }
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  for (var j = 0; j < 10; j++) {
    var cx = Math.random() * W;
    var cy = H * 0.5 + (Math.random() - 0.5) * H * 0.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 80 + Math.random() * 160, 18 + Math.random() * 22, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(30,10,0,' + (0.04 + Math.random() * 0.06) + ')';
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.stroke();
  }
  var tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
})();

var ftShelfMat = new THREE.MeshStandardMaterial({ map: shelfWoodTex, color: 0x5a4020, roughness: 0.8, metalness: 0.1 });
var ftShelfGroup = new THREE.Group();
ftScene.add(ftShelfGroup);

// Backboard
var backboard = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.0, 0.04), ftShelfMat);
backboard.position.set(0, 2.0, -1.52);
backboard.receiveShadow = true;
ftShelfGroup.add(backboard);

// Left side panel
var leftSide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.4), ftShelfMat);
leftSide.position.set(-1.87, 2.0, -1.32);
leftSide.castShadow = leftSide.receiveShadow = true;
ftShelfGroup.add(leftSide);

// Right side panel
var rightSide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.4), ftShelfMat);
rightSide.position.set(1.87, 2.0, -1.32);
rightSide.castShadow = rightSide.receiveShadow = true;
ftShelfGroup.add(rightSide);

// Top panel
var topPanel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.4), ftShelfMat);
topPanel.position.set(0, 3.47, -1.32);
topPanel.castShadow = topPanel.receiveShadow = true;
ftShelfGroup.add(topPanel);

// Bottom panel
var bottomPanel = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.4), ftShelfMat);
bottomPanel.position.set(0, 0.53, -1.32);
bottomPanel.castShadow = bottomPanel.receiveShadow = true;
ftShelfGroup.add(bottomPanel);

// Shelf 1 (Middle Lower / Reagents)
var shelf1 = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.04, 0.38), ftShelfMat);
shelf1.position.set(0, 1.5, -1.32);
shelf1.castShadow = shelf1.receiveShadow = true;
ftShelfGroup.add(shelf1);

// Shelf 2 (Middle Upper / Samples)
var shelf2 = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.04, 0.38), ftShelfMat);
shelf2.position.set(0, 2.5, -1.32);
shelf2.castShadow = shelf2.receiveShadow = true;
ftShelfGroup.add(shelf2);

// ── 1. HCl Dropper Bottle (Middle Shelf) ─────────────────────────────────────
var hclGroup = new THREE.Group();
var hclBodyMat = new THREE.MeshPhysicalMaterial({
  color: 0xfffce0, transparent: true, opacity: 0.55, roughness: 0.08, transmission: 0.62
});
hclGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.38, 18), hclBodyMat));
var hclCap = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16),
  new THREE.MeshStandardMaterial({ color: 0xaaaa22, roughness: 0.5 })
);
hclCap.position.y = 0.22;
hclGroup.add(hclCap);
hclGroup.position.set(-1.2, 1.69, -1.35);
hclGroup.userData = { initX: -1.2, initY: 1.69, initZ: -1.35, type: 'hcl' };
ftScene.add(hclGroup);

// ── 2. Evaporating Dish (Bottom Shelf) ───────────────────────────────────────
var dishMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, transparent: true, opacity: 0.32,
  roughness: 0.04, transmission: 0.82, side: THREE.DoubleSide
});
var dish = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.04, 28, 1, true), dishMat);
dish.position.set(-0.6, 0.55, -1.35);
dish.userData = { initX: -0.6, initY: 0.55, initZ: -1.35, type: 'dish' };
ftScene.add(dish);

var dishBottom = new THREE.Mesh(new THREE.CircleGeometry(0.08, 28), dishMat);
dishBottom.rotation.x = -Math.PI / 2;
dishBottom.position.set(-0.6, 0.53, -1.35);
ftScene.add(dishBottom);

var dishPasteMat = new THREE.MeshStandardMaterial({
  color: 0xd8d4c0, transparent: true, opacity: 0.0, roughness: 0.9
});
var dishPaste = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.014, 24), dishPasteMat);
dishPaste.position.set(-0.6, 0.544, -1.35);
ftScene.add(dishPaste);

// ── 3. Wire Loop (Bottom Shelf) ──────────────────────────────────────────────
var wireLoop = new THREE.Group();
var handleMat = new THREE.MeshPhysicalMaterial({
  color: 0xc8e8ff, transparent: true, opacity: 0.45, roughness: 0.04, transmission: 0.75
});
var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.72, 14), handleMat);
wireLoop.add(handle);

var wireMat  = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.25, metalness: 0.95 });
var wireStem = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.16, 8), wireMat);
wireStem.position.y = 0.44;
wireLoop.add(wireStem);

var loop = new THREE.Mesh(new THREE.TorusGeometry(0.020, 0.003, 8, 24), wireMat);
loop.position.y = 0.525;
loop.rotation.x = Math.PI / 2;
wireLoop.add(loop);

var pasteMat = new THREE.MeshStandardMaterial({
  color: 0xd8d4c0, transparent: true, opacity: 0.0, roughness: 0.88
});
var pasteMesh = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), pasteMat);
pasteMesh.position.y = 0.525;
wireLoop.add(pasteMesh);

wireLoop.position.set(0.5, 0.55, -1.35);
wireLoop.rotation.set(Math.PI / 2, 0, Math.PI / 4);
wireLoop.userData = { initX: 0.5, initY: 0.55, initZ: -1.35, type: 'wire' };
ftScene.add(wireLoop);

// ── 4. Cobalt Blue Glass (Bottom Shelf) ──────────────────────────────────────
var cobaltGlass = new THREE.Mesh(
  new THREE.BoxGeometry(0.18, 0.12, 0.01),
  new THREE.MeshPhysicalMaterial({ color: 0x0033cc, transparent: true, opacity: 0.55, roughness: 0.04, transmission: 0.72 })
);
cobaltGlass.position.set(1.6, 0.54, -1.35);
cobaltGlass.userData = { initX: 1.6, initY: 0.54, initZ: -1.35, type: 'cobalt' };
ftScene.add(cobaltGlass);

// ── 5. Unknown Sample Bottles (Top Shelf) ────────────────────────────────────
var ftSampleBottleGroups = [];
var ftSampleLabels = [];
var ftSampleData = [
  { id: 'borate',    label: 'A' },
  { id: 'copper',    label: 'B' },
  { id: 'strontium', label: 'C' },
  { id: 'calcium',   label: 'D' },
  { id: 'sodium',    label: 'E' },
  { id: 'potassium', label: 'F' },
  { id: 'random',    label: '?' }
];

ftSampleData.forEach(function(d, idx) {
  var g = new THREE.Group();
  g.add(new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.28, 16),
    new THREE.MeshPhysicalMaterial({ color: 0xf0f0f0, transparent: true, opacity: 0.42, roughness: 0.1, transmission: 0.52 })
  ));
  var cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 })
  );
  cap.position.y = 0.165;
  g.add(cap);

  var initX = -1.5 + idx * 0.5;
  g.position.set(initX, 2.64, -1.35);
  g.userData = { initX: initX, initY: 2.64, initZ: -1.35, id: d.id, type: 'sample' };
  ftScene.add(g);
  ftSampleBottleGroups.push(g);

  var lbl = ftMakeLabel(d.label === '?' ? '?' : 'Substance ' + d.label, 140, 34, 16);
  lbl.position.set(0, 0.32, 0.1);
  g.add(lbl);
  ftSampleLabels.push(lbl);
});

// ── 6. Observation Sheet (Bench Left) ────────────────────────────────────────
var ftSheet = new THREE.Mesh(
  new THREE.PlaneGeometry(1.4, 0.9),
  new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.95 })
);
ftSheet.rotation.x = -Math.PI / 2;
ftSheet.position.set(-3.2, 0.01, 0.6);
ftSheet.userData = { type: 'sheet' };
ftScene.add(ftSheet);

// Stirring Glass Rod (initially invisible)
var glassRod = new THREE.Mesh(
  new THREE.CylinderGeometry(0.008, 0.008, 0.5, 8),
  new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, roughness: 0.05, transmission: 0.9 })
);
glassRod.rotation.x = Math.PI / 6;
glassRod.position.set(-0.4, 0.5, 0.5);
ftScene.add(glassRod);

// Apparatus labels
var lblBunsen = ftMakeLabel('Bunsen Burner', 150, 34, 17);
lblBunsen.position.set(0, 0.80, 0.6);
ftScene.add(lblBunsen);

var lblWireLoop = ftMakeLabel('Wire Loop', 120, 34, 17);
lblWireLoop.position.set(0.5, 0.82, -1.1);
ftScene.add(lblWireLoop);

var lblDish = ftMakeLabel('Evaporating Dish', 175, 34, 17);
lblDish.position.set(-0.6, 0.82, -1.1);
ftScene.add(lblDish);

var lblHcl = ftMakeLabel('Conc. HCl', 110, 34, 17);
lblHcl.position.set(-1.2, 2.14, -1.1);
ftScene.add(lblHcl);

var lblCobalt = ftMakeLabel('Cobalt Blue Glass', 175, 34, 17);
lblCobalt.position.set(1.6, 0.82, -1.1);
ftScene.add(lblCobalt);

var lblSheet = ftMakeLabel('Observation Sheet', 175, 34, 16);
lblSheet.position.set(-3.2, 0.36, 0.6);
ftScene.add(lblSheet);

// Resize handler
window.addEventListener('resize', function() {
  ftCamera.aspect = window.innerWidth / window.innerHeight;
  ftCamera.updateProjectionMatrix();
  ftRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Lab Sinks
var ftLabSinkLeft = new LabSink(ftScene, { x: -8, y: 0, z: -1.7 });
var ftLabSinkRight = new LabSink(ftScene, { x: 8, y: 0, z: -1.7 });

// ═══════════════════════════════════════════════════════════════════════════
// RENDER LOOP
// ═══════════════════════════════════════════════════════════════════════════
var _ftT = 0;

function ftAnimate() {
  requestAnimationFrame(ftAnimate);

  var now = performance.now() * 0.001;
  _dt  = Math.min(now - _lastTime, 0.05);
  _lastTime = now;
  _ftT = now;

  if (flameActive) {
    var posArr = fpGeo.attributes.position.array;
    var colArr = fpGeo.attributes.color.array;
    var szArr  = fpGeo.attributes.size.array;

    for (var i = 0; i < FP_COUNT; i++) {
      fp_life[i] += _dt / fp_maxL[i];

      if (fp_life[i] >= 1.0) {
        _fpReset(i);
        fp_life[i] = 0;
      }

      var t = fp_life[i];
      var turb = Math.sin(_ftT * 4.1 + fp_seed[i]) * 0.008
               + Math.sin(_ftT * 7.3 + fp_seed[i] * 1.7) * 0.004;

      fp_pos[i*3]   += (fp_vx[i] + turb) * _dt;
      fp_pos[i*3+1] += fp_vy[i] * _dt * (1.0 - t * 0.3);
      fp_pos[i*3+2] += (fp_vz[i] + turb * 0.5) * _dt;

      fp_pos[i*3]   += fp_pos[i*3] * 0.18 * _dt;
      fp_pos[i*3+2] += fp_pos[i*3+2] * 0.18 * _dt;

      var c = new THREE.Color();
      if (t < 0.2) {
        c.lerpColors(_fpColBase, _fpColMid, t / 0.2);
      } else if (t < 0.65) {
        c.lerpColors(_fpColMid, _fpColTip, (t - 0.2) / 0.45);
      } else {
        c.copy(_fpColTip);
        var fade = 1.0 - (t - 0.65) / 0.35;
        c.multiplyScalar(fade);
      }
      colArr[i*3]   = c.r;
      colArr[i*3+1] = c.g;
      colArr[i*3+2] = c.b;

      var sizeT = t < 0.3 ? t / 0.3 : 1.0 - (t - 0.3) / 0.7;
      szArr[i] = (0.04 + sizeT * 0.10) * (0.7 + Math.random() * 0.3);

      posArr[i*3]   = fp_pos[i*3];
      posArr[i*3+1] = fp_pos[i*3+1];
      posArr[i*3+2] = fp_pos[i*3+2];
    }

    fpGeo.attributes.position.needsUpdate = true;
    fpGeo.attributes.color.needsUpdate    = true;
    fpGeo.attributes.size.needsUpdate     = true;

    // Displacement
    var icPos = innerConeGeo.attributes.position.array;
    for (var v = 0; v < icPos.length / 3; v++) {
      var ox = _icOrigPos[v*3];
      var oy = _icOrigPos[v*3+1];
      var oz = _icOrigPos[v*3+2];
      var heightFrac = (oy + 0.11) / 0.22;
      var disp = Math.sin(_ftT * 18 + v * 0.8 + fp_seed[v % FP_COUNT]) * 0.006 * heightFrac;
      icPos[v*3]   = ox + disp;
      icPos[v*3+2] = oz + disp * 0.7;
    }
    innerConeGeo.attributes.position.needsUpdate = true;
    innerConeGeo.computeVertexNormals();

    // Flicker
    var f1 = Math.sin(_ftT * 17.3) * 0.18 + Math.sin(_ftT * 11.1) * 0.12;
    var f2 = Math.sin(_ftT * 13.7) * 0.22 + Math.sin(_ftT *  8.9) * 0.14;
    var f3 = Math.sin(_ftT *  9.1) * 0.28 + Math.sin(_ftT *  6.3) * 0.18;

    flameLightBase.intensity = Math.max(0, 1.2 + f1);
    flameLightMid.intensity  = Math.max(0, (_wireInFlame ? 3.2 : 2.8) + f2);
    flameLight.intensity     = Math.max(0, (_wireInFlame ? 3.5 : 1.5) + f3);

    var pulse = 1.0 + Math.sin(_ftT * 8.5) * 0.06;
    glowSprite.scale.set(0.55 * pulse, 0.75 * pulse, 1.0);

    fpPoints.rotation.z    = Math.sin(_ftT * 1.8) * 0.018;
    innerConeMesh.rotation.z = Math.sin(_ftT * 2.1) * 0.015;
    glowSprite.position.x  = Math.sin(_ftT * 1.8) * 0.012;
  }

  bunsen.rotation.y = Math.sin(_ftT * 0.22) * 0.007;
  ftLabSinkLeft.update(_ftT);
  ftLabSinkRight.update(_ftT);
  ftRenderer.render(ftScene, ftCamera);
}
ftAnimate();

// ═══════════════════════════════════════════════════════════════════════════
// MANUAL LABORATORY ACTIONS & ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════
var ftSelectedSampleIdx = -1;
var ftHclTaken = false;
var ftPasteMade = false;
var ftWireLoaded = false;
var ftFlameObserved = false;
var cobaltGlassActive = false;
var reactionCountdownActive = false;

function showPasteInDish(colourHex) {
  var c = new THREE.Color(colourHex);
  gsap.to(dishPasteMat, { opacity: 0.88, duration: 0.6 });
  gsap.to(dishPasteMat.color, { r: c.r, g: c.g, b: c.b, duration: 0.6 });
}

function showPasteOnLoop(colourHex) {
  var c = new THREE.Color(colourHex);
  gsap.to(pasteMat, { opacity: 0.92, duration: 0.4 });
  gsap.to(pasteMat.color, { r: c.r, g: c.g, b: c.b, duration: 0.4 });
}

function ftAnimateTakeSample(sampleIdx, onComplete) {
  ftSelectedSampleIdx = sampleIdx;
  var bottleGroup = ftSampleBottleGroups[sampleIdx];

  // Camera zoom in on bench center
  gsap.to(ftControls.target, { x: -0.2, y: 0.3, z: 0.3, duration: 1.5, ease: 'power2.inOut' });
  gsap.to(ftControls, {
    radius: 3.0,
    phi: Math.PI / 3.0,
    theta: -Math.PI / 8.0,
    duration: 1.5,
    onUpdate: function() { ftControls._update(); }
  });

  // Fade out labels
  var allLabels = [lblBunsen, lblWireLoop, lblDish, lblHcl, lblCobalt, lblSheet];
  gsap.to(allLabels.map(function(l) { return l.material; }), { opacity: 0, duration: 0.4 });

  // Move evaporating dish to table center
  gsap.to(dish.position, { x: -0.4, y: 0.02, z: 0.5, duration: 1.0, ease: 'power2.out' });
  gsap.to(dishBottom.position, { x: -0.4, y: 0.0, z: 0.5, duration: 1.0, ease: 'power2.out' });
  gsap.to(dishPaste.position, { x: -0.4, y: 0.014, z: 0.5, duration: 1.0, ease: 'power2.out' });

  // Move selected sample bottle to table
  gsap.to(bottleGroup.position, {
    x: -1.0, y: 0.18, z: 0.5,
    duration: 1.2,
    ease: 'power2.out',
    onComplete: function() {
      gsap.to(allLabels.map(function(l) { return l.material; }), { opacity: 1, duration: 0.3 });
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    }
  });
}

var hclDropperActive = false;

function ftAnimateAddHCl(onComplete) {
  if (hclDropperActive) return;
  hclDropperActive = true;

  gsap.timeline()
    .to(hclGroup.position, { x: 0.3, y: 0.22, z: 0.5, duration: 0.8, ease: 'power2.out' })
    .to(hclGroup.position, { x: -0.15, y: 0.55, z: 0.5, duration: 0.6, ease: 'power2.inOut' })
    .to(hclGroup.rotation, { z: -Math.PI / 2.3, duration: 0.4 })
    .add(function() {
      var dropGeo = new THREE.SphereGeometry(0.01, 8, 8);
      var dropMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
      var drop = new THREE.Mesh(dropGeo, dropMat);
      drop.position.set(-0.25, 0.45, 0.5);
      ftScene.add(drop);

      gsap.to(drop.position, {
        y: 0.03, duration: 0.3, ease: 'power1.in', onComplete: function() {
          ftScene.remove(drop);
          showPasteInDish('#d8d4c0');
        }
      });
    })
    .to(hclGroup.rotation, { z: 0, duration: 0.4, delay: 0.4 })
    .to(hclGroup.position, { x: hclGroup.userData.initX, y: hclGroup.userData.initY, z: hclGroup.userData.initZ, duration: 0.8, ease: 'power2.inOut' })
    .add(function() {
      hclDropperActive = false;
      ftHclTaken = true;
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    });
}

var stirActive = false;

function ftAnimateMakePaste(onComplete) {
  if (stirActive) return;
  stirActive = true;

  gsap.timeline()
    .to(glassRod.material, { opacity: 0.8, duration: 0.3 })
    .to(glassRod.position, { x: -0.4, y: 0.16, z: 0.5, duration: 0.5 })
    .to(glassRod.position, { x: -0.44, y: 0.15, duration: 0.1, yoyo: true, repeat: 7 })
    .to(dish.rotation, { y: 0.3, duration: 0.1, yoyo: true, repeat: 7 }, "<")
    .add(function() {
      showPasteInDish('#ccbba0');
    })
    .to(glassRod.position, { x: -0.4, y: 0.5, z: 0.5, duration: 0.5 })
    .to(glassRod.material, { opacity: 0, duration: 0.3 })
    .add(function() {
      stirActive = false;
      ftPasteMade = true;
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    });
}

function ftAnimateLoadWire(onComplete) {
  gsap.timeline()
    .to(wireLoop.position, { x: -0.4, y: 0.12, z: 0.5, duration: 0.8, ease: 'power2.inOut' })
    .to(wireLoop.rotation, { x: Math.PI / 2.3, z: 0, duration: 0.5 }, "<")
    .add(function() {
      showPasteOnLoop('#ccbba0');
    })
    .to(wireLoop.position, { x: 0.8, y: 0.35, z: 0.5, duration: 0.7, ease: 'power2.out' })
    .to(wireLoop.rotation, { x: 0, z: -Math.PI / 8, duration: 0.5 }, "<")
    .add(function() {
      ftWireLoaded = true;
      updateKeyboardGuideText();
      if (onComplete) onComplete();
    });
}

function animateWireToFlame(onComplete) {
  var allLabels = [lblDish, lblHcl, lblCobalt, lblSheet];
  gsap.to(allLabels.map(function(l) { return l.material; }), { opacity: 0, duration: 0.4 });

  gsap.to(ftControls.target, { x: 0.14, y: 0.9, z: 0.5, duration: 1.2, ease: 'power2.inOut' });
  gsap.to(ftControls, {
    radius: 1.6,
    phi: Math.PI / 2.2,
    theta: 0.1,
    duration: 1.2,
    ease: 'power2.inOut',
    onUpdate: function() { ftControls._update(); }
  });

  var tl = gsap.timeline({ onComplete: onComplete });
  tl.to(wireLoop.position, { x: 0.28, y: 0.88, z: 0.5, duration: 0.9, ease: 'power2.inOut' })
    .to(wireLoop.rotation,  { z: 0, duration: 0.5 }, '-=0.3');
}

function animateWireReturn(onComplete) {
  if (cobaltGlassActive) {
    toggleCobaltGlass();
  }

  gsap.to(ftControls.target, { x: 0, y: 0.9, z: 0, duration: 1.2, ease: 'power2.inOut' });
  gsap.to(ftControls, {
    radius: 6.2,
    phi: Math.PI / 2.6,
    theta: 0,
    duration: 1.2,
    ease: 'power2.inOut',
    onUpdate: function() { ftControls._update(); }
  });

  var allLabels = [lblDish, lblHcl, lblCobalt, lblSheet];
  gsap.to(allLabels.map(function(l) { return l.material; }), { opacity: 1, duration: 0.4 });

  var tl = gsap.timeline({ onComplete: onComplete });
  tl.to(wireLoop.position, { x: wireLoop.userData.initX, y: wireLoop.userData.initY, z: wireLoop.userData.initZ, duration: 0.7, ease: 'power2.inOut' })
    .to(wireLoop.rotation,  { x: Math.PI / 2, z: Math.PI / 4, duration: 0.4 }, '-=0.3');
}

function toggleCobaltGlass() {
  if (!flameActive) return;
  cobaltGlassActive = !cobaltGlassActive;
  if (cobaltGlassActive) {
    gsap.to(cobaltGlass.position, { x: 0.14, y: 0.9, z: 0.75, duration: 0.5, ease: 'power2.out' });
    gsap.to(cobaltGlass.rotation, { x: 0, y: 0, z: 0, duration: 0.5 });
    
    if (ftSampleId === 'sodium') {
      gsap.to(glowSpriteMat, { opacity: 0.05, duration: 0.3 });
    } else if (ftSampleId === 'potassium') {
      gsap.to(glowSpriteMat.color, { r: 1.0, g: 0.1, b: 0.4, duration: 0.3 });
      gsap.to(glowSpriteMat, { opacity: 0.85, duration: 0.3 });
      gsap.to(flameLight.color, { r: 1.0, g: 0.1, b: 0.4, duration: 0.3 });
    }
  } else {
    gsap.to(cobaltGlass.position, { x: cobaltGlass.userData.initX, y: cobaltGlass.userData.initY, z: cobaltGlass.userData.initZ, duration: 0.5, ease: 'power2.out' });
    gsap.to(cobaltGlass.rotation, { x: 0, y: 0, z: 0, duration: 0.5 });

    var substance = FlameDatabase.getSubstance(ftSampleId);
    if (substance) {
      var gc = new THREE.Color(substance.flameHex);
      gsap.to(glowSpriteMat.color, { r: gc.r, g: gc.g, b: gc.b, duration: 0.3 });
      gsap.to(glowSpriteMat, { opacity: 0.65, duration: 0.3 });
      gsap.to(flameLight.color, { r: gc.r, g: gc.g, b: gc.b, duration: 0.3 });
    }
  }
}

function resetFlameScene() {
  gsap.killTweensOf(fpMatSimple);
  gsap.killTweensOf(innerConeMat);
  gsap.killTweensOf(glowSpriteMat);
  gsap.killTweensOf(flameLightBase);
  gsap.killTweensOf(flameLightMid);
  gsap.killTweensOf(flameLight);
  gsap.killTweensOf(pasteMat);
  gsap.killTweensOf(dishPasteMat);
  gsap.killTweensOf(wireLoop.position);
  gsap.killTweensOf(wireLoop.rotation);
  gsap.killTweensOf(hclGroup.position);
  gsap.killTweensOf(dish.position);
  gsap.killTweensOf(cobaltGlass.position);
  gsap.killTweensOf(ftControls.target);
  gsap.killTweensOf(ftControls);

  ftSelectedSampleIdx = -1;
  ftHclTaken = false;
  ftPasteMade = false;
  ftWireLoaded = false;
  ftFlameObserved = false;
  cobaltGlassActive = false;
  reactionCountdownActive = false;

  ftControls.target.set(0, 0.9, 0);
  ftControls.radius = 6.2;
  ftControls.phi = Math.PI / 2.6;
  ftControls.theta = 0;
  ftControls._update();

  var allLabels = [lblBunsen, lblWireLoop, lblDish, lblHcl, lblCobalt, lblSheet];
  gsap.to(allLabels.map(function(l) { return l.material; }), { opacity: 1, duration: 0.1 });

  ftSampleBottleGroups.forEach(function(g) {
    gsap.to(g.position, {
      x: g.userData.initX,
      y: g.userData.initY,
      z: g.userData.initZ,
      duration: 1.0,
      ease: 'power2.inOut'
    });
  });

  gsap.to(hclGroup.position, { x: hclGroup.userData.initX, y: hclGroup.userData.initY, z: hclGroup.userData.initZ, duration: 1.0 });
  gsap.to(dish.position, { x: dish.userData.initX, y: dish.userData.initY, z: dish.userData.initZ, duration: 1.0 });
  gsap.to(dishBottom.position, { x: dish.userData.initX, y: dish.userData.initY - 0.02, z: dish.userData.initZ, duration: 1.0 });
  gsap.to(dishPaste.position, { x: dish.userData.initX, y: dish.userData.initY - 0.006, z: dish.userData.initZ, duration: 1.0 });
  gsap.to(wireLoop.position, { x: wireLoop.userData.initX, y: wireLoop.userData.initY, z: wireLoop.userData.initZ, duration: 1.0 });
  gsap.to(wireLoop.rotation, { x: Math.PI / 2, z: Math.PI / 4, duration: 1.0 });
  gsap.to(cobaltGlass.position, { x: cobaltGlass.userData.initX, y: cobaltGlass.userData.initY, z: cobaltGlass.userData.initZ, duration: 1.0 });
  gsap.to(cobaltGlass.rotation, { x: 0, y: 0, z: 0, duration: 1.0 });

  fpMatSimple.opacity      = 0;
  innerConeMat.opacity     = 0;
  glowSpriteMat.opacity    = 0;
  flameLightBase.intensity = 0;
  flameLightMid.intensity  = 0;
  flameLight.intensity     = 0;
  flameLight.color.set(0xff7700);
  flameLightMid.color.set(0xff7700);
  glowSpriteMat.color.set(0xff7700);
  flameActive  = false;
  _wireInFlame = false;
  _fpColTip.set(0xff7700);

  for (var i = 0; i < FP_COUNT; i++) { _fpReset(i); }

  pasteMat.opacity     = 0;
  dishPasteMat.opacity = 0;
  fpPoints.rotation.z    = 0;
  innerConeMesh.rotation.z = 0;

  updateKeyboardGuideText();
}

// ── INTERACTIVE RAYCASTING ──────────────────────────────────────────────────
var ftRaycaster = new THREE.Raycaster();
var ftMouse = new THREE.Vector2();
var ftHoveredObject = null;

function ftHighlightGroup(group, active) {
  if (!group) return;
  group.traverse(function(child) {
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

function ftGetIntersectedInteractive(intersects) {
  for (var i = 0; i < intersects.length; i++) {
    var obj = intersects[i].object;
    while (obj && obj !== ftScene) {
      if (obj.userData && obj.userData.isSinkKnob) return { type: 'sinkKnob', group: obj };

      var sIdx = ftSampleBottleGroups.indexOf(obj);
      if (sIdx >= 0) return { type: 'sample', index: sIdx, group: obj };
      
      if (obj === hclGroup) return { type: 'hcl', group: obj };
      if (obj === dish) return { type: 'dish', group: obj };
      if (obj === wireLoop) return { type: 'wire', group: obj };
      if (obj === cobaltGlass) return { type: 'cobalt', group: obj };
      if (obj === bunsen) return { type: 'bunsen', group: obj };
      if (obj === ftSheet) return { type: 'sheet', group: obj };
      
      obj = obj.parent;
    }
  }
  return null;
}

window.addEventListener('mousemove', function(event) {
  ftMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  ftMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  ftRaycaster.setFromCamera(ftMouse, ftCamera);
  var intersects = ftRaycaster.intersectObjects(ftScene.children, true);
  var intersected = ftGetIntersectedInteractive(intersects);

  var isInteractive = false;
  if (intersected) {
    var state = typeof ftState !== 'undefined' ? ftState : 'IDLE';
    if (intersected.type === 'sinkKnob') isInteractive = true;
    if (intersected.type === 'sample' && state === 'IDLE') isInteractive = true;
    if (intersected.type === 'hcl' && state === 'SAMPLE_SELECTED') isInteractive = true;
    if (intersected.type === 'dish' && state === 'HCL_ADDED') isInteractive = true;
    if (intersected.type === 'wire' && state === 'PASTE_MADE') isInteractive = true;
    if (intersected.type === 'bunsen' && state === 'WIRE_LOADED') isInteractive = true;
    if (intersected.type === 'cobalt' && state === 'IN_FLAME') isInteractive = true;
    if ((intersected.type === 'sheet' || intersected.type === 'bunsen') && state === 'IN_FLAME' && !reactionCountdownActive) isInteractive = true;
    if (intersected.type === 'sheet' && state === 'COLOUR_SUBMITTED') isInteractive = true;
  }

  if (isInteractive) {
    document.body.style.cursor = 'pointer';
    if (ftHoveredObject !== intersected.group) {
      ftHighlightGroup(ftHoveredObject, false);
      ftHoveredObject = intersected.group;
      ftHighlightGroup(ftHoveredObject, true);
    }
  } else {
    document.body.style.cursor = 'default';
    if (ftHoveredObject) {
      ftHighlightGroup(ftHoveredObject, false);
      ftHoveredObject = null;
    }
  }
});

window.addEventListener('click', function() {
  if (!ftHoveredObject) return;

  ftRaycaster.setFromCamera(ftMouse, ftCamera);
  var intersects = ftRaycaster.intersectObjects(ftScene.children, true);
  var intersected = ftGetIntersectedInteractive(intersects);
  if (!intersected) return;

  if (intersected.type === 'sinkKnob') {
    ftHighlightGroup(ftHoveredObject, false);
    ftHoveredObject = null;
    document.body.style.cursor = 'default';
    return;
  }

  var state = typeof ftState !== 'undefined' ? ftState : 'IDLE';

  if (intersected.type === 'sample' && state === 'IDLE') {
    ftHighlightGroup(ftHoveredObject, false);
    ftHoveredObject = null;
    document.body.style.cursor = 'default';
    
    var sampleKey = ftSampleData[intersected.index].id;
    if (sampleKey === 'random') {
      sampleKey = FlameDatabase.randomSubstanceId();
    }
    ftSelectSample(sampleKey);
  } else if (intersected.type === 'hcl' && state === 'SAMPLE_SELECTED') {
    ftHighlightGroup(ftHoveredObject, false);
    ftHoveredObject = null;
    document.body.style.cursor = 'default';
    ftAddHCl();
  } else if (intersected.type === 'dish' && state === 'HCL_ADDED') {
    ftHighlightGroup(ftHoveredObject, false);
    ftHoveredObject = null;
    document.body.style.cursor = 'default';
    ftMakePaste();
  } else if (intersected.type === 'wire' && state === 'PASTE_MADE') {
    ftHighlightGroup(ftHoveredObject, false);
    ftHoveredObject = null;
    document.body.style.cursor = 'default';
    ftLoadWire();
  } else if (intersected.type === 'bunsen' && state === 'WIRE_LOADED') {
    ftHighlightGroup(ftHoveredObject, false);
    ftHoveredObject = null;
    document.body.style.cursor = 'default';
    ftIgnite();
  } else if (intersected.type === 'cobalt' && state === 'IN_FLAME') {
    toggleCobaltGlass();
  } else if ((intersected.type === 'sheet' || intersected.type === 'bunsen') && state === 'IN_FLAME' && !reactionCountdownActive) {
    ftHighlightGroup(ftHoveredObject, false);
    ftHoveredObject = null;
    document.body.style.cursor = 'default';
    document.getElementById('ft-colour-submit-panel').classList.remove('hidden');
  } else if (intersected.type === 'sheet' && state === 'COLOUR_SUBMITTED') {
    ftHighlightGroup(ftHoveredObject, false);
    ftHoveredObject = null;
    document.body.style.cursor = 'default';
    document.getElementById('ft-id-panel').classList.remove('hidden');
  }
});

// ── KEYBOARD CONTROLS LISTENERS ───────────────────────────────────────────
window.addEventListener('keydown', function(event) {
  var key = event.key.toUpperCase();
  var state = typeof ftState !== 'undefined' ? ftState : 'IDLE';

  if (state === 'IDLE') {
    if (key >= '1' && key <= '6') {
      var idx = parseInt(key) - 1;
      ftSelectSample(ftSampleData[idx].id);
    } else if (key === '7') {
      ftSelectSample(FlameDatabase.randomSubstanceId());
    }
  } else if (state === 'SAMPLE_SELECTED') {
    if (key === 'A') {
      ftAddHCl();
    }
  } else if (state === 'HCL_ADDED') {
    if (key === 'M') {
      ftMakePaste();
    }
  } else if (state === 'PASTE_MADE') {
    if (key === 'L') {
      ftLoadWire();
    }
  } else if (state === 'WIRE_LOADED') {
    if (key === 'I') {
      ftIgnite();
    }
  } else if (state === 'IN_FLAME') {
    if (key === 'C') {
      toggleCobaltGlass();
    } else if (key === 'O' && !reactionCountdownActive) {
      document.getElementById('ft-colour-submit-panel').classList.remove('hidden');
    }
  } else if (state === 'COLOUR_SUBMITTED') {
    if (key === 'I') {
      document.getElementById('ft-id-panel').classList.remove('hidden');
    }
  }

  if (key === 'R') {
    ftReset();
  }
});

// ── KEYBOARD GUIDE PANEL ────────────────────────────────────────────────────
function updateKeyboardGuideText() {
  var guideEl = document.getElementById('keyboard-guide-text');
  if (!guideEl) return;

  var state = typeof ftState !== 'undefined' ? ftState : 'IDLE';

  var html = "";
  if (state === 'IDLE') {
    html = "Step 1: Press <span class='key-btn'>1</span>-<span class='key-btn'>6</span> or click a sample bottle on the shelf (or <span class='key-btn'>7</span> for random)";
  } else if (state === 'SAMPLE_SELECTED') {
    html = "Step 2: Press <span class='key-btn'>A</span> or click the Conc. HCl bottle to add acid";
  } else if (state === 'HCL_ADDED') {
    html = "Step 3: Press <span class='key-btn'>M</span> or click the Evaporating Dish to stir mixture and make paste";
  } else if (state === 'PASTE_MADE') {
    html = "Step 4: Press <span class='key-btn'>L</span> or click the Wire Loop to load the paste on the loop";
  } else if (state === 'WIRE_LOADED') {
    html = "Step 5: Press <span class='key-btn'>I</span> or click the Bunsen Burner to ignite and introduce loop";
  } else if (state === 'IN_FLAME') {
    if (reactionCountdownActive) {
      html = "Observing flame colour... Please wait";
    } else {
      html = "Step 5: Observe flame. Press <span class='key-btn'>C</span> to toggle Cobalt Blue Glass. Press <span class='key-btn'>O</span> or click <b>Record Observation</b> to submit";
    }
  } else if (state === 'COLOUR_SUBMITTED') {
    html = "Step 6: Press <span class='key-btn'>I</span> or click the Observation Sheet to open the Identification Panel";
  } else if (state === 'IDENTIFYING') {
    html = "Step 6: Select the identified cation on the panel";
  } else if (state === 'DONE') {
    html = "Experiment Complete. Press <span class='key-btn'>R</span> or click New Experiment to reset";
  }

  guideEl.innerHTML = html;
}

function setLabelsOpacity(opacity) {
  try {
    ftScene.traverse(function(child) {
      if (child.isSprite && child.material) {
        gsap.to(child.material, { opacity: opacity, duration: 0.3 });
      }
    });
  } catch(e) { /* no sprites to fade */ }
}

var _ftCountdownEl = null;

function showFlameCountdown(seconds, onDone) {
  if (_ftCountdownEl) { _ftCountdownEl.remove(); _ftCountdownEl = null; }
  try { setLabelsOpacity(0); } catch(e) {}

  var overlay = document.createElement('div');
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
  _ftCountdownEl = overlay;

  var remaining = seconds;
  function tick() {
    if (!_ftCountdownEl) return;
    overlay.innerHTML = `Observe the flame colour... <b style="color:#63b3ed;font-size:1.2em">${remaining}s</b><br>
      <span style="font-size:0.8rem;color:#90cdf4">Watch the non-luminous flame bloom to characteristic colour</span>`;
    if (remaining <= 0) {
      overlay.remove();
      _ftCountdownEl = null;
      try { setLabelsOpacity(1); } catch(e) {}
      if (onDone) onDone();
      return;
    }
    remaining--;
    setTimeout(tick, 1000);
  }
  tick();
}

setTimeout(updateKeyboardGuideText, 500);
