/* ============================================================
   GWA Calculator — Pambayang Dalubhasaan ng Marilao
   Auto-calculating · Honors detection · Inline editing
   ============================================================ */

(function () {
  'use strict';

  // ---- Storage key ----
  var STORAGE_KEY = 'gwa-subjects';

  // ---- Defaults ----
  var DEFAULT_GRADE = 1.75;
  var DEFAULT_UNITS = 3;
  var subjectCounter = 0;

  // ---- State ----
  var subjects = [];

  // ---- DOM References ----
  var form           = document.getElementById('subject-form');
  var inputName      = document.getElementById('input-name');
  var inputGrade     = document.getElementById('input-grade');
  var inputUnits     = document.getElementById('input-units');
  var tableBody      = document.getElementById('table-body');
  var emptyState     = document.getElementById('empty-state');
  var gwaDisplay     = document.getElementById('gwa-display');
  var gwaStatus      = document.getElementById('gwa-status');
  var totalUnitsEl   = document.getElementById('total-units');
  var subjectCountEl = document.getElementById('subject-count');
  var btnAdd         = document.getElementById('btn-add');
  var btnClear       = document.getElementById('btn-clear');

  // Stats
  var statBest       = document.getElementById('stat-best');
  var statBestName   = document.getElementById('stat-best-name');
  var statWorst      = document.getElementById('stat-worst');
  var statWorstName  = document.getElementById('stat-worst-name');
  var statCount      = document.getElementById('stat-count');

  // Honors cards
  var honorSumma     = document.getElementById('honor-summa');
  var honorMagna     = document.getElementById('honor-magna');
  var honorCum       = document.getElementById('honor-cum');

  // ============================================================
  //  Initialization
  // ============================================================

  function init() {
    loadFromStorage();
    subjectCounter = subjects.length;
    renderAll();

    // Event listeners
    btnAdd.addEventListener('click', addSubject);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      addSubject();
    });
    tableBody.addEventListener('click', handleTableClick);
    tableBody.addEventListener('change', handleInlineEdit);
    btnClear.addEventListener('click', clearAll);

    // Remove invalid class on input interaction
    [inputName, inputGrade, inputUnits].forEach(function (input) {
      input.addEventListener('input', function () {
        input.classList.remove('input-invalid');
      });
      input.addEventListener('focus', function () {
        input.classList.remove('input-invalid');
      });
    });
  }

  // ============================================================
  //  Add Subject
  // ============================================================

  function addSubject() {
    var rawName  = inputName.value.trim();
    var rawGrade = inputGrade.value.trim();
    var rawUnits = inputUnits.value.trim();

    // Apply defaults for empty fields
    var name  = rawName || ('Subject ' + (++subjectCounter));
    var grade = rawGrade !== '' ? parseFloat(rawGrade) : DEFAULT_GRADE;
    var units = rawUnits !== '' ? parseInt(rawUnits, 10) : DEFAULT_UNITS;

    if (!validateInputs(grade, units)) {
      return;
    }

    subjects.push({ name: name, grade: grade, units: units });
    saveToStorage();
    renderAll(true);
    clearInputs();
    inputName.focus();
  }

  // ============================================================
  //  Validation (only rejects out-of-range)
  // ============================================================

  function validateInputs(grade, units) {
    var isValid = true;

    if (isNaN(grade) || grade < 1 || grade > 5) {
      markInvalid(inputGrade);
      isValid = false;
    }

    if (isNaN(units) || units < 1 || units > 12 || !Number.isInteger(units)) {
      markInvalid(inputUnits);
      isValid = false;
    }

    return isValid;
  }

  function markInvalid(input) {
    input.classList.remove('input-invalid');
    void input.offsetWidth;
    input.classList.add('input-invalid');
  }

  // ============================================================
  //  Remove & Clear
  // ============================================================

  function handleTableClick(e) {
    var deleteBtn = e.target.closest('.btn-delete');
    if (!deleteBtn) return;

    var index = parseInt(deleteBtn.getAttribute('data-index'), 10);
    if (isNaN(index) || index < 0 || index >= subjects.length) return;

    removeSubject(index);
  }

  function removeSubject(index) {
    subjects.splice(index, 1);
    saveToStorage();
    renderAll();
  }

  // ============================================================
  //  Inline Editing
  // ============================================================

  function handleInlineEdit(e) {
    var input = e.target;
    var field = input.getAttribute('data-field');
    var index = parseInt(input.getAttribute('data-index'), 10);

    if (!field || isNaN(index) || index < 0 || index >= subjects.length) return;

    var subject = subjects[index];

    if (field === 'name') {
      var newName = input.value.trim();
      if (newName.length === 0) {
        input.value = subject.name;
        markInvalid(input);
        return;
      }
      subject.name = newName;
    } else if (field === 'grade') {
      var newGrade = parseFloat(input.value);
      if (isNaN(newGrade) || newGrade < 1 || newGrade > 5) {
        input.value = subject.grade.toFixed(2);
        markInvalid(input);
        return;
      }
      subject.grade = newGrade;
      input.value = newGrade.toFixed(2);
    } else if (field === 'units') {
      var newUnits = parseInt(input.value, 10);
      if (isNaN(newUnits) || newUnits < 1 || newUnits > 12 || !Number.isInteger(newUnits)) {
        input.value = subject.units;
        markInvalid(input);
        return;
      }
      subject.units = newUnits;
    }

    input.classList.remove('input-invalid');
    saveToStorage();

    // Re-render stats, banner, honors (but not the table to keep focus)
    updateGWADisplay();
    renderStats();
    renderBannerMeta();
    updateHonors();
  }

  function clearAll() {
    if (subjects.length === 0) return;

    var confirmed = confirm('Clear all subjects? This cannot be undone.');
    if (!confirmed) return;

    subjects = [];
    saveToStorage();
    renderAll();
    inputName.focus();
  }

  // ============================================================
  //  GWA Calculation
  // ============================================================

  function calculateGWA() {
    if (subjects.length === 0) return null;

    var totalWeighted = 0;
    var totalUnits = 0;

    for (var i = 0; i < subjects.length; i++) {
      totalWeighted += subjects[i].grade * subjects[i].units;
      totalUnits += subjects[i].units;
    }

    if (totalUnits === 0) return null;
    return totalWeighted / totalUnits;
  }

  function getTotalUnits() {
    var total = 0;
    for (var i = 0; i < subjects.length; i++) {
      total += subjects[i].units;
    }
    return total;
  }

  function getHighestGrade() {
    // Highest (worst) numeric grade
    if (subjects.length === 0) return null;
    var worst = subjects[0];
    for (var i = 1; i < subjects.length; i++) {
      if (subjects[i].grade > worst.grade) worst = subjects[i];
    }
    return worst;
  }

  function getBestGrade() {
    if (subjects.length === 0) return null;
    var best = subjects[0];
    for (var i = 1; i < subjects.length; i++) {
      if (subjects[i].grade < best.grade) best = subjects[i];
    }
    return best;
  }

  function getWorstGrade() {
    return getHighestGrade();
  }

  // ============================================================
  //  Academic Honors Detection
  // ============================================================

  function determineHonors() {
    if (subjects.length === 0) return null;

    var gwa = calculateGWA();
    if (gwa === null) return null;

    var highestGrade = getHighestGrade();
    var maxGrade = highestGrade ? highestGrade.grade : 5;

    // Summa Cum Laude: GWA 1.00–1.25, no grade lower than 1.75
    if (gwa >= 1.00 && gwa <= 1.25 && maxGrade <= 1.75) {
      return 'summa';
    }
    // Magna Cum Laude: GWA 1.26–1.50, no grade lower than 2.00
    if (gwa >= 1.00 && gwa <= 1.50 && maxGrade <= 2.00) {
      return 'magna';
    }
    // Cum Laude: GWA 1.51–1.75, no grade lower than 2.25
    if (gwa >= 1.00 && gwa <= 1.75 && maxGrade <= 2.25) {
      return 'cum';
    }

    return null;
  }

  function updateHonors() {
    var honor = determineHonors();

    // Clear all
    honorSumma.classList.remove('is-active');
    honorMagna.classList.remove('is-active');
    honorCum.classList.remove('is-active');

    if (honor === 'summa') {
      honorSumma.classList.add('is-active');
    } else if (honor === 'magna') {
      honorMagna.classList.add('is-active');
    } else if (honor === 'cum') {
      honorCum.classList.add('is-active');
    }
  }

  function getHonorLabel(honor) {
    if (honor === 'summa') return 'Summa Cum Laude';
    if (honor === 'magna') return 'Magna Cum Laude';
    if (honor === 'cum')   return 'Cum Laude';
    return null;
  }

  // ============================================================
  //  Rendering
  // ============================================================

  function renderAll(animateLastRow) {
    renderTable(animateLastRow);
    updateGWADisplay();
    renderStats();
    renderBannerMeta();
    updateHonors();

    var isEmpty = subjects.length === 0;
    btnClear.disabled = isEmpty;
  }

  function renderTable(animateLastRow) {
    tableBody.innerHTML = '';

    var isEmpty = subjects.length === 0;

    if (isEmpty) {
      emptyState.classList.add('is-visible');
    } else {
      emptyState.classList.remove('is-visible');
    }

    for (var i = 0; i < subjects.length; i++) {
      var subject = subjects[i];
      var row = document.createElement('div');
      row.className = 'subject-row';
      row.setAttribute('data-index', i);

      if (animateLastRow && i === subjects.length - 1) {
        row.classList.add('row-new');
        row.addEventListener('animationend', function () {
          this.classList.remove('row-new');
        });
      }

      // Editable name input
      var nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'row-name';
      nameInput.value = subject.name;
      nameInput.setAttribute('data-index', i);
      nameInput.setAttribute('data-field', 'name');
      nameInput.setAttribute('aria-label', 'Subject name');

      // Editable units input
      var unitsInput = document.createElement('input');
      unitsInput.type = 'number';
      unitsInput.className = 'row-units';
      unitsInput.value = subject.units;
      unitsInput.setAttribute('data-index', i);
      unitsInput.setAttribute('data-field', 'units');
      unitsInput.setAttribute('aria-label', 'Units');
      unitsInput.min = '1';
      unitsInput.max = '12';
      unitsInput.step = '1';

      // Editable grade input
      var gradeInput = document.createElement('input');
      gradeInput.type = 'number';
      gradeInput.className = 'row-grade';
      gradeInput.value = subject.grade.toFixed(2);
      gradeInput.setAttribute('data-index', i);
      gradeInput.setAttribute('data-field', 'grade');
      gradeInput.setAttribute('aria-label', 'Grade');
      gradeInput.min = '1';
      gradeInput.max = '5';
      gradeInput.step = '0.25';

      // Delete button
      var actionEl = document.createElement('span');
      actionEl.className = 'row-action';

      var deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-delete';
      deleteBtn.setAttribute('data-index', i);
      deleteBtn.setAttribute('aria-label', 'Delete ' + subject.name);
      deleteBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
          '<path d="M1.75 3.5h10.5M5.25 3.5V2.333a1.167 1.167 0 0 1 1.167-1.166h1.166a1.167 1.167 0 0 1 1.167 1.166V3.5m1.75 0v8.167a1.167 1.167 0 0 1-1.167 1.166H4.667A1.167 1.167 0 0 1 3.5 11.667V3.5h7Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>';
      actionEl.appendChild(deleteBtn);

      row.appendChild(nameInput);
      row.appendChild(unitsInput);
      row.appendChild(gradeInput);
      row.appendChild(actionEl);
      tableBody.appendChild(row);
    }
  }

  function updateGWADisplay() {
    var gwa = calculateGWA();
    var honor = determineHonors();

    if (gwa === null) {
      gwaDisplay.textContent = '\u2014';
      gwaDisplay.classList.add('is-empty');
      gwaDisplay.classList.remove('just-calculated');
      gwaStatus.textContent = 'Add subjects below';
    } else {
      var previousValue = gwaDisplay.textContent;
      var newValue = gwa.toFixed(4);

      gwaDisplay.textContent = newValue;
      gwaDisplay.classList.remove('is-empty');

      // Pop animation if value changed
      if (previousValue !== newValue && previousValue !== '\u2014') {
        gwaDisplay.classList.remove('just-calculated');
        void gwaDisplay.offsetWidth;
        gwaDisplay.classList.add('just-calculated');
      } else if (previousValue === '\u2014') {
        gwaDisplay.classList.remove('just-calculated');
        void gwaDisplay.offsetWidth;
        gwaDisplay.classList.add('just-calculated');
      }

      // Status text with honor
      var honorLabel = getHonorLabel(honor);
      if (honorLabel) {
        gwaStatus.textContent = honorLabel + ' \u2014 With Honors';
      } else {
        gwaStatus.textContent = 'Calculated';
      }
    }
  }

  function renderStats() {
    var best = getBestGrade();
    var worst = getWorstGrade();

    if (best) {
      statBest.textContent = best.grade.toFixed(2);
      statBestName.textContent = best.name;
    } else {
      statBest.textContent = '\u2014';
      statBestName.textContent = 'N/A';
    }

    if (worst) {
      statWorst.textContent = worst.grade.toFixed(2);
      statWorstName.textContent = worst.name;
    } else {
      statWorst.textContent = '\u2014';
      statWorstName.textContent = 'N/A';
    }

    statCount.textContent = subjects.length;
  }

  function renderBannerMeta() {
    var total = getTotalUnits();
    totalUnitsEl.textContent = total;

    if (subjects.length === 0) {
      subjectCountEl.textContent = 'no subjects';
    } else {
      subjectCountEl.textContent =
        subjects.length + ' subject' + (subjects.length !== 1 ? 's' : '') +
        ' \u00B7 ' + total + ' total units';
    }
  }

  // ============================================================
  //  Input Helpers
  // ============================================================

  function clearInputs() {
    inputName.value  = '';
    inputGrade.value = '';
    inputUnits.value = '';
  }

  // ============================================================
  //  LocalStorage Persistence
  // ============================================================

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    } catch (e) {
      // Silently fail
    }
  }

  function loadFromStorage() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          subjects = parsed.filter(function (item) {
            return (
              item &&
              typeof item.name === 'string' &&
              typeof item.grade === 'number' &&
              typeof item.units === 'number' &&
              item.name.length > 0 &&
              item.grade >= 1 && item.grade <= 5 &&
              item.units >= 1 && item.units <= 12 &&
              Number.isInteger(item.units)
            );
          });
        }
      }
    } catch (e) {
      subjects = [];
    }
  }

  // ============================================================
  //  Boot
  // ============================================================

  document.addEventListener('DOMContentLoaded', init);
})();
