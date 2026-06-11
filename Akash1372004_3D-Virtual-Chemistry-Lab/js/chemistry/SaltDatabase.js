/**
 * SaltDatabase.js
 * Master database — salts, reagent reactions, colour table.
 *
 * IMPORTANT: solutionLabel and inference are HIDDEN from the student
 * until they complete the observation step. The UI must never show
 * these directly — only the ObservationPanel reveals them after
 * the student records their own observation.
 */

const SaltDatabase = (() => {

  const salts = {

    copper: {
      id:            'copper',
      name:          'Copper(II) Sulphate',
      formula:       'CuSO₄',
      ion:           'Cu²⁺',
      solutionHex:   '#1a7fff',
      solutionLabel: 'Blue',
      inference:     'Copper (Cu²⁺) may be present',
      reagentResults: {
        NaOH: {
          hex:         '#1a5fcc',
          precipitate: true,
          precipHex:   '#1a5fcc',
          label:       'Pale blue precipitate forms — Cu(OH)₂',
          inference:   'Confirms Cu²⁺ present'
        },
        NH3: {
          hex:         '#0a3a8a',
          precipitate: true,
          precipHex:   '#1a5fcc',
          label:       'Blue precipitate, dissolves in excess NH₃ → deep blue (tetraamminecopper)',
          inference:   'Confirms Cu²⁺ present'
        },
        HCl: {
          hex:         '#1a7fff',
          precipitate: false,
          label:       'No visible change',
          inference:   'Inconclusive — try NaOH or NH₃'
        },
        H2SO4: {
          hex:         '#1a7fff',
          precipitate: false,
          label:       'No visible change',
          inference:   'Inconclusive — try NaOH or NH₃'
        }
      }
    },

    nickel: {
      id:            'nickel',
      name:          'Nickel(II) Sulphate',
      formula:       'NiSO₄',
      ion:           'Ni²⁺',
      solutionHex:   '#00aa44',
      solutionLabel: 'Green',
      inference:     'Nickel (Ni²⁺) or Copper may be present',
      reagentResults: {
        NaOH: {
          hex:         '#007a2f',
          precipitate: true,
          precipHex:   '#3aaa55',
          label:       'Apple-green precipitate — Ni(OH)₂',
          inference:   'Confirms Ni²⁺ present'
        },
        NH3: {
          hex:         '#005520',
          precipitate: true,
          precipHex:   '#3aaa55',
          label:       'Green precipitate, partially dissolves in excess NH₃',
          inference:   'Confirms Ni²⁺ present'
        },
        HCl: {
          hex:         '#00aa44',
          precipitate: false,
          label:       'No visible change',
          inference:   'Inconclusive — try NaOH or NH₃'
        },
        H2SO4: {
          hex:         '#00aa44',
          precipitate: false,
          label:       'No visible change',
          inference:   'Inconclusive — try NaOH or NH₃'
        }
      }
    },

    cobalt: {
      id:            'cobalt',
      name:          'Cobalt(II) Chloride',
      formula:       'CoCl₂',
      ion:           'Co²⁺',
      solutionHex:   '#ff5fa0',
      solutionLabel: 'Pink',
      inference:     'Cobalt (Co²⁺) may be present',
      reagentResults: {
        NaOH: {
          hex:         '#aa2266',
          precipitate: true,
          precipHex:   '#4488ff',
          label:       'Blue precipitate — Co(OH)₂',
          inference:   'Confirms Co²⁺ present'
        },
        NH3: {
          hex:         '#7700aa',
          precipitate: true,
          precipHex:   '#4488ff',
          label:       'Blue precipitate, dissolves in excess NH₃ → yellow-brown',
          inference:   'Confirms Co²⁺ present'
        },
        HCl: {
          hex:         '#1133cc',
          precipitate: false,
          label:       'Solution turns blue — CoCl₄²⁻ complex forms',
          inference:   'Strongly suggests Co²⁺ present'
        },
        H2SO4: {
          hex:         '#ff5fa0',
          precipitate: false,
          label:       'No visible change',
          inference:   'Inconclusive — try NaOH or NH₃'
        }
      }
    },

    manganese: {
      id:            'manganese',
      name:          'Manganese(II) Sulphate',
      formula:       'MnSO₄',
      ion:           'Mn²⁺',
      solutionHex:   '#c8a27d',
      solutionLabel: 'Pale Pink / Flesh',
      inference:     'Manganese (Mn²⁺) may be present',
      reagentResults: {
        NaOH: {
          hex:         '#9a7a50',
          precipitate: true,
          precipHex:   '#d4c090',
          label:       'Off-white / cream precipitate — Mn(OH)₂',
          inference:   'Confirms Mn²⁺ present'
        },
        NH3: {
          hex:         '#b09060',
          precipitate: true,
          precipHex:   '#d4c090',
          label:       'Off-white precipitate — Mn(OH)₂',
          inference:   'Confirms Mn²⁺ present'
        },
        HCl: {
          hex:         '#c8a27d',
          precipitate: false,
          label:       'No visible change',
          inference:   'Inconclusive — try NaOH or NH₃'
        },
        H2SO4: {
          hex:         '#c8a27d',
          precipitate: false,
          label:       'No visible change',
          inference:   'Inconclusive — try NaOH or NH₃'
        }
      }
    },

    iron: {
      id:            'iron',
      name:          'Iron(III) Chloride',
      formula:       'FeCl₃',
      ion:           'Fe³⁺',
      solutionHex:   '#cc6600',
      solutionLabel: 'Yellow / Orange-Brown',
      inference:     'Iron (Fe³⁺) may be present',
      reagentResults: {
        NaOH: {
          hex:         '#aa4400',
          precipitate: true,
          precipHex:   '#cc6600',
          label:       'Rust-brown precipitate — Fe(OH)₃',
          inference:   'Confirms Fe³⁺ present'
        },
        NH3: {
          hex:         '#993300',
          precipitate: true,
          precipHex:   '#cc6600',
          label:       'Rust-brown precipitate — Fe(OH)₃',
          inference:   'Confirms Fe³⁺ present'
        },
        HCl: {
          hex:         '#cc6600',
          precipitate: false,
          label:       'No visible change',
          inference:   'Inconclusive — try NaOH or NH₃'
        },
        H2SO4: {
          hex:         '#cc6600',
          precipitate: false,
          label:       'No visible change',
          inference:   'Inconclusive — try NaOH or NH₃'
        }
      }
    }
  };

  // RSC colour interpretation table
  const colourTable = [
    { colour: 'White / Colourless',   interpretation: 'No transition metal (likely Na⁺, K⁺, Ca²⁺)' },
    { colour: 'Pale Pink / Flesh',    interpretation: 'Mn²⁺ present' },
    { colour: 'Blue',                 interpretation: 'Cu²⁺ present' },
    { colour: 'Green',                interpretation: 'Cu²⁺ or Ni²⁺ present' },
    { colour: 'Pink',                 interpretation: 'Co²⁺ present' },
    { colour: 'Yellow / Orange-Brown',interpretation: 'Fe³⁺ present' }
  ];

  const reagents = {
    NaOH:  { name: 'Sodium Hydroxide',  formula: 'NaOH',    colour: '#e0f0ff', hex: '#e0f0ff' },
    NH3:   { name: 'Ammonia Solution',  formula: 'NH₃(aq)', colour: '#e8f8e0', hex: '#e8f8e0' },
    HCl:   { name: 'Hydrochloric Acid', formula: 'HCl',     colour: '#fffce0', hex: '#fffce0' },
    H2SO4: { name: 'Sulphuric Acid',    formula: 'H₂SO₄',   colour: '#fff0f0', hex: '#fff0f0' }
  };

  return {
    getSalt(id)      { return salts[id] || null; },
    getAllSalts()     { return Object.values(salts); },
    getColourTable() { return colourTable; },
    getReagent(id)   { return reagents[id] || null; },
    getAllReagents()  { return reagents; },

    /** Random salt key — includes iron now for extra difficulty */
    randomSaltId() {
      const keys = ['copper', 'nickel', 'cobalt', 'manganese', 'iron'];
      return keys[Math.floor(Math.random() * keys.length)];
    }
  };
})();
