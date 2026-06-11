/**
 * CopperTurningsTest.js
 * Experiment 7 — Copper Turnings Test (Nitrate Test)
 * 
 * Chemistry Logic:
 *   - Nitrate (NO₃⁻): Reacts with copper turnings and Con. H₂SO₄ on warming to evolve
 *                     reddish-brown NO₂ gas and turn the solution green. Confirmed by 
 *                     FeSO₄ paper turning brown.
 *   - Chloride (Cl⁻): Reacts with Con. H₂SO₄ to evolve colourless HCl gas (gives dense 
 *                     white fumes with NH₄OH rod). Solution remains clear/amber.
 *   - Bromide (Br⁻): Reacts with Con. H₂SO₄ to evolve reddish-brown Br₂ vapours (turns 
 *                    fluorescence paper red). Solution remains clear/amber-brown.
 */

const CopperTurningsTest = (() => {

  // The 3 Substance Mixtures
  const mixtures = {
    sample1: {
      id: 'sample1', name: 'Substance 1', formula: 'KNO₃',
      constituents: 'Potassium nitrate',
      hasNitrate: true, hasChloride: false, hasBromide: false,
      reaction: 'KNO₃ + H₂SO₄ → KHSO₄ + HNO₃; 4HNO₃ + Cu → Cu(NO₃)₂ (green solution) + 2NO₂↑ (reddish-brown gas) + 2H₂O'
    },
    sample2: {
      id: 'sample2', name: 'Substance 2', formula: 'KCl',
      constituents: 'Potassium chloride',
      hasNitrate: false, hasChloride: true, hasBromide: false,
      reaction: 'KCl + H₂SO₄ → KHSO₄ + HCl↑ (Colourless gas forming dense white fumes of NH₄Cl with NH₄OH glass rod)'
    },
    sample3: {
      id: 'sample3', name: 'Substance 3', formula: 'KBr',
      constituents: 'Potassium bromide',
      hasNitrate: false, hasChloride: false, hasBromide: true,
      reaction: '2KBr + 2H₂SO₄ → K₂SO₄ + SO₂↑ + Br₂↑ + 2H₂O (Reddish-brown Bromine vapours turning moist fluorescence paper red)'
    }
  };

  const allSampleIds = Object.keys(mixtures);

  const State = {
    IDLE: 'IDLE',
    SAMPLE_SELECTED: 'SAMPLE_SELECTED',
    POWDER_ADDED: 'POWDER_ADDED',
    COPPER_ADDED: 'COPPER_ADDED',
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
    solidHotCold: null, // 'green' or 'none' (solution appearance)
    gasColour: null,    // 'colourless', 'reddish-brown', 'none'
    gasOdour: null      // 'pungent', 'odourless', 'none'
  };

  let conductedTests = {
    nh4oh: null,        // 'dense-white-fumes', 'no-fumes'
    fluorescence: null, // 'red', 'no-change'
    feso4: null         // 'brown', 'no-change'
  };

  let scoreBreakdown = {
    observations: 0, // max 15
    nh4oh: 0,        // max 15
    fluorescence: 0, // max 15
    feso4: 0,        // max 15
    identify: 0,     // max 40
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
      scoreBreakdown.feso4 +
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
    document.getElementById('btn-copper').disabled = true; // wait for powder
    document.getElementById('btn-acid').disabled = true;
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
    currentState = State.POWDER_ADDED;
    document.getElementById('btn-copper').disabled = false;
    say('Powder mixture scooped into the dry test tube. Now, click the Copper Turnings bottle or press C to add a piece of copper turning using tweezers.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function addCopper() {
    if (currentState !== State.POWDER_ADDED) return;
    document.getElementById('btn-copper').disabled = true;

    const onComplete = () => {
      currentState = State.COPPER_ADDED;
      document.getElementById('btn-acid').disabled = false;
      say('Copper turnings added to the test tube. Now, click the Con. H₂SO₄ bottle or press A to add concentrated acid using the dropper.');
      if (typeof updateKeyboardGuideText === 'function') {
        updateKeyboardGuideText();
      }
    };

    if (typeof runCopperAddAnimation === 'function') {
      runCopperAddAnimation(onComplete);
    } else {
      setTimeout(onComplete, 2000);
    }
  }

  function addAcid() {
    if (currentState !== State.COPPER_ADDED) return;
    document.getElementById('btn-acid').disabled = true;

    const onComplete = () => {
      currentState = State.ACID_ADDED;
      document.getElementById('btn-heat').disabled = false;
      say('Concentrated sulphuric acid added. Now, press H or click the Bunsen Burner to place and light the burner under the test tube.');
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
    say('Warming the test tube containing mixture, copper turnings, and concentrated sulphuric acid. Observe evolved fumes and solution color change...');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }

    const onFinish = () => {
      currentState = State.HEATED;
      setStep(3);
      document.getElementById('btn-waft').disabled = false;
      say('Warming finished! Press W or click the Test Tube to waft and detect if evolved vapours have a pungent odour.');
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
    if (currentState === State.POWDER_ADDED) {
      addCopper();
      return;
    }
    if (currentState === State.COPPER_ADDED) {
      addAcid();
      return;
    }
    if (currentState !== State.ACID_ADDED) return;

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
      showHint('Please record all observations (solution color, gas colour, and odour) before submitting.');
      return;
    }

    studentObservations.solidHotCold = solidVal;
    studentObservations.gasColour = gasColourVal;
    studentObservations.gasOdour = gasOdourVal;

    document.getElementById('obs-solid').textContent = 
      solidVal === 'green' ? 'Solution turns green ✓' : 'Solution remains clear / normal';
    document.getElementById('obs-gas-colour').textContent = 
      gasColourVal === 'colourless' ? 'Colourless gas/fumes' :
      gasColourVal === 'reddish-brown' ? 'Reddish-brown vapours ✓' : 'No gas evolved';
    document.getElementById('obs-gas-odour').textContent = 
      gasOdourVal === 'pungent' ? 'Pungent / suffocating odour ✓' :
      gasOdourVal === 'odourless' ? 'Odourless gas' : 'No gas evolved';

    // Verify observations
    const correctSolid = currentSample.hasNitrate ? 'green' : 'none';
    const correctColour = 
      (currentSample.hasNitrate || currentSample.hasBromide) ? 'reddish-brown' :
      currentSample.hasChloride ? 'colourless' : 'none';
    const correctOdour = 'pungent';

    let marks = 0;
    if (solidVal === correctSolid) marks += 5;
    if (gasColourVal === correctColour) marks += 5;
    if (gasOdourVal === correctOdour) marks += 5;
    scoreBreakdown.observations = marks;
    updateScore();

    ObservationEngine.record({
      step: 'Observations',
      label: `Solution: ${solidVal === 'green' ? 'Green' : 'Clear'}, Gas: ${gasColourVal}, Odour: ${gasOdourVal}`
    });

    document.getElementById('observation-submit-panel').classList.add('hidden');

    if (marks < 15) {
      showHint(`Hint: Nitrate turns the solution green and yields reddish-brown NO₂ gas. Bromide also yields reddish-brown Br₂ gas but the solution stays clear. Chloride gives colourless HCl gas.`, 7000);
    }

    currentState = State.OBSERVED;
    setStep(4);
    // Enable confirmatory tests
    document.getElementById('btn-test-nh4oh').disabled = false;
    document.getElementById('btn-test-fluorescence').disabled = false;
    document.getElementById('btn-test-feso4').disabled = false;
    document.getElementById('btn-finish-tests').disabled = false;
    say('Conduct confirmatory vapour tests (NH₄OH glass rod, Fluorescence paper, or FeSO₄ paper) using the buttons below, or proceed to identify anions.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function conductGasTest(testType) {
    if (currentState !== State.OBSERVED && currentState !== State.TESTED_GAS) return;
    currentState = State.TESTING_GAS;
    
    document.getElementById('btn-test-nh4oh').disabled = true;
    document.getElementById('btn-test-fluorescence').disabled = true;
    document.getElementById('btn-test-feso4').disabled = true;
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
    } else if (testType === 'feso4') {
      say('Holding moist ferrous sulphate (FeSO₄) paper at the test tube mouth...');
      if (typeof animateFeSO4Test === 'function') {
        animateFeSO4Test(currentSample, () => {
          document.getElementById('test-feso4-panel').classList.remove('hidden');
          say('Do you observe any colour change on the FeSO₄ paper?');
        });
      } else {
        setTimeout(() => {
          document.getElementById('test-feso4-panel').classList.remove('hidden');
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
      result === 'dense-white-fumes' ? 'Dense white fumes evolved ✓' : 'No fumes observed';
    
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

  // Bromide turns fluorescence paper red
  function submitFluorescenceTest() {
    const result = document.getElementById('fluorescence-picker').value;
    if (!result) { showHint('Please select an observation.'); return; }
    conductedTests.fluorescence = result;

    const correct = currentSample.hasBromide ? 'red' : 'no-change';
    scoreBreakdown.fluorescence = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-fluorescence').textContent = 
      result === 'red' ? 'Paper turned red ✓' : 'Paper remained yellow / no change';

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

  // Nitrate turns FeSO4 paper brown
  function submitFeSO4Test() {
    const result = document.getElementById('feso4-picker').value;
    if (!result) { showHint('Please select an observation.'); return; }
    conductedTests.feso4 = result;

    const correct = currentSample.hasNitrate ? 'brown' : 'no-change';
    scoreBreakdown.feso4 = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-feso4').textContent = 
      result === 'brown' ? 'Paper turned brown ✓' : 'Paper remained light green / no change';

    document.getElementById('test-feso4-panel').classList.add('hidden');
    ObservationEngine.record({
      step: 'FeSO₄ Paper Test',
      label: result === 'brown' ? 'Turns brown' : 'No change',
      inference: result === 'brown' ? 'NO₂ gas (Nitrate) confirmed' : 'No NO₂ detected'
    });

    if (result !== correct) {
      showHint(`Hint: NO₂ gas reacts with FeSO₄ to form a brown nitroso-ferrous sulphate complex. Only Nitrate gives this reaction.`, 5000);
    }
    restoreGasTestButtons();
  }

  function restoreGasTestButtons() {
    currentState = State.TESTED_GAS;
    document.getElementById('btn-test-nh4oh').disabled = false;
    document.getElementById('btn-test-fluorescence').disabled = false;
    document.getElementById('btn-test-feso4').disabled = false;
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
      let odourMsg = 'Wafting indicates that the evolved gas has a sharp, pungent, and irritating odour.';
      let odourPopupText = 'Pungent / suffocating odour';
      
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
    document.getElementById('btn-test-feso4').disabled = true;
    document.getElementById('btn-finish-tests').disabled = true;
    document.getElementById('btn-waft').disabled = true;

    document.getElementById('identification-panel').classList.remove('hidden');
    say('Identify which of the acid radical ions (Nitrate, Chloride, Bromide) are present in the mixture. Select all that apply.');
    if (typeof updateKeyboardGuideText === 'function') {
      updateKeyboardGuideText();
    }
  }

  function handleIdentificationSubmit() {
    if (currentState !== State.IDENTIFYING) return;

    const guessNitrate = document.getElementById('chk-id-nitrate').checked;
    const guessChloride = document.getElementById('chk-id-chloride').checked;
    const guessBromide = document.getElementById('chk-id-bromide').checked;

    const actualNitrate = currentSample.hasNitrate;
    const actualChloride = currentSample.hasChloride;
    const actualBromide = currentSample.hasBromide;

    let correctCount = 0;
    if (guessNitrate === actualNitrate) correctCount++;
    if (guessChloride === actualChloride) correctCount++;
    if (guessBromide === actualBromide) correctCount++;

    const identifyScore = Math.min(40, Math.round(correctCount * 13.33));
    scoreBreakdown.identify = identifyScore;
    updateScore();

    const items = [
      { id: 'chk-id-nitrate', labelId: 'lbl-id-nitrate', guessed: guessNitrate, actual: actualNitrate },
      { id: 'chk-id-chloride', labelId: 'lbl-id-chloride', guessed: guessChloride, actual: actualChloride },
      { id: 'chk-id-bromide', labelId: 'lbl-id-bromide', guessed: guessBromide, actual: actualBromide }
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
      if (actualNitrate) correctList.push('Nitrate');
      if (actualChloride) correctList.push('Chloride');
      if (actualBromide) correctList.push('Bromide');
      showHint(`Correct anions in this mixture: ${correctList.join(', ')}. Reaction: ${currentSample.reaction}`, 9000);
    }

    document.querySelectorAll('.id-checkbox').forEach(chk => chk.disabled = true);
    document.getElementById('btn-submit-id').disabled = true;

    ObservationEngine.record({
      step: 'Identification',
      label: `Guessed: NO3:${guessNitrate}, Cl:${guessChloride}, Br:${guessBromide}`,
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
    if (sample.hasNitrate) gasDesc = 'NO₂ (reddish-brown)';
    else if (sample.hasChloride) gasDesc = 'HCl (colourless)';
    else if (sample.hasBromide) gasDesc = 'Br₂ (reddish-brown)';

    document.getElementById('report-content').innerHTML = `
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Mixture Composition</h4>
        <p><strong>Sample Selected:</strong> ${sample.name}</p>
        <p><strong>Actual Salts:</strong> ${sample.constituents} (<code>${sample.formula}</code>)</p>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Warming Observations</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">Tube / Solution state</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${obs.solidHotCold === 'green' ? 'Solution turned green ✓' : 'No change'}</td></tr>
          <tr><td style="padding: 5px; border: 1px solid #3a4a5a;">Gas Evolved</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${gasDesc}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Confirmatory Vapour Tests</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">NH₄OH Rod Test</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.nh4oh === 'dense-white-fumes' ? 'Dense white fumes' : tests.nh4oh ? 'No fumes' : 'Not tested'}</td></tr>
          <tr><td style="padding: 5px; border: 1px solid #3a4a5a;">Fluorescence Paper Test</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.fluorescence === 'red' ? 'Paper turned red' : tests.fluorescence ? 'No change' : 'Not tested'}</td></tr>
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">FeSO₄ Paper Test</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.feso4 === 'brown' ? 'Paper turned brown' : tests.feso4 ? 'No change' : 'Not tested'}</td></tr>
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
          NH₄OH Rod: ${scoreBreakdown.nh4oh}/15 | Fluorescence Paper: ${scoreBreakdown.fluorescence}/15 | FeSO₄ Paper: ${scoreBreakdown.feso4}/15 <br>
          Constituent Identification: ${scoreBreakdown.identify}/40
        </p>
        <p style="font-size:0.85rem; margin-top: 5px;"><strong>Total Score: ${scoreBreakdown.total}/100</strong></p>
      </div>
      <div style="background: rgba(104,211,145,0.15); padding: 8px 12px; border-radius: 6px; border-left: 4px solid #68d391; font-size: 0.78rem;">
        <strong>Lab Conclusion:</strong> Copper turnings test confirms presence of: <br>
        ${[
          sample.hasNitrate ? 'Nitrate (NO₃⁻)' : null,
          sample.hasChloride ? 'Chloride (Cl⁻)' : null,
          sample.hasBromide ? 'Bromide (Br⁻)' : null
        ].filter(Boolean).join(', ') || 'No active acid radicals detected.'}
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
    doc.text('Experiment 7 — Copper Turnings Test (Nitrate Test) Report', margin, 20);

    // Body
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Sample: ' + sample.name, margin, y); y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Composition: ' + sample.constituents + ' (' + sample.formula + ')', margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Initial Observations (Copper Turnings + Con. H2SO4 + Warm):', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(' - Solution Color: ' + (obs.solidHotCold === 'green' ? 'Turns green' : 'Remains clear / normal'), margin, y); y += 5;
    doc.text(' - Evolved vapour colour: ' + obs.gasColour, margin, y); y += 5;
    doc.text(' - Evolved vapour odour: ' + obs.gasOdour, margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Vapour Test Results:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(' - NH4OH Rod Test: ' + (conductedTests.nh4oh || 'Not tested'), margin, y); y += 5;
    doc.text(' - Fluorescence Paper Test: ' + (conductedTests.fluorescence || 'Not tested'), margin, y); y += 5;
    doc.text(' - FeSO4 Paper Test: ' + (conductedTests.feso4 || 'Not tested'), margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Chemical Reaction Equation:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    const splitReaction = doc.splitTextToSize(sample.reaction, W - margin * 2);
    doc.text(splitReaction, margin, y); y += splitReaction.length * 5 + 3;

    doc.setFont('helvetica', 'bold');
    doc.text('Marking Scheme & Score:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('Observations: ' + scoreBreakdown.observations + '/15 | Vapour Tests: ' + (scoreBreakdown.nh4oh + scoreBreakdown.fluorescence + scoreBreakdown.feso4) + '/45 | ID: ' + scoreBreakdown.identify + '/40', margin, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Score: ' + scoreBreakdown.total + '/100', margin, y); y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Conclusion:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('Confirmed the presence of active acid radicals: ' + [
      sample.hasNitrate ? 'Nitrate' : null,
      sample.hasChloride ? 'Chloride' : null,
      sample.hasBromide ? 'Bromide' : null
    ].filter(Boolean).join(', '), margin, y);

    doc.save('CopperTurningsTest_Report.pdf');
  }

  function resetExperiment() {
    currentState = State.IDLE;
    currentSample = null;
    studentObservations = { solidHotCold: null, gasColour: null, gasOdour: null };
    conductedTests = { nh4oh: null, fluorescence: null, feso4: null };
    scoreBreakdown = { observations: 0, nh4oh: 0, fluorescence: 0, feso4: 0, identify: 0, total: 0 };

    ['observation-submit-panel', 'waft-result-panel', 'test-nh4oh-panel', 'test-fluorescence-panel', 'test-feso4-panel', 'identification-panel', 'report-panel', 'hint-box']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });

    // Reset buttons
    document.getElementById('btn-copper').disabled = true;
    document.getElementById('btn-acid').disabled = true;
    document.getElementById('btn-heat').disabled = true;
    document.getElementById('btn-waft').disabled = true;
    document.getElementById('btn-test-nh4oh').disabled = true;
    document.getElementById('btn-test-fluorescence').disabled = true;
    document.getElementById('btn-test-feso4').disabled = true;
    document.getElementById('btn-finish-tests').disabled = true;

    // Reset inputs
    document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#solid-hotcold-picker, #gas-colour-picker, #gas-odour-picker, #nh4oh-picker, #fluorescence-picker, #feso4-picker')
      .forEach(s => s.value = '');
    document.querySelectorAll('.id-checkbox').forEach(chk => { chk.checked = false; chk.disabled = false; });
    document.getElementById('btn-submit-id').disabled = false;

    ['lbl-id-nitrate', 'lbl-id-chloride', 'lbl-id-bromide'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.color = ''; el.style.fontWeight = ''; }
    });

    ['obs-sample', 'obs-solid', 'obs-gas-colour', 'obs-gas-odour', 'obs-nh4oh', 'obs-fluorescence', 'obs-feso4']
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
    say('Welcome! Select one of the 3 substances to begin qualitative copper turnings analysis.');
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

    document.getElementById('btn-copper').addEventListener('click', addCopper);
    document.getElementById('btn-acid').addEventListener('click', addAcid);
    document.getElementById('btn-heat').addEventListener('click', heatSample);
    document.getElementById('btn-waft').addEventListener('click', waftGas);
    
    // Obs submit
    document.getElementById('btn-submit-obs').addEventListener('click', handleObservationSubmit);

    // Vapour test triggers
    document.getElementById('btn-test-nh4oh').addEventListener('click', () => conductGasTest('nh4oh'));
    document.getElementById('btn-test-fluorescence').addEventListener('click', () => conductGasTest('fluorescence'));
    document.getElementById('btn-test-feso4').addEventListener('click', () => conductGasTest('feso4'));
    
    // Vapour test submissions
    document.getElementById('btn-submit-nh4oh').addEventListener('click', submitNH4OHTest);
    document.getElementById('btn-submit-fluorescence').addEventListener('click', submitFluorescenceTest);
    document.getElementById('btn-submit-feso4').addEventListener('click', submitFeSO4Test);

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

    document.getElementById('btn-download-pdf').addEventListener('click', downloadPDF);
    document.getElementById('btn-new-exp').addEventListener('click', resetExperiment);
    document.getElementById('btn-reset').addEventListener('click', resetExperiment);

    resetExperiment();
  }

  // Exports
  return {
    init: initEvents,
    getState: () => currentState,
    getSample: () => currentSample,
    onSamplePlaced: samplePlaced,
    onBurnerPlaced: burnerPlaced,
    igniteBurner: igniteBurner,
    waftGas: waftGas,
    showObservationsFromKey: showObservationsFromKey,
    selectSample: selectSample,
    addAcid: addAcid,
    addCopper: addCopper,
    reset: resetExperiment,
    showIdentificationPanel: showIdentificationPanel,
    conductGasTest: conductGasTest
  };

})();

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  CopperTurningsTest.init();
});
