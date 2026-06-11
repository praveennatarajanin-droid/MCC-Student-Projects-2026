/**
 * FlameMain.js — Flame Test Experiment Controller
 * Includes PDF report generation via jsPDF (loaded from CDN in experiment2.html)
 */

var FTState = {
  IDLE:             'IDLE',
  SAMPLE_SELECTED:  'SAMPLE_SELECTED',
  HCL_ADDED:        'HCL_ADDED',
  PASTE_MADE:       'PASTE_MADE',
  WIRE_LOADED:      'WIRE_LOADED',
  IN_FLAME:         'IN_FLAME',
  COLOUR_SUBMITTED: 'COLOUR_SUBMITTED',
  IDENTIFYING:      'IDENTIFYING',
  DONE:             'DONE'
};

var ftState     = FTState.IDLE;
var ftSampleId  = null;
var ftHintTimer = null;
var _ftStudentColour = '';

// ── Step indicator ────────────────────────────────────────────────────────
var FT_STEPS = ['ft-step-1','ft-step-2','ft-step-3','ft-step-4','ft-step-5','ft-step-6'];

function ftSetStep(n) {
  FT_STEPS.forEach(function(id, i) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active','done');
    if (i + 1 === n) el.classList.add('active');
    if (i + 1 <  n)  el.classList.add('done');
  });
}

// ── Assistant ─────────────────────────────────────────────────────────────
function ftSay(msg, delay) {
  delay = delay || 0;
  setTimeout(function() {
    var el = document.getElementById('ft-assistant-msg');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(function() {
      el.textContent = msg;
      el.style.transition = 'opacity .35s';
      el.style.opacity = '1';
    }, 120);
  }, delay);
}

// ── Hint ──────────────────────────────────────────────────────────────────
function ftShowHint(text, duration) {
  duration = duration || 5000;
  var box  = document.getElementById('ft-hint-box');
  var span = document.getElementById('ft-hint-text');
  if (!box || !span) return;
  span.textContent = text;
  box.classList.remove('hidden');
  clearTimeout(ftHintTimer);
  ftHintTimer = setTimeout(function() { box.classList.add('hidden'); }, duration);
}

// ── Colour picker ─────────────────────────────────────────────────────────
function ftInitColourPicker() {
  var sel = document.getElementById('ft-colour-picker');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Select flame colour —</option>';
  FlameDatabase.getColourOptions().forEach(function(c) {
    var opt = document.createElement('option');
    opt.value = c.label;
    opt.textContent = c.label;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', function() {
    var found = FlameDatabase.getColourOptions().find(function(c) { return c.label === sel.value; });
    var sw = document.getElementById('ft-colour-swatch-live');
    if (sw && found) sw.style.background = found.hex;
  });
}

// ── Reset ─────────────────────────────────────────────────────────────────
function ftReset() {
  ftState          = FTState.IDLE;
  ftSampleId       = null;
  _ftStudentColour = '';

  resetFlameScene();
  FlameObservation.reset();
  FlameScoring.reset();

  ['ft-hint-box','ft-id-panel','ft-colour-submit-panel','ft-report-panel'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  document.getElementById('ft-btn-add-hcl').disabled    = true;
  document.getElementById('ft-btn-make-paste').disabled = true;
  document.getElementById('ft-btn-load-wire').disabled  = true;
  var _bIgn = document.getElementById('ft-btn-ignite');
  if (_bIgn) { _bIgn.disabled = true; _bIgn.textContent = 'Ignite & Observe'; }

  document.querySelectorAll('.ft-sample-btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.ft-id-btn').forEach(function(b) {
    b.classList.remove('correct','wrong');
    b.disabled = false;
  });

  ['ft-obs-flame','ft-obs-inference'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '—';
  });

  var sel = document.getElementById('ft-colour-picker');
  if (sel) sel.value = '';
  var sw = document.getElementById('ft-colour-swatch-live');
  if (sw) sw.style.background = 'transparent';

  ftSetStep(1);
  ftSay('Welcome to the Flame Test. Select an unknown substance from the shelf to begin.');
  if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
}

