/* ============================================================
   GWA Calculator — Application Logic
   ============================================================ */

(function () {
  'use strict';

  // ---- Storage key ----
  const STORAGE_KEY = 'gwa-subjects';

  // ---- State ----
  let subjects = [];

  // ---- DOM References ----
  const form         = document.getElementById('subject-form');
  const inputName    = document.getElementById('input-name');
  const inputGrade   = document.getElementById('input-grade');
  const inputUnits   = document.getElementById('input-units');
  const tableBody    = document.getElementById('table-body');
  const tableWrap    = document.getElementById('table-wrap');
  const emptyState   = document.getElementById('empty-state');
  const gwaDisplay     = document.getElementById('gwa-display');
  const resultsSummary = document.getElementById('results-summary');
  const btnClear       = document.getElementById('btn-clear');
  const btnCalculate   = document.getElementById('btn-calculate');

  // ============================================================
  //  Initialization
  // ============================================================

  function init() {
    loadFromStorage();
    renderTable();

    // Event listeners
    form.addEventListener('submit', handleFormSubmit);
    tableBody.addEventListener('click', handleTableClick);
    btnClear.addEventListener('click', clearAll);
    btnCalculate.addEventListener('click', handleCalculate);

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
  //  Form Handling
  // ============================================================

  function handleFormSubmit(e) {
    e.preventDefault();
    addSubject();
  }

  function addSubject() {
    var name  = inputName.value.trim();
    var grade = parseFloat(inputGrade.value);
    var units = parseInt(inputUnits.value, 10);

    if (!validateInputs(name, grade, units)) {
      return;
    }

    subjects.push({ name: name, grade: grade, units: units });
    saveToStorage();
    renderTable(true); // pass true to animate the new row
    clearInputs();
    inputName.focus();
  }

  // ============================================================
  //  Validation
  // ============================================================

  function validateInputs(name, grade, units) {
    var isValid = true;

    // Subject name
    if (!name || name.length === 0) {
      markInvalid(inputName);
      isValid = false;
    }

    // Grade: must be a number between 1.00 and 5.00
    if (isNaN(grade) || grade < 1 || grade > 5) {
      markInvalid(inputGrade);
      isValid = false;
    }

    // Units: must be a positive integer between 1 and 12
    if (isNaN(units) || units < 1 || units > 12 || !Number.isInteger(units)) {
      markInvalid(inputUnits);
      isValid = false;
    }

    return isValid;
  }

  function markInvalid(input) {
    // Remove and re-add to retrigger animation
    input.classList.remove('input-invalid');
    // Force reflow
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
    renderTable();
  }

  function clearAll() {
    if (subjects.length === 0) return;

    var confirmed = confirm('Clear all subjects? This cannot be undone.');
    if (!confirmed) return;

    subjects = [];
    saveToStorage();
    renderTable();
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

  // ============================================================
  //  Rendering
  // ============================================================

  function renderTable(animateLastRow) {
    // Clear existing rows
    tableBody.innerHTML = '';

    var isEmpty = subjects.length === 0;

    // Toggle empty state
    if (isEmpty) {
      emptyState.classList.add('is-visible');
      tableWrap.classList.add('is-empty');
    } else {
      emptyState.classList.remove('is-visible');
      tableWrap.classList.remove('is-empty');
    }

    // Build rows
    for (var i = 0; i < subjects.length; i++) {
      var subject = subjects[i];
      var tr = document.createElement('tr');

      // Animate only the last (newly added) row
      if (animateLastRow && i === subjects.length - 1) {
        tr.classList.add('row-new');
        // Remove animation class after it completes
        tr.addEventListener('animationend', function () {
          this.classList.remove('row-new');
        });
      }

      // Subject name
      var tdName = document.createElement('td');
      tdName.className = 'cell-name';
      var nameSpan = document.createElement('span');
      nameSpan.className = 'subject-name';
      nameSpan.textContent = subject.name;
      tdName.appendChild(nameSpan);

      // Grade
      var tdGrade = document.createElement('td');
      tdGrade.className = 'cell-grade';
      tdGrade.textContent = subject.grade.toFixed(2);

      // Units
      var tdUnits = document.createElement('td');
      tdUnits.className = 'cell-units';
      tdUnits.textContent = subject.units;

      // Delete action
      var tdAction = document.createElement('td');
      tdAction.className = 'cell-action';

      var deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-delete';
      deleteBtn.setAttribute('data-index', i);
      deleteBtn.setAttribute('aria-label', 'Delete ' + subject.name);
      deleteBtn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
          '<path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>';
      tdAction.appendChild(deleteBtn);

      tr.appendChild(tdName);
      tr.appendChild(tdGrade);
      tr.appendChild(tdUnits);
      tr.appendChild(tdAction);
      tableBody.appendChild(tr);
    }

    // Reset GWA display — user must click Calculate
    resetGWADisplay();

    // Toggle clear & calculate buttons
    btnClear.disabled = isEmpty;
    btnCalculate.disabled = isEmpty;
  }

  function resetGWADisplay() {
    if (subjects.length === 0) {
      gwaDisplay.textContent = '\u2014'; // em dash
      gwaDisplay.classList.add('is-empty');
      gwaDisplay.classList.remove('just-calculated');
      resultsSummary.textContent = 'Add subjects and click calculate';
    } else {
      gwaDisplay.textContent = '\u2014';
      gwaDisplay.classList.add('is-empty');
      gwaDisplay.classList.remove('just-calculated');
      resultsSummary.textContent =
        subjects.length + ' subject' + (subjects.length !== 1 ? 's' : '') +
        ' ready \u2014 click Calculate';
    }
  }

  function handleCalculate() {
    var gwa = calculateGWA();
    if (gwa === null) return;

    var totalUnits = getTotalUnits();

    gwaDisplay.textContent = gwa.toFixed(4);
    gwaDisplay.classList.remove('is-empty');
    resultsSummary.textContent =
      subjects.length + ' subject' + (subjects.length !== 1 ? 's' : '') +
      ' \u00B7 ' + totalUnits + ' total unit' + (totalUnits !== 1 ? 's' : '');

    // Trigger pop animation
    gwaDisplay.classList.remove('just-calculated');
    void gwaDisplay.offsetWidth; // force reflow
    gwaDisplay.classList.add('just-calculated');
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
      // Silently fail if storage is unavailable
    }
  }

  function loadFromStorage() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Validate each entry
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
