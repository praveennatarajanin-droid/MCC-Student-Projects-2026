/**
 * Reactions.js
 * Pure chemistry logic — no side effects, no DOM.
 */

const Reactions = (() => {

  function react(saltId, reagentId) {
    const salt   = SaltDatabase.getSalt(saltId);
    const reagent = SaltDatabase.getReagent(reagentId);
    if (!salt || !reagent) {
      console.warn('[Reactions] Unknown salt or reagent:', saltId, reagentId);
      return null;
    }
    const r = salt.reagentResults[reagentId];
    return {
      saltId,
      reagentId,
      hex:          r.hex,
      precipitate:  r.precipitate,
      precipHex:    r.precipHex || null,
      label:        r.label,
      inference:    r.inference,
      solutionHex:  salt.solutionHex,
      solutionLabel: salt.solutionLabel,
      ionName:      salt.ion,
      saltName:     salt.name
    };
  }

  function dissolve(saltId) {
    const salt = SaltDatabase.getSalt(saltId);
    if (!salt) return null;
    return {
      hex:   salt.solutionHex,
      label: salt.solutionLabel
      // NOTE: inference is intentionally NOT returned here —
      // the student must deduce it themselves from the colour.
    };
  }

  return { react, dissolve };
})();
