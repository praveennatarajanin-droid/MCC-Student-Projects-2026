/**
 * FlameObservation.js
 * Manages the student's observation log for the flame test.
 */

const FlameObservation = (() => {

  let observations = [];

  function record(entry) {
    observations.push({ timestamp: new Date().toLocaleTimeString(), ...entry });
    _render();
  }

  function reset() {
    observations = [];
    _render();
  }

  function getAll() { return [...observations]; }

  function _render() {
    const el = document.getElementById('ft-notebook-entries');
    if (!el) return;
    if (!observations.length) {
      el.innerHTML = '<em>No entries yet.</em>';
      return;
    }
    el.innerHTML = observations.map((o, i) => `
      <div class="nb-entry">
        <b>#${i + 1}</b> <span class="nb-time">[${o.timestamp}]</span><br>
        ${o.step      ? `<span class="nb-step">${o.step}</span><br>` : ''}
        ${o.colour    ? `Flame: <span>${o.colour}</span><br>` : ''}
        ${o.inference ? `Inference: <span>${o.inference}</span>` : ''}
      </div>`).join('');
  }

  return { record, reset, getAll };
})();
