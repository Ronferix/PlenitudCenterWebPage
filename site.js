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
      changed: function (item, q) { return item + ': ' + q; }, removed: function (item) { return item + ' quitado del pedido.'; }, cleared: 'Pedido vacío.',
      hour: function (h) { return h + ':00'; },
      openNow: function (c) { return 'Abierto ahora · cierra a las ' + c; },
      opensToday: function (o) { return 'Cerrado ahora · abre hoy a las ' + o; },
      opensTomorrow: function (o) { return 'Cerrado ahora · abre mañana a las ' + o; },
      opensOn: function (d, o) { return 'Cerrado ahora · abre el ' + ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d] + ' a las ' + o; },
      therapies: function (n, need) { return (n === 1 ? '1 terapia' : n + ' terapias') + (need ? ' para ' + need.toLowerCase() : ''); },
      products: function (n) { return n === 1 ? '1 producto' : n + ' productos'; }
    },
    en: {
      errors: function (n) { return n === 1 ? '1 field needs fixing.' : n + ' fields need fixing.'; },
      total: 'Total',
      cartLabel: function (n) { return 'Order, ' + (n === 1 ? '1 item' : n + ' items'); },
      added: function (item, n) { return 'Added: ' + item + '. Your order has ' + (n === 1 ? '1 item' : n + ' items') + '.'; },
      less: 'One less', more: 'One more', remove: 'Remove', qty: 'Quantity of', view: 'View order →',
      changed: function (item, q) { return item + ': ' + q; }, removed: function (item) { return item + ' removed from the order.'; }, cleared: 'Order emptied.',
      hour: function (h) { h = Number(h); return (h % 12 || 12) + (h < 12 ? ' a.m.' : ' p.m.'); },
      openNow: function (c) { return 'Open now · closes at ' + c; },
      opensToday: function (o) { return 'Closed now · opens today at ' + o; },
      opensTomorrow: function (o) { return 'Closed now · opens tomorrow at ' + o; },
      opensOn: function (d, o) { return 'Closed now · opens ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d] + ' at ' + o; },
      therapies: function (n, need) { return (n === 1 ? '1 therapy' : n + ' therapies') + (need ? ' for ' + need.toLowerCase() : ''); },
      products: function (n) { return n === 1 ? '1 product' : n + ' products'; }
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

  /* ---------- Demo notice: dismissed once, remembered in this browser ---------- */
  $$('[data-demo-ok]').forEach(function (b) {
    b.addEventListener('click', function () {
      try { localStorage.setItem('plenitud-demo-ok', '1'); } catch (e) {}
      document.documentElement.classList.add('demo-ok');
      var brand = $('.nav__brand'); if (brand) brand.focus();   /* the button is gone; keep focus at the top of the page */
    });
  });

  /* ---------- Menu disclosure (mobile) ---------- */
  var toggle = $('.nav__toggle'), list = $('#menu-principal');
  var setMenu = function (open) { toggle.setAttribute('aria-expanded', String(open)); list.classList.toggle('is-open', open); };
  if (toggle && list) {
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

  /* ---------- Navigation bar on the home page ----------
     Hidden over the full-screen hero, it slides in once the hero starts to leave and stays.
     CSS keeps it visible whenever it holds focus or the menu is open. */
  var bar = $('.nav__bar');
  if (bar && document.body.classList.contains('is-home')) {
    var body = document.body, isHome = true;
    var placeNav = function () {
      if (isHome) body.classList.toggle('nav-shown', Math.max(0, scrollY) > innerHeight * 0.2);   /* iOS bounces past the top with negative values */
    };
    window.addEventListener('scroll', placeNav, { passive: true });
    window.addEventListener('resize', placeNav);
    placeNav();
  }

  /* ---------- Settings dialog: language, theme, Google map ---------- */
  var settingsDlg = $('#settings');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; };
  if (settingsDlg) {
    $$('[data-settings-open]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (toggle && list) setMenu(false);
        settingsDlg.showModal(); $('#settings-title').focus();
      });
    });
    $$('[data-close]', settingsDlg).forEach(function (b) { b.addEventListener('click', function () { settingsDlg.close(); }); });
    settingsDlg.addEventListener('click', function (e) { if (e.target === settingsDlg) settingsDlg.close(); });
  }

  /* Theme: the pre-paint script in <head> already applied the saved choice. Dark and high
     contrast are two switches over one setting, so turning one on turns the other off. */
  var html = document.documentElement;
  var themeSwitches = $$('[data-theme-switch]');
  var syncTheme = function () { themeSwitches.forEach(function (b) { b.setAttribute('aria-checked', String(html.dataset.theme === b.dataset.themeSwitch)); }); };
  themeSwitches.forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('aria-checked') === 'true' ? 'light' : b.dataset.themeSwitch;
      html.classList.add('theme-fade');   /* colours ease over instead of snapping (no-op under reduced motion) */
      html.dataset.theme = v; store('plenitud-theme', v); syncTheme();
      setTimeout(function () { html.classList.remove('theme-fade'); }, 500);
    });
  });
  syncTheme();
  if (store('plenitud-theme') === 'auto') {   /* a choice saved by the old footer selector keeps following the device */
    ['(prefers-color-scheme: dark)', '(prefers-contrast: more)'].forEach(function (q) {
      window.matchMedia(q).addEventListener('change', function () {
        var m = function (x) { return window.matchMedia(x).matches; };
        html.dataset.theme = m('(prefers-contrast: more)') ? 'high-contrast' : m('(prefers-color-scheme: dark)') ? 'dark' : 'light'; syncTheme();
      });
    });
  }

  var langAnchors = function () { return $$('main h1, main h2, main h3, main p, main li, main img, main figure'); };
  var navBottom = function () { var n = $('.nav'); return n ? n.getBoundingClientRect().bottom : 0; };

  /* Language: the toggle is a plain link to this page in the other language. With JS the
     knob slides across, Settings fades away, and only then the page changes, so the
     cross-fade touches nothing but the page text. */
  $$('[data-lang-toggle]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      /* Note for the next page: skip the splash and keep the reading place. Both languages
         share the same markup, so "the n-th block at the top of the screen, this far down"
         finds the same spot even though text lengths and image loading differ. */
      var list = langAnchors(), top = navBottom(), i = 0;
      while (i < list.length && list[i].getBoundingClientRect().bottom <= top) i++;
      var note = { i: scrollY > 0 && list[i] ? i : -1, d: list[i] ? list[i].getBoundingClientRect().top : 0 };
      try { sessionStorage.setItem('plenitud-lang-switch', JSON.stringify(note)); } catch (err) {}
      if (reduced || !a.classList.contains('toggle')) return;
      e.preventDefault();
      a.classList.toggle('is-end');
      $$('.toggle__opt', a).forEach(function (o) { o.classList.toggle('is-current'); });
      setTimeout(function () {
        if (!settingsDlg || !settingsDlg.open) { window.location.href = a.href; return; }
        settingsDlg.classList.add('is-closing');
        setTimeout(function () { settingsDlg.close(); settingsDlg.classList.remove('is-closing'); window.location.href = a.href; }, 220);
      }, 260);
    });
  });

  /* Arrived from the language toggle: no splash, same place on the page */
  var arrived = null;
  try { arrived = JSON.parse(sessionStorage.getItem('plenitud-lang-switch')); sessionStorage.removeItem('plenitud-lang-switch'); } catch (e) {}
  if (arrived) {
    if (loader) loader.remove();
    var restoredTo = 0;
    var restore = function () {
      var el = arrived.i >= 0 && langAnchors()[arrived.i];
      if (!el) return;
      restoredTo = Math.round(el.getBoundingClientRect().top + scrollY - arrived.d);
      window.scrollTo({ top: restoredTo, behavior: 'instant' });
    };
    restore();
    /* Once images have their size the page may be taller; adjust, unless the visitor already scrolled */
    window.addEventListener('load', function () { if (Math.abs(scrollY - restoredTo) < 2) restore(); }, { once: true });
    setTimeout(function () { html.classList.remove('lang-switched'); }, 600);
  }

  /* Google map: its embed is the only thing on the site that sets (third-party) cookies.
     Off = the iframe loses its src and a short note with a "show" button takes its place. */
  var mapsSwitch = $('[data-maps-switch]'), map = $('[data-map]');
  var applyMaps = function () {
    var on = store('plenitud-maps') !== 'off';
    if (mapsSwitch) mapsSwitch.setAttribute('aria-checked', String(on));
    if (!map) return;
    var frame = $('iframe', map);
    if (!frame.dataset.src) frame.dataset.src = frame.getAttribute('src');
    if (on && !frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
    if (!on) frame.removeAttribute('src');
    frame.hidden = !on; $('.map__off', map).hidden = on;
    map.classList.toggle('map--off', !on);
  };
  if (mapsSwitch) mapsSwitch.addEventListener('click', function () { store('plenitud-maps', mapsSwitch.getAttribute('aria-checked') === 'true' ? 'off' : 'on'); applyMaps(); });
  var showMap = $('[data-map-show]');
  if (showMap) showMap.addEventListener('click', function () { store('plenitud-maps', 'on'); applyMaps(); });
  applyMaps();

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

  /* Controls that only work with script (filters, sorting) stay hidden without it */
  $$('[data-js-only]').forEach(function (el) { el.hidden = false; });

  /* ---------- Open now (home hero, Visit) ----------
     Hours come from the page; the clock is the business's own time zone, so someone
     looking from elsewhere still sees whether the doors are open in Zapopan. */
  var openLines = $$('[data-open-status]');
  if (openLines.length) {
    var now = -1, day = -1;
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      var part = function (t) { return parts.filter(function (x) { return x.type === t; })[0].value; };
      now = (Number(part('hour')) % 24) * 60 + Number(part('minute'));
      day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(part('weekday'));
    } catch (e) {}
    if (now >= 0 && day >= 0) openLines.forEach(function (p) {
      var o = Number(p.dataset.open), c = Number(p.dataset.close), days = p.dataset.days.split(' ').map(Number);
      var openToday = days.indexOf(day) !== -1, isOpen = openToday && now >= o * 60 && now < c * 60;
      var text;
      if (isOpen) text = T.openNow(T.hour(c));
      else if (openToday && now < o * 60) text = T.opensToday(T.hour(o));
      else {   /* the next day it opens: tomorrow, or a named day after a closed one */
        var ahead = 1;
        while (ahead < 7 && days.indexOf((day + ahead) % 7) === -1) ahead++;
        text = ahead === 1 ? T.opensTomorrow(T.hour(o)) : T.opensOn((day + ahead) % 7, T.hour(o));
      }
      $('[data-open-text]', p).textContent = text;
      p.classList.toggle('is-open', isOpen);
      p.hidden = false;
    });
  }

  /* ---------- Therapy filter by need: hides the cards that don't match ---------- */
  var needRadios = $$('input[name=need]');
  if (needRadios.length) {
    var therapyStatus = $('[data-therapy-status]');
    needRadios.forEach(function (r) {
      r.addEventListener('change', function () {
        var n = 0;
        $$('#therapy-grid > li').forEach(function (li) {
          var ok = !r.value || (' ' + li.dataset.needs + ' ').indexOf(' ' + r.value + ' ') !== -1;
          li.hidden = !ok;
          if (ok) n++;
        });
        therapyStatus.textContent = T.therapies(n, r.value ? r.parentNode.textContent.trim() : '');
      });
    });
  }

  /* ---------- Product catalog: search and sort (progressive enhancement) ---------- */
  var filter = $('#product-filter'), grid = $('#product-grid');
  if (filter && grid) {
    var items = $$('li', grid), empty = $('#product-empty'), sort = $('#product-sort'), productStatus = $('[data-product-status]');
    var applyFilter = function () {
      var q = filter.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (li) {
        var match = !q || li.dataset.name.indexOf(q) !== -1;
        li.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (productStatus) productStatus.textContent = shown ? T.products(shown) : (empty ? empty.textContent : '');
    };
    /* Sorting moves the cards themselves, so the reading and Tab order match what is on screen */
    var applySort = function () {
      var how = sort.value;
      var price = function (li) { return li.dataset.price === '' ? null : Number(li.dataset.price); };
      items.slice().sort(function (a, b) {
        var pa = price(a), pb = price(b);
        if (how !== 'featured' && pa !== pb) {
          if (pa === null) return 1;   /* "price to be confirmed" goes last either way */
          if (pb === null) return -1;
          return how === 'low' ? pa - pb : pb - pa;
        }
        return a.dataset.order - b.dataset.order;
      }).forEach(function (li) { grid.appendChild(li); });
    };
    filter.addEventListener('input', applyFilter);
    if (sort) sort.addEventListener('change', applySort);
  }

  /* ---------- Back to top: only on long pages, once the visitor is well down ---------- */
  var toTop = $('[data-to-top]');
  if (toTop) {
    var placeToTop = function () { toTop.hidden = !(html.scrollHeight > innerHeight * 3 && scrollY > innerHeight * 1.5); };
    window.addEventListener('scroll', placeToTop, { passive: true });
    window.addEventListener('resize', placeToTop);
    placeToTop();
  }

  /* ---------- Therapy pages: Book bar while the main Book button is above the screen ----------
     (CSS draws it on phones only.) Below the button, never above it, so it doesn't repeat
     the button while it is still in view. */
  var bar2 = $('[data-reserve-bar]'), mainCta = $('.detail__cta');
  if (bar2 && mainCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      bar2.hidden = e.isIntersecting || e.boundingClientRect.top > 0;
    }, { rootMargin: '-96px 0px 0px 0px' }).observe(mainCta);   /* under the floating nav bar counts as gone */
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

})();
