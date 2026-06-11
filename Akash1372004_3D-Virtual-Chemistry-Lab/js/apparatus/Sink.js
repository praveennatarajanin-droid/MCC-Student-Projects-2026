/**
 * Sink.js — Simplified Virtual-Lab Style Black Sink
 * Replaces the complex chemistry sink with the simple black rectangular basin sink
 * seen in the C:\virtual-lab environment and user screenshot.
 *
 * Features:
 *  - Clickable Cold Knob (blue) & Hot Knob (red) on a single gooseneck faucet.
 *  - Self-contained mouse hover and click raycasting detection.
 *  - Animated flowing water stream from the single nozzle.
 *  - Physics-based gravity splash particles at the drain.
 *  - Expanding & fading drain ripple sprite.
 *  - Rising steam particles (when Hot is turned on).
 *  - Smooth handle rotation animations.
 */

class LabSink {
  constructor(scene, position) {
    this.scene = scene;
    this.pos = position || { x: 3.2, y: 0, z: 0.3 };
    this.group = new THREE.Group();

    // Interaction states
    this.isColdOn = false;
    this.isHotOn = false;
    this.coldTargetAngle = 0;
    this.hotTargetAngle = 0;
    this.coldCurrentAngle = 0;
    this.hotCurrentAngle = 0;

    // References for animations
    this.coldKnobGroup = null;
    this.hotKnobGroup = null;
    this.streamMesh = null;
    this.rippleMesh = null;
    this.splashParticles = null;
    this.steamParticles = null;

    // Raycasting & input detection
    this.interactiveObjects = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.canvas = null;
    this.camera = null;

    // Build sink assets
    this._build();

    // Add to scene and position
    scene.add(this.group);
    this.group.position.set(this.pos.x, this.pos.y, this.pos.z);

    // Bind interaction events
    this._onPointerDown = this.onPointerDown.bind(this);
    this._onPointerMove = this.onPointerMove.bind(this);
    window.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
  }

