/* Plenitud reference behaviour: menu disclosure, theme switch, booking dialog.
   Plain JS, no dependencies. Every widget degrades to working HTML without it. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Messages written by script, in the page's language (<html lang>). Page text comes from build.mjs. */
  var MESSAGES = {
    es: {
      order: 'Hola, quiero pedir: ', available: '. ¿Está disponible?',
      errors: function (n) { return n === 1 ? 'Hay 1 campo por corregir.' : 'Hay ' + n + ' campos por corregir.'; },
      booked: function (label, email) { return label + '. Te escribimos a ' + email + '.'; }
    },
    en: {
      order: 'Hi, I would like to order: ', available: '. Is it available?',
      errors: function (n) { return n === 1 ? '1 field needs fixing.' : n + ' fields need fixing.'; },
      booked: function (label, email) { return label + '. We will write to you at ' + email + '.'; }
    }
  };
  var T = MESSAGES[document.documentElement.lang] || MESSAGES.es;

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

  /* ---------- Carousels (therapy groups) ----------
     The track scrolls natively; JS only adds the arrows, and only when the row overflows.
     aria-disabled (not disabled) at the ends so a focused arrow keeps focus. */
  $$('.carousel').forEach(function (c) {
    var track = $('.carousel__track', c), ctr = $('.carousel__controls', c);
    if (!track || !ctr) return;
    var prev = $('[data-dir="-1"]', ctr), next = $('[data-dir="1"]', ctr);
    var update = function () {
      var max = track.scrollWidth - track.clientWidth;
      ctr.hidden = max <= 1;
      prev.setAttribute('aria-disabled', String(track.scrollLeft <= 1));
      next.setAttribute('aria-disabled', String(track.scrollLeft >= max - 1));
    };
    var step = function (dir) {
      var li = track.firstElementChild;
      var w = li ? li.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
      track.scrollBy({ left: dir * w });   /* smoothness comes from CSS, which drops it under reduced motion */
    };
    [prev, next].forEach(function (b) {
      b.addEventListener('click', function () { if (b.getAttribute('aria-disabled') !== 'true') step(Number(b.dataset.dir)); });
    });
    track.addEventListener('scroll', update, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);   /* catches layout changes a window resize misses */
    else window.addEventListener('resize', update);
    update();
  });

  /* ---------- WhatsApp order link follows the chosen variant ---------- */
  var waLinks = $$('[data-whatsapp]');   /* the order button plus each reception line */
  if (waLinks.length) {
    var setMessage = function () {
      var picked = $('input[name=variant]:checked');
      waLinks.forEach(function (wa) {
        var text = T.order + wa.dataset.product +
          (picked ? ' (' + wa.dataset.variantName + ': ' + picked.value + ')' : '') +
          (wa.dataset.price ? ' · ' + wa.dataset.price : '') + T.available;
        wa.href = wa.href.split('?')[0] + '?text=' + encodeURIComponent(text);
      });
    };
    $$('input[name=variant]').forEach(function (r) { r.addEventListener('change', setMessage); });
    setMessage();
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
      status.textContent = T.errors(bad.length);
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
    $('#reserve-summary').textContent = T.booked(label, $('#f-email').value.trim());
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
