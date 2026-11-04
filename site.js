/* Plenitud reference behaviour: menu disclosure, theme switch, booking dialog.
   Plain JS, no dependencies. Every widget degrades to working HTML without it. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* WhatsApp messages: always Spanish, the language reception works in (English pages say so). */
  var WA = {
    order: 'Hola, quiero pedir: ', available: '. ¿Está disponible?',
    booking: function (name, therapy, detail, pref) {
      return 'Hola, soy ' + name + '. Quiero reservar una terapia:\n• ' + therapy + (detail ? ' (' + detail + ')' : '') +
        (pref ? '\nDía y hora que prefiero: ' + pref : '') + '\n¿Qué horarios tienen disponibles?';
    },
    cartIntro: 'Hola, quiero hacer este pedido:', total: 'Total', cartEnd: '¿Está disponible?'
  };
  /* Interface text written by script, in the page's language (<html lang>). Page text comes from build.mjs. */
  var MESSAGES = {
    es: {
      errors: function (n) { return n === 1 ? 'Hay 1 campo por corregir.' : 'Hay ' + n + ' campos por corregir.'; },
      total: 'Total',
      cartLabel: function (n) { return 'Pedido, ' + (n === 1 ? '1 artículo' : n + ' artículos'); },
      added: function (item, n) { return 'Agregado: ' + item + '. Llevas ' + (n === 1 ? '1 artículo' : n + ' artículos') + ' en tu pedido.'; },
      less: 'Quitar uno de', more: 'Agregar uno de', remove: 'Quitar', qty: 'Cantidad de', view: 'Ver pedido →',
      changed: function (item, q) { return item + ': ' + q; }, removed: function (item) { return item + ' quitado del pedido.'; }, cleared: 'Pedido vacío.'
    },
    en: {
      errors: function (n) { return n === 1 ? '1 field needs fixing.' : n + ' fields need fixing.'; },
      total: 'Total',
      cartLabel: function (n) { return 'Order, ' + (n === 1 ? '1 item' : n + ' items'); },
      added: function (item, n) { return 'Added: ' + item + '. Your order has ' + (n === 1 ? '1 item' : n + ' items') + '.'; },
      less: 'One less', more: 'One more', remove: 'Remove', qty: 'Quantity of', view: 'View order →',
      changed: function (item, q) { return item + ': ' + q; }, removed: function (item) { return item + ' removed from the order.'; }, cleared: 'Order emptied.'
    }
  };
  var LANG = MESSAGES[document.documentElement.lang] ? document.documentElement.lang : 'es';
  var T = MESSAGES[LANG];
  var money = function (n) { return '$' + n.toLocaleString('es-MX') + ' MXN'; };
  /* Point every WhatsApp link carrying `attr` at the same message (main button + second reception line) */
  var setWhatsApp = function (attr, text) {
    $$('[' + attr + ']').forEach(function (a) { a.href = a.href.split('?')[0] + '?text=' + encodeURIComponent(text); });
  };

  /* ---------- Loading splash: take it out of the page once it has faded ---------- */
  var loader = $('.loader');
  if (loader) loader.addEventListener('animationend', function (e) { if (e.animationName === 'loader-out') loader.remove(); });

  /* ---------- Menu disclosure (mobile) ---------- */
  var toggle = $('.nav__toggle'), list = $('#menu-principal');
  if (toggle && list) {
    var setMenu = function (open) { toggle.setAttribute('aria-expanded', String(open)); list.classList.toggle('is-open', open); };
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
    list.addEventListener('click', function (e) { if (e.target.closest('a, button')) setMenu(false); });
    /* The panel floats over the page, so a click or Tab outside the header closes it */
    var header = toggle.closest('header');
    /* pointerdown, not click: iOS Safari sends no click for a tap on a non-interactive area like the dimmed page */
    document.addEventListener('pointerdown', function (e) { if (!header.contains(e.target)) setMenu(false); });
    header.addEventListener('focusout', function (e) { if (e.relatedTarget && !header.contains(e.relatedTarget)) setMenu(false); });
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
        var text = WA.order + wa.dataset.product +
          (picked ? ' (' + wa.dataset.variantName + ': ' + picked.value + ')' : '') +
          (wa.dataset.price ? ' · ' + wa.dataset.price : '') + WA.available;
        wa.href = wa.href.split('?')[0] + '?text=' + encodeURIComponent(text);
      });
    };
    $$('input[name=variant]').forEach(function (r) { r.addEventListener('change', setMessage); });
    setMessage();
  }

  /* ---------- Order cart ----------
     Lives in localStorage (this browser only) and leaves the site as one WhatsApp
     message listing every item. Without storage it still works for the visit.
     Each item keeps its text in both languages (`t`), so the list follows the page
     language while the message is always written in Spanish. */
  var CART_KEY = 'plenitud-cart';
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
  var cartDlg = $('#cart');
  var cartCount = function () { return cart.reduce(function (n, it) { return n + it.qty; }, 0); };
  /* Item text in `lang`; carts saved before items carried both languages fall back to their stored fields */
  var itemText = function (it, lang) {
    var t = it.t && (it.t[lang] || it.t.es);
    return t ? { name: t.name, variantName: t.variantName, variant: it.vi >= 0 ? t.variants[it.vi] : '', note: t.note }
      : { name: it.name, variantName: it.variantName, variant: it.variant, note: it.note };
  };
  var itemLabel = function (it, lang) {
    var x = itemText(it, lang || LANG);
    return x.name + (x.variant ? ' (' + x.variantName + ': ' + x.variant + ')' : '');
  };
  var saveCart = function () { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} };

  function cartMessage() {
    var total = 0, priced = true;
    var lines = cart.map(function (it) {
      var line = '• ' + it.qty + ' × ' + itemLabel(it, 'es');
      if (it.price != null) { line += ' — ' + money(it.price * it.qty); total += it.price * it.qty; } else priced = false;
      return line;
    });
    return [WA.cartIntro].concat(lines, priced ? [WA.total + ': ' + money(total)] : [], [WA.cartEnd]).join('\n');
  }

  function renderCart(focusKey, focusAct) {
    var n = cartCount();
    $$('[data-cart-open]').forEach(function (b) {
      if (b.classList.contains('cart-fab')) b.hidden = n === 0;
      b.setAttribute('aria-label', T.cartLabel(n));
    });
    $$('[data-cart-count]').forEach(function (s) { s.textContent = n; });
    if (!cartDlg) return;
    var list = $('[data-cart-list]', cartDlg);
    list.innerHTML = '';
    cart.forEach(function (it) {
      var li = document.createElement('li');
      li.className = 'cart-item';
      var label = itemLabel(it), x = itemText(it, LANG);
      li.innerHTML =
        '<div class="cart-item__info"><p class="cart-item__name"></p><p class="cart-item__meta caption"></p></div>' +
        '<div class="cart-item__qty" role="group">' +
          '<button class="btn btn--secondary qty-btn" type="button" data-act="less"><span aria-hidden="true">−</span></button>' +
          '<span class="qty-value"></span>' +
          '<button class="btn btn--secondary qty-btn" type="button" data-act="more"><span aria-hidden="true">+</span></button>' +
        '</div>' +
        '<p class="cart-item__total"></p>' +
        '<button class="btn btn--ghost cart-item__remove" type="button" data-act="remove"></button>';
      $('.cart-item__name', li).textContent = x.name;
      $('.cart-item__meta', li).textContent = [x.variant ? x.variantName + ': ' + x.variant : '', it.price != null ? money(it.price) + (x.note ? ' ' + x.note : '') : ''].filter(Boolean).join(' · ');
      $('.cart-item__qty', li).setAttribute('aria-label', T.qty + ' ' + label);
      $('.qty-value', li).textContent = it.qty;
      $('[data-act=less]', li).setAttribute('aria-label', T.less + ' ' + label);
      $('[data-act=less]', li).setAttribute('aria-disabled', String(it.qty <= 1));
      $('[data-act=more]', li).setAttribute('aria-label', T.more + ' ' + label);
      $('.cart-item__total', li).textContent = it.price != null ? money(it.price * it.qty) : '';
      var rm = $('[data-act=remove]', li);
      rm.textContent = T.remove + ' ';
      var sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = label; rm.appendChild(sr);
      $$('[data-act]', li).forEach(function (b) { b.dataset.key = it.key; });
      list.appendChild(li);
    });
    var total = cart.reduce(function (s, it) { return s + (it.price || 0) * it.qty; }, 0);
    $('[data-cart-total]', cartDlg).textContent = n ? T.total + ': ' + money(total) : '';
    $('[data-cart-empty]', cartDlg).hidden = n > 0;
    $('[data-cart-actions]', cartDlg).hidden = n === 0;
    $$('.dialog__note', cartDlg).forEach(function (p) { p.hidden = n === 0; });
    setWhatsApp('data-cart-send', cartMessage());
    /* Re-rendering replaces the buttons, so put focus back where it was (or on the title when that item is gone) */
    if (focusKey) {
      var again = $('[data-key="' + focusKey + '"][data-act="' + focusAct + '"]', list);
      (again || $('#cart-title')).focus();
    }
  }

  function addToCart(btn) {
    var it = {
      slug: btn.dataset.slug, vi: $$('input[name=variant]').indexOf($('input[name=variant]:checked')),
      price: btn.dataset.price ? Number(btn.dataset.price) : null, t: JSON.parse(btn.dataset.texts), qty: 1
    };
    it.key = it.slug + '|' + it.vi;   /* the same in both languages, so a product never appears twice */
    var found = cart.filter(function (x) { return x.key === it.key; })[0];
    if (found) found.qty++; else cart.push(it);
    saveCart(); renderCart();
    var msg = $('[data-cart-added]');
    if (msg) {
      msg.innerHTML = '';
      msg.appendChild(document.createTextNode(T.added(itemLabel(it), cartCount()) + ' '));
      var open = document.createElement('button');
      open.type = 'button'; open.className = 'link-button'; open.textContent = T.view;
      open.addEventListener('click', openCart);
      msg.appendChild(open);
    }
  }

  function openCart() { if (!cartDlg) return; renderCart(); cartDlg.showModal(); $('#cart-title').focus(); }

  $$('[data-cart-add]').forEach(function (b) {
    b.hidden = false;
    b.addEventListener('click', function () { addToCart(b); });
    /* With the cart available, ordering a single item directly becomes the secondary path */
    var one = $('[data-order-one]'); if (one) one.classList.replace('btn--secondary', 'btn--ghost');
  });
  $$('[data-cart-open]').forEach(function (b) { b.addEventListener('click', openCart); });
  if (cartDlg) {
    var status = $('[data-cart-status]', cartDlg);
    $('[data-cart-list]', cartDlg).addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var it = cart.filter(function (x) { return x.key === b.dataset.key; })[0]; if (!it) return;
      var act = b.dataset.act;
      if (act === 'less' && it.qty <= 1) return;
      if (act === 'less') it.qty--;
      if (act === 'more') it.qty++;
      if (act === 'remove') cart = cart.filter(function (x) { return x !== it; });
      status.textContent = act === 'remove' ? T.removed(itemLabel(it)) : T.changed(itemLabel(it), it.qty);
      saveCart(); renderCart(it.key, act);
    });
    $('[data-cart-clear]', cartDlg).addEventListener('click', function () {
      cart = []; saveCart(); renderCart(); status.textContent = T.cleared; $('#cart-title').focus();
    });
    $$('[data-close]', cartDlg).forEach(function (b) { b.addEventListener('click', function () { cartDlg.close(); }); });
    cartDlg.addEventListener('click', function (e) { if (e.target === cartDlg) cartDlg.close(); });
  }
  renderCart();

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
    var name = $('#f-name');
    if (!name.value.trim()) bad.push(name);
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
    /* Step 3 shows the exact text that will reach WhatsApp; the visitor sends it from there */
    var checked = $('input[name=session]:checked', form);
    var text = WA.booking($('#f-name').value.trim(), checked.dataset.name, checked.dataset.detail, $('#f-pref').value.trim());
    $('#reserve-summary').textContent = text;
    setWhatsApp('data-booking-send', text);
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
