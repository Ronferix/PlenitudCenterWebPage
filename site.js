/* Plenitud reference behaviour: menu disclosure, theme switch, booking dialog.
   Plain JS, no dependencies. Every widget degrades to working HTML without it. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Menu disclosure (mobile) ---------- */
  var toggle = $('.nav__toggle'), list = $('#menu-principal');
  if (toggle && list) {
    var setMenu = function (open) { toggle.setAttribute('aria-expanded', String(open)); list.classList.toggle('is-open', open); };
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
    list.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  }

  /* ---------- Theme switch ---------- */
  var sel = $('#theme');
  if (sel) {
    var saved = null; try { saved = localStorage.getItem('plenitud-theme'); } catch (e) {}
    sel.value = saved || 'light'; /* matches the pre-paint script's default so the switch never lies about what's on screen */
    var apply = function () {
      var v = sel.value, m = function (q) { return window.matchMedia(q).matches; };
      document.documentElement.dataset.theme = v !== 'auto' ? v : m('(prefers-contrast: more)') ? 'high-contrast' : m('(prefers-color-scheme: dark)') ? 'dark' : 'light';
    };
    sel.addEventListener('change', function () { try { localStorage.setItem('plenitud-theme', sel.value); } catch (e) {} apply(); });
    ['(prefers-color-scheme: dark)', '(prefers-contrast: more)'].forEach(function (q) { window.matchMedia(q).addEventListener('change', function () { if (sel.value === 'auto') apply(); }); });
  }

  /* ---------- Booking dialog (native <dialog>) ---------- */
  var dlg = $('#reserve'), form = $('#reserve-form');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var steps = $$('[data-step]', form), titles = { 1: 'reserve-t1', 2: 'reserve-t2', 3: 'reserve-t3' };
  var status = $('#form-status');

  function show(n) {
    steps.forEach(function (s) { s.hidden = Number(s.dataset.step) !== n; });
    dlg.setAttribute('aria-labelledby', titles[n]);
    var h = document.getElementById(titles[n]); if (h) h.focus();   /* focus the new step's heading: it is announced, and keyboard users start at the top */
  }
  function open(sessionKey) {
    form.reset(); clearErrors();
    if (sessionKey) { var r = $('input[name=session][value=' + sessionKey + ']', form); if (r) r.checked = true; }
    dlg.showModal(); show(1);
  }
  function clearErrors() {
    status.hidden = true; status.textContent = '';
    $$('.field', form).forEach(function (f) {
      f.classList.remove('is-invalid');
      var c = $('.input', f); if (c) c.removeAttribute('aria-invalid');
    });
  }
  function validate() {
    clearErrors();
    var bad = [];
    var name = $('#f-name'), email = $('#f-email');
    if (!name.value.trim()) bad.push(name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) bad.push(email);
    bad.forEach(function (c) { c.setAttribute('aria-invalid', 'true'); c.closest('.field').classList.add('is-invalid'); });
    if (bad.length) {
      status.textContent = bad.length === 1 ? 'Hay 1 campo por corregir.' : 'Hay ' + bad.length + ' campos por corregir.';
      status.hidden = false;
      bad[0].focus();
    }
    return !bad.length;
  }

  $$('[data-reserve]').forEach(function (b) { b.addEventListener('click', function () { open(b.dataset.session); }); });
  $$('[data-close]', dlg).forEach(function (b) { b.addEventListener('click', function () { dlg.close(); }); });
  $('[data-next]', dlg).addEventListener('click', function () { show(2); });
  $('[data-back]', dlg).addEventListener('click', function () { clearErrors(); show(1); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var checked = $('input[name=session]:checked', form);
    var label = checked.closest('.choice').querySelector('.choice__title').textContent;
    $('#reserve-summary').textContent = label + '. Te escribimos a ' + $('#f-email').value.trim() + '.';
    show(3);
  });
  /* Light dismiss: a click on the backdrop closes the dialog. Esc is built in. */
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  /* ---------- Product catalog filter (progressive enhancement) ---------- */
  var filter = $('#product-filter'), grid = $('#product-grid');
  if (filter && grid) {
    var items = $$('li', grid), empty = $('#product-empty');
    filter.addEventListener('input', function () {
      var q = filter.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (li) {
        var match = !q || li.dataset.name.indexOf(q) !== -1;
        li.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  }
})();
