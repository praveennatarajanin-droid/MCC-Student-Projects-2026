/**
 * Rack.js
 * Builds the 3-D test-tube rack using Three.js primitives.
 */

class Rack {
  /**
   * @param {THREE.Scene} scene
   * @param {{ x, y, z }} position
   */
  constructor(scene, position = { x: 0, y: 0, z: 0 }) {
    this.scene    = scene;
    this.position = position;
    this.group    = new THREE.Group();
    this._build();
    scene.add(this.group);
  }

  _build() {
    const wood = new THREE.MeshStandardMaterial({
      color: 0x8B5E3C,
      roughness: 0.85,
      metalness: 0.0
    });

    // ── Base plate ──────────────────────────────────────────────────────
    const baseGeo = new THREE.BoxGeometry(2.8, 0.12, 0.7);
    const base    = new THREE.Mesh(baseGeo, wood);
    base.position.set(0, 0, 0);
    base.receiveShadow = true;
    this.group.add(base);

    // ── Top bar ─────────────────────────────────────────────────────────
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 0.7), wood);
    topBar.position.set(0, 1.1, 0);
    topBar.castShadow = true;
    this.group.add(topBar);

    // ── Side uprights ────────────────────────────────────────────────────
    [-1.3, 1.3].forEach(x => {
      const upright = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.7), wood);
      upright.position.set(x, 0.55, 0);
      upright.castShadow = true;
      this.group.add(upright);
    });

    // ── Holes in top bar (visual only — cylinders punched through) ───────
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 1 });
    const holePositions = [-1.0, -0.5, 0, 0.5, 1.0];
    holePositions.forEach(x => {
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 16), holeMat);
      hole.position.set(x, 1.1, 0);
      this.group.add(hole);
    });

    // ── Position the whole group ─────────────────────────────────────────
    this.group.position.set(this.position.x, this.position.y, this.position.z);
  }
}