  _build() {
    const g = this.group;

    // ── Materials ────────────────────────────────────────────────────────
    const basinMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c0d, roughness: 0.6, metalness: 0.1
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xb0b0b0, metalness: 1.0, roughness: 0.25
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x1f1f1f
    });
    const blueCapMat = new THREE.MeshBasicMaterial({
      color: 0x3d7eff
    });
    const redCapMat = new THREE.MeshBasicMaterial({
      color: 0xff3b30
    });

    // ── Basin Outer Dimensions: 1.6 x 0.35 x 1.1 ───────────────────────
    // Outer Bottom Plate
    const bottomPlate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 1.1), basinMat);
    bottomPlate.position.set(0, 0.025, 0);
    bottomPlate.receiveShadow = true;
    g.add(bottomPlate);

    // Basin Walls (height 0.35, thickness 0.05)
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.05), basinMat);
    frontWall.position.set(0, 0.175, 0.525);
    frontWall.castShadow = frontWall.receiveShadow = true;
    g.add(frontWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.05), basinMat);
    backWall.position.set(0, 0.175, -0.525);
    backWall.castShadow = backWall.receiveShadow = true;
    g.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 1.1), basinMat);
    leftWall.position.set(-0.775, 0.175, 0);
    leftWall.castShadow = leftWall.receiveShadow = true;
    g.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 1.1), basinMat);
    rightWall.position.set(0.775, 0.175, 0);
    rightWall.castShadow = rightWall.receiveShadow = true;
    g.add(rightWall);

    // ── Metallic Drain and Hole ──────────────────────────────────────────
    const drainRing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.01, 32), steelMat);
    drainRing.position.set(0, 0.05, -0.075);
    drainRing.receiveShadow = true;
    g.add(drainRing);

    const drainHole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 32), blackMat);
    drainHole.position.set(0, 0.051, -0.075);
    g.add(drainHole);

    // ── Faucet Group (placed on the back wall) ───────────────────────────
    const faucetGroup = new THREE.Group();
    faucetGroup.position.set(0, 0.35, -0.525);
    g.add(faucetGroup);

    // Faucet Base
    const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 32), steelMat);
    faucetBase.position.y = 0.04;
    faucetGroup.add(faucetBase);

    // Vertical Stand
    const verticalStand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 32), steelMat);
    verticalStand.position.y = 0.44;
    verticalStand.castShadow = true;
    faucetGroup.add(verticalStand);

    // Gooseneck Curve (Torus)
    const curveRadius = 0.225;
    const curveGeom = new THREE.TorusGeometry(curveRadius, 0.035, 16, 64, Math.PI);
    const curve = new THREE.Mesh(curveGeom, steelMat);
    curve.position.set(0, 0.84, curveRadius);
    curve.rotation.y = Math.PI / 2;
    curve.castShadow = true;
    faucetGroup.add(curve);

    // Nozzle
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 32), steelMat);
    nozzle.position.set(0, 0.84, curveRadius * 2);
    nozzle.castShadow = true;
    faucetGroup.add(nozzle);

    // Register faucet body elements as clickable for toggling cold water
    verticalStand.userData = { isSinkKnob: true, type: 'cold' };
    curve.userData = { isSinkKnob: true, type: 'cold' };
    nozzle.userData = { isSinkKnob: true, type: 'cold' };
    this.interactiveObjects.push(verticalStand, curve, nozzle);

    // Knob Shafts
    const leftShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 16), steelMat);
    leftShaft.rotation.z = Math.PI / 2;
    leftShaft.position.set(-0.08, 0.15, 0);
    faucetGroup.add(leftShaft);

    const rightShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 16), steelMat);
    rightShaft.rotation.z = Math.PI / 2;
    rightShaft.position.set(0.08, 0.15, 0);
    faucetGroup.add(rightShaft);

    // Cold Knob Group
    this.coldKnobGroup = new THREE.Group();
    this.coldKnobGroup.position.set(-0.13, 0.15, 0);
    faucetGroup.add(this.coldKnobGroup);

    // Hot Knob Group
    this.hotKnobGroup = new THREE.Group();
    this.hotKnobGroup.position.set(0.13, 0.15, 0);
    faucetGroup.add(this.hotKnobGroup);

    const tBarGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.14, 16);

    // Cold T-Bar + Blue Cap
    const coldTBar = new THREE.Mesh(tBarGeom, steelMat);
    this.coldKnobGroup.add(coldTBar);
    const coldCap = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), blueCapMat);
    coldCap.position.y = 0.07;
    this.coldKnobGroup.add(coldCap);

    coldTBar.userData = { isSinkKnob: true, type: 'cold' };
    coldCap.userData = { isSinkKnob: true, type: 'cold' };
    this.interactiveObjects.push(coldTBar, coldCap);

    // Hot T-Bar + Red Cap
    const hotTBar = new THREE.Mesh(tBarGeom, steelMat);
    this.hotKnobGroup.add(hotTBar);
    const hotCap = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), redCapMat);
    hotCap.position.y = 0.07;
    this.hotKnobGroup.add(hotCap);

    hotTBar.userData = { isSinkKnob: true, type: 'hot' };
    hotCap.userData = { isSinkKnob: true, type: 'hot' };
    this.interactiveObjects.push(hotTBar, hotCap);

    // ── Water Stream (single nozzle at z = -0.075 relative to center) ─────
    const streamHeight = 1.09;
    const streamGeom = new THREE.CylinderGeometry(0.02, 0.03, streamHeight, 16, 1, true);
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x5cd6ff, transparent: true, opacity: 0.0,
      roughness: 0.1, metalness: 0.1, emissive: 0x114466, emissiveIntensity: 0.5
    });

    this.streamMesh = new THREE.Mesh(streamGeom, this.waterMat);
    this.streamMesh.position.set(0, 0.595, -0.075);
    this.streamMesh.visible = false;
    g.add(this.streamMesh);

    // ── Splash Ripple ring mesh ──────────────────────────────────────────
    const rippleGeom = new THREE.RingGeometry(0.02, 0.15, 32);
    this.rippleMat = new THREE.MeshBasicMaterial({
      color: 0xdcf4ff, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false
    });
    this.rippleMesh = new THREE.Mesh(rippleGeom, this.rippleMat);
    this.rippleMesh.position.set(0, 0.055, -0.075);
    this.rippleMesh.rotation.x = -Math.PI / 2;
    this.rippleMesh.visible = false;
    g.add(this.rippleMesh);

    // ── Splash Particles ─────────────────────────────────────────────────
    this.splash = this._createSplashParticles(0, 0.055, -0.075, 0xdcf4ff);
    g.add(this.splash.points);
    this.splashParticles = this.splash.points;

    // ── Steam Particles (for Hot water) ──────────────────────────────────
    this.steam = this._createSteamParticles(0, 0.1, -0.075);
    g.add(this.steam.points);
    this.steamParticles = this.steam.points;
  }

  _makeSoftParticleTex() {
    const s = 16, cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const ctx = cv.getContext('2d');
    const r = s / 2;
    const g = ctx.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(cv);
  }

  _createSplashParticles(x, y, z, colorHex) {
    const splashCount = 20;
    const positions = new Float32Array(splashCount * 3);
    const velocities = [];

    for (let i = 0; i < splashCount; i++) {
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      velocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: Math.random() * 0.8 + 0.3,
        z: (Math.random() - 0.5) * 0.4
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.02,
      map: this._makeSoftParticleTex(),
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    points.visible = false;

    return { points, geometry, positions, velocities, origin: { x, y, z } };
  }

  _createSteamParticles(x, y, z) {
    const steamCount = 15;
    const positions = new Float32Array(steamCount * 3);
    const velocities = [];

    for (let i = 0; i < steamCount; i++) {
      positions[i * 3] = x + (Math.random() - 0.5) * 0.15;
      positions[i * 3 + 1] = y + Math.random() * 0.1;
      positions[i * 3 + 2] = z + (Math.random() - 0.5) * 0.15;
      velocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: 0.15 + Math.random() * 0.15,
        z: (Math.random() - 0.5) * 0.05
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xe2eef4,
      size: 0.05,
      map: this._makeSoftParticleTex(),
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    points.visible = false;

    return { points, geometry, positions, velocities, origin: { x, y, z } };
  }

  toggleWater(type) {
    if (type === 'cold') {
      this.isColdOn = !this.isColdOn;
      this.coldTargetAngle = this.isColdOn ? Math.PI / 2 : 0;
    } else if (type === 'hot') {
      this.isHotOn = !this.isHotOn;
      this.hotTargetAngle = this.isHotOn ? Math.PI / 2 : 0;
    }
  }

  onPointerDown(event) {
    if (event.button !== 0) return;
    if (!this.canvas) {
      this.canvas = document.getElementById('lab-canvas') || document.getElementById('ft-canvas');
      if (!this.canvas) return;
    }
    if (!this.camera) {
      this.camera = window.camera || window.ftCamera;
      if (!this.camera) return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.mouse.set(x, y);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
    if (intersects.length > 0) {
      let picked = intersects[0].object;
      while (picked && picked !== this.group) {
        if (picked.userData && picked.userData.isSinkKnob) {
          this.toggleWater(picked.userData.type);
          break;
        }
        picked = picked.parent;
      }
    }
  }

  onPointerMove(event) {
    if (!this.canvas) {
      this.canvas = document.getElementById('lab-canvas') || document.getElementById('ft-canvas');
      if (!this.canvas) return;
    }
    if (!this.camera) {
      this.camera = window.camera || window.ftCamera;
      if (!this.camera) return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.mouse.set(x, y);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
    }
  }

  turnOn() {
    if (!this.isColdOn) {
      this.toggleWater('cold');
    }
  }

  turnOff() {
    if (this.isColdOn) {
      this.toggleWater('cold');
    }
    if (this.isHotOn) {
      this.toggleWater('hot');
    }
  }

  update(t) {
    const dt = 0.016;

    // 1. Knob rotations
    this.coldCurrentAngle += (this.coldTargetAngle - this.coldCurrentAngle) * 0.15;
    if (this.coldKnobGroup) {
      this.coldKnobGroup.rotation.x = this.coldCurrentAngle;
    }

    this.hotCurrentAngle += (this.hotTargetAngle - this.hotCurrentAngle) * 0.15;
    if (this.hotKnobGroup) {
      this.hotKnobGroup.rotation.x = this.hotCurrentAngle;
    }

    const isWaterFlowing = this.isColdOn || this.isHotOn;

    // 2. Animate Water Stream
    if (this.streamMesh) {
      if (isWaterFlowing) {
        this.streamMesh.visible = true;
        const scaleX = 1.0 + Math.sin(t * 12) * 0.08;
        const scaleZ = 1.0 + Math.cos(t * 10) * 0.08;
        this.streamMesh.scale.set(scaleX, 1.0, scaleZ);
        this.streamMesh.material.opacity = 0.55 + Math.sin(t * 15) * 0.1;

        // Blended colors
        if (this.isColdOn && this.isHotOn) {
          this.streamMesh.material.color.setHex(0xe8f7ff);
        } else if (this.isHotOn) {
          this.streamMesh.material.color.setHex(0xfff2f0);
        } else {
          this.streamMesh.material.color.setHex(0x5cd6ff);
        }
      } else {
        if (this.streamMesh.material.opacity > 0.01) {
          this.streamMesh.material.opacity -= 0.15;
        } else {
          this.streamMesh.visible = false;
        }
      }
    }

    // 3. Animate Ripple
    if (this.rippleMesh) {
      if (isWaterFlowing) {
        this.rippleMesh.visible = true;
        const ripScale = 1.0 + Math.sin(t * 8) * 0.25;
        this.rippleMesh.scale.set(ripScale, ripScale, 1.0);
        this.rippleMat.opacity = 0.45 + Math.sin(t * 8) * 0.15;
      } else {
        if (this.rippleMat.opacity > 0.01) {
          this.rippleMat.opacity -= 0.15;
        } else {
          this.rippleMesh.visible = false;
        }
      }
    }

    // 4. Update Splash Particles
    if (this.splash) {
      if (isWaterFlowing) {
        this.splashParticles.visible = true;
        this.splash.points.material.opacity = 0.8;
        const pos = this.splash.positions;
        const vels = this.splash.velocities;
        const orig = this.splash.origin;

        for (let i = 0; i < vels.length; i++) {
          pos[i * 3] += vels[i].x * dt;
          pos[i * 3 + 1] += vels[i].y * dt;
          pos[i * 3 + 2] += vels[i].z * dt;

          vels[i].y -= 4.0 * dt; // gravity

          if (pos[i * 3 + 1] < orig.y) {
            pos[i * 3] = orig.x;
            pos[i * 3 + 1] = orig.y;
            pos[i * 3 + 2] = orig.z;
            vels[i].x = (Math.random() - 0.5) * 0.4;
            vels[i].y = Math.random() * 0.8 + 0.3;
            vels[i].z = (Math.random() - 0.5) * 0.4;
          }
        }
        this.splash.geometry.attributes.position.needsUpdate = true;
      } else {
        if (this.splash.points.material.opacity > 0.01) {
          this.splash.points.material.opacity -= 0.15;
        } else {
          this.splashParticles.visible = false;
        }
      }
    }

    // 5. Update Steam Particles (only if Hot is on)
    if (this.steam) {
      if (this.isHotOn) {
        this.steamParticles.visible = true;
        this.steam.points.material.opacity = 0.25;
        const pos = this.steam.positions;
        const vels = this.steam.velocities;
        const orig = this.steam.origin;

        for (let i = 0; i < vels.length; i++) {
          pos[i * 3] += vels[i].x * dt;
          pos[i * 3 + 1] += vels[i].y * dt;
          pos[i * 3 + 2] += vels[i].z * dt;

          if (pos[i * 3 + 1] > orig.y + 0.35) {
            pos[i * 3] = orig.x + (Math.random() - 0.5) * 0.15;
            pos[i * 3 + 1] = orig.y + Math.random() * 0.1;
            pos[i * 3 + 2] = orig.z + (Math.random() - 0.5) * 0.15;
            vels[i].x = (Math.random() - 0.5) * 0.05;
            vels[i].y = 0.15 + Math.random() * 0.15;
            vels[i].z = (Math.random() - 0.5) * 0.05;
          }
        }
        this.steam.geometry.attributes.position.needsUpdate = true;
      } else {
        if (this.steam.points.material.opacity > 0.01) {
          this.steam.points.material.opacity -= 0.05;
        } else {
          this.steamParticles.visible = false;
        }
      }
    }
  }
}
