/**
 * QuizPanel.js
 * Two-stage quiz:
 *   Stage A — student submits their colour observation + inference
 *   Stage B — student identifies the metal ion
 */

const QuizPanel = (() => {

  let _onColourSubmit = null;
  let _onIdentify     = null;

  function initColourSubmit(onSubmit) {
    _onColourSubmit = onSubmit;
    const btn = document.getElementById('btn-submit-colour');
    if (btn) btn.addEventListener('click', () => {
      const colour = ObservationPanel.getSelectedColour();
      if (!colour) {
        showFieldError('colour-picker', 'Please select a colour first.');
        return;
      }
      if (_onColourSubmit) _onColourSubmit(colour);
    });
  }

  function showColourSubmit() {
    const panel = document.getElementById('colour-submit-panel');
    if (panel) panel.classList.remove('hidden');
  }

  function hideColourSubmit() {
    const panel = document.getElementById('colour-submit-panel');
    if (panel) panel.classList.add('hidden');
  }

  // ── Identification panel ──────────────────────────────────────────────
  function show(onAnswer) {
    _onIdentify = onAnswer;
    document.getElementById('id-panel').classList.remove('hidden');
    document.querySelectorAll('.id-btn').forEach(btn => {
      btn.classList.remove('correct', 'wrong');
      btn.disabled = false;
    });
  }

  function hide() {
    document.getElementById('id-panel').classList.add('hidden');
  }

  function markResult(guessedIon, correctIon) {
    document.querySelectorAll('.id-btn').forEach(btn => {
      const ion = btn.dataset.ion;
      if (ion === correctIon)                          btn.classList.add('correct');
      else if (ion === guessedIon && ion !== correctIon) btn.classList.add('wrong');
      btn.disabled = true;
    });
  }

  function init() {
    document.querySelectorAll('.id-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (_onIdentify) _onIdentify(btn.dataset.ion);
      });
    });
  }

  function showFieldError(fieldId, msg) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.style.borderColor = '#fc8181';
    setTimeout(() => { el.style.borderColor = ''; }, 2000);
    // showHint is defined in main.js (loaded after this file)
    if (typeof showHint === 'function') showHint(msg, 3000);
  }

  return { init, initColourSubmit, showColourSubmit, hideColourSubmit, show, hide, markResult };
})();
