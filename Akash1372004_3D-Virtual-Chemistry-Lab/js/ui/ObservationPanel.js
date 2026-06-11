/**
 * ObservationPanel.js
 * Shows live colour/volume data.
 * Student must SELECT their colour observation (not auto-filled).
 */

const ObservationPanel = (() => {

  // Colour options the student can pick from
  const COLOUR_OPTIONS = [
    { label: 'Blue',                  hex: '#1a7fff' },
    { label: 'Green',                 hex: '#00aa44' },
    { label: 'Pink',                  hex: '#ff5fa0' },
    { label: 'Pale Pink / Flesh',     hex: '#c8a27d' },
    { label: 'Yellow / Orange-Brown', hex: '#cc6600' },
    { label: 'White / Colourless',    hex: '#e8e8e8' },
    { label: 'Deep Blue',             hex: '#0a3a8a' },
    { label: 'Blue-Green',            hex: '#007a2f' },
    { label: 'Rust-Brown',            hex: '#aa4400' },
    { label: 'No Change',             hex: '#888888' }
  ];

  let _selectedColour = null;
  let _onColourSelect = null;

  /** Populate the colour picker dropdown. */
  function initColourPicker(onSelect) {
    _onColourSelect = onSelect;
    const sel = document.getElementById('colour-picker');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Select colour —</option>';
    COLOUR_OPTIONS.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.label;
      opt.textContent = c.label;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      _selectedColour = sel.value;
      const found = COLOUR_OPTIONS.find(c => c.label === _selectedColour);
      const swatch = document.getElementById('colour-swatch-live');
      if (swatch && found) swatch.style.background = found.hex;
      if (_onColourSelect) _onColourSelect(_selectedColour);
    });
  }

  /** Update the live volume display. */
  function updateVolume(vol) {
    const el = document.getElementById('obs-volume');
    if (el) el.textContent = vol;
  }

  /** Show the actual colour after reaction (for reference after student submits). */
  function revealColour(label, hexColour) {
    const el = document.getElementById('obs-actual-colour');
    if (el) {
      const swatch = hexColour
        ? `<span class="colour-swatch" style="background:${hexColour}"></span>`
        : '';
      el.innerHTML = `${swatch}${label}`;
    }
  }

  /** Show inference text. */
  function revealInference(text) {
    const el = document.getElementById('obs-inference');
    if (el) el.textContent = text;
  }

  /** Show reagent result label. */
  function revealResult(label) {
    const el = document.getElementById('obs-result');
    if (el) el.textContent = label;
  }

  function clear() {
    _selectedColour = null;
    const sel = document.getElementById('colour-picker');
    if (sel) sel.value = '';
    const swatch = document.getElementById('colour-swatch-live');
    if (swatch) swatch.style.background = 'transparent';
    const els = ['obs-actual-colour','obs-inference','obs-result','obs-volume'];
    els.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
  }

  function getSelectedColour() { return _selectedColour; }

  return { initColourPicker, updateVolume, revealColour, revealInference, revealResult, clear, getSelectedColour };
})();
