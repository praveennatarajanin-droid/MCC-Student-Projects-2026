/**
* MnO2Test.js
* Experiment 6 — Manganese Dioxide Test
*
* Procedure:
*   To a small amount of the given mixture add equal amounts of MnO₂ and a few
*   drops of Concentrated Sulphuric Acid. Warm if necessary.
*
* Chemistry Logic:
*   - Chloride (Cl⁻):
*       MnO₂ + 2NaCl + 2H₂SO₄ → MnSO₄ + Na₂SO₄ + 2H₂O + Cl₂↑
*       Greenish-yellow Cl₂ gas → starch iodide paper turns blue
*       (Cl₂ oxidises I⁻ to I₂, which turns starch blue)
*
*   - Bromide (Br⁻):
*       MnO₂ + 2NaBr + 2H₂SO₄ → MnSO₄ + Na₂SO₄ + 2H₂O + Br₂↑
*       Reddish-brown Br₂ vapours → moist fluorescence paper turns red
*
*   - Oxalate (C₂O₄²⁻):
*       (C₂O₄²⁻) + H₂SO₄ → CO₂↑ + CO↑ + H₂O (effervescence)
*       Colourless CO₂ gas turns limewater milky (CaCO₃ precipitate)
*       Note: MnO₂ oxidises oxalate but the dominant observable is CO₂ with limewater
*/

