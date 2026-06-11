/**
 * controls.js
 * Orbit-style camera controls implemented without external dependencies.
 * Supports mouse drag to orbit, scroll to zoom, right-drag to pan.
 */

class OrbitControls {
  /**
   * @param {THREE.Camera} camera
   * @param {HTMLElement}  domElement
   */
  constructor(camera, domElement) {
    this.camera     = camera;
    this.domElement = domElement;

    // Spherical coordinates
    this.theta  = 0;          // horizontal angle (radians)
    this.phi    = Math.PI / 4; // vertical angle
    this.radius = 7;

    this.target = new THREE.Vector3(0, 0.5, 0);

    // Limits
    this.minRadius = 3;
    this.maxRadius = 14;
    this.minPhi    = 0.15;
    this.maxPhi    = Math.PI / 2.1;

    // Drag state
    this._dragging   = false;
    this._panning    = false;
    this._lastX      = 0;
    this._lastY      = 0;

    this._bindEvents();
    this._update();
  }

  _bindEvents() {
    const el = this.domElement;
    el.addEventListener('mousedown',  e => this._onMouseDown(e));
    el.addEventListener('mousemove',  e => this._onMouseMove(e));
    el.addEventListener('mouseup',    ()  => { this._dragging = false; this._panning = false; });
    el.addEventListener('mouseleave', ()  => { this._dragging = false; this._panning = false; });
    el.addEventListener('wheel',      e => this._onWheel(e), { passive: false });
    el.addEventListener('contextmenu', e => e.preventDefault());

    // Touch support
    el.addEventListener('touchstart', e => this._onTouchStart(e), { passive: false });
    el.addEventListener('touchmove',  e => this._onTouchMove(e),  { passive: false });
    el.addEventListener('touchend',   ()  => { this._dragging = false; });
  }

  _onMouseDown(e) {
    if (e.button === 0) { this._dragging = true; this._panning = false; }
    if (e.button === 2) { this._panning  = true; this._dragging = false; }
    this._lastX = e.clientX;
    this._lastY = e.clientY;
  }

  _onMouseMove(e) {
    const dx = e.clientX - this._lastX;
    const dy = e.clientY - this._lastY;
    this._lastX = e.clientX;
    this._lastY = e.clientY;

    if (this._dragging) {
      this.theta -= dx * 0.01;
      this.phi    = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi - dy * 0.01));
      this._update();
    }
    if (this._panning) {
      const panSpeed = 0.005 * this.radius;
      this.target.x -= dx * panSpeed;
      this.target.y += dy * panSpeed;
      this._update();
    }
  }

  _onWheel(e) {
    e.preventDefault();
    this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius + e.deltaY * 0.01));
    this._update();
  }

  _onTouchStart(e) {
    if (e.touches.length === 1) {
      this._dragging = true;
      this._lastX = e.touches[0].clientX;
      this._lastY = e.touches[0].clientY;
    }
  }

  _onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && this._dragging) {
      const dx = e.touches[0].clientX - this._lastX;
      const dy = e.touches[0].clientY - this._lastY;
      this._lastX = e.touches[0].clientX;
      this._lastY = e.touches[0].clientY;
      this.theta -= dx * 0.01;
      this.phi    = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi - dy * 0.01));
      this._update();
    }
  }

  _update() {
    const x = this.target.x + this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.target.y + this.radius * Math.cos(this.phi);
    const z = this.target.z + this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }
}
