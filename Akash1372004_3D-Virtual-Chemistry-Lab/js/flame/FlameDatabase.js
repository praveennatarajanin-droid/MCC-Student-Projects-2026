/**
 * FlameDatabase.js — Realistic flame colours (RSC Flame Test)
 *
 * Colours are tuned to match real laboratory observations:
 *   - Mixed with the orange Bunsen base (not pure saturated hues)
 *   - Borate/Barium: vivid green (volatile boron compounds)
 *   - Copper: blue-green / verdigris (CuCl volatile at flame temp)
 *   - Strontium: deep crimson-red (distinct from calcium)
 *   - Calcium: brick/orange-red (warmer, less pure than strontium)
 *   - Sodium: intense persistent yellow (swamps other colours)
 *   - Potassium: faint lilac (easily masked by Na contamination)
 */

const FlameDatabase = (() => {

  const substances = {

    borate: {
      id:         'borate',
      name:       'Boric Acid / Borate',
      formula:    'H₃BO₃',
      ion:        'BO₃³⁻',
      // Vivid green — trimethyl borate volatile, very distinctive
      flameHex:   '#22cc44',
      flameLabel: 'Green',
      flameDesc:  'Vivid bright green flame — very distinctive',
      inference:  'Borate (BO₃³⁻) or Barium (Ba²⁺) present',
      emissionLines: ['#00ff44','#22dd44','#44ff66'],
      difficulty: 'easy'
    },

    copper: {
      id:         'copper',
      name:       'Copper(II) Chloride',
      formula:    'CuCl₂',
      ion:        'Cu²⁺',
      // Blue-green / verdigris — CuCl volatile, gives characteristic colour
      flameHex:   '#00c8a0',
      flameLabel: 'Bluish-Green',
      flameDesc:  'Blue-green / turquoise flame — CuCl emission',
      inference:  'Copper (Cu²⁺) present',
      emissionLines: ['#00ffcc','#00ddaa','#22eebb'],
      difficulty: 'medium'
    },

    strontium: {
      id:         'strontium',
      name:       'Strontium Chloride',
      formula:    'SrCl₂',
      ion:        'Sr²⁺',
      // Deep crimson — pure red, cooler than calcium
      flameHex:   '#cc1133',
      flameLabel: 'Crimson Red',
      flameDesc:  'Deep crimson / carmine red — pure and intense',
      inference:  'Strontium (Sr²⁺) present',
      emissionLines: ['#ff1144','#cc0033','#ee2244'],
      difficulty: 'hard'
    },

    calcium: {
      id:         'calcium',
      name:       'Calcium Chloride',
      formula:    'CaCl₂',
      ion:        'Ca²⁺',
      // Brick red — orange-red, warmer than strontium, easy to confuse
      flameHex:   '#dd4400',
      flameLabel: 'Brick Red',
      flameDesc:  'Brick red / orange-red — warmer than strontium crimson',
      inference:  'Calcium (Ca²⁺) present',
      emissionLines: ['#ff5500','#dd4400','#ff6622'],
      difficulty: 'hard'
    },

    sodium: {
      id:         'sodium',
      name:       'Sodium Chloride',
      formula:    'NaCl',
      ion:        'Na⁺',
      // Intense persistent yellow — dominates and masks other colours
      flameHex:   '#ffcc00',
      flameLabel: 'Intense Yellow',
      flameDesc:  'Persistent bright yellow — masks all other colours',
      inference:  'Sodium (Na⁺) present',
      emissionLines: ['#ffee00','#ffcc00','#ffdd22'],
      difficulty: 'easy'
    },

    potassium: {
      id:         'potassium',
      name:       'Potassium Chloride',
      formula:    'KCl',
      ion:        'K⁺',
      // Faint lilac — easily missed, use cobalt blue glass to see it
      flameHex:   '#bb66ee',
      flameLabel: 'Lilac / Violet',
      flameDesc:  'Faint lilac / violet — use cobalt-blue glass to confirm',
      inference:  'Potassium (K⁺) present',
      emissionLines: ['#cc77ff','#bb66ee','#aa55dd'],
      difficulty: 'hard'
    }

  };

  const flameTable = [
    { colour: 'Green',          hex: '#22cc44', inference: 'Borate / Ba²⁺ present' },
    { colour: 'Bluish-Green',   hex: '#00c8a0', inference: 'Copper (Cu²⁺) present' },
    { colour: 'Crimson Red',    hex: '#cc1133', inference: 'Strontium (Sr²⁺) present' },
    { colour: 'Brick Red',      hex: '#dd4400', inference: 'Calcium (Ca²⁺) present' },
    { colour: 'Intense Yellow', hex: '#ffcc00', inference: 'Sodium (Na⁺) present' },
    { colour: 'Lilac / Violet', hex: '#bb66ee', inference: 'Potassium (K⁺) present' }
  ];

  // Student colour picker options — includes distractors
  const colourOptions = [
    { label: 'Green',            hex: '#22cc44' },
    { label: 'Bluish-Green',     hex: '#00c8a0' },
    { label: 'Crimson Red',      hex: '#cc1133' },
    { label: 'Brick Red',        hex: '#dd4400' },
    { label: 'Intense Yellow',   hex: '#ffcc00' },
    { label: 'Lilac / Violet',   hex: '#bb66ee' },
    { label: 'Orange',           hex: '#ff8800' },
    { label: 'Blue',             hex: '#4488ff' },
    { label: 'No Colour Change', hex: '#888888' }
  ];

  return {
    getSubstance(id)   { return substances[id] || null; },
    getAllSubstances()  { return Object.values(substances); },
    getFlameTable()    { return flameTable; },
    getColourOptions() { return colourOptions; },
    randomSubstanceId() {
      var keys = Object.keys(substances);
      return keys[Math.floor(Math.random() * keys.length)];
    }
  };
})();
