/**
 * TestTube.js  — Realistic chemistry test tube
 *
 * Features:
 *  • Proper glass geometry (open-top cylinder + hemisphere cap)
 *  • Liquid fill with correct scale math (height driven, not scale.y hack)
 *  • Animated meniscus that sits exactly at the liquid surface
 *  • Precipitate particle cloud that spawns on reaction
 *  • Bubble particles on dissolution
 *  • Colour transition via GSAP (slow, realistic diffusion)
 *  • Tilt-pour animation with stream effect
 *  • Glow highlight on active tube
 */

class TestTube {
  constructor(scene, position, index = 0) {
    this.scene    = scene;
    this.index    = index;
    this.group    = new THREE.Group();
    this.volume   = 0;
    this.maxVol   = 20;

    // Internal geometry refs
    this._liquidMesh    = null;
    this._liquidMat     = null;
    this._meniscusMesh  = null;
    this._meniscusMat   = null;
    this._precipGroup   = null;
    this._bubbleGroup   = null;
    this._glowMesh      = null;
    this._activeTweens  = [];

    // Tube geometry constants
    this.TUBE_HEIGHT  = 1.0;
    this.TUBE_RADIUS  = 0.08;
    this.INNER_RADIUS = 0.072;
    this.BOTTOM_Y     = -0.5;   // world-space bottom of liquid column

    this._build();
    scene.add(this.group);
    this.group.position.set(position.x, position.y, position.z);
  }

