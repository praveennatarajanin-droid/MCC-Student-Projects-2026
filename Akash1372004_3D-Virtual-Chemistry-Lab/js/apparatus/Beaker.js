/**
 * Beaker.js
 * A 3-D glass beaker used as the wash / water vessel.
 */

class Beaker {
  /**
   * @param {THREE.Scene} scene
   * @param {{ x, y, z }} position
   */
  constructor(scene, position = { x: 0, y: 0, z: 0 }) {
    this.scene = scene;
    this.group = new THREE.Group();
    this._build();
    scene.add(this.group);
    this.group.position.set(position.x, position.y, position.z);
  }

  _build() {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color:        0xaaddff,
      transparent:  true,
      opacity:      0.22,
      roughness:    0.05,
      metalness:    0.0,
      transmission: 0.85,
      thickness:    0.4,
      side:         THREE.DoubleSide
    });

    // Outer cylinder (open top)
    const outerGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.7, 32, 1, true);
    const outer    = new THREE.Mesh(outerGeo, glassMat);
    outer.castShadow = true;
    this.group.add(outer);

    // Bottom disc
    const bottomGeo = new THREE.CircleGeometry(0.24, 32);
    const bottom    = new THREE.Mesh(bottomGeo, glassMat);
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -0.35;
    this.group.add(bottom);

    // Water inside
    const waterMat = new THREE.MeshStandardMaterial({
      color:       0x88ccff,
      transparent: true,
      opacity:     0.45,
      roughness:   0.1
    });
    const waterGeo = new THREE.CylinderGeometry(0.22, 0.20, 0.3, 32);
    const water    = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = -0.2;
    this.group.add(water);

    // Label strip
    const labelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    const labelGeo = new THREE.PlaneGeometry(0.25, 0.12);
    const label    = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(0.25, 0.05, 0);
    label.rotation.y = -Math.PI / 2;
    this.group.add(label);
  }
}
