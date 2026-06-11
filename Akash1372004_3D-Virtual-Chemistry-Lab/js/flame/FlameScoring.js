
/**
 * FlameScoring.js — RSC marking scheme for Flame Test
 *
 * Task                              Marks
 * ─────────────────────────────────────────
 * Correct HCl paste preparation       10
 * Correct flame colour observation     30
 * Correct inference from colour        20
 * Final correct identification         40
 * ─────────────────────────────────────────
 * Total                               100
 */

const FlameScoring = (() => {

  const MAX = { paste: 10, colour: 30, inference: 20, identify: 40 };
  let marks = { paste: 0, colour: 0, inference: 0, identify: 0 };
  let _colourAwarded = false;
  let _inferenceAwarded = false;

  function reset() {
    marks = { paste: 0, colour: 0, inference: 0, identify: 0 };
    _colourAwarded = _inferenceAwarded = false;
    _updateDisplay();
  }

  /** Awarded when student correctly makes the HCl paste (always 10 if they proceed). */
  function awardPaste() {
    marks.paste = MAX.paste;
    _updateDisplay();
    return marks.paste;
  }

  /**
   * Awarded when student submits their flame colour observation.
   * @param {string} studentColour  - label student selected
   * @param {string} correctColour  - actual flame colour label
   */
  function awardColour(studentColour, correctColour) {
    if (_colourAwarded) return 0;
    _colourAwarded = true;
    const match = studentColour.trim().toLowerCase() === correctColour.trim().toLowerCase();
    marks.colour = match ? MAX.colour : 0;
    _updateDisplay();
    return marks.colour;
  }

  /**
   * Awarded when student submits their inference.
   * @param {string} studentId   - substance id guessed
   * @param {string} correctId   - actual substance id
   */
  function awardInference(studentId, correctId) {
    if (_inferenceAwarded) return 0;
    _inferenceAwarded = true;
    marks.inference = studentId === correctId ? MAX.inference : 0;
    _updateDisplay();
    return marks.inference;
  }

  function awardIdentify(guessedId, correctId) {
    marks.identify = guessedId === correctId ? MAX.identify : 0;
    _updateDisplay();
    return marks.identify === MAX.identify;
  }

  function total()        { return marks.paste + marks.colour + marks.inference + marks.identify; }
  function getBreakdown() { return { ...marks, total: total(), max: 100 }; }

  function _updateDisplay() {
    const el = document.getElementById('score-val');
    if (el) el.textContent = total();
  }

  return { reset, awardPaste, awardColour, awardInference, awardIdentify, total, getBreakdown };
})();