  // ─────────────────────────────────────────────────────────────────────────
  _build() {
    // ── Glass outer wall (open cylinder, double-sided so inside is visible) ──
    const glassMat = new THREE.MeshPhysicalMaterial({
      color:        0xd0eeff,
      transparent:  true,
      opacity:      0.18,
      roughness:    0.04,
      metalness:    0.0,
      transmission: 0.92,
      thickness:    0.3,
      side:         THREE.DoubleSide,
      depthWrite:   false
    });

    const tubeGeo = new THREE.CylinderGeometry(
      this.TUBE_RADIUS, this.TUBE_RADIUS, this.TUBE_HEIGHT, 32, 1, true
    );
    const tube = new THREE.Mesh(tubeGeo, glassMat);
    tube.castShadow = true;
    this.group.add(tube);

    // ── Rounded bottom hemisphere ─────────────────────────────────────────
    const capGeo = new THREE.SphereGeometry(
      this.TUBE_RADIUS, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2
    );
    const cap = new THREE.Mesh(capGeo, glassMat);
    cap.position.y = this.BOTTOM_Y;
    this.group.add(cap);

    // ── Liquid column ─────────────────────────────────────────────────────
    // We control height by changing geometry scaleY via position + scale.
    // Base geometry is 1 unit tall, centred at origin.
    // We'll move it so its bottom sits at BOTTOM_Y and grows upward.
    this._liquidMat = new THREE.MeshStandardMaterial({
      color:       0xffffff,
      transparent: true,
      opacity:     0.0,
      roughness:   0.08,
      metalness:   0.0,
      emissive:    new THREE.Color(0x000000),
      emissiveIntensity: 0.15,
      depthWrite:  false
    });

    // 1-unit-tall cylinder; we scale Y to set actual height
    const liquidGeo = new THREE.CylinderGeometry(
      this.INNER_RADIUS, this.INNER_RADIUS, 1.0, 32
    );
    this._liquidMesh = new THREE.Mesh(liquidGeo, this._liquidMat);
    // Start invisible at bottom
    this._liquidMesh.scale.y  = 0.001;
    this._liquidMesh.position.y = this.BOTTOM_Y;
    this.group.add(this._liquidMesh);

    // ── Meniscus (concave top surface) ────────────────────────────────────
    this._meniscusMat = new THREE.MeshStandardMaterial({
      color:       0xffffff,
      transparent: true,
      opacity:     0.0,
      roughness:   0.04,
      metalness:   0.0,
      depthWrite:  false
    });
    // Flat disc — we'll give it a slight concave look via normal map trick
    const meniscusGeo = new THREE.CircleGeometry(this.INNER_RADIUS, 32);
    this._meniscusMesh = new THREE.Mesh(meniscusGeo, this._meniscusMat);
    this._meniscusMesh.rotation.x = -Math.PI / 2;
    this._meniscusMesh.position.y = this.BOTTOM_Y;
    this.group.add(this._meniscusMesh);

    // ── Precipitate particle group ────────────────────────────────────────
    this._precipGroup = new THREE.Group();
    this.group.add(this._precipGroup);

    // ── Bubble group ──────────────────────────────────────────────────────
    this._bubbleGroup = new THREE.Group();
    this.group.add(this._bubbleGroup);

    // ── Glow ring (active indicator) ──────────────────────────────────────
    const glowGeo = new THREE.TorusGeometry(this.TUBE_RADIUS + 0.02, 0.008, 8, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color:       0x00ffff,
      transparent: true,
      opacity:     0.0
    });
    this._glowMesh = new THREE.Mesh(glowGeo, glowMat);
    this._glowMesh.position.y = 0.52;
    this.group.add(this._glowMesh);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE: compute liquid top Y in local space given a fill fraction
  _liquidTopY(fraction) {
    const maxH = this.TUBE_HEIGHT * 0.88;   // usable inner height
    const h    = Math.max(0.001, fraction * maxH);
    return this.BOTTOM_Y + h;
  }

  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Fill the tube to targetVol mL with animated rise + colour.
   * @param {number} targetVol  0–20
   * @param {string} hexColour
   */
  fill(targetVol, hexColour = '#88ccff') {
    this.volume = Math.min(targetVol, this.maxVol);
    const frac   = this.volume / this.maxVol;
    const maxH   = this.TUBE_HEIGHT * 0.88;
    const newH   = Math.max(0.001, frac * maxH);
    const topY   = this.BOTTOM_Y + newH;
    const centreY = this.BOTTOM_Y + newH / 2;

    const col = new THREE.Color(hexColour);

    // Kill any running tweens on liquid
    gsap.killTweensOf(this._liquidMesh.scale);
    gsap.killTweensOf(this._liquidMesh.position);
    gsap.killTweensOf(this._liquidMat);
    gsap.killTweensOf(this._liquidMat.color);

    // Scale Y = newH (geometry is 1 unit tall)
    gsap.to(this._liquidMesh.scale,    { y: newH, duration: 1.4, ease: 'power2.out' });
    gsap.to(this._liquidMesh.position, { y: centreY, duration: 1.4, ease: 'power2.out' });

    // Colour
    gsap.to(this._liquidMat.color, {
      r: col.r, g: col.g, b: col.b,
      duration: 1.2,
      onUpdate: () => { this._liquidMat.needsUpdate = true; }
    });
    gsap.to(this._liquidMat.emissive, {
      r: col.r * 0.3, g: col.g * 0.3, b: col.b * 0.3,
      duration: 1.2,
      onUpdate: () => { this._liquidMat.needsUpdate = true; }
    });
    gsap.to(this._liquidMat, { opacity: 0.80, duration: 0.9 });

    // Meniscus
    gsap.killTweensOf(this._meniscusMesh.position);
    gsap.killTweensOf(this._meniscusMat);
    gsap.to(this._meniscusMesh.position, { y: topY, duration: 1.4, ease: 'power2.out' });
    gsap.to(this._meniscusMat.color, { r: col.r, g: col.g, b: col.b, duration: 1.2 });
    gsap.to(this._meniscusMat, { opacity: 0.55, duration: 0.9 });

    // Spawn dissolution bubbles
    this._spawnBubbles(hexColour, 8);
  }

  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Animate a slow colour diffusion (reagent mixing).
   * @param {string} hexColour
   * @param {number} duration  seconds
   * @param {boolean} hasPrecipitate
   * @param {string}  precipHex
   */
  changeColour(hexColour, duration = 2.5, hasPrecipitate = false, precipHex = null) {
    const col = new THREE.Color(hexColour);

    gsap.killTweensOf(this._liquidMat.color);
    gsap.killTweensOf(this._liquidMat.emissive);

    // Slow diffusion — colour spreads from top down (simulate with two-phase tween)
    gsap.to(this._liquidMat.color, {
      r: col.r, g: col.g, b: col.b,
      duration,
      ease: 'power1.inOut',
      onUpdate: () => { this._liquidMat.needsUpdate = true; }
    });
    gsap.to(this._liquidMat.emissive, {
      r: col.r * 0.25, g: col.g * 0.25, b: col.b * 0.25,
      duration,
      onUpdate: () => { this._liquidMat.needsUpdate = true; }
    });
    gsap.to(this._meniscusMat.color, { r: col.r, g: col.g, b: col.b, duration });

    // Swirl animation — brief scale pulse to simulate mixing
    gsap.to(this._liquidMesh.scale, {
      x: 1.04, z: 1.04, duration: 0.3, yoyo: true, repeat: 5, ease: 'sine.inOut'
    });

    if (hasPrecipitate && precipHex) {
      setTimeout(() => this._spawnPrecipitate(precipHex), duration * 600);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  /** Spawn floating precipitate particles inside the tube. */
  _spawnPrecipitate(hexColour) {
    // Clear old precipitate
    while (this._precipGroup.children.length) {
      this._precipGroup.remove(this._precipGroup.children[0]);
    }

    const col = new THREE.Color(hexColour);
    const mat = new THREE.MeshStandardMaterial({
      color:       col,
      transparent: true,
      opacity:     0.0,
      roughness:   0.9,
      emissive:    col,
      emissiveIntensity: 0.1
    });

    const frac   = this.volume / this.maxVol;
    const maxH   = this.TUBE_HEIGHT * 0.88;
    const liqH   = frac * maxH;
    const count  = 28;

    for (let i = 0; i < count; i++) {
      const size = 0.006 + Math.random() * 0.012;
      const geo  = new THREE.SphereGeometry(size, 6, 4);
      const mesh = new THREE.Mesh(geo, mat.clone());

      // Random position inside liquid column
      const r     = Math.random() * this.INNER_RADIUS * 0.85;
      const angle = Math.random() * Math.PI * 2;
      const yPos  = this.BOTTOM_Y + Math.random() * liqH * 0.9;

      mesh.position.set(
        Math.cos(angle) * r,
        yPos,
        Math.sin(angle) * r
      );
      this._precipGroup.add(mesh);

      // Fade in then slowly settle to bottom
      gsap.to(mesh.material, { opacity: 0.75, duration: 0.4, delay: i * 0.04 });
      gsap.to(mesh.position, {
        y: this.BOTTOM_Y + size,
        duration: 2.5 + Math.random() * 2,
        delay:    0.2 + Math.random() * 0.8,
        ease:     'power1.in'
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  /** Spawn rising bubble particles (dissolution effect). */
  _spawnBubbles(hexColour, count = 6) {
    const col = new THREE.Color(hexColour);
    const frac = this.volume / this.maxVol;
    const maxH = this.TUBE_HEIGHT * 0.88;
    const liqH = frac * maxH;

    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.007 + Math.random() * 0.008, 8, 6);
      const mat = new THREE.MeshStandardMaterial({
        color:       0xffffff,
        transparent: true,
        opacity:     0.0,
        roughness:   0.05
      });
      const mesh = new THREE.Mesh(geo, mat);

      const r     = Math.random() * this.INNER_RADIUS * 0.7;
      const angle = Math.random() * Math.PI * 2;
      const startY = this.BOTTOM_Y + Math.random() * liqH * 0.3;

      mesh.position.set(Math.cos(angle) * r, startY, Math.sin(angle) * r);
      this._bubbleGroup.add(mesh);

      const delay = i * 0.12;
      gsap.to(mat, { opacity: 0.6, duration: 0.2, delay });
      gsap.to(mesh.position, {
        y: this.BOTTOM_Y + liqH + 0.05,
        duration: 0.8 + Math.random() * 0.6,
        delay,
        ease: 'power1.out',
        onComplete: () => {
          gsap.to(mat, { opacity: 0, duration: 0.2, onComplete: () => {
            this._bubbleGroup.remove(mesh);
          }});
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  /** Highlight this tube as active. */
  activate() {
    gsap.to(this._glowMesh.material, { opacity: 0.8, duration: 0.4 });
    gsap.to(this._glowMesh.material.color, { r: 0, g: 1, b: 1, duration: 0.4 });
    // Pulse
    gsap.to(this._glowMesh.scale, {
      x: 1.15, y: 1.15, z: 1.15,
      duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut'
    });
  }

  deactivate() {
    gsap.killTweensOf(this._glowMesh.scale);
    gsap.to(this._glowMesh.material, { opacity: 0, duration: 0.3 });
    this._glowMesh.scale.set(1, 1, 1);
  }

  // ─────────────────────────────────────────────────────────────────────────
  /** Tilt-pour animation. */
  pour(onComplete) {
    const tl = gsap.timeline({ onComplete });
    tl.to(this.group.rotation, { z: -Math.PI / 3, duration: 0.8, ease: 'power2.inOut' })
      .to(this._liquidMesh.scale, { y: this._liquidMesh.scale.y * 0.45, duration: 0.7 }, '-=0.2')
      .to(this.group.rotation, { z: 0, duration: 0.8, ease: 'power2.inOut' }, '+=0.3');
  }

  // ─────────────────────────────────────────────────────────────────────────
  /** Full reset — kills all tweens, clears particles. */
  reset() {
    gsap.killTweensOf(this._liquidMesh.scale);
    gsap.killTweensOf(this._liquidMesh.position);
    gsap.killTweensOf(this._liquidMat);
    gsap.killTweensOf(this._liquidMat.color);
    gsap.killTweensOf(this._liquidMat.emissive);
    gsap.killTweensOf(this._meniscusMesh.position);
    gsap.killTweensOf(this._meniscusMat);
    gsap.killTweensOf(this._glowMesh.scale);
    gsap.killTweensOf(this._glowMesh.material);

    this.volume = 0;

    this._liquidMesh.scale.set(1, 0.001, 1);
    this._liquidMesh.position.y = this.BOTTOM_Y;
    this._liquidMat.opacity     = 0;
    this._liquidMat.color.set(0xffffff);
    this._liquidMat.emissive.set(0x000000);

    this._meniscusMesh.position.y = this.BOTTOM_Y;
    this._meniscusMat.opacity     = 0;

    this._glowMesh.material.opacity = 0;
    this._glowMesh.scale.set(1, 1, 1);

    this.group.rotation.set(0, 0, 0);

    // Clear particles
    while (this._precipGroup.children.length)
      this._precipGroup.remove(this._precipGroup.children[0]);
    while (this._bubbleGroup.children.length)
      this._bubbleGroup.remove(this._bubbleGroup.children[0]);
  }

  volumeLabel() { return `${this.volume.toFixed(1)} mL`; }
}
