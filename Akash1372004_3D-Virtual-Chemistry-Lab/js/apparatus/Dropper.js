/**
 * Dropper.js — Realistic pipette/dropper with stream animation
 *
 * Features:
 *  • Moves to target tube, drops multiple drops with stream
 *  • Returns to home position after use
 *  • Liquid stream particle trail
 */

class Dropper {
  constructor(scene, position = { x: 0, y: 0, z: 0 }) {
    this.scene    = scene;
    this.group    = new THREE.Group();
    this.homePos  = { ...position };
    this._streamParticles = [];
    this._build();
    scene.add(this.group);
    this.group.position.set(position.x, position.y, position.z);
  }

  _build() {
    // ── Glass body ────────────────────────────────────────────────────────
    const glassMat = new THREE.MeshPhysicalMaterial({
      color:        0xc8e8ff,
      transparent:  true,
      opacity:      0.35,
      roughness:    0.04,
      transmission: 0.7,
      thickness:    0.2
    });

    // Main tube
    const bodyGeo = new THREE.CylinderGeometry(0.038, 0.028, 0.65, 20);
    this._body    = new THREE.Mesh(bodyGeo, glassMat);
    this.group.add(this._body);

    // Rubber bulb
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.75 });
    const bulbGeo   = new THREE.SphereGeometry(0.072, 20, 14);
    const bulb      = new THREE.Mesh(bulbGeo, rubberMat);
    bulb.scale.y    = 0.85;
    bulb.position.y = 0.38;
    this.group.add(bulb);

    // Tip cone
    const tipGeo = new THREE.ConeGeometry(0.028, 0.12, 16);
    const tip    = new THREE.Mesh(tipGeo, glassMat);
    tip.position.y = -0.385;
    this.group.add(tip);

    // Liquid inside dropper (coloured)
    this._innerMat = new THREE.MeshStandardMaterial({
      color:       0x88ccff,
      transparent: true,
      opacity:     0.65
    });
    const innerGeo = new THREE.CylinderGeometry(0.022, 0.016, 0.42, 16);
    this._innerMesh = new THREE.Mesh(innerGeo, this._innerMat);
    this._innerMesh.position.y = 0.05;
    this.group.add(this._innerMesh);

    // ── Stream group (drop particles) ─────────────────────────────────────
    this._streamGroup = new THREE.Group();
    this.group.add(this._streamGroup);
  }

  /**
   * Move dropper to world position, then fire drops, then return home.
   * @param {{ x, y, z }} targetPos   - position above the test tube
   * @param {string}       hexColour  - reagent colour
   * @param {number}       drops      - number of drops to animate
   * @param {Function}     onComplete - called after last drop lands
   */
  dispense(targetPos, hexColour, drops = 4, onComplete) {
    const col = new THREE.Color(hexColour);

    // Colour the inner liquid
    gsap.to(this._innerMat.color, { r: col.r, g: col.g, b: col.b, duration: 0.3 });

    // Move to target
    gsap.to(this.group.position, {
      x: targetPos.x, y: targetPos.y, z: targetPos.z,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        // Squeeze bulb animation
        gsap.to(this._body.scale, { y: 0.92, duration: 0.1, yoyo: true, repeat: drops * 2 - 1 });

        // Fire drops sequentially
        let fired = 0;
        const fireNext = () => {
          if (fired >= drops) {
            // Return home
            gsap.to(this.group.position, {
              x: this.homePos.x, y: this.homePos.y, z: this.homePos.z,
              duration: 0.6,
              ease: 'power2.inOut',
              onComplete
            });
            return;
          }
          this._fireDrop(hexColour, () => {
            fired++;
            setTimeout(fireNext, 180);
          });
        };
        setTimeout(fireNext, 200);
      }
    });
  }

  /** Animate a single drop falling from the tip. */
  _fireDrop(hexColour, onComplete) {
    const col = new THREE.Color(hexColour);
    const mat = new THREE.MeshStandardMaterial({
      color:       col,
      transparent: true,
      opacity:     0.88,
      roughness:   0.05,
      emissive:    col,
      emissiveIntensity: 0.2
    });

    // Elongated drop shape
    const geo  = new THREE.SphereGeometry(0.018, 10, 8);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.y = 1.6;
    mesh.position.set(0, -0.45, 0);   // tip position in local space
    this._streamGroup.add(mesh);

    gsap.to(mesh.position, {
      y: -1.1,
      duration: 0.38,
      ease: 'power2.in',
      onComplete: () => {
        this._streamGroup.remove(mesh);
        if (onComplete) onComplete();
      }
    });
    gsap.to(mat, { opacity: 0, duration: 0.38, delay: 0.2 });
  }

  /** Legacy single-drop API (used by water addition). */
  drop(hexColour = '#88ccff', onComplete) {
    this._fireDrop(hexColour, onComplete);
  }

  /** Legacy moveTo API. */
  moveTo(pos, onComplete) {
    gsap.to(this.group.position, {
      x: pos.x, y: pos.y, z: pos.z,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete
    });
  }

  /** Return dropper to home position. */
  returnHome(onComplete) {
    gsap.to(this.group.position, {
      x: this.homePos.x, y: this.homePos.y, z: this.homePos.z,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete
    });
  }
}
