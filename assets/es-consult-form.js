(function () {
  'use strict';
  var form         = document.getElementById('esConsultForm');
  if (!form) return;

  var submitBtn    = document.getElementById('esSubmitBtn');
  var successPanel = document.getElementById('esSuccessPanel');
  var refNumber    = document.getElementById('esRefNumber');
  var submitError  = document.getElementById('es-error-submit');

  // Reuses the same live GSC consultation pipeline documented in
  // gsc-consultation-form-infrastructure.md — Formspree (primary) +
  // Apps Script CRM logger (secondary, best-effort). A hidden "source"
  // field tags these submissions as coming from the Executive Solutions
  // site so they're identifiable in the shared CRM sheet.
  var FORMSPREE_ENDPOINT   = 'https://formspree.io/f/xnpaolpe';
  var APPS_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0e9ZsA5S8ExRM9bG35t29DboaJk7eG6dreAm9jWDNmX7WOy85DPg16xyDC8fbtGx-/exec';

  var rules = [
    { field:'es_name',         type:'text',     errorId:'es-error-name',    msg:'Please enter your full name.' },
    { field:'es_organization', type:'text',     errorId:'es-error-org',     msg:'Please enter your organization (or "Individual" if personal).' },
    { field:'es_email',        type:'email',    errorId:'es-error-email',   msg:'Please enter a valid email address.' },
    { field:'es_service',      type:'select',   errorId:'es-error-service', msg:'Please select an area of interest.' },
    { field:'es_message',      type:'textarea', errorId:'es-error-message', msg:'Please briefly describe your situation or inquiry.' }
  ];

  function isValidEmail(val) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim()); }

  function validateField(rule) {
    var valid = true;
    var el = document.getElementById(rule.field);
    if (rule.type === 'email') {
      valid = !!(el && el.value.trim() !== '' && isValidEmail(el.value));
    } else {
      valid = !!(el && el.value.trim() !== '');
    }
    var errEl = document.getElementById(rule.errorId);
    if (errEl) errEl.style.display = valid ? 'none' : 'block';
    return valid;
  }

  rules.forEach(function (rule) {
    var el = document.getElementById(rule.field);
    if (!el) return;
    var evt = (rule.type === 'select') ? 'change' : 'input';
    el.addEventListener(evt, function () { validateField(rule); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitError) submitError.style.display = 'none';

    var validity = rules.map(function (rule) { return validateField(rule); });
    var allValid = validity.every(function (v) { return v; });
    if (!allValid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    var fd = new FormData(form);
    fd.set('source', 'Executive Solutions Site');

    fetch(FORMSPREE_ENDPOINT, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Formspree submission failed');
        var ref = 'ES-' + Date.now().toString(36).toUpperCase();
        if (refNumber) refNumber.textContent = ref;
        form.style.display = 'none';
        if (successPanel) successPanel.classList.add('show');
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request a Consultation';
        if (submitError) submitError.style.display = 'block';
      });

    try {
      fetch(APPS_SCRIPT_ENDPOINT, { method: 'POST', mode: 'no-cors', body: fd }).catch(function () {});
    } catch (err) {}
  });
})();
