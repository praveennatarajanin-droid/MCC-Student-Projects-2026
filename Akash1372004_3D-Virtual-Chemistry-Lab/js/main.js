/**
 * main.js — RSC Salt Analysis Lab Controller
 *
 * Bug fixes vs v1:
 *  ✓ State machine fixed — OBSERVED state set correctly before quiz
 *  ✓ Dropper returns home after each use
 *  ✓ Scoring: colour/inference only awarded on student submission
 *  ✓ Observation panel doesn't reveal answer automatically
 *  ✓ Iron(III) added as 5th unknown
 *  ✓ Student must select colour before proceeding
 *  ✓ Precipitate animation triggered from reaction data
 *  ✓ All GSAP tweens killed on reset
 *  ✓ Reagent buttons disabled until water is added
 *
 * Experiment flow:
 *   IDLE → SALT_SELECTED → WATER_ADDED → REAGENT_CHOSEN
 *   → POURED → COLOUR_SUBMITTED → IDENTIFYING → DONE
 */

// ── State machine ─────────────────────────────────────────────────────────
const State = {
  IDLE:              'IDLE',
  SALT_SELECTED:     'SALT_SELECTED',
  WATER_TAKEN:       'WATER_TAKEN',
  WATER_ADDED:       'WATER_ADDED',
  REAGENT_CHOSEN:    'REAGENT_CHOSEN',
  REAGENT_TAKEN:     'REAGENT_TAKEN',
  POURED:            'POURED',
  COLOUR_SUBMITTED:  'COLOUR_SUBMITTED',
  IDENTIFYING:       'IDENTIFYING',
  DONE:              'DONE'
};

let currentState   = State.IDLE;
let currentSaltId  = null;
let currentReagent = null;
let activeTube     = null;   // TestTube instance
let hintTimer      = null;
let _lastReactionResult = null;

// ── Step indicator ────────────────────────────────────────────────────────
const STEP_IDS = ['step-1','step-2','step-3','step-4','step-5','step-6'];

function setStep(n) {
  STEP_IDS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active','done');
    if (i + 1 === n) el.classList.add('active');
    if (i + 1 <  n)  el.classList.add('done');
  });
}

// ── Lab assistant ─────────────────────────────────────────────────────────
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

// ── Hint system ───────────────────────────────────────────────────────────
function showHint(text, duration = 5000) {
  const box  = document.getElementById('hint-box');
  const span = document.getElementById('hint-text');
  if (!box || !span) return;
  span.textContent = text;
  box.classList.remove('hidden');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => box.classList.add('hidden'), duration);
}

// ── Reset ─────────────────────────────────────────────────────────────────
function resetExperiment() {
  currentState        = State.IDLE;
  currentSaltId       = null;
  currentReagent      = null;
  _lastReactionResult = null;

  testTubes.forEach(t => t.reset());
  activeTube = testTubes[0];

  if (typeof resetScene1 === 'function') {
    resetScene1();
  } else if (typeof resetCamera === 'function') {
    resetCamera();
  }

  ObservationPanel.clear();
  ObservationEngine.reset();
  Scoring.reset();
  QuizPanel.hide();
  QuizPanel.hideColourSubmit();
  ReportPanel.hide();

  document.getElementById('hint-box').classList.add('hidden');
  document.getElementById('btn-add-water').disabled = true;
  document.getElementById('btn-pour').disabled      = true;
  document.getElementById('btn-add-water').textContent = 'Add Water';
  document.getElementById('btn-pour').textContent      = 'Pour Reagent';

  document.querySelectorAll('.reagent-btn').forEach(b => {
    b.classList.remove('active');
    b.disabled = true;
  });
  document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));

  setStep(1);
  say('Welcome to the Salt Analysis Lab. Select an unknown sample from the shelf to begin.');
  if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
}

// ── 1. Select salt ────────────────────────────────────────────────────────
function selectSalt(saltId) {
  if (currentState !== State.IDLE) return;

  currentSaltId = saltId;
  currentState  = State.SALT_SELECTED;
  activeTube    = testTubes[0];

  document.getElementById('btn-add-water').disabled = false;
  document.getElementById('btn-add-water').textContent = 'Load Water';
  setStep(2);

  // Highlight active tube
  activeTube.activate();

  if (typeof animateTakeSalt === 'function') {
    animateTakeSalt(saltId, () => {
      say('Unknown sample selected. Click Beaker or press W to load water in dropper.');
    });
  } else {
    say('Unknown sample selected. Add distilled water to dissolve it in test tube 1.');
  }
  if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
}