// ── 1. Select sample ──────────────────────────────────────────────────────
function ftSelectSample(sampleId) {
  if (ftState !== FTState.IDLE) return;
  ftSampleId = sampleId;
  ftState    = FTState.SAMPLE_SELECTED;
  document.getElementById('ft-btn-add-hcl').disabled = false;
  ftSetStep(2);

  var sampleIdx = ftSampleData.findIndex(function(s) { return s.id === sampleId; });
  if (typeof ftAnimateTakeSample === 'function' && sampleIdx >= 0) {
    ftAnimateTakeSample(sampleIdx, function() {
      ftSay('Unknown sample selected. Click Conc. HCl bottle or press A to add acid.');
    });
  } else {
    ftSay('Unknown sample selected. Add 1–2 drops of Conc. HCl to the evaporating dish.');
  }
  if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
}

// ── 2. Add HCl ────────────────────────────────────────────────────────────
function ftAddHCl() {
  if (ftState !== FTState.SAMPLE_SELECTED) return;
  document.getElementById('ft-btn-add-hcl').disabled = true;

  if (typeof ftAnimateAddHCl === 'function') {
    ftAnimateAddHCl(function() {
      ftState = FTState.HCL_ADDED;
      document.getElementById('ft-btn-make-paste').disabled = false;
      ftSetStep(3);
      ftSay('Conc. HCl added. Click Evaporating Dish or press M to make a paste.');
      if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
    });
  }
}

// ── 3. Make paste ─────────────────────────────────────────────────────────
function ftMakePaste() {
  if (ftState !== FTState.HCL_ADDED) return;
  document.getElementById('ft-btn-make-paste').disabled = true;

  if (typeof ftAnimateMakePaste === 'function') {
    ftAnimateMakePaste(function() {
      FlameScoring.awardPaste();
      FlameObservation.record({ step: 'Paste Preparation', inference: 'HCl paste formed successfully' });
      ftState = FTState.PASTE_MADE;
      document.getElementById('ft-btn-load-wire').disabled = false;
      ftSetStep(4);
      ftSay('Paste formed. Click Wire Loop or press L to load the paste onto the wire loop.');
      if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
    });
  }
}

// ── 4. Load wire ──────────────────────────────────────────────────────────
function ftLoadWire() {
  if (ftState !== FTState.PASTE_MADE) return;
  document.getElementById('ft-btn-load-wire').disabled = true;

  if (typeof ftAnimateLoadWire === 'function') {
    ftAnimateLoadWire(function() {
      ftState = FTState.WIRE_LOADED;
      document.getElementById('ft-btn-ignite').disabled = false;
      ftSetStep(5);
      ftSay('Wire loop loaded. Click Bunsen Burner or press I to ignite the burner and observe.');
      if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
    });
  }
}

// ── 5. Ignite & observe ───────────────────────────────────────────────────
function ftIgnite() {
  // If called while IN_FLAME (button repurposed as Record Observation), open panel
  if (ftState === FTState.IN_FLAME && !reactionCountdownActive) {
    document.getElementById('ft-colour-submit-panel').classList.remove('hidden');
    return;
  }

  if (ftState !== FTState.WIRE_LOADED) return;
  document.getElementById('ft-btn-ignite').disabled = true;
  ftState = FTState.IN_FLAME;

  var substance = FlameDatabase.getSubstance(ftSampleId);

  // Start with normal orange Bunsen flame
  igniteFlame('#ff7700');

  setTimeout(function() {
    animateWireToFlame(function() {
      setTimeout(function() {
        setFlameColour(substance.flameHex, 2.2);

        FlameObservation.record({ step: 'Flame Observation', colour: '(awaiting student observation)' });

        reactionCountdownActive = true;
        if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();

        if (typeof showFlameCountdown === 'function') {
          showFlameCountdown(4, function() {
            reactionCountdownActive = false;
            // Re-enable ignite button and relabel it so student can record observation
            var btnIgn = document.getElementById('ft-btn-ignite');
            if (btnIgn) { btnIgn.textContent = 'Record Observation'; btnIgn.disabled = false; }
            if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
            ftSay('Observe the flame colour carefully. Press O or click Record Observation to submit.', 200);
          });
        } else {
          setTimeout(function() {
            reactionCountdownActive = false;
            var btnIgn = document.getElementById('ft-btn-ignite');
            if (btnIgn) { btnIgn.textContent = 'Record Observation'; btnIgn.disabled = false; }
            if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
            ftSay('Observe the flame colour carefully. Record your observation.', 200);
          }, 4000);
        }
      }, 1000);
    });
  }, 700);
}

