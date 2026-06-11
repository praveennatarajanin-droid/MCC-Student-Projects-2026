/**
 * CarbonateTest.js
 * Experiment 3 — Carbonate detection using dilute HCl
 * 
 * Chemistry:
 *   CO₃²⁻ + 2H⁺ → CO₂↑ + H₂O
 *   CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O (milky precipitate)
 * 
 * Observations:
 *   - Brisk effervescence (vigorous bubbling)
 *   - Colourless, odourless gas (CO₂)
 *   - Limewater turns milky (confirms CO₂)
 */

const CarbonateTest = (() => {

  // Sample database
  const samples = {
    sodiumCarbonate: {
      id: 'sodiumCarbonate', name: 'Sodium Carbonate', formula: 'Na₂CO₃',
      anion: 'CO₃²⁻', anionName: 'Carbonate',
      effervescence: 'brisk', gasColour: 'colourless', gasOdour: 'odourless',
      limewaterResult: 'milky', inference: 'Carbonate (CO₃²⁻) confirmed',
      reaction: 'Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑', isCarbonate: true
    },
    sodiumBicarbonate: {
      id: 'sodiumBicarbonate', name: 'Sodium Bicarbonate', formula: 'NaHCO₃',
      anion: 'HCO₃⁻', anionName: 'Bicarbonate',
      effervescence: 'brisk', gasColour: 'colourless', gasOdour: 'odourless',
      limewaterResult: 'milky', inference: 'Bicarbonate (HCO₃⁻) confirmed',
      reaction: 'NaHCO₃ + HCl → NaCl + H₂O + CO₂↑', isCarbonate: true
    },
    potassiumCarbonate: {
      id: 'potassiumCarbonate', name: 'Potassium Carbonate', formula: 'K₂CO₃',
      anion: 'CO₃²⁻', anionName: 'Carbonate',
      effervescence: 'brisk', gasColour: 'colourless', gasOdour: 'odourless',
      limewaterResult: 'milky', inference: 'Carbonate (CO₃²⁻) confirmed',
      reaction: 'K₂CO₃ + 2HCl → 2KCl + H₂O + CO₂↑', isCarbonate: true
    },
    calciumCarbonate: {
      id: 'calciumCarbonate', name: 'Calcium Carbonate', formula: 'CaCO₃',
      anion: 'CO₃²⁻', anionName: 'Carbonate',
      effervescence: 'brisk', gasColour: 'colourless', gasOdour: 'odourless',
      limewaterResult: 'milky', inference: 'Carbonate (CO₃²⁻) confirmed',
      reaction: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑', isCarbonate: true
    },
    sodiumSulphide: {
      id: 'sodiumSulphide', name: 'Sodium Sulphide', formula: 'Na₂S',
      anion: 'S²⁻', anionName: 'Sulphide',
      effervescence: 'brisk', gasColour: 'colourless', gasOdour: 'rotten-egg',
      limewaterResult: 'clear', inference: 'Sulphide (S²⁻) present — H₂S gas',
      reaction: 'Na₂S + 2HCl → 2NaCl + H₂S↑', isCarbonate: false
    },
    sodiumSulphite: {
      id: 'sodiumSulphite', name: 'Sodium Sulphite', formula: 'Na₂SO₃',
      anion: 'SO₃²⁻', anionName: 'Sulphite',
      effervescence: 'brisk', gasColour: 'colourless', gasOdour: 'pungent',
      limewaterResult: 'clear', inference: 'Sulphite (SO₃²⁻) — SO₂ gas',
      reaction: 'Na₂SO₃ + 2HCl → 2NaCl + H₂O + SO₂↑', isCarbonate: false
    },
    sodiumNitrite: {
      id: 'sodiumNitrite', name: 'Sodium Nitrite', formula: 'NaNO₂',
      anion: 'NO₂⁻', anionName: 'Nitrite',
      effervescence: 'slow', gasColour: 'brown', gasOdour: 'pungent',
      limewaterResult: 'clear', inference: 'Nitrite (NO₂⁻) — brown NO₂ gas',
      reaction: '2NaNO₂ + 2HCl → 2NaCl + H₂O + NO↑ + NO₂↑', isCarbonate: false
    },
    sodiumChloride: {
      id: 'sodiumChloride', name: 'Sodium Chloride', formula: 'NaCl',
      anion: 'Cl⁻', anionName: 'Chloride',
      effervescence: 'none', gasColour: 'none', gasOdour: 'none',
      limewaterResult: 'clear', inference: 'No acid-reactive anion present',
      reaction: 'No visible reaction', isCarbonate: false
    },
    sodiumSulphate: {
      id: 'sodiumSulphate', name: 'Sodium Sulphate', formula: 'Na₂SO₄',
      anion: 'SO₄²⁻', anionName: 'Sulphate',
      effervescence: 'none', gasColour: 'none', gasOdour: 'none',
      limewaterResult: 'clear', inference: 'Sulphate does not react with dilute HCl',
      reaction: 'No visible reaction', isCarbonate: false
    }
  };

  const carbonateSamples = ['sodiumCarbonate', 'sodiumBicarbonate', 'potassiumCarbonate', 'calciumCarbonate'];
  const allSamples = Object.keys(samples);

  // State machine
  const State = { IDLE: 'IDLE', SAMPLE_SELECTED: 'SAMPLE_SELECTED', HCl_ADDED: 'HCl_ADDED',
    EFFERVESCENCE_OBSERVED: 'EFFERVESCENCE_OBSERVED', LIMEWATER_TESTED: 'LIMEWATER_TESTED',
    IDENTIFYING: 'IDENTIFYING', DONE: 'DONE' };

  let currentState = State.IDLE;
  let currentSample = null;
  let studentObservations = { effervescence: null, gasColour: null, gasOdour: null, limewater: null };
  let hintTimer = null;
  let scoreBreakdown = { effervescence: 0, gas: 0, limewater: 0, identify: 0, total: 0 };

  // UI Helpers
  const STEP_IDS = ['step-1','step-2','step-3','step-4','step-5','step-6'];

  function setStep(n) {
    STEP_IDS.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('active','done');
      if (i + 1 === n) el.classList.add('active');
      if (i + 1 < n) el.classList.add('done');
    });
  }

  function say(msg, delay = 0) {
    setTimeout(() => {
      const el = document.getElementById('assistant-msg');
      if (!el) return;
      el.style.opacity = '0';
      setTimeout(() => { el.textContent = msg; el.style.transition = 'opacity .35s'; el.style.opacity = '1'; }, 120);
    }, delay);
  }

  function showHint(text, duration = 6000) {
    const box = document.getElementById('hint-box'), span = document.getElementById('hint-text');
    if (!box || !span) return;
    span.textContent = text;
    box.classList.remove('hidden');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => box.classList.add('hidden'), duration);
  }

  function updateScore() {
    scoreBreakdown.total = scoreBreakdown.effervescence + scoreBreakdown.gas + 
                           scoreBreakdown.limewater + scoreBreakdown.identify;
    document.getElementById('score-val').textContent = scoreBreakdown.total;
  }

  // 1. Select Sample
  function selectSample(sampleId) {
    if (currentState !== State.IDLE) return;
    if (!samples[sampleId]) {
      sampleId = allSamples[Math.floor(Math.random() * allSamples.length)];
    }
    currentSample = samples[sampleId];
    currentState = State.SAMPLE_SELECTED;

    document.getElementById('btn-unknown').disabled = true;
    document.getElementById('btn-random').disabled = true;

    const sampleIndices = {
      sodiumCarbonate: 0,
      sodiumBicarbonate: 1,
      potassiumCarbonate: 2,
      calciumCarbonate: 3,
      sodiumSulphide: 4
    };
    let idx = sampleIndices[currentSample.id] !== undefined ? sampleIndices[currentSample.id] : 4;

    if (typeof animateTakeSample === 'function') {
      animateTakeSample(idx, () => {
        setStep(2);
        document.getElementById('obs-sample').textContent = currentSample.name + ' (' + currentSample.formula + ')';
        document.getElementById('btn-add-hcl').disabled = true; // wait for scoop
        say('Sample selected. Press S to scoop the sample powder onto the watch glass using the spatula.');
        ObservationEngine.record({ step: 'Sample Selected', sample: currentSample.name });
      });
    } else {
      setStep(2);
      document.getElementById('obs-sample').textContent = currentSample.name + ' (' + currentSample.formula + ')';
      document.getElementById('btn-add-hcl').disabled = true; // wait for scoop
      say('Sample selected. Press S to scoop the sample powder onto the watch glass using the spatula.');
      ObservationEngine.record({ step: 'Sample Selected', sample: currentSample.name });
    }
  }

  // 1.5 Spatula scoop complete callback
  function samplePlaced() {
    document.getElementById('btn-add-hcl').disabled = false;
    say('Sample powder is placed on the watch glass. Press H or click Add Dilute HCl to take the acid dropper.');
  }

  // 2. Add HCl — run dropper take animation, wait for student to add drops
  function addHCl() {
    if (currentState !== State.SAMPLE_SELECTED) return;
    currentState = State.HCl_ADDED;
    document.getElementById('btn-add-hcl').disabled = true;
    document.getElementById('obs-reagent').textContent = 'Dil. HCl added';

    // Hard-hide the panel — no accidental show
    const effPanel = document.getElementById('effervescence-panel');
    if (effPanel) effPanel.classList.add('hidden');

    setStep(3);
    ObservationEngine.record({ step: 'Reagent Added', reagent: 'Dil. HCl' });

    // 3D animation
    if (typeof animateHClReaction === 'function') animateHClReaction();
    say('HCl dropper ready. Press Space or D to dispense drops of dilute HCl onto the sample.');
  }

  // 2.5 Trigger HCl reaction after drops are dispensed
  function triggerHClReaction() {
    // Start effervescence bubbles
    if (currentSample && currentSample.effervescence !== 'none') {
      if (typeof startEffervescence === 'function') {
        startEffervescence();
      }
    }

    // Nitrite gas color effect
    if (currentSample && currentSample.gasColour === 'brown') {
      if (typeof bubbles !== 'undefined') {
        bubbles.forEach(b => {
          b.material.color.setHex(0x8b4513); // brown
          b.material.emissive.setHex(0x5c2c16);
        });
      }
    } else {
      if (typeof bubbles !== 'undefined') {
        bubbles.forEach(b => {
          b.material.color.setHex(0xccddff);
          b.material.emissive.setHex(0x224488);
        });
      }
    }

    say('Dilute HCl added! Observe the reaction carefully.');

    if (typeof showReactionCountdown === 'function') {
      showReactionCountdown(7, () => {
        say('Reaction observed. Press W to waft the gas and detect odour, or press O to open the observation panel.');
        // Enable waft button so student can test odour
        const waftBtn = document.getElementById('btn-waft');
        if (waftBtn) waftBtn.disabled = false;
      });
    } else {
      setTimeout(() => {
        say('Reaction observed. Press W to waft the gas and detect odour, or press O to open the observation panel.');
        const waftBtn = document.getElementById('btn-waft');
        if (waftBtn) waftBtn.disabled = false;
      }, 7000);
    }
  }

  // 2.6 Waft Gas — detect odour of evolved gas
  function waftGas() {
    if (!currentSample || currentState !== State.HCl_ADDED) return;
    const waftBtn = document.getElementById('btn-waft');
    if (waftBtn && waftBtn.disabled) return;

    // Run a brief camera wobble to simulate wafting
    if (typeof runWaftAnimation === 'function') {
      runWaftAnimation(showWaftResult);
    } else {
      showWaftResult();
    }
  }

  function showWaftResult() {
    const panel = document.getElementById('waft-result-panel');
    const resultEl = document.getElementById('waft-result-text');
    if (!panel || !resultEl) return;

    const odour = currentSample.gasOdour;
    let odourText;
    if (odour === 'odourless')  odourText = 'Odourless — no perceptible smell detected';
    else if (odour === 'rotten-egg') odourText = 'Rotten egg odour — characteristic of H\u2082S gas';
    else if (odour === 'pungent') odourText = 'Pungent / irritating odour — characteristic of SO\u2082 or NH\u2083';
    else odourText = 'No gas evolved — no odour detected';

    resultEl.textContent = odourText;
    panel.classList.remove('hidden');
    say('Odour detected during wafting. Record this observation.');
    // Pre-fill the gas odour picker for convenience
    const picker = document.getElementById('gas-odour-picker');
    if (picker && odour && odour !== 'none') picker.value = odour;
  }

  // 3. Show Effervescence Panel
  function showEffervescencePanel() {
    setStep(4);
    document.getElementById('effervescence-panel').classList.remove('hidden');
    say('Now record what you observed: effervescence, gas colour and odour.');
  }

  // 4. Handle Effervescence Submit
  function handleEffervescenceSubmit() {
    const effervescence = document.getElementById('effervescence-picker').value;
    const gasColour = document.getElementById('gas-colour-picker').value;
    const gasOdour = document.getElementById('gas-odour-picker').value;

    if (!effervescence || !gasColour || !gasOdour) {
      showHint('Please select all three observations before submitting.');
      return;
    }

    studentObservations.effervescence = effervescence;
    studentObservations.gasColour = gasColour;
    studentObservations.gasOdour = gasOdour;

    document.getElementById('obs-effervescence').textContent = 
      effervescence === 'brisk' ? 'Brisk effervescence observed' :
      effervescence === 'slow' ? 'Slow effervescence observed' : 'No effervescence';
    document.getElementById('obs-gas-colour').textContent = 
      gasColour === 'colourless' ? 'Colourless gas' : gasColour.charAt(0).toUpperCase() + gasColour.slice(1);
    document.getElementById('obs-gas-odour').textContent = 
      gasOdour === 'odourless' ? 'Odourless gas' :
      gasOdour === 'rotten-egg' ? 'Rotten egg smell (H₂S)' : 'Pungent odour';

    let correctCount = 0;
    if (effervescence === currentSample.effervescence) { correctCount++; scoreBreakdown.effervescence = 15; }
    if (gasColour === currentSample.gasColour) { correctCount++; scoreBreakdown.gas = (scoreBreakdown.gas || 0) + 10; }
    if (gasOdour === currentSample.gasOdour)   { correctCount++; scoreBreakdown.gas = Math.min(20, (scoreBreakdown.gas || 0) + 10); }

    updateScore();
    ObservationEngine.record({ step: 'Effervescence Observation', effervescence, gasColour, gasOdour });
    document.getElementById('effervescence-panel').classList.add('hidden');

    if (correctCount < 3) {
      showHint(`Hint: Actual - Effervescence: ${currentSample.effervescence}, Colour: ${currentSample.gasColour}, Odour: ${currentSample.gasOdour}`, 7000);
    }

    if (currentSample.effervescence !== 'none') {
      currentState = State.EFFERVESCENCE_OBSERVED;
      setStep(5);
      document.getElementById('btn-test-gas').disabled = false;
      say('Gas evolved! Now test the gas by passing it through limewater.');
    } else {
      showIdentificationPanel();
    }
  }

  // 5. Limewater Test
  function showLimewaterPanel() {
    if (currentState !== State.EFFERVESCENCE_OBSERVED) return;
    document.getElementById('btn-test-gas').disabled = true;
    
    const lwPanel = document.getElementById('limewater-panel');
    if (lwPanel) lwPanel.classList.add('hidden');
    
    if (typeof animateTakeLimewater === 'function') {
      animateTakeLimewater(() => {
        say('Limewater stand and bottle placed on the table. Press P to pour limewater into the test tube.');
      });
    } else {
      say('Limewater stand placed on table. Press P to pour.');
    }
  }

  function triggerLimewaterMilkyEffect() {
    if (currentSample && currentSample.limewaterResult === 'milky') {
      if (typeof makeLimewaterMilky === 'function') {
        makeLimewaterMilky();
      }
    } else {
      say('Gas is passing through the limewater, but no precipitate forms.');
    }

    setTimeout(() => {
      say('Reaction complete. Press O to open the Limewater Observation Panel.');
      if (typeof updateKeyboardGuideText === 'function') {
        updateKeyboardGuideText();
      }
    }, 2500);
  }

  function showLimewaterPanelFromKey() {
    const panel = document.getElementById('limewater-panel');
    if (panel) {
      panel.classList.remove('hidden');
    }
    
    const tube2D = document.getElementById('limewater-tube');
    const status2D = document.getElementById('limewater-status');
    
    if (currentSample && currentSample.limewaterResult === 'milky') {
      if (tube2D) tube2D.classList.add('milky');
      if (status2D) status2D.textContent = 'Limewater turned milky!';
    } else {
      if (tube2D) tube2D.classList.remove('milky');
      if (status2D) status2D.textContent = 'Limewater remained clear';
    }
    
    say('Record what happened to the limewater.');
  }

  function handleLimewaterSubmit() {
    const limewaterResult = document.getElementById('limewater-picker').value;
    if (!limewaterResult) { showHint('Please select your observation.'); return; }

    studentObservations.limewater = limewaterResult;
    document.getElementById('obs-limewater').textContent = 
      limewaterResult === 'milky' ? 'Limewater turned milky' : 'Limewater remained clear';

    // ── 3D: animate limewater tube if milky ──────────────────────────────
    if (limewaterResult === 'milky' && typeof makeLimewaterMilky === 'function') {
      makeLimewaterMilky();
    }

    if (limewaterResult === currentSample.limewaterResult) {
      scoreBreakdown.limewater = 25;
    } else {
      showHint(`Hint: The limewater ${currentSample.limewaterResult === 'milky' ? 'turned milky' : 'remained clear'}.`, 5000);
    }
    updateScore();

    ObservationEngine.record({ step: 'Limewater Test', result: limewaterResult === 'milky' ? 'Milky' : 'Clear' });
    document.getElementById('limewater-panel').classList.add('hidden');
    document.getElementById('obs-inference').textContent = 
      limewaterResult === 'milky' ? 'CO₂ confirmed — Carbonate/Bicarbonate present' : 'No CO₂ detected';
    currentState = State.LIMEWATER_TESTED;
    showIdentificationPanel();
  }

  // 6. Identification
  function showIdentificationPanel() {
    setStep(6);
    currentState = State.IDENTIFYING;
    document.getElementById('id-panel').classList.remove('hidden');
    say('Based on your observations, identify the anion present in the sample.');
  }

  function handleIdentification(guessedAnion) {
    if (currentState !== State.IDENTIFYING) return;
    const isCorrect = guessedAnion === 'carbonate' && currentSample.isCarbonate;

    if (isCorrect || (guessedAnion === 'bicarbonate' && currentSample.anion === 'HCO₃⁻')) {
      scoreBreakdown.identify = 40;
      say('Excellent! Carbonate/Bicarbonate correctly identified!');
      if (typeof gsap !== 'undefined') {
        gsap.to('#score-display', { scale: 1.3, duration: 0.3, yoyo: true, repeat: 3 });
      }
    } else {
      scoreBreakdown.identify = 0;
      showHint(`Correct answer: ${currentSample.anionName} (${currentSample.anion}). Reaction: ${currentSample.reaction}`, 8000);
      say('Incorrect identification. Review the procedure and try again next time.');
    }
    updateScore();

    document.querySelectorAll('.id-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.anion === guessedAnion) btn.style.background = isCorrect ? '#22aa22' : '#aa2222';
    });

    ObservationEngine.record({ step: 'Identification', guessed: guessedAnion, correct: currentSample.anionName });
    setTimeout(showReport, 2000);
  }

  // 7. Report
  function showReport() {
    currentState = State.DONE;
    document.getElementById('id-panel').classList.add('hidden');
    document.getElementById('report-panel').classList.remove('hidden');

    const sample = currentSample, obs = studentObservations;
    document.getElementById('report-content').innerHTML = `
      <div style="margin-bottom: 15px;">
        <h4 style="color: #88ccff; margin: 5px 0;">Sample Details</h4>
        <p><strong>Unknown Sample:</strong> ${sample.name} (${sample.formula})</p>
        <p><strong>Anion Present:</strong> ${sample.anionName} (${sample.anion})</p>
      </div>
      <div style="margin-bottom: 15px;">
        <h4 style="color: #88ccff; margin: 5px 0;">Observations</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 6px; border: 1px solid #3a4a5a;">Effervescence</td><td style="padding: 6px; border: 1px solid #3a4a5a;">${obs.effervescence || '—'}</td></tr>
          <tr><td style="padding: 6px; border: 1px solid #3a4a5a;">Gas Colour</td><td style="padding: 6px; border: 1px solid #3a4a5a;">${obs.gasColour || '—'}</td></tr>
          <tr style="background: rgba(40,50,70,0.5);"><td style="padding: 6px; border: 1px solid #3a4a5a;">Gas Odour</td><td style="padding: 6px; border: 1px solid #3a4a5a;">${obs.gasOdour || '—'}</td></tr>
          <tr><td style="padding: 6px; border: 1px solid #3a4a5a;">Limewater Test</td><td style="padding: 6px; border: 1px solid #3a4a5a;">${obs.limewater || '—'}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 15px;">
        <h4 style="color: #88ccff; margin: 5px 0;">Chemical Reaction</h4>
        <p style="font-family: monospace; background: rgba(40,50,70,0.5); padding: 8px; border-radius: 4px;">${sample.reaction}</p>
      </div>
      <div style="margin-bottom: 15px;">
        <h4 style="color: #88ccff; margin: 5px 0;">Scoring</h4>
        <p>Effervescence: ${scoreBreakdown.effervescence}/15 | Gas: ${scoreBreakdown.gas}/20 | Limewater: ${scoreBreakdown.limewater}/25 | ID: ${scoreBreakdown.identify}/40</p>
        <p><strong>Total: ${scoreBreakdown.total}/100</strong></p>
      </div>
      <div style="background: rgba(34,139,34,0.2); padding: 10px; border-radius: 6px; border-left: 4px solid #22aa22;">
        <strong>Conclusion:</strong> ${sample.inference}
      </div>
    `;
  }

  // PDF Download
  function downloadPDF() {
    if (!window.jspdf) { alert('PDF library not loaded.'); return; }
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const sample = currentSample, obs = studentObservations;
    const W = 210, margin = 18;
    let y = 36;

    doc.setFillColor(14, 21, 32);
    doc.rect(0, 0, W, 28, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('Virtual Chemistry Lab', margin, 12);
    doc.setFontSize(10); doc.text('Experiment 3 — Carbonate Test', margin, 20);
    doc.setTextColor(20,20,20);
    
    doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.text('Sample: ' + sample.name + ' (' + sample.formula + ')', margin, y); y += 10;
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text('Anion: ' + sample.anionName + ' (' + sample.anion + ')', margin, y); y += 8;
    doc.text('Effervescence: ' + (obs.effervescence || '—'), margin, y); y += 6;
    doc.text('Gas Colour: ' + (obs.gasColour || '—'), margin, y); y += 6;
    doc.text('Gas Odour: ' + (obs.gasOdour || '—'), margin, y); y += 6;
    doc.text('Limewater: ' + (obs.limewater || '—'), margin, y); y += 10;
    doc.text('Reaction: ' + sample.reaction, margin, y); y += 10;
    doc.text('Score: ' + scoreBreakdown.total + '/100', margin, y); y += 8;
    doc.text('Conclusion: ' + sample.inference, margin, y);

    doc.save('CarbonateTest_Report.pdf');
  }

  // Reset
  function resetExperiment() {
    currentState = State.IDLE;
    currentSample = null;
    studentObservations = { effervescence: null, gasColour: null, gasOdour: null, limewater: null };
    scoreBreakdown = { effervescence: 0, gas: 0, limewater: 0, identify: 0, total: 0 };

    ['effervescence-panel', 'limewater-panel', 'waft-result-panel', 'id-panel', 'report-panel', 'hint-box'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    document.getElementById('limewater-tube').classList.remove('milky');
    document.getElementById('limewater-status').textContent = 'Clear limewater';
    document.getElementById('btn-add-hcl').disabled = true;
    document.getElementById('btn-waft').disabled = true;
    document.getElementById('btn-test-gas').disabled = true;

    document.querySelectorAll('.salt-btn').forEach(b => { b.classList.remove('active'); b.disabled = false; });
    document.querySelectorAll('.id-btn').forEach(b => { b.disabled = false; b.style.background = ''; });
    document.querySelectorAll('#effervescence-picker, #gas-colour-picker, #gas-odour-picker, #limewater-picker')
      .forEach(s => s.value = '');
    ['obs-sample','obs-reagent','obs-effervescence','obs-gas-colour','obs-gas-odour','obs-limewater','obs-inference']
      .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '—'; });

    document.getElementById('score-val').textContent = '0';
    ObservationEngine.reset();
    setStep(1);
    // ── 3D: stop effects ──────────────────────────────────────────────
    if (typeof stopReaction === 'function') stopReaction();
    say('Welcome! Select an unknown sample to test for carbonate ions.');
  }

  // Event Wiring
  function initEvents() {
    document.getElementById('btn-unknown').addEventListener('click', () => {
      if (currentState !== State.IDLE) return;
      document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('btn-unknown').classList.add('active');
      const sampleId = carbonateSamples[Math.floor(Math.random() * carbonateSamples.length)];
      selectSample(sampleId);
    });

    document.getElementById('btn-random').addEventListener('click', () => {
      if (currentState !== State.IDLE) return;
      document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('btn-random').classList.add('active');
      selectSample('random');
    });

    document.getElementById('btn-add-hcl').addEventListener('click', addHCl);
    document.getElementById('btn-waft').addEventListener('click', waftGas);
    const btnCloseWaft = document.getElementById('btn-close-waft');
    if (btnCloseWaft) btnCloseWaft.addEventListener('click', () => {
      const p = document.getElementById('waft-result-panel');
      if (p) p.classList.add('hidden');
    });
    document.getElementById('btn-test-gas').addEventListener('click', () => {
      if (currentState !== State.EFFERVESCENCE_OBSERVED) return;
      if (!limewaterTaken) {
        showLimewaterPanel();
      } else if (!limewaterPoured) {
        runLimewaterPourAnimation();
      } else if (!tubeConnected) {
        runConnectTubeAnimation();
      } else {
        showLimewaterPanelFromKey();
      }
    });
    document.getElementById('btn-submit-effervescence').addEventListener('click', handleEffervescenceSubmit);
    document.getElementById('btn-submit-limewater').addEventListener('click', handleLimewaterSubmit);
    document.getElementById('btn-reset').addEventListener('click', resetExperiment);
    document.getElementById('btn-download-pdf').addEventListener('click', downloadPDF);
    document.getElementById('btn-new-exp').addEventListener('click', () => {
      document.getElementById('report-panel').classList.add('hidden');
      resetExperiment();
    });

    document.querySelectorAll('.id-btn').forEach(btn => {
      btn.addEventListener('click', () => handleIdentification(btn.dataset.anion));
    });
  }

  return { 
    init: () => {
      initEvents();
      resetExperiment();
      console.log('[Carbonate Test] Experiment 3 ready.');
    },
    reset: resetExperiment, 
    getSample: () => currentSample, 
    getState: () => currentState,
    selectSample,
    addHCl,
    samplePlaced,
    waftGas,
    triggerHClReaction,
    showEffervescencePanel,
    showLimewaterPanel,
    showLimewaterPanelFromKey,
    showIdentificationPanel,
    triggerLimewaterMilkyEffect
  };
})();

// Boot after initialization to avoid Temporal Dead Zone ReferenceError
CarbonateTest.init();
