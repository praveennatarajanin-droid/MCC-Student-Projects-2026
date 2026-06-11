/**
 * Scoring.js — RSC marking scheme
 *
 * Task                         Marks
 * ────────────────────────────────────
 * Select diagnostic reagent      10   (NaOH or NH₃ = 10, others = 5)
 * Record colour observation       10   (awarded when student submits colour)
 * Write correct inference         20   (awarded when student submits inference)
 * Final correct identification    60
 * ────────────────────────────────────
 * Total                          100
 *
 * Colour and inference marks are only awarded when the student
 * actively submits them — NOT automatically from the reaction.
 */

const Scoring = (() => {

  const MAX = { reagent: 10, colour: 10, inference: 20, identify: 60 };

  let marks = { reagent: 0, colour: 0, inference: 0, identify: 0 };
  let _reagentAwarded   = false;
  let _colourAwarded    = false;
  let _inferenceAwarded = false;

  function reset() {
    marks = { reagent: 0, colour: 0, inference: 0, identify: 0 };
    _reagentAwarded = _colourAwarded = _inferenceAwarded = false;
    _updateDisplay();
  }

  /** Called when student picks a reagent. */
  function awardReagent(reagentId) {
    if (_reagentAwarded) return;
    _reagentAwarded = true;
    const diagnostic = ['NaOH', 'NH3'];
    marks.reagent = diagnostic.includes(reagentId) ? MAX.reagent : 5;
    _updateDisplay();
    return marks.reagent;
  }

  /**
   * Called when student submits their colour observation.
   * @param {string} studentColour  - what the student typed/selected
   * @param {string} correctColour  - actual solution colour label
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
   * Called when student submits their inference.
   * @param {string} studentIon   - e.g. 'copper'
   * @param {string} correctIon   - actual salt id
   */
  function awardInference(studentIon, correctIon) {
    if (_inferenceAwarded) return 0;
    _inferenceAwarded = true;
    marks.inference = studentIon === correctIon ? MAX.inference : 0;
    _updateDisplay();
    return marks.inference;
  }

  /**
   * Called on final identification submit.
   * @param {string} guessedIon
   * @param {string} correctIon
   * @returns {boolean} correct
   */
  function awardIdentify(guessedIon, correctIon) {
    marks.identify = guessedIon === correctIon ? MAX.identify : 0;
    _updateDisplay();
    return marks.identify === MAX.identify;
  }

  function total()        { return marks.reagent + marks.colour + marks.inference + marks.identify; }
  function getBreakdown() { return { ...marks, total: total(), max: 100 }; }

  function _updateDisplay() {
    const el = document.getElementById('score-val');
    if (el) el.textContent = total();
  }

  return { reset, awardReagent, awardColour, awardInference, awardIdentify, total, getBreakdown };
})();
