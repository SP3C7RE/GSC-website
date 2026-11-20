(function () {
  'use strict';
  var form         = document.getElementById('consultationForm');
  if (!form) return;

  var submitBtn    = document.getElementById('submitBtn');
  var successPanel = document.getElementById('successPanel');
  var refNumber    = document.getElementById('refNumber');
  var submitError  = document.getElementById('error-submit');

  // Live pipeline this form submits to (see gsc-consultation-form-infrastructure.md):
  // Formspree = primary, blocking. Apps Script Web App = secondary CRM log, best-effort/fire-and-forget.
  var FORMSPREE_ENDPOINT  = 'https://formspree.io/f/xnpaolpe';
  var APPS_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0e9ZsA5S8ExRM9bG35t29DboaJk7eG6dreAm9jWDNmX7WOy85DPg16xyDC8fbtGx-/exec';

  var rules = [
    { field:'org_type',     type:'radio',    errorId:'error-orgtype', wrap:null,            msg:'Please select the type of organization you represent.' },
    { field:'name',         type:'text',     errorId:'error-name',    wrap:'field-name',     msg:'Please enter your full name.' },
    { field:'organization', type:'text',     errorId:'error-org',     wrap:'field-org',      msg:'Please enter your organization name.' },
    { field:'email',        type:'email',    errorId:'error-email',   wrap:'field-email',    msg:'Please enter a valid email address.' },
    { field:'service',      type:'select',   errorId:'error-service', wrap:'field-service',  msg:'Please select an area of interest.' },
    { field:'message',      type:'textarea', errorId:'error-message', wrap:'field-message',  msg:'Please briefly describe your situation or inquiry.' }
  ];

  function isValidEmail(val) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim()); }

  function validateField(rule) {
    var valid = true;
    var el = document.getElementById(rule.field);
    if (rule.type === 'radio') {
      valid = !!document.querySelector('input[name="' + rule.field + '"]:checked');
    } else if (rule.type === 'email') {
      valid = !!(el && el.value.trim() !== '' && isValidEmail(el.value));
    } else {
      valid = !!(el && el.value.trim() !== '');
    }
    var errEl = document.getElementById(rule.errorId);
    if (errEl) errEl.style.display = valid ? 'none' : 'block';
    if (rule.wrap) {
      var wrapEl = document.getElementById(rule.wrap);
      if (wrapEl) wrapEl.classList.toggle('has-error', !valid);
    }
    return valid;
  }

  rules.forEach(function (rule) {
    if (rule.type === 'radio') {
      document.querySelectorAll('input[name="' + rule.field + '"]').forEach(function (r) {
        r.addEventListener('change', function () { validateField(rule); });
      });
    } else {
      var el = document.getElementById(rule.field);
      if (el) {
        el.addEventListener('input', function () { validateField(rule); });
        el.addEventListener('change', function () { validateField(rule); });
      }
    }
  });

  var phoneEl = document.getElementById('phone');
  if (phoneEl) {
    phoneEl.addEventListener('input', function () {
      var digits = this.value.replace(/\D/g, '').slice(0, 10);
      var formatted = '';
      if (digits.length > 0) formatted += '(' + digits.slice(0, 3);
      if (digits.length >= 4) formatted += ') ' + digits.slice(3, 6);
      if (digits.length >= 7) formatted += '-' + digits.slice(6, 10);
      this.value = formatted;
    });
  }

  function generateRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var ref = 'GSC-';
    for (var i = 0; i < 8; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
    return ref;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitError) submitError.style.display = 'none';

    var validity = rules.map(function (rule) { return validateField(rule); });
    var allValid = validity.every(function (v) { return v; });
    if (!allValid) {
      var errVisible = form.querySelector('.field-error[style*="block"]');
      if (errVisible) errVisible.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    var fd = new FormData(form);

    // Primary: Formspree — the visitor's official inquiry.
    fetch(FORMSPREE_ENDPOINT, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Formspree submission failed');
        var ref = generateRef();
        refNumber.textContent = 'Reference: ' + ref;
        form.style.display = 'none';
        successPanel.style.display = 'block';
        successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request →';
        if (submitError) { submitError.style.display = 'block'; submitError.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      });

    // Secondary: Apps Script CRM log — best-effort, fire-and-forget, never blocks the visitor.
    try {
      fetch(APPS_SCRIPT_ENDPOINT, { method: 'POST', mode: 'no-cors', body: fd }).catch(function () {});
    } catch (err) { /* ignore */ }
  });
})();