const MnO2Test = (() => {

  // ── The 3 Substance Mixtures ──────────────────────────────────────────────
  const mixtures = {
    sample1: {
      id: 'sample1', name: 'Substance 1',
      formula: 'NaCl + Na₂C₂O₄',
      constituents: 'Sodium Chloride + Sodium Oxalate',
      hasChloride: true, hasBromide: false, hasOxalate: true,
      gasColour: 'greenish-yellow',
      gasOdour: 'pungent-chlorine',
      hasEffervescence: true,
      reaction: `Chloride: MnO₂ + 2NaCl + 2H₂SO₄ → MnSO₄ + Na₂SO₄ + 2H₂O + Cl₂↑ (greenish-yellow gas turning starch iodide paper blue)\nOxalate: (C₂O₄²⁻) + H₂SO₄ → CO₂↑ + H₂O (effervescence; limewater turns milky)`
    },
    sample2: {
      id: 'sample2', name: 'Substance 2',
      formula: 'KBr',
      constituents: 'Potassium Bromide',
      hasChloride: false, hasBromide: true, hasOxalate: false,
      gasColour: 'reddish-brown',
      gasOdour: 'pungent-bromine',
      hasEffervescence: false,
      reaction: `Bromide: MnO₂ + 2KBr + 2H₂SO₄ → MnSO₄ + K₂SO₄ + 2H₂O + Br₂↑ (reddish-brown vapours turning moist fluorescence paper red)`
    },
    sample3: {
      id: 'sample3', name: 'Substance 3',
      formula: 'NaCl + KBr + Na₂C₂O₄',
      constituents: 'Sodium Chloride + Potassium Bromide + Sodium Oxalate',
      hasChloride: true, hasBromide: true, hasOxalate: true,
      gasColour: 'reddish-brown', // Br₂ dominates colour
      gasOdour: 'pungent-bromine',
      hasEffervescence: true,
      reaction: `Chloride: MnO₂ + 2NaCl + 2H₂SO₄ → Cl₂↑ (greenish-yellow; starch iodide → blue)\nBromide: MnO₂ + 2KBr + 2H₂SO₄ → Br₂↑ (reddish-brown; fluorescence paper → red)\nOxalate: C₂O₄²⁻ + H₂SO₄ → CO₂↑ (effervescence; limewater → milky)`
    }
  };

  const allSampleIds = Object.keys(mixtures);

  // ── State Machine ─────────────────────────────────────────────────────────
  const State = {
    IDLE: 'IDLE',
    SAMPLE_SELECTED: 'SAMPLE_SELECTED',
    MNO2_ADDED: 'MNO2_ADDED',
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
    gasColour: null,
    gasOdour: null,
    effervescence: null
  };

  let conductedTests = {
    starch: null,        // 'blue', 'no-change'
    fluorescence: null,  // 'red', 'no-change'
    limewater: null      // 'milky', 'no-change'
  };

  let scoreBreakdown = {
    observations: 0,  // max 15
    starch: 0,        // max 15
    fluorescence: 0,  // max 15
    limewater: 0,     // max 15
    identify: 0,      // max 40
    total: 0
  };

  let hintTimer = null;

  // ── Helpers ───────────────────────────────────────────────────────────────
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
      scoreBreakdown.starch +
      scoreBreakdown.fluorescence +
      scoreBreakdown.limewater +
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

  function updateKeyGuide() {
    const el = document.getElementById('keyboard-guide-text');
    if (!el) return;
    const guides = {
      [State.IDLE]: '<span class="key-btn">Click</span> a substance button to begin the MnO₂ test',
      [State.SAMPLE_SELECTED]: '<span class="key-btn">M</span> Add MnO₂ powder',
      [State.MNO2_ADDED]: '<span class="key-btn">A</span> Add Con. H₂SO₄',
      [State.ACID_ADDED]: '<span class="key-btn">H</span> Warm the test tube',
      [State.HEATED]: '<span class="key-btn">W</span> Waft gas  |  <span class="key-btn">O</span> Record observations',
      [State.OBSERVED]: '<span class="key-btn">1</span> Starch test  <span class="key-btn">2</span> Fluorescence test  <span class="key-btn">3</span> Limewater test  <span class="key-btn">F</span> Finish',
      [State.TESTED_GAS]: '<span class="key-btn">1</span> Starch  <span class="key-btn">2</span> Fluorescence  <span class="key-btn">3</span> Limewater  <span class="key-btn">F</span> Finish &amp; Identify',
      [State.DONE]: '<span class="key-btn">R</span> Reset experiment'
    };
    el.innerHTML = guides[currentState] || 'Virtual Lab — MnO₂ Test';
  }

  // ── Step 1: Select Sample ─────────────────────────────────────────────────
  function selectSample(sampleId) {
    if (currentState !== State.IDLE) return;
    if (sampleId === 'random') {
      sampleId = allSampleIds[Math.floor(Math.random() * allSampleIds.length)];
    }
    currentSample = mixtures[sampleId];
    currentState = State.SAMPLE_SELECTED;
    setStep(2);

    document.getElementById('obs-sample').textContent =
      currentSample.name + ': ' + currentSample.constituents;
    document.getElementById('btn-mno2').disabled = false;

    say('Selected ' + currentSample.name + '. Now press M or click "Add MnO₂" to add equal amounts of Manganese Dioxide powder to the mixture.');
    ObservationEngine.record({ step: 'Sample Selected', label: currentSample.name + ' loaded' });

    if (typeof animateTakeSample6 === 'function') {
      animateTakeSample6(sampleId, () => updateKeyGuide());
    }
    updateKeyGuide();
  }

  // ── Step 2a: Add MnO₂ ────────────────────────────────────────────────────
  function addMnO2() {
    if (currentState !== State.SAMPLE_SELECTED) return;
    document.getElementById('btn-mno2').disabled = true;

    say('Adding equal amounts of Manganese Dioxide (MnO₂) powder to the mixture in the test tube…');

    const onComplete = () => {
      currentState = State.MNO2_ADDED;
      document.getElementById('btn-acid').disabled = false;
      say('MnO₂ added. Now press A or click "Add Con. H₂SO₄" to add a few drops of Concentrated Sulphuric Acid.');
      updateKeyGuide();
    };

    if (typeof animateAddMnO2 === 'function') {
      animateAddMnO2(onComplete);
    } else {
      setTimeout(onComplete, 1800);
    }
    updateKeyGuide();
  }

  // ── Step 2b: Add Acid ─────────────────────────────────────────────────────
  function addAcid() {
    if (currentState !== State.MNO2_ADDED) return;
    document.getElementById('btn-acid').disabled = true;

    say('Adding a few drops of Concentrated Sulphuric Acid to the mixture with MnO₂…');

    const onComplete = () => {
      currentState = State.ACID_ADDED;
      document.getElementById('btn-heat').disabled = false;
      say('Concentrated H₂SO₄ added. Now press H or click "Warm Test Tube" to gently warm the mixture and observe the reaction.');
      updateKeyGuide();
    };

    if (typeof animateAddAcid6 === 'function') {
      animateAddAcid6(onComplete);
    } else {
      setTimeout(onComplete, 2000);
    }
    updateKeyGuide();
  }

  // ── Step 3: Warm ──────────────────────────────────────────────────────────
  function warmTube() {
    if (currentState !== State.ACID_ADDED) return;
    currentState = State.HEATING;
    document.getElementById('btn-heat').disabled = true;
    setStep(3);

    say('Gently warming the test tube… Observe the colour and nature of any gas or vapour evolved.');
    updateKeyGuide();

    const onFinish = () => {
      currentState = State.HEATED;
      document.getElementById('btn-waft').disabled = false;
      document.getElementById('btn-obs').disabled = false;

      // Start fume animation based on sample
      if (typeof startFumes6 === 'function') {
        const ft = currentSample.hasChloride && !currentSample.hasBromide ? 'greenish' :
          currentSample.hasBromide ? 'brown' :
            currentSample.hasOxalate ? 'white' : 'white';
        startFumes6(ft);
      }

      let msg = 'Warming done! Gas/vapour observed. Press W to waft, then O to record your observations.';
      if (currentSample.hasChloride && !currentSample.hasBromide) {
        msg = 'Warming done! Observe a greenish-yellow gas being evolved — this is chlorine (Cl₂). Waft to detect its sharp odour!';
      } else if (currentSample.hasBromide) {
        msg = 'Warming done! Reddish-brown vapours rising from the tube — this is bromine (Br₂). Waft carefully!';
      }
      if (currentSample.hasOxalate) {
        msg += ' Brisk effervescence also noted — colourless gas is evolved.';
      }
      say(msg);
      updateKeyGuide();
    };

    if (typeof showReactionCountdown6 === 'function') {
      showReactionCountdown6(7, onFinish);
    } else {
      setTimeout(onFinish, 7000);
    }
  }

  // ── Waft Gas ──────────────────────────────────────────────────────────────
  function waftGas() {
    if (currentState !== State.HEATED && currentState !== State.OBSERVED &&
      currentState !== State.TESTING_GAS && currentState !== State.TESTED_GAS) return;

    const btnWaft = document.getElementById('btn-waft');
    btnWaft.disabled = true;
    say('Wafting the air above the test tube towards your nose…');

    const showResult = () => {
      let odourPopupText = 'No odour detected';
      if (currentSample.gasOdour === 'pungent-chlorine') {
        odourPopupText = 'Sharp, pungent chlorine-like odour';
      } else if (currentSample.gasOdour === 'pungent-bromine') {
        odourPopupText = 'Choking, pungent bromine-like odour';
      }

      ObservationEngine.record({ step: 'Waft Test', label: odourPopupText });
      document.getElementById('waft-result-text').textContent = odourPopupText;
      document.getElementById('waft-result-panel').classList.remove('hidden');
      btnWaft.disabled = false;
    };

    if (typeof animateWaft6 === 'function') {
      animateWaft6(currentSample, showResult);
    } else {
      setTimeout(showResult, 2000);
    }
  }

  function showObservationsFromKey() {
    if (currentState === State.HEATED) {
      document.getElementById('observation-submit-panel').classList.remove('hidden');
    }
  }

  // ── Submit Initial Observations ───────────────────────────────────────────
  function handleObservationSubmit() {
    const gasColourVal = document.getElementById('gas-colour-picker').value;
    const gasOdourVal = document.getElementById('gas-odour-picker').value;
    const effervescenceVal = document.getElementById('effervescence-picker').value;

    if (!gasColourVal || !gasOdourVal || !effervescenceVal) {
      showHint('Please select all three observations (gas colour, odour, and effervescence) before submitting.');
      return;
    }

    studentObservations.gasColour = gasColourVal;
    studentObservations.gasOdour = gasOdourVal;
    studentObservations.effervescence = effervescenceVal;

    // Update observation table
    const colourMap = {
      'none': 'No gas evolved',
      'greenish-yellow': 'Greenish-yellow gas (Cl₂)',
      'reddish-brown': 'Reddish-brown vapours (Br₂)',
      'colourless': 'Colourless gas (with effervescence)'
    };
    const odourMap = {
      'none': 'No odour',
      'pungent-chlorine': 'Pungent / chlorine-like',
      'pungent-bromine': 'Choking / bromine-like',
      'odourless': 'Odourless'
    };
    const effMap = {
      'none': 'No effervescence',
      'brisk': 'Brisk effervescence (colourless gas)'
    };

    const colorHexMap = {
      'none': 'transparent',
      'greenish-yellow': '#88dd44',
      'reddish-brown': '#9a4e10',
      'colourless': '#e2efff'
    };
    const colourSwatch = colorHexMap[gasColourVal] && gasColourVal !== 'none' ? `<span class="colour-swatch" style="background:${colorHexMap[gasColourVal]}; margin-right:6px;"></span>` : '';
    document.getElementById('obs-gas-colour').innerHTML = colourSwatch + (colourMap[gasColourVal] || gasColourVal);
    document.getElementById('obs-gas-odour').textContent = odourMap[gasOdourVal] || gasOdourVal;
    document.getElementById('obs-effervescence').textContent = effMap[effervescenceVal] || effervescenceVal;

    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#obs-gas-colour', { scale: 1.2, color: '#63b3ed' }, { scale: 1.0, color: '', duration: 0.6 });
      gsap.fromTo('#obs-gas-odour', { scale: 1.2, color: '#63b3ed' }, { scale: 1.0, color: '', duration: 0.6 });
      gsap.fromTo('#obs-effervescence', { scale: 1.2, color: '#63b3ed' }, { scale: 1.0, color: '', duration: 0.6 });
      gsap.fromTo('#observation-panel', { backgroundColor: 'rgba(99,179,237,0.18)' }, { backgroundColor: 'rgba(18, 26, 44, 0.94)', duration: 0.8 });
    }

    // Determine all scientifically correct observations based on the constituents
    const acceptableColours = [];
    const acceptableOdours = [];

    if (currentSample.hasChloride) {
      acceptableColours.push('greenish-yellow');
      acceptableOdours.push('pungent-chlorine');
    }
    if (currentSample.hasBromide) {
      acceptableColours.push('reddish-brown');
      acceptableOdours.push('pungent-bromine');
    }
    if (currentSample.hasOxalate) {
      acceptableColours.push('colourless');
      acceptableOdours.push('odourless');
    }

    // In case none match (safety fallback)
    if (acceptableColours.length === 0) acceptableColours.push('none');
    if (acceptableOdours.length === 0) acceptableOdours.push('none');

    const correctEff = currentSample.hasOxalate ? 'brisk' : 'none';

    let marks = 0;
    if (acceptableColours.includes(gasColourVal)) marks += 5;
    if (acceptableOdours.includes(gasOdourVal)) marks += 5;
    if (effervescenceVal === correctEff) marks += 5;
    scoreBreakdown.observations = marks;
    updateScore();

    ObservationEngine.record({
      step: 'Gas Observations',
      label: `Colour: ${gasColourVal}, Odour: ${gasOdourVal}, Effervescence: ${effervescenceVal}`
    });

    document.getElementById('observation-submit-panel').classList.add('hidden');

    if (marks < 15) {
      let hintMsg = 'Hint: ';
      if (currentSample.hasChloride && !currentSample.hasBromide) {
        hintMsg += 'MnO₂ oxidises Cl⁻ to Cl₂ gas — greenish-yellow, pungent (chlorine-like).';
      } else if (currentSample.hasBromide) {
        hintMsg += 'MnO₂ oxidises Br⁻ to Br₂ vapour — reddish-brown, choking odour.';
      }
      if (currentSample.hasOxalate) {
        hintMsg += ' Oxalate decomposes with H₂SO₄ — brisk effervescence of CO₂.';
      }
      showHint(hintMsg, 7000);
    }

    currentState = State.OBSERVED;
    setStep(4);
    document.getElementById('btn-obs').disabled = true;
    document.getElementById('btn-test-starch').disabled = false;
    document.getElementById('btn-test-fluorescence').disabled = false;
    document.getElementById('btn-test-limewater').disabled = false;
    document.getElementById('btn-finish-tests').disabled = false;
    say('Observations recorded. Conduct confirmatory tests: Starch Iodide, Fluorescence Paper, or Limewater — then click Finish & Identify.');
    updateKeyGuide();
  }

  // ── Gas Tests ─────────────────────────────────────────────────────────────
  function conductGasTest(testType) {
    if (currentState !== State.OBSERVED && currentState !== State.TESTED_GAS) return;
    currentState = State.TESTING_GAS;

    ['btn-test-starch', 'btn-test-fluorescence', 'btn-test-limewater', 'btn-finish-tests', 'btn-waft']
      .forEach(id => { const el = document.getElementById(id); if (el) el.disabled = true; });

    updateKeyGuide();

    if (testType === 'starch') {
      say('Holding moist starch iodide paper at the mouth of the test tube…');
      if (typeof animateStarchTest === 'function') {
        animateStarchTest(currentSample, () => {
          document.getElementById('test-starch-panel').classList.remove('hidden');
          say('Does the starch iodide paper change colour?');
        });
      } else {
        setTimeout(() => document.getElementById('test-starch-panel').classList.remove('hidden'), 2500);
      }
    } else if (testType === 'fluorescence') {
      say('Holding moist fluorescence paper at the test tube mouth…');
      if (typeof animateFluorescenceTest6 === 'function') {
        animateFluorescenceTest6(currentSample, () => {
          document.getElementById('test-fluorescence-panel').classList.remove('hidden');
          say('Does the fluorescence paper change colour?');
        });
      } else {
        setTimeout(() => document.getElementById('test-fluorescence-panel').classList.remove('hidden'), 2500);
      }
    } else if (testType === 'limewater') {
      say('Passing the evolved gas through limewater…');
      if (typeof animateLimewaterTest === 'function') {
        animateLimewaterTest(currentSample, () => {
          document.getElementById('test-limewater-panel').classList.remove('hidden');
          say('Does the limewater turn milky?');
        });
      } else {
        setTimeout(() => document.getElementById('test-limewater-panel').classList.remove('hidden'), 2500);
      }
    }
  }

  function submitStarchTest() {
    const result = document.getElementById('starch-picker').value;
    if (!result) { showHint('Please select an observation for the starch iodide paper.'); return; }
    conductedTests.starch = result;

    // Chloride (Cl₂) oxidises I⁻ in starch-iodide → turns blue
    const correct = currentSample.hasChloride ? 'blue' : 'no-change';
    scoreBreakdown.starch = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-starch').textContent =
      result === 'blue' ? 'Paper turned blue ✓' : 'No change';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#obs-starch', { scale: 1.2, color: '#63b3ed' }, { scale: 1.0, color: '', duration: 0.6 });
      gsap.fromTo('#observation-panel', { backgroundColor: 'rgba(99,179,237,0.18)' }, { backgroundColor: 'rgba(18, 26, 44, 0.94)', duration: 0.8 });
    }
    document.getElementById('test-starch-panel').classList.add('hidden');

    ObservationEngine.record({
      step: 'Starch Iodide Paper Test',
      label: result === 'blue' ? 'Paper turned blue' : 'No change',
      inference: result === 'blue' ? 'Cl₂ gas (Chloride) confirmed' : 'No Cl₂ detected'
    });

    if (result !== correct) {
      showHint('Hint: Cl₂ gas oxidises iodide (I⁻) to iodine (I₂), which forms a blue complex with starch. Only Chloride gives this reaction.', 6000);
    }
    restoreGasTestButtons();
  }

  function submitFluorescenceTest() {
    const result = document.getElementById('fluorescence-picker').value;
    if (!result) { showHint('Please select an observation for the fluorescence paper.'); return; }
    conductedTests.fluorescence = result;

    // Bromide (Br₂) turns fluorescence paper red
    const correct = currentSample.hasBromide ? 'red' : 'no-change';
    scoreBreakdown.fluorescence = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-fluorescence').textContent =
      result === 'red' ? 'Paper turned red ✓' : 'No change';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#obs-fluorescence', { scale: 1.2, color: '#63b3ed' }, { scale: 1.0, color: '', duration: 0.6 });
      gsap.fromTo('#observation-panel', { backgroundColor: 'rgba(99,179,237,0.18)' }, { backgroundColor: 'rgba(18, 26, 44, 0.94)', duration: 0.8 });
    }
    document.getElementById('test-fluorescence-panel').classList.add('hidden');

    ObservationEngine.record({
      step: 'Fluorescence Paper Test',
      label: result === 'red' ? 'Paper turned red' : 'No change',
      inference: result === 'red' ? 'Br₂ vapour (Bromide) confirmed' : 'No Br₂ detected'
    });

    if (result !== correct) {
      showHint('Hint: Br₂ vapour reacts with fluorescein dye on the moist paper to form eosin — a bright red compound.', 5000);
    }
    restoreGasTestButtons();
  }

  function submitLimewaterTest() {
    const result = document.getElementById('limewater-picker').value;
    if (!result) { showHint('Please select an observation for the limewater test.'); return; }
    conductedTests.limewater = result;

    // CO₂ from Oxalate decomposition turns limewater milky
    const correct = currentSample.hasOxalate ? 'milky' : 'no-change';
    scoreBreakdown.limewater = (result === correct) ? 15 : 0;
    updateScore();

    document.getElementById('obs-limewater').textContent =
      result === 'milky' ? 'Limewater turned milky ✓' : 'Limewater remains clear';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#obs-limewater', { scale: 1.2, color: '#63b3ed' }, { scale: 1.0, color: '', duration: 0.6 });
      gsap.fromTo('#observation-panel', { backgroundColor: 'rgba(99,179,237,0.18)' }, { backgroundColor: 'rgba(18, 26, 44, 0.94)', duration: 0.8 });
    }
    document.getElementById('test-limewater-panel').classList.add('hidden');

    ObservationEngine.record({
      step: 'Limewater Test',
      label: result === 'milky' ? 'Limewater turned milky (CaCO₃ ppt)' : 'No change',
      inference: result === 'milky' ? 'CO₂ gas (Oxalate) confirmed' : 'No CO₂ detected'
    });

    if (result !== correct) {
      showHint('Hint: CO₂ from oxalate decomposition reacts with Ca(OH)₂ → CaCO₃ (white ppt), turning limewater milky.', 5000);
    }
    restoreGasTestButtons();
  }

  function restoreGasTestButtons() {
    currentState = State.TESTED_GAS;
    ['btn-test-starch', 'btn-test-fluorescence', 'btn-test-limewater', 'btn-finish-tests', 'btn-waft']
      .forEach(id => { const el = document.getElementById(id); if (el) el.disabled = false; });
    say('Test recorded. Conduct more confirmatory tests or click "Finish & Identify" to conclude.');
    updateKeyGuide();

    if (typeof stopGasTestAnimations6 === 'function') stopGasTestAnimations6();
  }

  // ── Identification ────────────────────────────────────────────────────────
  function showIdentificationPanel() {
    setStep(5);
    currentState = State.IDENTIFYING;
    ['btn-test-starch', 'btn-test-fluorescence', 'btn-test-limewater', 'btn-finish-tests', 'btn-waft']
      .forEach(id => { const el = document.getElementById(id); if (el) el.disabled = true; });
    document.getElementById('identification-panel').classList.remove('hidden');
    say('Identify which ions (Chloride, Bromide, Oxalate) are present in the mixture. Select all that apply.');
    updateKeyGuide();
  }

  function handleIdentificationSubmit() {
    if (currentState !== State.IDENTIFYING) return;

    const guessChloride = document.getElementById('chk-id-chloride').checked;
    const guessBromide = document.getElementById('chk-id-bromide').checked;
    const guessOxalate = document.getElementById('chk-id-oxalate').checked;

    const actualChloride = currentSample.hasChloride;
    const actualBromide = currentSample.hasBromide;
    const actualOxalate = currentSample.hasOxalate;

    let correctCount = 0;
    if (guessChloride === actualChloride) correctCount++;
    if (guessBromide === actualBromide) correctCount++;
    if (guessOxalate === actualOxalate) correctCount++;

    const identifyScore = Math.min(40, Math.round(correctCount * 13.33));
    scoreBreakdown.identify = identifyScore;
    updateScore();

    const items = [
      { labelId: 'lbl-id-chloride', guessed: guessChloride, actual: actualChloride },
      { labelId: 'lbl-id-bromide', guessed: guessBromide, actual: actualBromide },
      { labelId: 'lbl-id-oxalate', guessed: guessOxalate, actual: actualOxalate }
    ];

    items.forEach(item => {
      const el = document.getElementById(item.labelId);
      if (!el) return;
      el.style.color = (item.guessed === item.actual) ? '#68d391' : '#fc8181';
      el.style.fontWeight = 'bold';
    });

    const isAllCorrect = correctCount === 3;
    if (isAllCorrect) {
      say('Excellent! You correctly identified all ionic species in the mixture!');
      if (typeof gsap !== 'undefined') {
        gsap.to('#score-display', { scale: 1.25, duration: 0.25, yoyo: true, repeat: 3 });
      }
    } else {
      say('Some identifications were incorrect. Review the MnO₂ test observations and chemical reactions.');
      const correctList = [];
      if (actualChloride) correctList.push('Chloride (Cl⁻)');
      if (actualBromide) correctList.push('Bromide (Br⁻)');
      if (actualOxalate) correctList.push('Oxalate (C₂O₄²⁻)');
      showHint(`Correct ions: ${correctList.join(', ')}. Reactions: ${currentSample.reaction}`, 10000);
    }

    document.querySelectorAll('.id-checkbox').forEach(chk => chk.disabled = true);
    document.getElementById('btn-submit-id').disabled = true;

    ObservationEngine.record({
      step: 'Identification',
      label: `Guessed: Cl:${guessChloride}, Br:${guessBromide}, Ox:${guessOxalate}`,
      inference: `Actual: ${currentSample.constituents}`
    });

    setTimeout(showReport, 2500);
  }

  // ── Lab Report ────────────────────────────────────────────────────────────
  function showReport() {
    currentState = State.DONE;
    setStep(6);
    document.getElementById('identification-panel').classList.add('hidden');
    document.getElementById('report-panel').classList.remove('hidden');
    updateKeyGuide();

    const s = currentSample;
    const obs = studentObservations;
    const tests = conductedTests;

    let gasDesc = 'No gas';
    if (s.hasChloride && s.hasBromide) gasDesc = 'Cl₂ (greenish-yellow) and Br₂ (reddish-brown)';
    else if (s.hasChloride) gasDesc = 'Cl₂ (greenish-yellow gas)';
    else if (s.hasBromide) gasDesc = 'Br₂ (reddish-brown vapours)';
    if (s.hasOxalate) gasDesc += ' + CO₂ (colourless, effervescence)';

    document.getElementById('report-content').innerHTML = `
      <div style="margin-bottom: 12px;">
        <h4 style="color: #9f7aea; margin: 4px 0; font-size: 0.85rem;">Experiment: Manganese Dioxide Test</h4>
        <p><strong>Sample:</strong> ${s.name} — ${s.constituents} (<code>${s.formula}</code>)</p>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Warming Observations (MnO₂ + Con. H₂SO₄)</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">Gas/Vapour Colour</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${gasDesc}</td></tr>
          <tr><td style="padding: 5px; border: 1px solid #3a4a5a;">Gas Odour</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${obs.gasOdour === 'pungent-chlorine' ? 'Sharp pungent (chlorine)' : obs.gasOdour === 'pungent-bromine' ? 'Choking pungent (bromine)' : obs.gasOdour || '—'}</td></tr>
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">Effervescence</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${s.hasOxalate ? 'Brisk effervescence (CO₂)' : 'None'}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Confirmatory Tests</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">Starch Iodide Paper</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.starch === 'blue' ? 'Turned blue → Cl⁻ confirmed' : tests.starch === 'no-change' ? 'No change' : 'Not tested'}</td></tr>
          <tr><td style="padding: 5px; border: 1px solid #3a4a5a;">Fluorescence Paper</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.fluorescence === 'red' ? 'Turned red → Br⁻ confirmed' : tests.fluorescence === 'no-change' ? 'No change' : 'Not tested'}</td></tr>
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 5px; border: 1px solid #3a4a5a;">Limewater</td><td style="padding: 5px; border: 1px solid #3a4a5a; text-align:right;">${tests.limewater === 'milky' ? 'Turned milky → C₂O₄²⁻ confirmed' : tests.limewater === 'no-change' ? 'Remains clear' : 'Not tested'}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Chemical Equations</h4>
        <p style="font-family: monospace; background: rgba(20,30,50,0.7); padding: 8px; border-radius: 4px; font-size: 0.7rem; white-space: pre-line;">${s.reaction}</p>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="color: #63b3ed; margin: 4px 0; font-size: 0.85rem;">Scoring</h4>
        <p style="font-size:0.78rem;">
          Observations: ${scoreBreakdown.observations}/15<br>
          Starch Iodide: ${scoreBreakdown.starch}/15 | Fluorescence: ${scoreBreakdown.fluorescence}/15 | Limewater: ${scoreBreakdown.limewater}/15<br>
          Ion Identification: ${scoreBreakdown.identify}/40
        </p>
        <p style="font-size:0.9rem; margin-top:5px;"><strong>Total Score: ${scoreBreakdown.total}/100</strong></p>
      </div>
      <div style="background: rgba(159,122,234,0.15); padding: 8px 12px; border-radius: 6px; border-left: 4px solid #9f7aea; font-size: 0.78rem;">
        <strong>Lab Conclusion:</strong> MnO₂ + Con. H₂SO₄ test confirms presence of:<br>
        ${[
        s.hasChloride ? 'Chloride (Cl⁻) — Cl₂ gas turns starch iodide paper blue' : null,
        s.hasBromide ? 'Bromide (Br⁻) — Br₂ vapour turns fluorescence paper red' : null,
        s.hasOxalate ? 'Oxalate (C₂O₄²⁻) — CO₂ effervescence turns limewater milky' : null
      ].filter(Boolean).join('<br>') || 'No diagnostic ions detected.'}
      </div>
    `;
  }

  // ── PDF Download ──────────────────────────────────────────────────────────
  function downloadPDF() {
    if (!window.jspdf) { alert('PDF library not loaded.'); return; }
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const s = currentSample;
    const obs = studentObservations;
    const W = 210, margin = 18;
    let y = 36;

    doc.setFillColor(14, 21, 40);
    doc.rect(0, 0, W, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Virtual Chemistry Lab', margin, 12);
    doc.setFontSize(10);
    doc.text('Experiment 6 — Manganese Dioxide Test Report', margin, 20);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Sample: ' + s.name, margin, y); y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Composition: ' + s.constituents + ' (' + s.formula + ')', margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Procedure: Add equal amounts of MnO2 + Con. H2SO4 (warm if necessary)', margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Observations (on warming):', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(' - Gas/Vapour Colour: ' + (obs.gasColour || '—'), margin, y); y += 5;
    doc.text(' - Gas Odour: ' + (obs.gasOdour || '—'), margin, y); y += 5;
    doc.text(' - Effervescence: ' + (obs.effervescence === 'brisk' ? 'Brisk effervescence (colourless gas)' : 'None'), margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Confirmatory Test Results:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(' - Starch Iodide Paper: ' + (conductedTests.starch === 'blue' ? 'Turned blue → Chloride confirmed' : conductedTests.starch || 'Not tested'), margin, y); y += 5;
    doc.text(' - Fluorescence Paper: ' + (conductedTests.fluorescence === 'red' ? 'Turned red → Bromide confirmed' : conductedTests.fluorescence || 'Not tested'), margin, y); y += 5;
    doc.text(' - Limewater: ' + (conductedTests.limewater === 'milky' ? 'Turned milky → Oxalate confirmed' : conductedTests.limewater || 'Not tested'), margin, y); y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Chemical Equations:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    const splitRxn = doc.splitTextToSize(s.reaction, W - margin * 2);
    doc.text(splitRxn, margin, y); y += splitRxn.length * 5 + 3;

    doc.setFont('helvetica', 'bold');
    doc.text('Score:', margin, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Observations: ${scoreBreakdown.observations}/15 | Tests: ${scoreBreakdown.starch + scoreBreakdown.fluorescence + scoreBreakdown.limewater}/45 | ID: ${scoreBreakdown.identify}/40`, margin, y); y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${scoreBreakdown.total}/100`, margin, y);

    doc.save('MnO2Test_Report.pdf');
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function resetExperiment() {
    currentState = State.IDLE;
    currentSample = null;
    studentObservations = { gasColour: null, gasOdour: null, effervescence: null };
    conductedTests = { starch: null, fluorescence: null, limewater: null };
    scoreBreakdown = { observations: 0, starch: 0, fluorescence: 0, limewater: 0, identify: 0, total: 0 };

    ['observation-submit-panel', 'waft-result-panel', 'test-starch-panel', 'test-fluorescence-panel',
      'test-limewater-panel', 'identification-panel', 'report-panel', 'hint-box']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });

    document.getElementById('btn-mno2').disabled = true;
    document.getElementById('btn-acid').disabled = true;
    document.getElementById('btn-heat').disabled = true;
    document.getElementById('btn-waft').disabled = true;
    document.getElementById('btn-obs').disabled = true;
    document.getElementById('btn-test-starch').disabled = true;
    document.getElementById('btn-test-fluorescence').disabled = true;
    document.getElementById('btn-test-limewater').disabled = true;
    document.getElementById('btn-finish-tests').disabled = true;

    document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#gas-colour-picker, #gas-odour-picker, #effervescence-picker, #starch-picker, #fluorescence-picker, #limewater-picker')
      .forEach(s => { s.value = ''; });
    document.querySelectorAll('.id-checkbox').forEach(chk => { chk.checked = false; chk.disabled = false; });
    document.getElementById('btn-submit-id').disabled = false;

    ['lbl-id-chloride', 'lbl-id-bromide', 'lbl-id-oxalate'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.color = ''; el.style.fontWeight = ''; }
    });
    document.querySelectorAll('.id-check-item').forEach(item => {
      item.style.background = '';
      item.style.borderColor = '';
    });
    const swatch = document.getElementById('gas-colour-swatch-live');
    if (swatch) {
      swatch.style.background = 'transparent';
      swatch.style.border = '';
    }

    ['obs-sample', 'obs-gas-colour', 'obs-gas-odour', 'obs-effervescence', 'obs-starch', 'obs-fluorescence', 'obs-limewater']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
      });

    document.getElementById('score-val').textContent = '0';
    ObservationEngine.reset();
    setStep(1);

    if (typeof stopFumes6 === 'function') stopFumes6();
    if (typeof stopHeating6 === 'function') stopHeating6();

    say('Welcome! Select one of the 3 substances to begin the Manganese Dioxide Test.');
    updateKeyGuide();
  }

  // ── Event Listeners ───────────────────────────────────────────────────────
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

    document.getElementById('btn-mno2').addEventListener('click', addMnO2);
    document.getElementById('btn-acid').addEventListener('click', addAcid);
    document.getElementById('btn-heat').addEventListener('click', warmTube);
    document.getElementById('btn-waft').addEventListener('click', waftGas);
    document.getElementById('btn-obs').addEventListener('click', showObservationsFromKey);

    document.getElementById('btn-submit-obs').addEventListener('click', handleObservationSubmit);

    // Live color swatch update for Gas Colour select picker
    const colPicker = document.getElementById('gas-colour-picker');
    if (colPicker) {
      colPicker.addEventListener('change', () => {
        const val = colPicker.value;
        const colorHexMap = {
          'none': 'transparent',
          'greenish-yellow': '#88dd44',
          'reddish-brown': '#9a4e10',
          'colourless': '#e2efff'
        };
        const swatch = document.getElementById('gas-colour-swatch-live');
        if (swatch) {
          swatch.style.background = colorHexMap[val] || 'transparent';
          if (val === 'colourless') {
            swatch.style.border = '1px dashed rgba(255,255,255,0.5)';
          } else {
            swatch.style.border = '';
          }
        }
      });
    }

    // Active checked state styling for Identification panel checkboxes
    document.querySelectorAll('.id-checkbox').forEach(chk => {
      chk.addEventListener('change', () => {
        const item = chk.closest('.id-check-item');
        if (item) {
          if (chk.checked) {
            item.style.background = 'rgba(99, 179, 237, 0.2)';
            item.style.borderColor = 'rgba(99, 179, 237, 0.6)';
          } else {
            item.style.background = '';
            item.style.borderColor = '';
          }
        }
      });
    });

    document.getElementById('btn-test-starch').addEventListener('click', () => conductGasTest('starch'));
    document.getElementById('btn-test-fluorescence').addEventListener('click', () => conductGasTest('fluorescence'));
    document.getElementById('btn-test-limewater').addEventListener('click', () => conductGasTest('limewater'));

    document.getElementById('btn-submit-starch').addEventListener('click', submitStarchTest);
    document.getElementById('btn-submit-fluorescence').addEventListener('click', submitFluorescenceTest);
    document.getElementById('btn-submit-limewater').addEventListener('click', submitLimewaterTest);

    document.getElementById('btn-finish-tests').addEventListener('click', showIdentificationPanel);
    document.getElementById('btn-submit-id').addEventListener('click', handleIdentificationSubmit);

    document.getElementById('btn-close-waft').addEventListener('click', () => {
      document.getElementById('waft-result-panel').classList.add('hidden');
      if (currentState === State.HEATED) {
        document.getElementById('observation-submit-panel').classList.remove('hidden');
      }
    });

    document.getElementById('btn-reset').addEventListener('click', resetExperiment);
    document.getElementById('btn-download-pdf').addEventListener('click', downloadPDF);
    document.getElementById('btn-new-exp').addEventListener('click', () => {
      document.getElementById('report-panel').classList.add('hidden');
      resetExperiment();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      if (key === 'm' && !document.getElementById('btn-mno2').disabled) addMnO2();
      if (key === 'a' && !document.getElementById('btn-acid').disabled) addAcid();
      if (key === 'h' && !document.getElementById('btn-heat').disabled) warmTube();
      if (key === 'w' && !document.getElementById('btn-waft').disabled) waftGas();
      if (key === 'o' && currentState === State.HEATED) showObservationsFromKey();
      if (key === '1' && !document.getElementById('btn-test-starch').disabled) conductGasTest('starch');
      if (key === '2' && !document.getElementById('btn-test-fluorescence').disabled) conductGasTest('fluorescence');
      if (key === '3' && !document.getElementById('btn-test-limewater').disabled) conductGasTest('limewater');
      if (key === 'f' && !document.getElementById('btn-finish-tests').disabled) showIdentificationPanel();
      if (key === 'r') resetExperiment();
    });
  }

  return {
    init: () => {
      initEvents();
      resetExperiment();
      console.log('[MnO₂ Test] Experiment 6 logic ready.');
    },
    reset: resetExperiment,
    getSample: () => currentSample,
    getState: () => currentState,
    getConductedTests: () => conductedTests,
    selectSample,
    addMnO2,
    addAcid,
    warmTube,
    waftGas,
    conductGasTest,
    showObservationsFromKey,
    showIdentificationPanel
  };
})();

// Boot
MnO2Test.init();