// ── 2. Add water ──────────────────────────────────────────────────────────
function takeWater() {
  if (currentState !== State.SALT_SELECTED || waterTaken) return;
  
  document.getElementById('btn-add-water').disabled = true;
  
  if (typeof runTakeWaterAnimation === 'function') {
    runTakeWaterAnimation(() => {
      currentState = State.WATER_TAKEN;
      document.getElementById('btn-add-water').textContent = 'Pour Water';
      document.getElementById('btn-add-water').disabled = false;
      say('Water loaded in dropper. Click Test Tube or press P to pour water.');
      if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
    });
  }
}

function pourWater() {
  if (currentState !== State.WATER_TAKEN && currentState !== State.SALT_SELECTED) return;
  
  document.getElementById('btn-add-water').disabled = true;
  const dissolution = Reactions.dissolve(currentSaltId);

  const proceed = () => {
    activeTube.fill(10, dissolution.hex);
    ObservationPanel.updateVolume('10.0 mL');

    currentState = State.WATER_ADDED;
    setStep(3);

    // Enable reagent buttons
    document.querySelectorAll('.reagent-btn').forEach(b => b.disabled = false);

    say(
      'Salt dissolved. Observe the colour carefully. ' +
      'Select a reagent from the shelf to proceed.',
      400
    );
    if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
  };

  if (typeof runPourWaterAnimation === 'function') {
    runPourWaterAnimation(proceed);
  } else {
    proceed();
  }
}

// ── 3. Select reagent ─────────────────────────────────────────────────────
function selectReagent(reagentId) {
  if (currentState !== State.WATER_ADDED && currentState !== State.REAGENT_CHOSEN) return;

  currentReagent = reagentId;
  currentState   = State.REAGENT_CHOSEN;
  reagentTaken   = false;
  reagentPoured  = false;

  document.querySelectorAll('.reagent-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.reagent === reagentId);
  });
  document.getElementById('btn-pour').disabled = false;
  document.getElementById('btn-pour').textContent = 'Load Reagent';

  Scoring.awardReagent(reagentId);

  const reagent = SaltDatabase.getReagent(reagentId);
  
  if (typeof animateTakeReagent === 'function') {
    animateTakeReagent(reagentId, () => {
      say(`${reagent.name} selected. Click selected Reagent Bottle or press T to load dropper.`);
    });
  } else {
    say(`${reagent.name} (${reagent.formula}) selected. Click "Pour Reagent" to add it.`);
  }
  if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
}

// ── 4. Pour reagent ───────────────────────────────────────────────────────
function takeReagent() {
  if (currentState !== State.REAGENT_CHOSEN || reagentTaken) return;

  document.getElementById('btn-pour').disabled = true;

  if (typeof runTakeReagentAnimation === 'function') {
    runTakeReagentAnimation(() => {
      currentState = State.REAGENT_TAKEN;
      document.getElementById('btn-pour').textContent = 'Pour Reagent';
      document.getElementById('btn-pour').disabled = false;
      say('Reagent loaded in dropper. Click Test Tube or press P to pour reagent.');
      if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
    });
  }
}

function pourReagent() {
  if (currentState !== State.REAGENT_TAKEN && currentState !== State.REAGENT_CHOSEN) return;

  document.getElementById('btn-pour').disabled = true;
  document.querySelectorAll('.reagent-btn').forEach(b => b.disabled = true);

  const result  = Reactions.react(currentSaltId, currentReagent);
  const reagent = SaltDatabase.getReagent(currentReagent);
  _lastReactionResult = result;

  const proceed = () => {
    activeTube.changeColour(
      result.hex,
      2.5,
      result.precipitate,
      result.precipHex
    );

    activeTube.volume = 15;
    ObservationPanel.updateVolume('15.0 mL');

    // Trigger countdown overlay
    reactionCountdownActive = true;
    if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
    
    if (typeof showReactionCountdown === 'function') {
      showReactionCountdown(4, () => {
        reactionCountdownActive = false;
        currentState = State.POURED;
        setStep(4);
        if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
        say('Reaction complete. Press O or click the Observation Sheet to record observations.');
        
        // Record in notebook (without revealing answer)
        ObservationEngine.record({
          step:    'Reagent Added',
          reagent: currentReagent,
          label:   '(awaiting student observation)'
        });
      });
    } else {
      setTimeout(() => {
        currentState = State.POURED;
        setStep(4);
        if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
        say('Reaction complete. Open observations.');
      }, 2800);
    }
  };

  if (typeof runPourReagentAnimation === 'function') {
    runPourReagentAnimation(proceed);
  } else {
    proceed();
  }
}