// ── 6. Student submits colour ─────────────────────────────────────────────
function ftSubmitColour() {
  if (ftState !== FTState.IN_FLAME) return;

  var sel = document.getElementById('ft-colour-picker');
  _ftStudentColour = sel ? sel.value : '';

  if (!_ftStudentColour) {
    ftShowHint('Please select a flame colour before submitting.', 3000);
    return;
  }

  var substance = FlameDatabase.getSubstance(ftSampleId);
  var colMarks  = FlameScoring.awardColour(_ftStudentColour, substance.flameLabel);

  // Reveal actual colour in observation panel
  var flameEl = document.getElementById('ft-obs-flame');
  if (flameEl) {
    var c = FlameDatabase.getColourOptions().find(function(o) { return o.label === substance.flameLabel; });
    flameEl.innerHTML = c
      ? '<span class="colour-swatch" style="background:' + c.hex + ';display:inline-block;width:12px;height:12px;margin-right:5px;border:1px solid rgba(255,255,255,.2)"></span>' + substance.flameLabel
      : substance.flameLabel;
  }

  FlameObservation.record({
    step:      'Student Observation',
    colour:    _ftStudentColour,
    inference: '(pending identification)'
  });

  document.getElementById('ft-colour-submit-panel').classList.add('hidden');

  if (colMarks === 30) {
    ftSay('Correct flame colour! Now identify the substance.', 200);
  } else {
    ftShowHint('The actual flame colour was: ' + substance.flameLabel + '. Check the reference table.', 6000);
    ftSay('Colour recorded. Now identify the substance.', 200);
  }

  ftState = FTState.COLOUR_SUBMITTED;
  ftSetStep(5);
  setTimeout(function() {
    document.getElementById('ft-id-panel').classList.remove('hidden');
    if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
  }, 800);
}

// ── 7. Identification ─────────────────────────────────────────────────────
function ftHandleIdentification(guessedId) {
  if (ftState !== FTState.COLOUR_SUBMITTED) return;
  ftState = FTState.IDENTIFYING;

  var correct   = FlameScoring.awardIdentify(guessedId, ftSampleId);
  FlameScoring.awardInference(guessedId, ftSampleId);
  var substance = FlameDatabase.getSubstance(ftSampleId);

  document.querySelectorAll('.ft-id-btn').forEach(function(btn) {
    var id = btn.dataset.substance;
    if (id === ftSampleId)                          btn.classList.add('correct');
    else if (id === guessedId && id !== ftSampleId) btn.classList.add('wrong');
    btn.disabled = true;
  });

  var infEl = document.getElementById('ft-obs-inference');
  if (infEl) infEl.textContent = substance.inference;

  FlameObservation.record({
    step:      'Identification',
    inference: correct ? 'Correct — ' + substance.ion : 'Incorrect — guessed ' + guessedId + ', actual ' + ftSampleId
  });

  if (correct) {
    ftSay('Excellent! Correct identification. Generating your report…');
    gsap.to(flameLight, { intensity: 5, duration: 0.25, yoyo: true, repeat: 5 });
  } else {
    ftShowHint(
      'Hint: The correct answer was ' + substance.name + ' (' + substance.ion + '). ' +
      substance.flameLabel + ' flame → ' + substance.inference + '.', 9000
    );
    ftSay('Incorrect. Review the hint and the flame colour table.');
  }

  animateWireReturn(function() { extinguishFlame(); });
  ftSetStep(6);

  setTimeout(function() {
    document.getElementById('ft-id-panel').classList.add('hidden');
    ftState = FTState.DONE;
    if (typeof updateKeyboardGuideText === 'function') updateKeyboardGuideText();
    ftShowReport(guessedId);
  }, 2800);
}

