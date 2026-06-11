/**
 * AcidTest.js
 * Experiment 5 — Concentrated Sulphuric Acid Test
 * 
 * Chemistry Logic:
 *   - Chloride (Cl⁻): Evolves HCl gas (colourless gas, fuming white with NH₄OH glass rod).
 *   - Bromide (Br⁻): Evolves Br₂ vapours (reddish brown vapours, turning fluorescence paper red).
 *   - Fluoride (F⁻): Evolves HF gas (colourless gas, forming white precipitate with a drop of water on a glass rod).
 *                    Also, the solution acquires an "oily appearance" in the tube due to etching of glass.
 * 
 * Mixtures: 25 combinations of salts.
 */

const AcidTest = (() => {

  // The 25 Mixtures
  const mixtures = {
    sample1: {
      id: 'sample1', name: 'Substance 1', formula: 'NaCl',
      constituents: 'Sodium chloride',
      hasChloride: true, hasBromide: false, hasFluoride: false,
      reaction: 'NaCl + H₂SO₄ —(gently warmed)→ NaHSO₄ + HCl↑ (Colourless gas giving dense white fumes with NH₄OH glass rod)'
    },
    sample2: {
      id: 'sample2', name: 'Substance 2', formula: 'KBr',
      constituents: 'Potassium bromide',
      hasChloride: false, hasBromide: true, hasFluoride: false,
      reaction: '2KBr + 2H₂SO₄ —(gently warmed)→ K₂SO₄ + SO₂↑ + Br₂↑ + 2H₂O (Reddish-brown vapours turning moist fluorescence paper red)'
    },
    sample3: {
      id: 'sample3', name: 'Substance 3', formula: 'CaF₂',
      constituents: 'Calcium fluoride',
      hasChloride: false, hasBromide: false, hasFluoride: true,
      reaction: 'CaF₂ + H₂SO₄ —(gently warmed)→ CaSO₄ + 2HF↑; SiO₂ + 4HF → SiF₄↑ + 2H₂O (Colourless gas forming white precipitate with drop of water; test tube acquires oily appearance)'
    }
  };

  const allSampleIds = Object.keys(mixtures);

  const State = {
    IDLE: 'IDLE',
    SAMPLE_SELECTED: 'SAMPLE_SELECTED',
    ACID_ADDED: 'ACID_ADDED',
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
    solidHotCold: null, // 'oily' or 'none' (test tube appearance)
    gasColour: null,    // 'colourless', 'reddish-brown', 'none'
    gasOdour: null      // 'pungent', 'odourless', 'none'
  };

  let conductedTests = {
    nh4oh: null,       // 'dense-white-fumes', 'no-fumes'
    fluorescence: null, // 'red', 'no-change'
    waterdrop: null     // 'white-ppt', 'no-ppt'
  };

  let scoreBreakdown = {
    observations: 0, // max 15
    nh4oh: 0,        // max 15
    fluorescence: 0, // max 15
    waterdrop: 0,    // max 15
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
      scoreBreakdown.nh4oh +
      scoreBreakdown.fluorescence +
      scoreBreakdown.waterdrop +
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

  function selectSample(sampleId) {
    if (currentState !== State.IDLE) return;
    if (sampleId === 'random') {
      sampleId = allSampleIds[Math.floor(Math.random() * allSampleIds.length)];
    }
    currentSample = mixtures[sampleId];
    currentState = State.SAMPLE_SELECTED;
    setStep(2);

    document.getElementById('obs-sample').textContent = currentSample.name + ': ' + currentSample.constituents;
    document.getElementById('btn-acid').disabled = false;
    say('Selected ' + currentSample.name + '. The bottle has been placed on the table. Press S or click the Spatula to scoop mixture powder into the dry test tube.');
    ObservationEngine.record({ step: 'Sample Selected', label: currentSample.name + ' loaded' });

    if (typeof animateTakeSample === 'function') {
      animateTakeSample(sampleId, () => {
        if (typeof updateKeyboardGuideText === 'function') {
          updateKeyboardGuideText();
        }
      });
    }
  }

  function samplePlaced() {
    say('Powder mixture scooped into the dry test tube. Now, click the Con. H₂SO₄ bottle or press A to add concentrated acid using the dropper.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function addAcid() {
    if (currentState !== State.SAMPLE_SELECTED) return;
    // Guard: don't proceed if spatula animation hasn't placed the powder yet
    if (typeof getScenePowderPlaced === 'function' && !getScenePowderPlaced()) {
      if (typeof runSpatulaScoopAnimation === 'function') {
        runSpatulaScoopAnimation();
      }
      return;
    }
    document.getElementById('btn-acid').disabled = true;

    const onComplete = () => {
      currentState = State.ACID_ADDED;
      document.getElementById('btn-heat').disabled = false;
      say('Concentrated sulphuric acid added to the test tube. Now, press H or click the Bunsen Burner to place and light the burner under the test tube.');
      if (typeof updateKeyboardGuideText === 'function') {
        updateKeyboardGuideText();
      }
    };

    if (typeof animateAddAcid === 'function') {
      animateAddAcid(onComplete);
    } else {
      setTimeout(onComplete, 2000);
    }
  }

  function burnerPlaced() {
    say('Bunsen burner placed under the test tube. Now, press L or click the Burner/Lighter to strike the lighter and ignite the flame to warm the mixture.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function igniteBurner() {
    currentState = State.HEATING;
    document.getElementById('btn-heat').disabled = true;
    say('Warming the test tube with concentrated sulphuric acid. Observe if any gas is evolved or if the glass appears oily...');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }

    const onFinish = () => {
      currentState = State.HEATED;
      setStep(3);
      document.getElementById('btn-waft').disabled = false;
      
      let finishMsg = 'Warming finished! Press W or click the Test Tube to waft and check gas odour before recording observations.';
      if (currentSample.hasChloride || currentSample.hasBromide || currentSample.hasFluoride) {
        finishMsg = 'Warming finished! Press W or click the Test Tube to waft and detect if the evolved vapours have a pungent odour.';
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
    if (currentState === State.SAMPLE_SELECTED) {
      addAcid();
      return;
    }
    if (currentState !== State.ACID_ADDED) return;

    // Read scene5.js state via helper functions (let vars are not on window)
    const bPlaced = (typeof getSceneBurnerPlaced === 'function') ? getSceneBurnerPlaced() : false;
    const fLit    = (typeof getSceneFlameLit === 'function')    ? getSceneFlameLit()    : false;

    if (!bPlaced) {
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
      showHint('Please record all observations (solution state, gas colour, and odour) before submitting.');
      return;
    }

    studentObservations.solidHotCold = solidVal;
    studentObservations.gasColour = gasColourVal;
    studentObservations.gasOdour = gasOdourVal;

    document.getElementById('obs-solid').textContent = 
      solidVal === 'oily' ? 'Solution acquires oily appearance / glass etched' : 'No physical change / normal solution';
    document.getElementById('obs-gas-colour').textContent = 
      gasColourVal === 'colourless' ? 'Colourless gas/fumes' :
      gasColourVal === 'reddish-brown' ? 'Reddish-brown vapours' : 'No gas evolved';
    document.getElementById('obs-gas-odour').textContent = 
      gasOdourVal === 'pungent' ? 'Pungent / suffocating odour' :
      gasOdourVal === 'odourless' ? 'Odourless gas' : 'No gas evolved';

    // Verify observations
    const correctSolid = currentSample.hasFluoride ? 'oily' : 'none';
    const correctColour = 
      currentSample.hasBromide ? 'reddish-brown' :
      currentSample.hasChloride || currentSample.hasFluoride ? 'colourless' : 'none';
    const correctOdour = 
      currentSample.hasChloride || currentSample.hasBromide || currentSample.hasFluoride ? 'pungent' : 'none';

    let marks = 0;
    if (solidVal === correctSolid) marks += 5;
    if (gasColourVal === correctColour) marks += 5;
    if (gasOdourVal === correctOdour) marks += 5;
    scoreBreakdown.observations = marks;
    updateScore();

    ObservationEngine.record({
      step: 'Observations',
      label: `Tube: ${solidVal === 'oily' ? 'Oily' : 'Normal'}, Gas: ${gasColourVal}, Odour: ${gasOdourVal}`
    });

    document.getElementById('observation-submit-panel').classList.add('hidden');

    if (marks < 15) {
      showHint(`Hint: Chlorides and Fluorides yield colourless pungent gases. Fluoride also etches glass, causing an oily liquid film. Bromide gives reddish-brown vapours.`, 7000);
    }

    currentState = State.OBSERVED;
    setStep(4);
    // Enable confirmatory tests
    document.getElementById('btn-test-nh4oh').disabled = false;
    document.getElementById('btn-test-fluorescence').disabled = false;
    document.getElementById('btn-test-waterdrop').disabled = false;
    document.getElementById('btn-finish-tests').disabled = false;
    say('Conduct confirmatory vapour tests (NH₄OH glass rod, Fluorescence paper, or Water drop rod) using the buttons below, or proceed to identify anions.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function conductGasTest(testType) {
    if (currentState !== State.OBSERVED && currentState !== State.TESTED_GAS) return;
    currentState = State.TESTING_GAS;
    
    document.getElementById('btn-test-nh4oh').disabled = true;
    document.getElementById('btn-test-fluorescence').disabled = true;
    document.getElementById('btn-test-waterdrop').disabled = true;
    document.getElementById('btn-finish-tests').disabled = true;
    document.getElementById('btn-waft').disabled = true;

    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }

    if (testType === 'nh4oh') {
      say('Bringing glass rod dipped in ammonium hydroxide to the mouth of the tube...');
      if (typeof animateNH4OHTest === 'function') {
        animateNH4OHTest(currentSample, () => {
          document.getElementById('test-nh4oh-panel').classList.remove('hidden');
          say('What happens near the rod tip when exposed to the evolved gas?');
        });
      } else {
        setTimeout(() => {
          document.getElementById('test-nh4oh-panel').classList.remove('hidden');
        }, 3000);
      }
    } else if (testType === 'fluorescence') {
      say('Holding moist fluorescence paper at the test tube mouth...');
      if (typeof animateFluorescenceTest === 'function') {
        animateFluorescenceTest(currentSample, () => {
          document.getElementById('test-fluorescence-panel').classList.remove('hidden');
          say('Do you observe any colour change on the fluorescence paper?');
        });
      } else {
        setTimeout(() => {
          document.getElementById('test-fluorescence-panel').classList.remove('hidden');
        }, 3000);
      }
    } else if (testType === 'waterdrop') {
      say('Bringing a glass rod with a water droplet at its end to the mouth of the tube...');
      if (typeof animateWaterDropTest === 'function') {
        animateWaterDropTest(currentSample, () => {
          document.getElementById('test-waterdrop-panel').classList.remove('hidden');
          say('Does any precipitate form inside the water drop?');
        });
      } else {
        setTimeout(() => {
          document.getElementById('test-waterdrop-panel').classList.remove('hidden');
        }, 3000);
      }
    }
  }

  function submitNH4OHTest() {
    const result = document.getElementById('nh4oh-picker').value;
    if (!result) { showHint('Please select an observation.'); return; }
    conductedTests.nh4oh = result;

    const correct = currentSample.hasChloride ? 'dense-white-fumes' : 'no-fumes';
    scoreBreakdown.nh4oh = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-nh4oh').textContent = 
      result === 'dense-white-fumes' ? 'Dense white fumes evolved' : 'No fumes observed';
    
    document.getElementById('test-nh4oh-panel').classList.add('hidden');
    ObservationEngine.record({
      step: 'NH₄OH Glass Rod Test',
      label: result === 'dense-white-fumes' ? 'Dense white fumes' : 'No fumes',
      inference: result === 'dense-white-fumes' ? 'HCl gas (Chloride) confirmed' : 'No HCl detected'
    });

    if (result !== correct) {
      showHint(`Hint: HCl gas reacts with NH₃ from the rod to form solid NH₄Cl particles in air, yielding dense white clouds.`, 5000);
    }
    restoreGasTestButtons();
  }

  function submitFluorescenceTest() {
    const result = document.getElementById('fluorescence-picker').value;
    if (!result) { showHint('Please select an observation.'); return; }
    conductedTests.fluorescence = result;

    const correct = currentSample.hasBromide ? 'red' : 'no-change';
    scoreBreakdown.fluorescence = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-fluorescence').textContent = 
      result === 'red' ? 'Paper turned red' : 'Paper remained yellow / no change';

    document.getElementById('test-fluorescence-panel').classList.add('hidden');
    ObservationEngine.record({
      step: 'Fluorescence Paper Test',
      label: result === 'red' ? 'Turns red' : 'No change',
      inference: result === 'red' ? 'Br₂ vapour (Bromide) confirmed' : 'No Br₂ detected'
    });

    if (result !== correct) {
      showHint(`Hint: Bromine (Br₂) vapours react with fluorescein dye on the paper to form eosin, which is bright red.`, 5000);
    }
    restoreGasTestButtons();
  }

  function submitWaterDropTest() {
    const result = document.getElementById('waterdrop-picker').value;
    if (!result) { showHint('Please select an observation.'); return; }
    conductedTests.waterdrop = result;

    const correct = currentSample.hasFluoride ? 'white-ppt' : 'no-ppt';
    scoreBreakdown.waterdrop = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-waterdrop').textContent = 
      result === 'white-ppt' ? 'White precipitate formed in drop' : 'Water drop remained clear / no precipitate';

    document.getElementById('test-waterdrop-panel').classList.add('hidden');
    ObservationEngine.record({
      step: 'Water Drop Rod Test',
      label: result === 'white-ppt' ? 'White ppt formed' : 'No precipitate',
      inference: result === 'white-ppt' ? 'HF gas (Fluoride) confirmed' : 'No HF detected'
    });

    if (result !== correct) {
      showHint(`Hint: HF gas reacts with silicate in the water drop to precipitate silicic acid, turning the drop cloudy white.`, 5000);
    }
    restoreGasTestButtons();
  }

  function restoreGasTestButtons() {
    currentState = State.TESTED_GAS;
    document.getElementById('btn-test-nh4oh').disabled = false;
    document.getElementById('btn-test-fluorescence').disabled = false;
    document.getElementById('btn-test-waterdrop').disabled = false;
    document.getElementById('btn-finish-tests').disabled = false;
    document.getElementById('btn-waft').disabled = false;
    say('You can run other vapour tests to fully analyse the mixture, or click "Finish & Identify" to submit your conclusions.');

    if (typeof stopGasTestAnimations === 'function') {
      stopGasTestAnimations();
    }
  }

  function waftGas() {
    if (currentState !== State.HEATED && currentState !== State.OBSERVED && currentState !== State.TESTING_GAS && currentState !== State.TESTED_GAS) return;

    const btnWaft = document.getElementById('btn-waft');
    btnWaft.disabled = true;

    say('Wafting the air above the test tube towards your nose...');

    const showResult = () => {
      let odourMsg = '';
      let odourPopupText = '';
      if (currentSample.hasChloride || currentSample.hasBromide || currentSample.hasFluoride) {
        odourMsg = 'Wafting indicates that the evolved gas has a sharp, pungent, and irritating odour.';
        odourPopupText = 'Pungent / suffocating odour';
      } else {
        odourMsg = 'Wafting indicates that no gas is evolved and no odour is detected.';
        odourPopupText = 'No odour / stable';
      }
      say(odourMsg);
      
      ObservationEngine.record({ step: 'Waft Test', label: odourMsg });

      document.getElementById('waft-result-text').textContent = odourPopupText;
      document.getElementById('waft-result-panel').classList.remove('hidden');
      btnWaft.disabled = false;
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
    document.getElementById('btn-test-nh4oh').disabled = true;
    document.getElementById('btn-test-fluorescence').disabled = true;
    document.getElementById('btn-test-waterdrop').disabled = true;
    document.getElementById('btn-finish-tests').disabled = true;
    document.getElementById('btn-waft').disabled = true;

    document.getElementById('identification-panel').classList.remove('hidden');
    say('Identify which of the diagnostic Group II anions (Chloride, Bromide, Fluoride) are present in the mixture. Select all that apply.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function handleIdentificationSubmit() {
    if (currentState !== State.IDENTIFYING) return;

    const guessChloride = document.getElementById('chk-id-chloride').checked;
    const guessBromide = document.getElementById('chk-id-bromide').checked;
    const guessFluoride = document.getElementById('chk-id-fluoride').checked;

    const actualChloride = currentSample.hasChloride;
    const actualBromide = currentSample.hasBromide;
    const actualFluoride = currentSample.hasFluoride;

    let correctCount = 0;
    if (guessChloride === actualChloride) correctCount++;
    if (guessBromide === actualBromide) correctCount++;
    if (guessFluoride === actualFluoride) correctCount++;

    // Calculate score (13.3 marks per correct guess, capped at 40 max)
    const identifyScore = Math.min(40, Math.round(correctCount * 13.33));
    scoreBreakdown.identify = identifyScore;
    updateScore();

    const items = [
      { id: 'chk-id-chloride', labelId: 'lbl-id-chloride', guessed: guessChloride, actual: actualChloride },
      { id: 'chk-id-bromide', labelId: 'lbl-id-bromide', guessed: guessBromide, actual: actualBromide },
      { id: 'chk-id-fluoride', labelId: 'lbl-id-fluoride', guessed: guessFluoride, actual: actualFluoride }
    ];

    items.forEach(item => {
      const el = document.getElementById(item.labelId);
      if (!el) return;
      if (item.guessed === item.actual) {
        el.style.color = '#68d391'; // green
        el.style.fontWeight = 'bold';
      } else {
        el.style.color = '#fc8181'; // red
        el.style.fontWeight = 'bold';
      }
    });

    const isAllCorrect = correctCount === 3;
    if (isAllCorrect) {
      say('Outstanding! You successfully identified all active radicals in the mixture.');
      if (typeof gsap !== 'undefined') {
        gsap.to('#score-display', { scale: 1.25, duration: 0.25, yoyo: true, repeat: 3 });
      }
    } else {
      say('Some identifications were incorrect. Look at the feedback and review chemical reactions.');
      let correctList = [];
      if (actualChloride) correctList.push('Chloride');
      if (actualBromide) correctList.push('Bromide');
      if (actualFluoride) correctList.push('Fluoride');
      if (correctList.length === 0) correctList.push('None of these');
      showHint(`Correct anions in this mixture: ${correctList.join(', ')}. Reaction: ${currentSample.reaction}`, 9000);
    }

    document.querySelectorAll('.id-checkbox').forEach(chk => chk.disabled = true);
    document.getElementById('btn-submit-id').disabled = true;

    ObservationEngine.record({
      step: 'Identification',
      label: `Guessed: Cl:${guessChloride}, Br:${guessBromide}, F:${guessFluoride}`,
      inference: `Actual constituents: ${currentSample.constituents}`
    });

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
    if (sample.hasChloride && sample.hasBromide && sample.hasFluoride) gasDesc = 'HCl/HF (colourless) and Br₂ (brown)';
    else if (sample.hasChloride && sample.hasBromide) gasDesc = 'HCl (colourless) and Br₂ (brown)';
    else if (sample.hasBromide && sample.hasFluoride) gasDesc = 'HF (colourless) and Br₂ (brown)';
    else if (sample.hasChloride && sample.hasFluoride) gasDesc = 'HCl and HF (colourless)';
    else if (sample.hasChloride) gasDesc = 'HCl (colourless)';
    else if (sample.hasBromide) gasDesc = 'Br₂ (brown)';
    else if (sample.hasFluoride) gasDesc = 'HF (colourless)';

    document.getElementById('report-content').innerHTML = `
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Mixture Composition</h4>
        <p><strong>Sample Selected:</strong> ${sample.name}</p>
        <p><strong>Actual Salts:</strong> ${sample.constituents} (<code>${sample.formula}</code>)</p>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Warming Observations</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">Tube / Solution state</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${obs.solidHotCold === 'oily' ? 'Oily / glass etched' : 'No change'}</td></tr>
          <tr><td style="padding: 5px; border: 1px solid #3a4a5a;">Gas Evolved</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${gasDesc}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Confirmatory Vapour Tests</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">NH₄OH Rod Test</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.nh4oh === 'dense-white-fumes' ? 'Dense white fumes' : tests.nh4oh ? 'No fumes' : 'Not tested'}</td></tr>
          <tr><td style="padding: 5px; border: 1px solid #3a4a5a;">Fluorescence Paper Test</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.fluorescence === 'red' ? 'Paper turned red' : tests.fluorescence ? 'No change' : 'Not tested'}</td></tr>
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">Water Drop Rod Test</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.waterdrop === 'white-ppt' ? 'White precipitate' : tests.waterdrop ? 'No precipitate' : 'Not tested'}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Chemical Reaction Equation</h4>
        <p style="font-family: monospace; background: rgba(20,30,50,0.7); padding: 8px; border-radius: 4px; font-size: 0.72rem; word-break: break-all;">${sample.reaction}</p>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Scoring Details</h4>
        <p style="font-size:0.78rem;">
          Initial Observations: ${scoreBreakdown.observations}/15 <br>
          NH₄OH Rod: ${scoreBreakdown.nh4oh}/15 | Fluorescence Paper: ${scoreBreakdown.fluorescence}/15 | Water Drop: ${scoreBreakdown.waterdrop}/15 <br>
          Constituent Identification: ${scoreBreakdown.identify}/40
        </p>
        <p style="font-size:0.85rem; margin-top: 5px;"><strong>Total Score: ${scoreBreakdown.total}/100</strong></p>
      </div>
      <div style="background: rgba(104,211,145,0.15); padding: 8px 12px; border-radius: 6px; border-left: 4px solid #68d391; font-size: 0.78rem;">
        <strong>Lab Conclusion:</strong> Acid warm test confirms presence of: <br>
        ${[
          sample.hasChloride ? 'Chloride (Cl⁻)' : null,
          sample.hasBromide ? 'Bromide (Br⁻)' : null,
          sample.hasFluoride ? 'Fluoride (F⁻)' : null
        ].filter(Boolean).join(', ') || 'No active Group II diagnostic acid radicals detected.'}
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
    doc.text('Experiment 5 — Concentrated Sulphuric Acid Test Report', margin, 20);

    // Body
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Sample: ' + sample.name, margin, y); y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Composition: ' + sample.constituents + ' (' + sample.formula + ')', margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Initial Observations (Warming with H2SO4):', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(' - Tube appearance: ' + (obs.solidHotCold === 'oily' ? 'Solution acquires oily appearance / glass etched' : 'No change'), margin, y); y += 5;
    doc.text(' - Evolved vapour colour: ' + obs.gasColour, margin, y); y += 5;
    doc.text(' - Evolved vapour odour: ' + obs.gasOdour, margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Vapour Test Results:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(' - NH4OH Rod Test: ' + (conductedTests.nh4oh || 'Not tested'), margin, y); y += 5;
    doc.text(' - Fluorescence Paper Test: ' + (conductedTests.fluorescence || 'Not tested'), margin, y); y += 5;
    doc.text(' - Water Drop Rod Test: ' + (conductedTests.waterdrop || 'Not tested'), margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Chemical Reaction Equation:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    const splitReaction = doc.splitTextToSize(sample.reaction, W - margin * 2);
    doc.text(splitReaction, margin, y); y += splitReaction.length * 5 + 3;

    doc.setFont('helvetica', 'bold');
    doc.text('Marking Scheme & Score:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('Observations: ' + scoreBreakdown.observations + '/15 | Vapour Tests: ' + (scoreBreakdown.nh4oh + scoreBreakdown.fluorescence + scoreBreakdown.waterdrop) + '/45 | ID: ' + scoreBreakdown.identify + '/40', margin, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Score: ' + scoreBreakdown.total + '/100', margin, y); y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Conclusion:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('Confirmed the presence of active acid radicals: ' + [
      sample.hasChloride ? 'Chloride' : null,
      sample.hasBromide ? 'Bromide' : null,
      sample.hasFluoride ? 'Fluoride' : null
    ].filter(Boolean).join(', '), margin, y);

    doc.save('AcidTest_Report.pdf');
  }

  function resetExperiment() {
    currentState = State.IDLE;
    currentSample = null;
    studentObservations = { solidHotCold: null, gasColour: null, gasOdour: null };
    conductedTests = { nh4oh: null, fluorescence: null, waterdrop: null };
    scoreBreakdown = { observations: 0, nh4oh: 0, fluorescence: 0, waterdrop: 0, identify: 0, total: 0 };

    ['observation-submit-panel', 'waft-result-panel', 'test-nh4oh-panel', 'test-fluorescence-panel', 'test-waterdrop-panel', 'identification-panel', 'report-panel', 'hint-box']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });

    // Reset buttons
    document.getElementById('btn-acid').disabled = true;
    document.getElementById('btn-heat').disabled = true;
    document.getElementById('btn-waft').disabled = true;
    document.getElementById('btn-test-nh4oh').disabled = true;
    document.getElementById('btn-test-fluorescence').disabled = true;
    document.getElementById('btn-test-waterdrop').disabled = true;
    document.getElementById('btn-finish-tests').disabled = true;

    // Reset inputs
    document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#solid-hotcold-picker, #gas-colour-picker, #gas-odour-picker, #nh4oh-picker, #fluorescence-picker, #waterdrop-picker')
      .forEach(s => s.value = '');
    document.querySelectorAll('.id-checkbox').forEach(chk => { chk.checked = false; chk.disabled = false; });
    document.getElementById('btn-submit-id').disabled = false;

    ['lbl-id-chloride', 'lbl-id-bromide', 'lbl-id-fluoride'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.color = ''; el.style.fontWeight = ''; }
    });

    ['obs-sample', 'obs-solid', 'obs-gas-colour', 'obs-gas-odour', 'obs-nh4oh', 'obs-fluorescence', 'obs-waterdrop']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
      });

    document.getElementById('score-val').textContent = '0';
    ObservationEngine.reset();
    setStep(1);

    if (typeof stopHeating === 'function') {
      stopHeating();
    }
    say('Welcome! Select one of the 3 substances to begin qualitative concentrated acid analysis.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function initEvents() {
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

    document.getElementById('btn-acid').addEventListener('click', addAcid);
    document.getElementById('btn-heat').addEventListener('click', heatSample);
    document.getElementById('btn-waft').addEventListener('click', waftGas);
    
    // Obs submit
    document.getElementById('btn-submit-obs').addEventListener('click', handleObservationSubmit);

    // Vapour test triggers
    document.getElementById('btn-test-nh4oh').addEventListener('click', () => conductGasTest('nh4oh'));
    document.getElementById('btn-test-fluorescence').addEventListener('click', () => conductGasTest('fluorescence'));
    document.getElementById('btn-test-waterdrop').addEventListener('click', () => conductGasTest('waterdrop'));
    
    // Vapour test submissions
    document.getElementById('btn-submit-nh4oh').addEventListener('click', submitNH4OHTest);
    document.getElementById('btn-submit-fluorescence').addEventListener('click', submitFluorescenceTest);
    document.getElementById('btn-submit-waterdrop').addEventListener('click', submitWaterDropTest);

    // Finish and guess
    document.getElementById('btn-finish-tests').addEventListener('click', showIdentificationPanel);

    // Guess submit
    document.getElementById('btn-submit-id').addEventListener('click', handleIdentificationSubmit);

    // Close Waft Result modal
    document.getElementById('btn-close-waft').addEventListener('click', () => {
      document.getElementById('waft-result-panel').classList.add('hidden');
      if (currentState === State.HEATED) {
        document.getElementById('observation-submit-panel').classList.remove('hidden');
      }
    });

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

    document.getElementById('btn-reset').addEventListener('click', resetExperiment);
    document.getElementById('btn-download-pdf').addEventListener('click', downloadPDF);
    document.getElementById('btn-new-exp').addEventListener('click', () => {
      document.getElementById('report-panel').classList.add('hidden');
      if (typeof stopHeating === 'function') stopHeating();
      resetExperiment();
    });
  }

  return {
    init: () => {
      initEvents();
      resetExperiment();
      console.log('[Acid Test] Experiment 5 logic ready.');
    },
    reset: resetExperiment,
    getSample: () => currentSample,
    getState: () => currentState,
    getConductedTests: () => conductedTests,
    selectSample,
    addAcid,
    waftGas,
    conductGasTest,
    onSamplePlaced: samplePlaced,
    onBurnerPlaced: burnerPlaced,
    igniteBurner,
    showObservationsFromKey,
    showIdentificationPanel
  };
})();

// Boot logic
AcidTest.init();
