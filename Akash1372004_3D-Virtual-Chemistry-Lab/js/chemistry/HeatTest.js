/**
 * HeatTest.js
 * Experiment 4 — Action of Heat on Mixtures
 * 
 * Chemistry & Physical Changes:
 *   - Zinc Salts (Zn²⁺): ZnO is yellow when hot, white when cold.
 *   - Ammonium Salts (NH₄⁺): Evolve NH₃ gas (pungent odour, fuming white with HCl glass rod).
 *   - Carbonates (CO₃²⁻): Evolve CO₂ gas (colourless, odourless, turns limewater milky).
 *   - Nitrates (NO₃⁻): Evolve NO₂ gas (brown, pungent odour, turns ferrous sulphate paper brown).
 * 
 * Mixtures: 25 combinations of salts.
 */

const HeatTest = (() => {

  // The 25 Mixtures
  const mixtures = {
    sample1: {
      id: 'sample1', name: 'Mixture 1', formula: 'PbCl₂ + Mg₃(PO₄)₂',
      constituents: 'Lead chloride and Magnesium phosphate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: false, hasZinc: false,
      reaction: 'No visible decomposition or gas evolution. Salts remain thermally stable.'
    },
    sample2: {
      id: 'sample2', name: 'Mixture 2', formula: '(NH₄)₃BO₃ + MnSO₄',
      constituents: 'Ammonium borate and Manganese sulphate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: true, hasZinc: false,
      reaction: '2(NH₄)₃BO₃ —(Δ)→ B₂O₃ + 6NH₃↑ + 3H₂O'
    },
    sample3: {
      id: 'sample3', name: 'Mixture 3', formula: 'PbCl₂ + (NH₄)₂C₂O₄',
      constituents: 'Lead chloride and Ammonium oxalate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: true, hasZinc: false,
      reaction: '(NH₄)₂C₂O₄ —(Δ)→ 2NH₃↑ + CO↑ + CO₂↑ + H₂O'
    },
    sample4: {
      id: 'sample4', name: 'Mixture 4', formula: 'Al₂(C₂O₄)₃ + CaSO₄',
      constituents: 'Aluminium oxalate and Calcium sulphate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: false, hasZinc: false,
      reaction: 'Al₂(C₂O₄)₃ —(Δ)→ Al₂O₃ + 3CO↑ + 3CO₂↑. Calcium sulphate remains unchanged.'
    },
    sample5: {
      id: 'sample5', name: 'Mixture 5', formula: 'Pb(NO₃)₂ + (NH₄)₃BO₃',
      constituents: 'Lead nitrate and Ammonium borate',
      hasCarbonate: false, hasNitrate: true, hasAmmonium: true, hasZinc: false,
      reaction: '2Pb(NO₃)₂ —(Δ)→ 2PbO + 4NO₂↑ + O₂↑; 2(NH₄)₃BO₃ —(Δ)→ B₂O₃ + 6NH₃↑ + 3H₂O'
    },
    sample6: {
      id: 'sample6', name: 'Mixture 6', formula: 'Pb(NO₃)₂ + Ba₃(BO₃)₂',
      constituents: 'Lead nitrate and Barium borate',
      hasCarbonate: false, hasNitrate: true, hasAmmonium: false, hasZinc: false,
      reaction: '2Pb(NO₃)₂ —(Δ)→ 2PbO + 4NO₂↑ + O₂↑'
    },
    sample7: {
      id: 'sample7', name: 'Mixture 7', formula: '(NH₄)₂SO₄ + Mn₃(BO₃)₂',
      constituents: 'Ammonium sulphate and Manganese borate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: true, hasZinc: false,
      reaction: '(NH₄)₂SO₄ —(Δ)→ 2NH₃↑ + H₂SO₄'
    },
    sample8: {
      id: 'sample8', name: 'Mixture 8', formula: 'Pb(NO₃)₂ + Zn₃(BO₃)₂',
      constituents: 'Lead nitrate and Zinc borate',
      hasCarbonate: false, hasNitrate: true, hasAmmonium: false, hasZinc: true,
      reaction: '2Pb(NO₃)₂ —(Δ)→ 2PbO + 4NO₂↑ + O₂↑; Zn₃(BO₃)₂ —(Δ)→ 3ZnO + B₂O₃ (ZnO turns yellow when hot, white when cold)'
    },
    sample9: {
      id: 'sample9', name: 'Mixture 9', formula: 'CaC₂O₄ + MnSO₄',
      constituents: 'Calcium oxalate and Manganese sulphate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: false, hasZinc: false,
      reaction: 'CaC₂O₄ —(Δ)→ CaCO₃ + CO↑'
    },
    sample10: {
      id: 'sample10', name: 'Mixture 10', formula: 'Pb(NO₃)₂ + CaF₂',
      constituents: 'Lead nitrate and Calcium fluoride',
      hasCarbonate: false, hasNitrate: true, hasAmmonium: false, hasZinc: false,
      reaction: '2Pb(NO₃)₂ —(Δ)→ 2PbO + 4NO₂↑ + O₂↑'
    },
    sample11: {
      id: 'sample11', name: 'Mixture 11', formula: '(NH₄)₃BO₃ + Ba(NO₃)₂',
      constituents: 'Ammonium borate and Barium nitrate',
      hasCarbonate: false, hasNitrate: true, hasAmmonium: true, hasZinc: false,
      reaction: 'Ba(NO₃)₂ + 2(NH₄)₃BO₃ —(Δ)→ BaO + B₂O₃ + 2NO₂↑ + 6NH₃↑ + O₂↑ + 3H₂O'
    },
    sample12: {
      id: 'sample12', name: 'Mixture 12', formula: 'Pb(NO₃)₂ + Ba₃(PO₄)₂',
      constituents: 'Lead nitrate and Barium phosphate',
      hasCarbonate: false, hasNitrate: true, hasAmmonium: false, hasZinc: false,
      reaction: '2Pb(NO₃)₂ —(Δ)→ 2PbO + 4NO₂↑ + O₂↑'
    },
    sample13: {
      id: 'sample13', name: 'Mixture 13', formula: 'Al₂(SO₄)₃ + SrF₂',
      constituents: 'Aluminium sulphate and Strontium fluoride',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: false, hasZinc: false,
      reaction: 'No visible decomposition. Compounds remain stable at standard bunsen temperature.'
    },
    sample14: {
      id: 'sample14', name: 'Mixture 14', formula: 'Pb(NO₃)₂ + Sr₃(BO₃)₂',
      constituents: 'Lead nitrate and Strontium borate',
      hasCarbonate: false, hasNitrate: true, hasAmmonium: false, hasZinc: false,
      reaction: '2Pb(NO₃)₂ —(Δ)→ 2PbO + 4NO₂↑ + O₂↑'
    },
    sample15: {
      id: 'sample15', name: 'Mixture 15', formula: 'PbCO₃ + Ba₃(PO₄)₂',
      constituents: 'Lead carbonate and Barium phosphate',
      hasCarbonate: true, hasNitrate: false, hasAmmonium: false, hasZinc: false,
      reaction: 'PbCO₃ —(Δ)→ PbO + CO₂↑'
    },
    sample16: {
      id: 'sample16', name: 'Mixture 16', formula: 'PbCl₂ + ZnC₂O₄',
      constituents: 'Lead chloride and Zinc oxalate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: false, hasZinc: true,
      reaction: 'ZnC₂O₄ —(Δ)→ ZnO + CO↑ + CO₂↑ (ZnO turns yellow when hot, white when cold)'
    },
    sample17: {
      id: 'sample17', name: 'Mixture 17', formula: 'SrC₂O₄ + NH₄NO₃',
      constituents: 'Strontium oxalate and Ammonium nitrate',
      hasCarbonate: false, hasNitrate: true, hasAmmonium: true, hasZinc: false,
      reaction: 'NH₄NO₃ —(Δ)→ N₂O↑ + 2H₂O; partially decomposes into NH₃↑ and HNO₃/NO₂↑'
    },
    sample18: {
      id: 'sample18', name: 'Mixture 18', formula: 'BaCl₂ + Zn₃(PO₄)₂',
      constituents: 'Barium chloride and Zinc phosphate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: false, hasZinc: true,
      reaction: 'Zinc phosphate undergoes transition to ZnO-like phase, turning yellow when hot and white when cold.'
    },
    sample19: {
      id: 'sample19', name: 'Mixture 19', formula: 'Pb(NO₃)₂ + CaC₂O₄',
      constituents: 'Lead nitrate and Calcium oxalate',
      hasCarbonate: false, hasNitrate: true, hasAmmonium: false, hasZinc: false,
      reaction: '2Pb(NO₃)₂ —(Δ)→ 2PbO + 4NO₂↑ + O₂↑'
    },
    sample20: {
      id: 'sample20', name: 'Mixture 20', formula: 'PbCl₂ + Zn₃(BO₃)₂',
      constituents: 'Lead chloride and Zinc borate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: false, hasZinc: true,
      reaction: 'Zn₃(BO₃)₂ —(Δ)→ 3ZnO + B₂O₃ (ZnO turns yellow when hot, white when cold)'
    },
    sample21: {
      id: 'sample21', name: 'Mixture 21', formula: 'MnSO₄ + Bi₂(BO₃)₃',
      constituents: 'Manganese sulphate and Bismuth borate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: false, hasZinc: false,
      reaction: 'No significant decomposition or gas release.'
    },
    sample22: {
      id: 'sample22', name: 'Mixture 22', formula: 'MgCl₂ + (NH₄)₂C₂O₄',
      constituents: 'Magnesium chloride and Ammonium oxalate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: true, hasZinc: false,
      reaction: '(NH₄)₂C₂O₄ —(Δ)→ 2NH₃↑ + CO↑ + CO₂↑ + H₂O'
    },
    sample23: {
      id: 'sample23', name: 'Mixture 23', formula: 'ZnCl₂ + SrC₂O₄',
      constituents: 'Zinc chloride and Strontium oxalate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: false, hasZinc: true,
      reaction: 'Zinc chloride reacts in moisture/heat to form ZnO phase, turning yellow when hot and white when cold.'
    },
    sample24: {
      id: 'sample24', name: 'Mixture 24', formula: 'SrC₂O₄ + ZnCO₃',
      constituents: 'Strontium oxalate and Zinc carbonate',
      hasCarbonate: true, hasNitrate: false, hasAmmonium: false, hasZinc: true,
      reaction: 'ZnCO₃ —(Δ)→ ZnO + CO₂↑ (ZnO turns yellow when hot, white when cold)'
    },
    sample25: {
      id: 'sample25', name: 'Mixture 25', formula: 'Al₂(C₂O₄)₃ + ZnSO₄',
      constituents: 'Aluminium oxalate and Zinc sulphate',
      hasCarbonate: false, hasNitrate: false, hasAmmonium: false, hasZinc: true,
      reaction: 'ZnSO₄ —(Δ)→ ZnO + SO₃↑ (ZnO turns yellow when hot, white when cold)'
    }
  };

  const allSampleIds = Object.keys(mixtures);

  const State = {
    IDLE: 'IDLE',
    SAMPLE_SELECTED: 'SAMPLE_SELECTED',
    HEATING: 'HEATING',
    HEATED: 'HEATED',
    OBSERVED: 'OBSERVED',
    TESTING_GAS: 'TESTING_GAS',
    TESTED_GAS: 'TESTED_GAS',
    IDENTIFYING: 'IDENTIFYING',
    DONE: 'DONE'
  };

  let currentState = State.IDLE;
  let currentSample = null;
  
  let studentObservations = {
    solidHotCold: null, // 'yellow-hot' or 'none'
    gasColour: null,    // 'colourless', 'brown', 'both', 'none'
    gasOdour: null      // 'odourless', 'pungent', 'none'
  };

  let conductedTests = {
    limewater: null,  // 'milky', 'clear'
    feso4: null,      // 'brown', 'no-change'
    hclRod: null      // 'dense-white-fumes', 'no-fumes'
  };

  let scoreBreakdown = {
    observations: 0, // max 15
    limewater: 0,    // max 15
    feso4: 0,        // max 15
    hclRod: 0,       // max 15
    identify: 40,    // max 40
    total: 0
  };

  let hintTimer = null;

  function say(msg, delay = 0) {
    setTimeout(() => {
      const el = document.getElementById('assistant-msg');
      if (!el) return;
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = msg;
        el.style.transition = 'opacity .35s';
        el.style.opacity = '1';
      }, 120);
    }, delay);
  }

  function showHint(text, duration = 6000) {
    const box = document.getElementById('hint-box');
    const span = document.getElementById('hint-text');
    if (!box || !span) return;
    span.textContent = text;
    box.classList.remove('hidden');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => box.classList.add('hidden'), duration);
  }

  function updateScore() {
    scoreBreakdown.total = 
      scoreBreakdown.observations +
      scoreBreakdown.limewater +
      scoreBreakdown.feso4 +
      scoreBreakdown.hclRod +
      scoreBreakdown.identify;
    document.getElementById('score-val').textContent = scoreBreakdown.total;
  }

  function setStep(n) {
    const steps = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6'];
    steps.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('active', 'done');
      if (i + 1 === n) el.classList.add('active');
      if (i + 1 < n) el.classList.add('done');
    });
  }

  // API Methods
  function selectSample(sampleId) {
    if (currentState !== State.IDLE) return;
    if (sampleId === 'random') {
      sampleId = allSampleIds[Math.floor(Math.random() * allSampleIds.length)];
    }
    currentSample = mixtures[sampleId];
    currentState = State.SAMPLE_SELECTED;
    setStep(2);

    document.getElementById('obs-sample').textContent = currentSample.name + ': ' + currentSample.constituents;
    document.getElementById('btn-heat').disabled = false;
    say('Selected ' + currentSample.name + '. The bottle has been placed on the table. Press S or click the Spatula to scoop powder mixture into the dry test tube.');
    ObservationEngine.record({ step: 'Sample Selected', label: currentSample.name + ' loaded' });

    // Update 3D scene (zoom camera and move bottle)
    if (typeof animateTakeSample === 'function') {
      animateTakeSample(sampleId, () => {
        if (typeof updateKeyboardGuideText === 'function') {
          updateKeyboardGuideText();
        }
      });
    }
  }

  function samplePlaced() {
    say('Powder mixture scooped into the dry test tube. Now, press H or click the Bunsen Burner to place it under the test tube.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function burnerPlaced() {
    say('Bunsen burner placed under the test tube. Now, press L or click the Burner/Lighter to strike the lighter and ignite the flame.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function igniteBurner() {
    currentState = State.HEATING;
    document.getElementById('btn-heat').disabled = true;
    say('Heating the test tube over the Bunsen burner flame. Watch for solid colour changes and gas release...');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }

    const onFinish = () => {
      currentState = State.HEATED;
      setStep(3);
      document.getElementById('btn-waft').disabled = false;
      
      let finishMsg = 'Heating finished! Press W or click the Test Tube to waft and check gas odour before recording observations.';
      const hasPungent = currentSample.hasNitrate || currentSample.hasAmmonium;
      const hasCO2 = currentSample.hasCarbonate;
      
      if (hasPungent) {
        finishMsg = 'Heating finished! Press W or click the Test Tube to waft and detect the sharp, pungent gas odour.';
      } else if (hasCO2) {
        finishMsg = 'Heating finished! Press W or click the Test Tube to waft and test if the evolved gas has any odour.';
      }
      say(finishMsg);
      if (typeof updateKeyboardGuideText === 'function') {
        updateKeyboardGuideText();
      }
    };

    if (typeof showReactionCountdown === 'function') {
      showReactionCountdown(7, onFinish);
    } else {
      setTimeout(onFinish, 7000);
    }
  }

  function showObservationsFromKey() {
    if (currentState === State.HEATED) {
      document.getElementById('observation-submit-panel').classList.remove('hidden');
    }
  }

  function heatSample() {
    if (currentState !== State.SAMPLE_SELECTED) return;
    const pPlaced = (typeof powderPlaced !== 'undefined') ? powderPlaced : window.powderPlaced;
    const bPlaced = (typeof burnerPlaced !== 'undefined') ? burnerPlaced : window.burnerPlaced;
    const fLit = (typeof flameLit !== 'undefined') ? flameLit : window.flameLit;

    if (!pPlaced) {
      if (typeof runSpatulaScoopAnimation === 'function') {
        runSpatulaScoopAnimation();
      }
    } else if (!bPlaced) {
      if (typeof runBurnerPlaceAnimation === 'function') {
        runBurnerPlaceAnimation();
      }
    } else if (!fLit) {
      if (typeof runBurnerLightAnimation === 'function') {
        runBurnerLightAnimation();
      }
    }
  }

  function handleObservationSubmit() {
    const solidVal = document.getElementById('solid-hotcold-picker').value;
    const gasColourVal = document.getElementById('gas-colour-picker').value;
    const gasOdourVal = document.getElementById('gas-odour-picker').value;

    if (!solidVal || !gasColourVal || !gasOdourVal) {
      showHint('Please record all observations (solid change, gas colour, and gas odour) before submitting.');
      return;
    }

    studentObservations.solidHotCold = solidVal;
    studentObservations.gasColour = gasColourVal;
    studentObservations.gasOdour = gasOdourVal;

    // Update Observation Panel
    document.getElementById('obs-solid').textContent = 
      solidVal === 'yellow-hot' ? 'Turns yellow when hot, white when cold' : 'Remains white / no change';
    document.getElementById('obs-gas-colour').textContent = 
      gasColourVal === 'colourless' ? 'Colourless gas' :
      gasColourVal === 'brown' ? 'Brown gas' :
      gasColourVal === 'both' ? 'Both colourless & brown gases' : 'No gas evolved';
    document.getElementById('obs-gas-odour').textContent = 
      gasOdourVal === 'pungent' ? 'Pungent smelling gas' :
      gasOdourVal === 'odourless' ? 'Odourless gas' : 'No gas evolved';

    // Verify observations
    const correctSolid = currentSample.hasZinc ? 'yellow-hot' : 'none';
    const correctColour = 
      (currentSample.hasNitrate && currentSample.hasCarbonate) || (currentSample.hasNitrate && currentSample.hasAmmonium) ? 'both' :
      currentSample.hasNitrate ? 'brown' :
      currentSample.hasCarbonate || currentSample.hasAmmonium ? 'colourless' : 'none';
    const correctOdour = 
      currentSample.hasAmmonium || currentSample.hasNitrate ? 'pungent' :
      currentSample.hasCarbonate ? 'odourless' : 'none';

    let marks = 0;
    if (solidVal === correctSolid) marks += 5;
    if (gasColourVal === correctColour) marks += 5;
    if (gasOdourVal === correctOdour) marks += 5;
    scoreBreakdown.observations = marks;
    updateScore();

    ObservationEngine.record({
      step: 'Heat Observations',
      label: `Solid: ${solidVal === 'yellow-hot' ? 'Yellow Hot' : 'White'}, Gas: ${gasColourVal}, Odour: ${gasOdourVal}`
    });

    document.getElementById('observation-submit-panel').classList.add('hidden');

    if (marks < 15) {
      showHint(`Hint: Check the reference table. Zinc turns yellow when hot. Carbonates give colourless/odourless gas. Nitrates/Ammonium give pungent gases (brown/colourless).`, 7000);
    }

    // Move to chemical testing of evolved gases (allowing students to test for positive/negative results)
    currentState = State.OBSERVED;
    setStep(4);
    // Enable gas test buttons
    document.getElementById('btn-test-limewater').disabled = false;
    document.getElementById('btn-test-feso4').disabled = false;
    document.getElementById('btn-test-hclrod').disabled = false;
    document.getElementById('btn-finish-tests').disabled = false;
    say('Conduct confirmatory chemical tests (Limewater, FeSO₄ paper, or HCl glass rod) using the buttons below, or proceed to identification when ready.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function conductGasTest(testType) {
    if (currentState !== State.OBSERVED && currentState !== State.TESTED_GAS) return;
    currentState = State.TESTING_GAS;
    
    // Disable all test buttons during animation
    document.getElementById('btn-test-limewater').disabled = true;
    document.getElementById('btn-test-feso4').disabled = true;
    document.getElementById('btn-test-hclrod').disabled = true;
    document.getElementById('btn-finish-tests').disabled = true;
    document.getElementById('btn-waft').disabled = true;

    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }

    if (testType === 'limewater') {
      say('Connecting gas delivery tube to limewater test tube...');
      if (typeof animateLimewaterTest === 'function') {
        animateLimewaterTest(currentSample, () => {
          document.getElementById('test-limewater-panel').classList.remove('hidden');
          say('What happens to the limewater when the evolved gas is bubbled through it?');
        });
      } else {
        setTimeout(() => {
          document.getElementById('test-limewater-panel').classList.remove('hidden');
        }, 3000);
      }
    } else if (testType === 'feso4') {
      say('Exposing ferrous sulphate paper to the fumes at the test tube mouth...');
      if (typeof animateFeso4Test === 'function') {
        animateFeso4Test(currentSample, () => {
          document.getElementById('test-feso4-panel').classList.remove('hidden');
          say('What colour change do you observe on the ferrous sulphate paper?');
        });
      } else {
        setTimeout(() => {
          document.getElementById('test-feso4-panel').classList.remove('hidden');
        }, 3000);
      }
    } else if (testType === 'hclrod') {
      say('Bringing a glass rod dipped in concentrated HCl to the mouth of the test tube...');
      if (typeof animateHClRodTest === 'function') {
        animateHClRodTest(currentSample, () => {
          document.getElementById('test-hclrod-panel').classList.remove('hidden');
          say('Do you observe fuming/dense white clouds near the glass rod?');
        });
      } else {
        setTimeout(() => {
          document.getElementById('test-hclrod-panel').classList.remove('hidden');
        }, 3000);
      }
    }
  }

  function submitLimewaterTest() {
    const result = document.getElementById('limewater-picker').value;
    if (!result) { showHint('Please select an observation.'); return; }
    conductedTests.limewater = result;
    
    const correct = currentSample.hasCarbonate ? 'milky' : 'clear';
    scoreBreakdown.limewater = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-limewater').textContent = 
      result === 'milky' ? 'Limewater turned milky (cloudy white)' : 'Limewater remained clear';
    
    document.getElementById('test-limewater-panel').classList.add('hidden');
    ObservationEngine.record({
      step: 'Limewater Gas Test',
      label: result === 'milky' ? 'Turns milky' : 'Remains clear',
      inference: result === 'milky' ? 'CO₂ gas (Carbonate) confirmed' : 'No CO₂ detected'
    });

    if (result !== correct) {
      showHint(`Hint: Carbonates release CO₂ which reacts with Ca(OH)₂ (limewater) to form insoluble CaCO₃ precipitate.`, 5000);
    }

    restoreGasTestButtons();
  }

  function submitFeso4Test() {
    const result = document.getElementById('feso4-picker').value;
    if (!result) { showHint('Please select an observation.'); return; }
    conductedTests.feso4 = result;

    const correct = currentSample.hasNitrate ? 'brown' : 'no-change';
    scoreBreakdown.feso4 = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-feso4').textContent = 
      result === 'brown' ? 'FeSO₄ paper turned brown' : 'FeSO₄ paper remained pale green / no change';

    document.getElementById('test-feso4-panel').classList.add('hidden');
    ObservationEngine.record({
      step: 'FeSO₄ Paper Gas Test',
      label: result === 'brown' ? 'Turns brown' : 'No change',
      inference: result === 'brown' ? 'NO₂ gas (Nitrate) confirmed' : 'No NO₂ detected'
    });

    if (result !== correct) {
      showHint(`Hint: Nitrates decompose to release NO₂ (nitrogen dioxide) brown fumes which turn moist FeSO₄ paper dark brown.`, 5000);
    }

    restoreGasTestButtons();
  }

  function submitHClRodTest() {
    const result = document.getElementById('hclrod-picker').value;
    if (!result) { showHint('Please select an observation.'); return; }
    conductedTests.hclRod = result;

    const correct = currentSample.hasAmmonium ? 'dense-white-fumes' : 'no-fumes';
    scoreBreakdown.hclRod = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-hclrod').textContent = 
      result === 'dense-white-fumes' ? 'Dense white fumes evolved' : 'No white fumes observed';

    document.getElementById('test-hclrod-panel').classList.add('hidden');
    ObservationEngine.record({
      step: 'HCl Glass Rod Test',
      label: result === 'dense-white-fumes' ? 'Dense white fumes' : 'No fumes',
      inference: result === 'dense-white-fumes' ? 'NH₃ gas (Ammonium) confirmed' : 'No NH₃ detected'
    });

    if (result !== correct) {
      showHint(`Hint: Ammonium salts release ammonia (NH₃) gas, which reacts with HCl fumes to form NH₄Cl (dense white solid particles in air).`, 5000);
    }

    restoreGasTestButtons();
  }

  function restoreGasTestButtons() {
    currentState = State.TESTED_GAS;
    // Re-enable test buttons so student can conduct other tests if they want
    document.getElementById('btn-test-limewater').disabled = false;
    document.getElementById('btn-test-feso4').disabled = false;
    document.getElementById('btn-test-hclrod').disabled = false;
    document.getElementById('btn-finish-tests').disabled = false;
    document.getElementById('btn-waft').disabled = false;
    say('You can run other gas tests to fully analyse the mixture, or click "Finish Gas Testing & Identify" to submit your conclusions.');

    // Stop 3D animations/returns
    if (typeof stopGasTestAnimations === 'function') {
      stopGasTestAnimations();
    }
  }

  function waftGas() {
    if (currentState !== State.HEATED && currentState !== State.OBSERVED && currentState !== State.TESTING_GAS && currentState !== State.TESTED_GAS) return;

    const btnWaft = document.getElementById('btn-waft');
    btnWaft.disabled = true;
    
    const btnLimewater = document.getElementById('btn-test-limewater');
    const btnFeso4 = document.getElementById('btn-test-feso4');
    const btnHclrod = document.getElementById('btn-test-hclrod');
    const btnFinish = document.getElementById('btn-finish-tests');
    
    const wasLimewaterDisabled = btnLimewater.disabled;
    const wasFeso4Disabled = btnFeso4.disabled;
    const wasHclrodDisabled = btnHclrod.disabled;
    const wasFinishDisabled = btnFinish.disabled;
    
    btnLimewater.disabled = true;
    btnFeso4.disabled = true;
    btnHclrod.disabled = true;
    btnFinish.disabled = true;

    say('Wafting the air above the test tube towards your nose...');

    const showResult = () => {
      let odourMsg = '';
      let odourPopupText = '';
      if (currentSample.hasNitrate || currentSample.hasAmmonium) {
        odourMsg = 'Wafting indicates that the evolved gas has a sharp, pungent, and irritating odour.';
        odourPopupText = 'Pungent / irritating odour';
      } else if (currentSample.hasCarbonate) {
        odourMsg = 'Wafting indicates that the evolved gas is completely odourless.';
        odourPopupText = 'Odourless';
      } else {
        odourMsg = 'Wafting indicates that no gas is evolved and no odour is detected.';
        odourPopupText = 'No gas evolved';
      }
      say(odourMsg);
      
      ObservationEngine.record({
        step: 'Waft Test',
        label: odourMsg
      });

      // Show the waft result popup modal instead of observation submit panel directly
      document.getElementById('waft-result-text').textContent = odourPopupText;
      document.getElementById('waft-result-panel').classList.remove('hidden');

      btnWaft.disabled = false;
      btnLimewater.disabled = wasLimewaterDisabled;
      btnFeso4.disabled = wasFeso4Disabled;
      btnHclrod.disabled = wasHclrodDisabled;
      btnFinish.disabled = wasFinishDisabled;
    };

    if (typeof animateWaft === 'function') {
      animateWaft(currentSample, showResult);
    } else {
      setTimeout(showResult, 2000);
    }
  }

  function showIdentificationPanel() {
    setStep(5);
    currentState = State.IDENTIFYING;
    // Hide gas buttons, open ID panel
    document.getElementById('btn-test-limewater').disabled = true;
    document.getElementById('btn-test-feso4').disabled = true;
    document.getElementById('btn-test-hclrod').disabled = true;
    document.getElementById('btn-finish-tests').disabled = true;
    document.getElementById('btn-waft').disabled = true;

    document.getElementById('identification-panel').classList.remove('hidden');
    say('Now, identify which of the four diagnostic ions (Carbonate, Nitrate, Ammonium, Zinc) are present in the mixture. Select all that apply.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function handleIdentificationSubmit() {
    if (currentState !== State.IDENTIFYING) return;

    const guessCarbonate = document.getElementById('chk-id-carbonate').checked;
    const guessNitrate = document.getElementById('chk-id-nitrate').checked;
    const guessAmmonium = document.getElementById('chk-id-ammonium').checked;
    const guessZinc = document.getElementById('chk-id-zinc').checked;

    const actualCarbonate = currentSample.hasCarbonate;
    const actualNitrate = currentSample.hasNitrate;
    const actualAmmonium = currentSample.hasAmmonium;
    const actualZinc = currentSample.hasZinc;

    let correctCount = 0;
    if (guessCarbonate === actualCarbonate) correctCount++;
    if (guessNitrate === actualNitrate) correctCount++;
    if (guessAmmonium === actualAmmonium) correctCount++;
    if (guessZinc === actualZinc) correctCount++;

    // Calculate score (10 marks per correct ion guess)
    const identifyScore = correctCount * 10;
    scoreBreakdown.identify = identifyScore;
    updateScore();

    // Visual feedback for checkboxes (green if guessed correct, red if incorrect)
    const items = [
      { id: 'lbl-id-carbonate', guessed: guessCarbonate, actual: actualCarbonate },
      { id: 'lbl-id-nitrate', guessed: guessNitrate, actual: actualNitrate },
      { id: 'lbl-id-ammonium', guessed: guessAmmonium, actual: actualAmmonium },
      { id: 'lbl-id-zinc', guessed: guessZinc, actual: actualZinc }
    ];

    items.forEach(item => {
      const el = document.getElementById(item.id);
      if (!el) return;
      if (item.guessed === item.actual) {
        el.style.color = '#68d391'; // correct green
        el.style.fontWeight = 'bold';
      } else {
        el.style.color = '#fc8181'; // incorrect red
        el.style.fontWeight = 'bold';
      }
    });

    const isAllCorrect = correctCount === 4;
    if (isAllCorrect) {
      say('Outstanding! You successfully identified all the ions in the mixture.');
      if (typeof gsap !== 'undefined') {
        gsap.to('#score-display', { scale: 1.25, duration: 0.25, yoyo: true, repeat: 3 });
      }
    } else {
      say('Some identifications were incorrect. Look at the feedback and review the reaction chemical equations.');
      let correctList = [];
      if (actualCarbonate) correctList.push('Carbonate');
      if (actualNitrate) correctList.push('Nitrate');
      if (actualAmmonium) correctList.push('Ammonium');
      if (actualZinc) correctList.push('Zinc');
      if (correctList.length === 0) correctList.push('None of these');
      showHint(`Correct ions in this mixture: ${correctList.join(', ')}. Reaction: ${currentSample.reaction}`, 9000);
    }

    // Disable checkboxes
    document.querySelectorAll('.id-checkbox').forEach(chk => chk.disabled = true);
    document.getElementById('btn-submit-id').disabled = true;

    // Record to ObservationEngine
    ObservationEngine.record({
      step: 'Identification',
      label: `Guessed: CO3:${guessCarbonate}, NO3:${guessNitrate}, NH4:${guessAmmonium}, Zn:${guessZinc}`,
      inference: `Actual constituents: ${currentSample.constituents}`
    });

    // Show report after a brief delay
    setTimeout(showReport, 2500);
  }

  function showReport() {
    currentState = State.DONE;
    setStep(6);
    document.getElementById('identification-panel').classList.add('hidden');
    document.getElementById('report-panel').classList.remove('hidden');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }

    const sample = currentSample;
    const obs = studentObservations;
    const tests = conductedTests;

    let gasDesc = 'No gas';
    if (sample.hasNitrate && sample.hasCarbonate) gasDesc = 'CO₂ (colourless) and NO₂ (brown)';
    else if (sample.hasNitrate && sample.hasAmmonium) gasDesc = 'NH₃ (colourless) and NO₂ (brown)';
    else if (sample.hasNitrate) gasDesc = 'NO₂ (brown)';
    else if (sample.hasCarbonate) gasDesc = 'CO₂ (colourless)';
    else if (sample.hasAmmonium) gasDesc = 'NH₃ (colourless)';

    document.getElementById('report-content').innerHTML = `
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Mixture Composition</h4>
        <p><strong>Sample Selected:</strong> ${sample.name}</p>
        <p><strong>Actual Salts:</strong> ${sample.constituents} (<code>${sample.formula}</code>)</p>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Thermal Observations</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">Solid change on heating</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${obs.solidHotCold === 'yellow-hot' ? 'Yellow when hot, white when cold' : 'No change'}</td></tr>
          <tr><td style="padding: 5px; border: 1px solid #3a4a5a;">Gas Evolved</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${gasDesc}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Gas Confirmatory Tests</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">Limewater bubbled</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.limewater === 'milky' ? 'Turned milky' : tests.limewater ? 'Remained clear' : 'Not tested'}</td></tr>
          <tr><td style="padding: 5px; border: 1px solid #3a4a5a;">FeSO₄ Paper exposed</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.feso4 === 'brown' ? 'Turned brown' : tests.feso4 ? 'No change' : 'Not tested'}</td></tr>
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">HCl Glass Rod introduced</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.hclRod === 'dense-white-fumes' ? 'Dense white fumes' : tests.hclRod ? 'No fumes' : 'Not tested'}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Thermal Reaction Equation</h4>
        <p style="font-family: monospace; background: rgba(20,30,50,0.7); padding: 8px; border-radius: 4px; font-size: 0.72rem; word-break: break-all;">${sample.reaction}</p>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Scoring Details</h4>
        <p style="font-size:0.78rem;">
          Initial Observations: ${scoreBreakdown.observations}/15 <br>
          Limewater Test: ${scoreBreakdown.limewater}/15 | FeSO₄ Paper: ${scoreBreakdown.feso4}/15 | HCl Glass Rod: ${scoreBreakdown.hclRod}/15 <br>
          Constituent Identification: ${scoreBreakdown.identify}/40
        </p>
        <p style="font-size:0.85rem; margin-top: 5px;"><strong>Total Score: ${scoreBreakdown.total}/100</strong></p>
      </div>
      <div style="background: rgba(104,211,145,0.15); padding: 8px 12px; border-radius: 6px; border-left: 4px solid #68d391; font-size: 0.78rem;">
        <strong>Lab Conclusion:</strong> Heat test indicates presence of: <br>
        ${[
          sample.hasCarbonate ? 'Carbonate (CO₃²⁻)' : null,
          sample.hasNitrate ? 'Nitrate (NO₃⁻)' : null,
          sample.hasAmmonium ? 'Ammonium (NH₄⁺)' : null,
          sample.hasZinc ? 'Zinc (Zn²⁺)' : null
        ].filter(Boolean).join(', ') || 'No diagnostic ions detected via thermal test.'}
      </div>
    `;
  }

  function downloadPDF() {
    if (!window.jspdf) { alert('PDF library not loaded.'); return; }
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const sample = currentSample;
    const obs = studentObservations;
    const W = 210, margin = 18;
    let y = 36;

    // Header Background
    doc.setFillColor(14, 21, 32);
    doc.rect(0, 0, W, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Virtual Chemistry Lab', margin, 12);
    doc.setFontSize(10);
    doc.text('Experiment 4 — Action of Heat Report', margin, 20);

    // Body
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Sample: ' + sample.name, margin, y); y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Composition: ' + sample.constituents + ' (' + sample.formula + ')', margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Initial Observations:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(' - Solid colour change: ' + (obs.solidHotCold === 'yellow-hot' ? 'Yellow when hot, white when cold' : 'No change'), margin, y); y += 5;
    doc.text(' - Evolved gas colour: ' + obs.gasColour, margin, y); y += 5;
    doc.text(' - Evolved gas odour: ' + obs.gasOdour, margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Chemical Test Observations:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(' - Limewater bubble test: ' + (conductedTests.limewater || 'Not tested'), margin, y); y += 5;
    doc.text(' - Ferrous Sulphate paper test: ' + (conductedTests.feso4 || 'Not tested'), margin, y); y += 5;
    doc.text(' - Glass rod + conc. HCl test: ' + (conductedTests.hclRod || 'Not tested'), margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Thermal Reaction Equation:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    const splitReaction = doc.splitTextToSize(sample.reaction, W - margin * 2);
    doc.text(splitReaction, margin, y); y += splitReaction.length * 5 + 3;

    doc.setFont('helvetica', 'bold');
    doc.text('Marking Scheme & Score:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('Observations: ' + scoreBreakdown.observations + '/15 | Gas Tests: ' + (scoreBreakdown.limewater + scoreBreakdown.feso4 + scoreBreakdown.hclRod) + '/45 | ID: ' + scoreBreakdown.identify + '/40', margin, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Score: ' + scoreBreakdown.total + '/100', margin, y); y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Conclusion:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('Confirmed the presence of thermal active ions: ' + [
      sample.hasCarbonate ? 'Carbonate' : null,
      sample.hasNitrate ? 'Nitrate' : null,
      sample.hasAmmonium ? 'Ammonium' : null,
      sample.hasZinc ? 'Zinc' : null
    ].filter(Boolean).join(', '), margin, y);

    doc.save('HeatTest_Report.pdf');
  }

  function resetExperiment() {
    currentState = State.IDLE;
    currentSample = null;
    studentObservations = { solidHotCold: null, gasColour: null, gasOdour: null };
    conductedTests = { limewater: null, feso4: null, hclRod: null };
    scoreBreakdown = { observations: 0, limewater: 0, feso4: 0, hclRod: 0, identify: 0, total: 0 };

    // Hide overlays
    ['observation-submit-panel', 'waft-result-panel', 'test-limewater-panel', 'test-feso4-panel', 'test-hclrod-panel', 'identification-panel', 'report-panel', 'hint-box']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });

    // Reset buttons
    document.getElementById('btn-heat').disabled = true;
    document.getElementById('btn-waft').disabled = true;
    document.getElementById('btn-test-limewater').disabled = true;
    document.getElementById('btn-test-feso4').disabled = true;
    document.getElementById('btn-test-hclrod').disabled = true;
    document.getElementById('btn-finish-tests').disabled = true;

    // Reset inputs
    document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#solid-hotcold-picker, #gas-colour-picker, #gas-odour-picker, #limewater-picker, #feso4-picker, #hclrod-picker')
      .forEach(s => s.value = '');
    document.querySelectorAll('.id-checkbox').forEach(chk => { chk.checked = false; chk.disabled = false; });
    document.getElementById('btn-submit-id').disabled = false;

    // Reset ID label colours
    ['lbl-id-carbonate', 'lbl-id-nitrate', 'lbl-id-ammonium', 'lbl-id-zinc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.color = ''; el.style.fontWeight = ''; }
    });

    // Reset observation table
    ['obs-sample', 'obs-solid', 'obs-gas-colour', 'obs-gas-odour', 'obs-limewater', 'obs-feso4', 'obs-hclrod']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
      });

    document.getElementById('score-val').textContent = '0';
    ObservationEngine.reset();
    setStep(1);

    // Reset 3D scene
    if (typeof stopHeating === 'function') {
      stopHeating();
    }
    say('Welcome! Select one of the 25 mixtures to begin qualitative thermal analysis.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function initEvents() {
    // Mixture shelf buttons
    const shelf = document.getElementById('mixtures-shelf');
    if (shelf) {
      shelf.addEventListener('click', (e) => {
        const btn = e.target.closest('.salt-btn');
        if (!btn) return;
        if (currentState !== State.IDLE) return;
        document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectSample(btn.dataset.sample);
      });
    }

    document.getElementById('btn-heat').addEventListener('click', heatSample);
    document.getElementById('btn-waft').addEventListener('click', waftGas);
    
    // Obs submit
    document.getElementById('btn-submit-obs').addEventListener('click', handleObservationSubmit);

    // Gas test triggers
    document.getElementById('btn-test-limewater').addEventListener('click', () => conductGasTest('limewater'));
    document.getElementById('btn-test-feso4').addEventListener('click', () => conductGasTest('feso4'));
    document.getElementById('btn-test-hclrod').addEventListener('click', () => conductGasTest('hclrod'));
    
    // Gas test submissions
    document.getElementById('btn-submit-limewater').addEventListener('click', submitLimewaterTest);
    document.getElementById('btn-submit-feso4').addEventListener('click', submitFeso4Test);
    document.getElementById('btn-submit-hclrod').addEventListener('click', submitHClRodTest);

    // Finish testing and guess
    document.getElementById('btn-finish-tests').addEventListener('click', showIdentificationPanel);

    // Guess submit
    document.getElementById('btn-submit-id').addEventListener('click', handleIdentificationSubmit);

    // Close Waft Result popup listener
    document.getElementById('btn-close-waft').addEventListener('click', () => {
      document.getElementById('waft-result-panel').classList.add('hidden');
      if (currentState === State.HEATED) {
        document.getElementById('observation-submit-panel').classList.remove('hidden');
      }
    });

    // Random Mixture button listener
    const randomBtn = document.querySelector('button[data-sample="random"]');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        if (currentState !== State.IDLE) return;
        document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
        const randomId = allSampleIds[Math.floor(Math.random() * allSampleIds.length)];
        const targetBtn = document.querySelector(`.salt-btn[data-sample="${randomId}"]`);
        if (targetBtn) {
          targetBtn.classList.add('active');
        }
        selectSample(randomId);
      });
    }

    // Reset & PDF
    document.getElementById('btn-reset').addEventListener('click', resetExperiment);
    document.getElementById('btn-download-pdf').addEventListener('click', downloadPDF);
    document.getElementById('btn-new-exp').addEventListener('click', () => {
      document.getElementById('report-panel').classList.add('hidden');
      resetExperiment();
    });
  }

  return {
    init: () => {
      initEvents();
      resetExperiment();
      console.log('[Heat Test] Experiment 4 logic ready.');
    },
    reset: resetExperiment,
    getSample: () => currentSample,
    getState: () => currentState,
    getConductedTests: () => conductedTests,
    selectSample,
    waftGas,
    conductGasTest,
    samplePlaced,
    burnerPlaced,
    igniteBurner,
    showObservationsFromKey,
    showIdentificationPanel
  };
})();

// Boot after initialization to avoid Temporal Dead Zone ReferenceError
HeatTest.init();