// ── Report (on-screen) ────────────────────────────────────────────────────
function ftShowReport(guessedId) {
  var substance = FlameDatabase.getSubstance(ftSampleId);
  var breakdown = FlameScoring.getBreakdown();
  var correct   = guessedId === ftSampleId;

  var GRADES = [
    { min: 90, label: 'A*', colour: '#ffd700', msg: 'Outstanding — perfect flame test technique!' },
    { min: 75, label: 'A',  colour: '#68d391', msg: 'Excellent. Strong colour observation skills.' },
    { min: 60, label: 'B',  colour: '#63b3ed', msg: 'Good. Review the flame colour table.' },
    { min: 45, label: 'C',  colour: '#f6ad55', msg: 'Satisfactory. Practise colour identification.' },
    { min: 0,  label: 'F',  colour: '#fc8181', msg: 'Needs improvement. Re-read the flame colour table.' }
  ];
  var grade = GRADES.find(function(g) { return breakdown.total >= g.min; });

  var flameSwatchHtml = '';
  var fc = FlameDatabase.getColourOptions().find(function(o) { return o.label === substance.flameLabel; });
  if (fc) flameSwatchHtml = '<span class="colour-swatch" style="background:' + fc.hex + ';width:16px;height:16px;border-radius:3px;display:inline-block;vertical-align:middle;margin-right:5px;border:1px solid rgba(255,255,255,.2)"></span>';

  document.getElementById('ft-report-content').innerHTML =
    '<div class="report-section">' +
      '<div class="report-row"><span>Unknown Substance</span><span class="report-val">' + substance.name + ' (' + substance.formula + ')</span></div>' +
      '<div class="report-row"><span>Metal Ion</span><span class="report-val">' + substance.ion + '</span></div>' +
      '<div class="report-row"><span>Flame Colour</span><span class="report-val">' + flameSwatchHtml + substance.flameLabel + '</span></div>' +
      '<div class="report-row"><span>Your Colour</span><span class="report-val">' + (_ftStudentColour || '—') + '</span></div>' +
      '<div class="report-row"><span>Your Answer</span><span class="report-val">' + _ftIonLabel(guessedId) + '</span></div>' +
      '<div class="report-row"><span>Result</span><span class="report-val" style="color:' + (correct ? 'var(--success)' : 'var(--danger)') + '">' + (correct ? 'Correct' : 'Incorrect') + '</span></div>' +
    '</div>' +
    '<div class="report-divider"></div>' +
    '<div class="report-section">' +
      '<div class="report-row"><span>Paste Preparation</span><span>' + breakdown.paste + ' / 10</span></div>' +
      '<div class="report-row"><span>Flame Colour Observation</span><span>' + breakdown.colour + ' / 30</span></div>' +
      '<div class="report-row"><span>Inference</span><span>' + breakdown.inference + ' / 20</span></div>' +
      '<div class="report-row"><span>Final Identification</span><span>' + breakdown.identify + ' / 40</span></div>' +
    '</div>' +
    '<div class="report-divider"></div>' +
    '<div class="report-total-row"><span>Total Score</span><span style="color:' + grade.colour + '">' + breakdown.total + ' / 100</span></div>' +
    '<div class="report-grade" style="border-color:' + grade.colour + ';color:' + grade.colour + '">Grade: ' + grade.label + '</div>' +
    '<div class="report-feedback">' + grade.msg + '</div>' +
    (!correct ? '<div class="report-hint"><b>Chemistry note:</b> ' + substance.flameLabel + ' flame → ' + substance.inference + '</div>' : '') +
    '<div class="report-obs-count">Observations recorded: <b>' + FlameObservation.getAll().length + '</b></div>';

  document.getElementById('ft-report-panel').classList.remove('hidden');
}

