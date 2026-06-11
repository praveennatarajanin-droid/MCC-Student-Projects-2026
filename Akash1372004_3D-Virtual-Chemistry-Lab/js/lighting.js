/**
 * lighting.js
 * Sets up the Three.js lighting rig for the virtual lab.
 * Mimics a real laboratory: overhead fluorescent + ambient fill.
 * Also provides shared procedural texture generators for consistent
 * floor, wall, and bench appearance across all experiments.
 */

function setupLighting(scene) {

  // ── Ambient fill ────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.22);
  scene.add(ambient);

  // ── Hemisphere sky/ground light ─────────────────────────────────
  const hemi = new THREE.HemisphereLight(0xd6e4f0, 0x2a2010, 0.35);
  scene.add(hemi);

  // ── Ceiling Point Light ──────────────────────────────────────────
  const ceilingLight = new THREE.PointLight(0xfff8e8, 4.5);
  ceilingLight.position.set(0, 12 - 3.25, 0);
  ceilingLight.castShadow = false;
  scene.add(ceilingLight);

  // ── Directional Key Light ────────────────────────────────────────
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 0.6);
  dirLight.position.set(10, 20 - 3.25, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width  = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near    = 0.5;
  dirLight.shadow.camera.far     = 40;
  dirLight.shadow.camera.left    = -10;
  dirLight.shadow.camera.right   = 10;
  dirLight.shadow.camera.top     = 10;
  dirLight.shadow.camera.bottom  = -10;
  dirLight.shadow.bias           = -0.0005;
  scene.add(dirLight);

  // ── Fluorescent tube light fixtures (visual) ────────────────────
  function createTubeLight(x, z) {
    const tubeLight = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.1, 0.3),
      new THREE.MeshBasicMaterial({ color: 0xfff8f0 })
    );
    tubeLight.position.set(x, 11.5 - 3.25, z);
    scene.add(tubeLight);
  }
  createTubeLight(0, 0);
  createTubeLight(-8, 0);
  createTubeLight(8, 0);

  return { ambient, hemi, ceilingLight, dirLight };
}

// ═══════════════════════════════════════════════════════════════
// SHARED PROCEDURAL TEXTURE GENERATORS
// Loaded before all scene files — available globally.
// ═══════════════════════════════════════════════════════════════

/**
 * Lab floor: square tiles with visible grout lines + subtle gloss variation.
 */
function createLabFloorTex(tileSize) {
  tileSize = tileSize || 64;
  var TILES = 4;
  var S = tileSize * TILES;
  var cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var ctx = cv.getContext('2d');

  var tileColors = ['#69717e', '#5f6d7a', '#6b7986', '#637078'];

  for (var row = 0; row < TILES; row++) {
    for (var col = 0; col < TILES; col++) {
      ctx.fillStyle = tileColors[(row + col) % tileColors.length];
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);

      // Soft surface highlight
      var grad = ctx.createRadialGradient(
        col * tileSize + tileSize * 0.4, row * tileSize + tileSize * 0.4, 0,
        col * tileSize + tileSize * 0.5, row * tileSize + tileSize * 0.5, tileSize * 0.85
      );
      grad.addColorStop(0,   'rgba(255,255,255,0.09)');
      grad.addColorStop(0.6, 'rgba(255,255,255,0.02)');
      grad.addColorStop(1,   'rgba(0,0,0,0.07)');
      ctx.fillStyle = grad;
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }

  // Grout lines
  ctx.strokeStyle = '#383e46';
  ctx.lineWidth = 2;
  for (var i = 0; i <= TILES; i++) {
    ctx.beginPath(); ctx.moveTo(i * tileSize, 0); ctx.lineTo(i * tileSize, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * tileSize); ctx.lineTo(S, i * tileSize); ctx.stroke();
  }

  var tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  _applyTexColorSpace(tex);
  return tex;
}

/**
 * Lab wall: smooth plaster with subtle grain and a soft sheen.
 */
function createLabWallTex() {
  var S = 256;
  var cv = document.createElement('canvas');
  cv.width = cv.height = S;
  var ctx = cv.getContext('2d');

  ctx.fillStyle = '#5a6270';
  ctx.fillRect(0, 0, S, S);

  for (var i = 0; i < 1800; i++) {
    var x = Math.random() * S, y = Math.random() * S;
    var a = 0.015 + Math.random() * 0.025;
    ctx.fillStyle = Math.random() > 0.5 ? ('rgba(255,255,255,' + a + ')') : ('rgba(0,0,0,' + a + ')');
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  var grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0.0,  'rgba(255,255,255,0)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.06)');
  grad.addColorStop(0.65, 'rgba(255,255,255,0.06)');
  grad.addColorStop(1.0,  'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  var tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  _applyTexColorSpace(tex);
  return tex;
}

/**
 * Rich procedural bench-top wood: deep mahogany with grain, knots, and gloss sheen.
 */
function createSharedBenchWoodTex() {
  var W = 1024, H = 256;
  var cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  var ctx = cv.getContext('2d');

  ctx.fillStyle = '#2e1508';
  ctx.fillRect(0, 0, W, H);

  for (var i = 0; i < 200; i++) {
    var x = Math.random() * W;
    var lineW = 0.4 + Math.random() * 4.5;
    var alpha = 0.03 + Math.random() * 0.12;
    var col = Math.random() > 0.48
      ? ('rgba(200,130,60,' + alpha + ')')
      : ('rgba(15,5,0,' + alpha + ')');
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (var y = 0; y <= H; y += 10) {
      var dx = Math.sin(y * 0.04 + i * 0.7) * 5 + Math.sin(y * 0.12 + i) * 2;
      ctx.lineTo(x + dx, y);
    }
    ctx.strokeStyle = col;
    ctx.lineWidth = lineW;
    ctx.stroke();
  }

  // Knot rings
  for (var k = 0; k < 5; k++) {
    var kx = Math.random() * W;
    var ky = H * 0.3 + Math.random() * H * 0.4;
    var kr = 22 + Math.random() * 45;
    for (var r = kr; r > 2; r -= 4) {
      ctx.beginPath();
      ctx.ellipse(kx, ky, r, r * 0.42, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(10,4,0,' + (0.05 + (kr - r) / kr * 0.11) + ')';
      ctx.lineWidth = 1 + Math.random() * 1.8;
      ctx.stroke();
    }
  }

  // Top gloss sheen
  var gloss = ctx.createLinearGradient(0, 0, 0, H);
  gloss.addColorStop(0,    'rgba(255,255,255,0.11)');
  gloss.addColorStop(0.12, 'rgba(255,255,255,0.04)');
  gloss.addColorStop(1,    'rgba(0,0,0,0.08)');
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, W, H);

  var tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  _applyTexColorSpace(tex);
  return tex;
}

/** Internal helper: apply sRGB color space to texture (r134 compatible). */
function _applyTexColorSpace(tex) {
  if (THREE.sRGBEncoding !== undefined) {
    tex.encoding = THREE.sRGBEncoding;
  } else if (typeof THREE.SRGBColorSpace !== 'undefined') {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
}
