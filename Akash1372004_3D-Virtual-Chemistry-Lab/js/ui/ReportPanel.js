/**
 * ReportPanel.js
 * Renders the final experiment report with full scoring breakdown,
 * grade, and chemistry feedback.
 */

const ReportPanel = (() => {

  const GRADES = [
    { min: 90, label: 'A*', colour: '#ffd700', msg: 'Outstanding — perfect lab technique!' },
    { min: 75, label: 'A',  colour: '#68d391', msg: 'Excellent work. Strong analytical skills.' },
    { min: 60, label: 'B',  colour: '#63b3ed', msg: 'Good. Review your colour observations.' },
    { min: 45, label: 'C',  colour: '#f6ad55', msg: 'Satisfactory. Practise reagent selection.' },
    { min: 0,  label: 'F',  colour: '#fc8181', msg: 'Needs improvement. Re-read the colour table.' }
  ];

  function show(saltId, guessedIon, breakdown, observations) {
    const salt    = SaltDatabase.getSalt(saltId);
    const correct = guessedIon === saltId;
    const grade   = GRADES.find(g => breakdown.total >= g.min);

    const content = document.getElementById('report-content');
    content.innerHTML = `
      <div class="report-section">
        <div class="report-row">
          <span>Unknown Salt</span>
          <span class="report-val">${salt ? salt.name + ' (' + salt.formula + ')' : '?'}</span>
        </div>
        <div class="report-row">
          <span>Metal Ion</span>
          <span class="report-val">${salt ? salt.ion : '?'}</span>
        </div>
        <div class="report-row">
          <span>Your Answer</span>
          <span class="report-val">${_ionLabel(guessedIon)}</span>
        </div>
        <div class="report-row">
          <span>Result</span>
          <span class="report-val" style="color:${correct ? 'var(--success)' : 'var(--danger)'}">
            ${correct ? '✅ Correct' : '❌ Incorrect'}
          </span>
        </div>
      </div>

      <div class="report-divider"></div>

      <div class="report-section">
        <div class="report-row"><span>Reagent Selection</span>   <span>${breakdown.reagent} / 10</span></div>
        <div class="report-row"><span>Colour Observation</span>  <span>${breakdown.colour} / 10</span></div>
        <div class="report-row"><span>Inference</span>           <span>${breakdown.inference} / 20</span></div>
        <div class="report-row"><span>Final Identification</span><span>${breakdown.identify} / 60</span></div>
      </div>

      <div class="report-divider"></div>

      <div class="report-total-row">
        <span>Total Score</span>
        <span style="color:${grade.colour}">${breakdown.total} / 100</span>
      </div>

      <div class="report-grade" style="border-color:${grade.colour};color:${grade.colour}">
        Grade: ${grade.label}
      </div>

      <div class="report-feedback">${grade.msg}</div>

      ${!correct ? `
      <div class="report-hint">
        💡 <b>Chemistry note:</b> ${salt ? salt.solutionLabel + ' solution → ' + salt.inference : ''}
      </div>` : ''}

      <div class="report-obs-count">
        Observations recorded: <b>${observations.length}</b>
      </div>
    `;

    document.getElementById('report-panel').classList.remove('hidden');
  }

  function hide() {
    document.getElementById('report-panel').classList.add('hidden');
  }

  function _ionLabel(ion) {
    const map = {
      copper:    'Copper (Cu²⁺)',
      nickel:    'Nickel (Ni²⁺)',
      cobalt:    'Cobalt (Co²⁺)',
      manganese: 'Manganese (Mn²⁺)',
      iron:      'Iron (Fe³⁺)',
      none:      'No Transition Metal'
    };
    return map[ion] || ion;
  }

  return { show, hide };
})();