function _ftIonLabel(id) {
  var s = FlameDatabase.getSubstance(id);
  return s ? s.name + ' (' + s.ion + ')' : id;
}

// ── PDF Report ────────────────────────────────────────────────────────────
function ftDownloadPDF() {
  if (!window.jspdf) { alert('PDF library not loaded. Check your internet connection.'); return; }
  var jsPDF = window.jspdf.jsPDF;
  var doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  var substance = FlameDatabase.getSubstance(ftSampleId);
  var breakdown = FlameScoring.getBreakdown();
  var obs       = FlameObservation.getAll();
  var dateStr   = new Date().toLocaleString();

  var GRADES = [
    { min: 90, label: 'A*' }, { min: 75, label: 'A' },
    { min: 60, label: 'B'  }, { min: 45, label: 'C' }, { min: 0, label: 'F' }
  ];
  var grade = GRADES.find(function(g) { return breakdown.total >= g.min; });

  var W = 210, margin = 18, y = 0;

  function ln(h) { y += (h || 7); }
  function line(x1, x2) { doc.setDrawColor(180,180,180); doc.line(x1, y, x2, y); ln(2); }
  function heading(txt, size, r, g, b) {
    doc.setFontSize(size || 12);
    doc.setTextColor(r || 30, g || 30, b || 30);
    doc.setFont('helvetica','bold');
    doc.text(txt, margin, y);
    ln(size ? size * 0.5 : 6);
  }
  function row(label, value, bold) {
    doc.setFontSize(10);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin, y);
    doc.setFont('helvetica','bold');
    doc.setTextColor(20, 20, 20);
    doc.text(String(value), 110, y);
    ln(6);
  }

  doc.setFillColor(14, 21, 32);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica','bold');
  doc.text('Virtual Chemistry Lab', margin, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica','normal');
  doc.text('Experiment 2 — Flame Test (Conc. HCl Paste Method)', margin, 20);
  doc.setTextColor(150, 180, 220);
  doc.text(dateStr, W - margin, 20, { align: 'right' });
  y = 36;

  heading('Experiment Details', 13, 30, 80, 160);
  line(margin, W - margin);
  row('Unknown Substance:', substance ? substance.name + ' (' + substance.formula + ')' : '—');
  row('Metal Ion:', substance ? substance.ion : '—');
  row('Characteristic Flame Colour:', substance ? substance.flameLabel : '—');
  row('Student Observed Colour:', _ftStudentColour || '—');
  ln(3);

  heading('Marking Scheme', 13, 30, 80, 160);
  line(margin, W - margin);
  row('Paste Preparation (HCl method):', breakdown.paste + ' / 10');
  row('Flame Colour Observation:', breakdown.colour + ' / 30');
  row('Inference:', breakdown.inference + ' / 20');
  row('Final Identification:', breakdown.identify + ' / 40');
  line(margin, W - margin);
  doc.setFontSize(12);
  doc.setFont('helvetica','bold');
  doc.setTextColor(20, 20, 20);
  doc.text('Total Score:', margin, y);
  doc.setTextColor(breakdown.total >= 75 ? 0 : 180, breakdown.total >= 75 ? 140 : 40, 0);
  doc.text(breakdown.total + ' / 100   Grade: ' + grade.label, 110, y);
  ln(10);

  heading('Flame Colour Reference Table (RSC)', 13, 30, 80, 160);
  line(margin, W - margin);
  var tableData = FlameDatabase.getFlameTable();
  doc.setFontSize(9);
  tableData.forEach(function(r) {
    doc.setFont('helvetica','bold');
    doc.setTextColor(40, 40, 40);
    doc.text(r.colour, margin, y);
    doc.setFont('helvetica','normal');
    doc.setTextColor(80, 80, 80);
    doc.text(r.inference, 80, y);
    ln(5.5);
  });
  ln(3);

  heading('Lab Notebook Entries', 13, 30, 80, 160);
  line(margin, W - margin);
  if (obs.length === 0) {
    doc.setFontSize(9); doc.setTextColor(120,120,120);
    doc.text('No observations recorded.', margin, y); ln(6);
  } else {
    obs.forEach(function(o, i) {
      doc.setFontSize(9);
      doc.setFont('helvetica','bold'); doc.setTextColor(40,40,40);
      doc.text('#' + (i+1) + ' [' + o.timestamp + '] ' + (o.step || ''), margin, y); ln(5);
      if (o.colour) {
        doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
        doc.text('  Colour: ' + o.colour, margin, y); ln(5);
      }
      if (o.inference) {
        doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
        doc.text('  Inference: ' + o.inference, margin, y); ln(5);
      }
      ln(1);
    });
  }

  doc.setFontSize(8); doc.setTextColor(150,150,150);
  doc.text('Generated by RSC Virtual Chemistry Lab  •  Flame Test Experiment', margin, 285);
  doc.text('Page 1', W - margin, 285, { align: 'right' });

  doc.save('RSC_FlameTest_Report_' + new Date().toISOString().slice(0,10) + '.pdf');
}