// ── 5. Student submits colour observation ─────────────────────────────────
function handleColourSubmit(studentColour) {
  if (currentState !== State.POURED) return;

  const result       = _lastReactionResult;
  const correctLabel = result.solutionLabel;   // initial dissolution colour

  // Award colour marks
  const colMarks = Scoring.awardColour(studentColour, correctLabel);

  // Reveal actual colour and inference in observation panel
  ObservationPanel.revealColour(result.solutionLabel, result.solutionHex);
  ObservationPanel.revealResult(result.label);
  // Inference is NOT revealed yet — student must identify first

  // Update notebook
  ObservationEngine.record({
    step:      'Student Observation',
    colour:    studentColour,
    reagent:   currentReagent,
    label:     result.label,
    inference: '(pending identification)'
  });

  QuizPanel.hideColourSubmit();
  if (typeof resetCamera === 'function') resetCamera();

  if (colMarks === 10) {
    say('Correct colour observation! Now identify the metal ion.', 200);
  } else {
    showHint(
      `The actual colour was: ${result.solutionLabel}. ` +
      `Check the colour interpretation table.`,
      5000
    );
    say('Colour observation recorded. Now identify the metal ion.', 200);
  }

  currentState = State.COLOUR_SUBMITTED;
  setStep(5);

  setTimeout(() => {
    QuizPanel.show(handleIdentification);
  }, 800);
}

// ── 6. Student identifies the ion ─────────────────────────────────────────
function handleIdentification(guessedIon) {
  if (currentState !== State.COLOUR_SUBMITTED) return;
  currentState = State.IDENTIFYING;

  const correct = Scoring.awardIdentify(guessedIon, currentSaltId);

  // Award inference marks (same as identification for simplicity)
  Scoring.awardInference(guessedIon, currentSaltId);

  // Mark quiz buttons
  QuizPanel.markResult(guessedIon, currentSaltId);

  // Reveal inference in observation panel
  if (_lastReactionResult) {
    ObservationPanel.revealInference(_lastReactionResult.inference);
  }

  // Update notebook
  ObservationEngine.record({
    step:      'Identification',
    inference: correct
      ? `Correct — ${SaltDatabase.getSalt(currentSaltId).ion}`
      : `Incorrect — guessed ${guessedIon}, actual ${currentSaltId}`
  });

  if (correct) {
    say('Excellent! Correct identification. Generating your report…');
    activeTube.deactivate();
    // Victory pulse on tube
    gsap.to(activeTube.group.position, {
      y: activeTube.group.position.y + 0.12,
      duration: 0.2, yoyo: true, repeat: 5, ease: 'power1.inOut'
    });
  } else {
    const salt = SaltDatabase.getSalt(currentSaltId);
    showHint(
      `Hint: The correct ion was ${salt.ion}. ` +
      `${salt.solutionLabel} solution → ${salt.inference}. ` +
      `With ${currentReagent}: ${_lastReactionResult.label}`,
      8000
    );
    say('Incorrect. Review the hint and the colour table for next time.');
    activeTube.deactivate();
  }

  setStep(6);

  setTimeout(() => {
    QuizPanel.hide();
    currentState = State.DONE;
    const breakdown = Scoring.getBreakdown();
    ReportPanel.show(currentSaltId, guessedIon, breakdown, ObservationEngine.getAll());
  }, 2200);
}