// ── Event wiring ──────────────────────────────────────────────────────────
function ftInitEvents() {

  // Sample buttons — each has data-sample attribute
  document.querySelectorAll('.ft-sample-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (ftState !== FTState.IDLE) {
        ftShowHint('Click Reset first to start a new experiment.', 3000);
        return;
      }
      document.querySelectorAll('.ft-sample-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var sampleKey = btn.dataset.sample;
      if (sampleKey === 'random') {
        sampleKey = FlameDatabase.randomSubstanceId();
      }
      ftSelectSample(sampleKey);
    });
  });

  // Action buttons
  var btnHcl   = document.getElementById('ft-btn-add-hcl');
  var btnPaste = document.getElementById('ft-btn-make-paste');
  var btnWire  = document.getElementById('ft-btn-load-wire');
  var btnIgn   = document.getElementById('ft-btn-ignite');
  var btnReset = document.getElementById('ft-btn-reset');
  var btnNew   = document.getElementById('ft-btn-new-exp');
  var btnSub   = document.getElementById('ft-btn-submit-colour');

  if (btnHcl)   btnHcl.addEventListener('click',   ftAddHCl);
  if (btnPaste) btnPaste.addEventListener('click',  ftMakePaste);
  if (btnWire)  btnWire.addEventListener('click',   ftLoadWire);
  if (btnIgn)   btnIgn.addEventListener('click',    ftIgnite);
  if (btnReset) btnReset.addEventListener('click',  ftReset);
  if (btnNew)   btnNew.addEventListener('click', function() {
    document.getElementById('ft-report-panel').classList.add('hidden');
    ftReset();
  });
  if (btnSub)   btnSub.addEventListener('click',   ftSubmitColour);

  // PDF download
  var btnPdf = document.getElementById('ft-btn-download-pdf');
  if (btnPdf) btnPdf.addEventListener('click', ftDownloadPDF);

  // Identification buttons
  document.querySelectorAll('.ft-id-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      ftHandleIdentification(btn.dataset.substance);
    });
  });

  // Colour picker
  ftInitColourPicker();
}

// ── Boot ──────────────────────────────────────────────────────────────────
ftInitEvents();
ftReset();
console.log('[RSC Virtual Lab] Flame Test v2 loaded.');