// ── PDF Report Download ───────────────────────────────────────────────────
function downloadPDF() {
  if (!window.jspdf) { alert('PDF library not loaded. Check your internet connection.'); return; }
  const jsPDF    = window.jspdf.jsPDF;
  const doc      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const salt     = SaltDatabase.getSalt(currentSaltId);
  const breakdown = Scoring.getBreakdown();
  const obs      = ObservationEngine.getAll();
  const dateStr  = new Date().toLocaleString();
  const W = 210, margin = 18;
  let y = 0;

  const GRADES = [
    { min: 90, label: 'A*' }, { min: 75, label: 'A' },
    { min: 60, label: 'B'  }, { min: 45, label: 'C' }, { min: 0, label: 'F' }
  ];
  const grade = GRADES.find(g => breakdown.total >= g.min);

  const ln  = (h = 7) => { y += h; };
  const sep = () => { doc.setDrawColor(180,180,180); doc.line(margin, y, W-margin, y); ln(2); };
  const hd  = (txt, sz = 12) => {
    doc.setFontSize(sz); doc.setFont('helvetica','bold');
    doc.setTextColor(30,80,160); doc.text(txt, margin, y); ln(sz * 0.5);
  };
  const row = (lbl, val) => {
    doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(60,60,60);
    doc.text(lbl, margin, y);
    doc.setFont('helvetica','bold'); doc.setTextColor(20,20,20);
    doc.text(String(val), 110, y); ln(6);
  };

  // Header
  doc.setFillColor(14, 21, 32);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('Virtual Chemistry Lab', margin, 12);
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('Experiment 1 — Salt Analysis (Colour Observation Method)', margin, 20);
  doc.setTextColor(150,180,220);
  doc.text(dateStr, W - margin, 20, { align: 'right' });
  y = 36;

  hd('Experiment Details', 13); sep();
  row('Unknown Salt:', salt ? salt.name + ' (' + salt.formula + ')' : '—');
  row('Metal Ion:', salt ? salt.ion : '—');
  row('Solution Colour:', salt ? salt.solutionLabel : '—');
  row('Reagent Used:', currentReagent || '—');
  if (_lastReactionResult) row('Reaction Result:', _lastReactionResult.label);
  ln(3);

  hd('Marking Scheme', 13); sep();
  row('Reagent Selection:', breakdown.reagent + ' / 10');
  row('Colour Observation:', breakdown.colour + ' / 10');
  row('Inference:', breakdown.inference + ' / 20');
  row('Final Identification:', breakdown.identify + ' / 60');
  sep();
  doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(20,20,20);
  doc.text('Total Score:', margin, y);
  doc.setTextColor(breakdown.total >= 75 ? 0 : 180, breakdown.total >= 75 ? 140 : 40, 0);
  doc.text(breakdown.total + ' / 100   Grade: ' + grade.label, 110, y); ln(10);

  hd('Colour Interpretation Table (RSC)', 13); sep();
  SaltDatabase.getColourTable().forEach(ct => {
    doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(40,40,40);
    doc.text(ct.colour, margin, y);
    doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
    doc.text(ct.interpretation, 80, y); ln(5.5);
  });
  ln(3);

  hd('Lab Notebook Entries', 13); sep();
  if (!obs.length) {
    doc.setFontSize(9); doc.setTextColor(120,120,120);
    doc.text('No observations recorded.', margin, y); ln(6);
  } else {
    obs.forEach((o, i) => {
      doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(40,40,40);
      doc.text('#' + (i+1) + ' [' + o.timestamp + '] ' + (o.step || ''), margin, y); ln(5);
      if (o.colour)    { doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80); doc.text('  Colour: ' + o.colour, margin, y); ln(5); }
      if (o.reagent)   { doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80); doc.text('  Reagent: ' + o.reagent, margin, y); ln(5); }
      if (o.label)     { doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80); doc.text('  Result: ' + o.label, margin, y); ln(5); }
      if (o.inference) { doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80); doc.text('  Inference: ' + o.inference, margin, y); ln(5); }
      ln(1);
    });
  }

  doc.setFontSize(8); doc.setTextColor(150,150,150);
  doc.text('Virtual Chemistry Lab  •  Salt Analysis Experiment', margin, 285);
  doc.text('Page 1', W - margin, 285, { align: 'right' });

  doc.save('SaltAnalysis_Report_' + new Date().toISOString().slice(0,10) + '.pdf');
}

// ── Event wiring ──────────────────────────────────────────────────────────
function initEvents() {

  // Salt buttons grid selection
  document.querySelectorAll('.salt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentState !== State.IDLE) return;
      document.querySelectorAll('.salt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const saltId = btn.dataset.salt;
      if (saltId === 'random') {
        selectSalt(SaltDatabase.randomSaltId());
      } else {
        selectSalt(saltId);
      }
    });
  });

  // Water (Load / Pour)
  const addWaterBtn = document.getElementById('btn-add-water');
  if (addWaterBtn) {
    addWaterBtn.addEventListener('click', () => {
      if (currentState === State.SALT_SELECTED && !waterTaken) {
        takeWater();
      } else if (currentState === State.WATER_TAKEN) {
        pourWater();
      }
    });
  }

  // Pour (Load / Pour Reagent)
  const pourBtn = document.getElementById('btn-pour');
  if (pourBtn) {
    pourBtn.addEventListener('click', () => {
      if (currentState === State.REAGENT_CHOSEN && !reagentTaken) {
        takeReagent();
      } else if (currentState === State.REAGENT_TAKEN) {
        pourReagent();
      }
    });
  }

  // Reset
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) resetBtn.addEventListener('click', resetExperiment);

  // New experiment
  const newExpBtn = document.getElementById('btn-new-exp');
  if (newExpBtn) {
    newExpBtn.addEventListener('click', () => {
      ReportPanel.hide();
      resetExperiment();
    });
  }

  // PDF download
  const pdfBtn = document.getElementById('btn-download-pdf');
  if (pdfBtn) pdfBtn.addEventListener('click', downloadPDF);

  // Reagent buttons
  document.querySelectorAll('.reagent-btn').forEach(btn => {
    btn.addEventListener('click', () => selectReagent(btn.dataset.reagent));
  });

  // Quiz panels
  QuizPanel.init();
  QuizPanel.initColourSubmit(handleColourSubmit);
  ObservationPanel.initColourPicker(null);   // picker init, no auto-callback
}

// ── Boot ──────────────────────────────────────────────────────────────────
initEvents();
resetExperiment();
console.log('[RSC Virtual Lab v2] Salt Analysis ready.');
