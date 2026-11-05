// Static site generator for Plenitud Center. No framework, no runtime dependency:
// this script reads data/terapias.json + data/productos.json and writes plain
// HTML files the same way a person would have typed them by hand. Re-run after
// editing either JSON file or any template function below.
//
// Two languages: Spanish (primary) at the site root, English under en/ with the
// same folder names, so switching language only adds or removes "en/". Interface
// text lives in UI below; catalog text in each JSON item's `en` object.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://ronferix.github.io/PlenitudCenterWebPage/';
const terapiasData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/terapias.json'), 'utf8'));
const productosData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/productos.json'), 'utf8'));
const { categories, terapias } = terapiasData;
const { productos } = productosData;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const prefixFor = (depth) => '../'.repeat(depth);

// GitHub Pages lets browsers keep CSS/JS for 10 minutes, so a fresh page could run last
// deploy's script. Each asset URL carries a hash of its contents: new contents, new URL.
const versioned = (file) => `${file}?v=${createHash('sha1').update(fs.readFileSync(path.join(ROOT, file))).digest('hex').slice(0, 8)}`;

function write(relPath, html) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

// ---------- language ----------

const UI = {
  es: {
    htmlLang: 'es', dir: '', toRoot: '', switchLabel: 'English', switchLang: 'en',
    skip: 'Saltar al contenido', homeLabel: 'Plenitud Center, inicio', menu: 'Menú', mainNav: 'Principal', reserve: 'Reservar',
    nav: { terapias: 'Terapias', productos: 'Productos', guias: 'Guías', visita: 'Visita' },
    tagline: 'Un lugar para volver a ti.', address: 'Av. Naciones Unidas 5461<br />Col. Vallarta Universidad<br />45110 Zapopan, Jalisco',
    openHours: 'Abierto de lunes a sábado, de 9:00 a 16:00', attention: 'Atención de lunes a sábado, de 9:00 a 16:00',
    fTherapies: 'Terapias', fSeeAll: 'Ver todas', fRead: 'Leer', fContact: 'Contacto',
    demo: { label: 'Aviso de sitio de demostración', title: 'Sitio de demostración.', text: 'Productos, servicios, precios, fotos y testimonios son de ejemplo y aún no reflejan la oferta real.', wa: 'Para información actual, escríbenos por WhatsApp.', ok: 'Entendido, cerrar aviso', footer: 'Sitio de demostración: el contenido es ilustrativo y no refleja todavía la oferta real del negocio.' },
    settings: { open: 'Ajustes', title: 'Ajustes', lang: 'Idioma', langTo: 'Cambiar a inglés', dark: 'Modo oscuro', contrast: 'Alto contraste',
      privacy: 'Privacidad y cookies', privacyLead: 'Este sitio no usa cookies propias. Tus ajustes y tu pedido se guardan solo en este navegador.',
      maps: 'Mapa de Google', mapsHint: 'Al mostrar el mapa en Visita, Google puede guardar sus propias cookies.', done: 'Listo' },
    dlg: { close: 'Cerrar', step1: 'Paso 1 de 2', step2: 'Paso 2 de 2', t1: '¿Qué terapia te llama?', lead1: 'Elige una para empezar. Puedes cambiar de opinión cuando quieras.', legend: 'Terapia', cancel: 'Cancelar', next: 'Continuar', t2: '¿A nombre de quién?', lead2: 'Con estos datos armamos tu mensaje de WhatsApp.', name: 'Nombre', req: '(obligatorio)', nameErr: 'Escribe tu nombre.', pref: 'Día y hora que prefieres', optional: '(opcional)', prefHint: 'Ejemplo: jueves por la mañana', back: 'Atrás', prepare: 'Preparar mensaje', t3: 'Tu mensaje está listo.', lead3: 'Al tocar el botón se abre WhatsApp con este texto; solo envíalo y te confirmamos el horario.', send: 'Enviar por WhatsApp' },
    cart: { open: 'Pedido', title: 'Tu pedido', lead: 'Al enviarlo se abre WhatsApp con tu lista; ahí confirmamos disponibilidad y entrega.', empty: 'Tu pedido está vacío. Agrega productos desde la página de cada uno.', clear: 'Vaciar pedido', send: 'Enviar pedido por WhatsApp', add: 'Agregar al pedido' },
    pricePending: 'Precio por confirmar', or: 'o', alsoAt: 'también por', options: 'opciones', option: 'opción',
    waOrder: (prod, variant, price) => `Hola, quiero pedir: ${prod}${variant ? ` (${variant})` : ''}${price ? ` · ${price}` : ''}. ¿Está disponible?`,
    waHello: 'Hola, quisiera información sobre Plenitud Center.',
    waLangNote: '',
    seeMore: 'Ver más', seeMoreAbout: 'sobre', see: 'Ver',
    home: {
      title: 'Plenitud Center · Un lugar para volver a ti', description: 'Plenitud Center: terapias corporales, energéticas y espirituales, y productos para la práctica en casa.',
      heroTitle: 'Un lugar para volver <em>a ti.</em>', heroLead: 'Un espacio de terapias corporales, energéticas y espirituales, y de productos para sostener esa práctica en casa. Llega como estás.',
      heroReserve: 'Reservar una terapia', heroSee: 'Ver terapias', more: 'Descubre más',
      offerEyebrow: 'Lo que ofrecemos', offerTitle: 'Cinco caminos, tres familias.', seeAllTherapies: 'Ver todas las terapias',
      takeEyebrow: 'Para llevar', takeTitle: 'Lo que sostiene la práctica en casa.', takeLead: 'Incienso, velas, resinas y herramientas rituales para seguir el ritmo entre sesión y sesión.', seeProducts: 'Ver productos',
      voiceEyebrow: 'Una voz de la casa',
      howEyebrow: 'Cómo funciona', howTitle: 'Tres pasos, sin prisa.',
      how: [['Elige tu terapia', 'Revisa qué trabaja cada una. Si dudas entre dos, pregúntanos por WhatsApp.'],
        ['Reserva por WhatsApp', 'Te armamos el mensaje con tu terapia y tu horario preferido; solo lo envías.'],
        ['Llega como estás', 'Confirmamos el horario contigo. El día de la sesión, ropa cómoda y unos minutos de margen.']],
      guidesLead: 'Conoce a quienes guían cada terapia.', guidesLink: 'Ver el equipo →',
    },
    quote: '"Llegué cargando una semana. Salí sin ella. La sala misma se sentía paciente."', quoteBy: 'Marisol G. · Miembro desde 2024',
    therapies: {
      title: 'Terapias · Plenitud Center', description: 'Terapias corporales, energéticas y espirituales en Plenitud Center.',
      h1: 'Corporal, energética, espiritual.', lead: 'Cinco formas de volver al cuerpo y al espacio personal, agrupadas por lo que trabajan primero.',
      note: 'Trae ropa cómoda. Qué traer exactamente depende de cada terapia — lo encuentras en su propia página.',
      price: 'Precio', duration: 'Duración', schedule: 'Horario', reserveThis: 'Reservar', expect: 'Qué esperar', back: '← Ver todas las terapias',
      guide: 'Te acompaña', helps: 'Ayuda con', filter: '¿Qué buscas hoy?', all: 'Todas', none: 'Ninguna terapia coincide con esa elección.',
    },
    products: {
      title: 'Productos · Plenitud Center', description: 'Incienso, velas, resinas y herramientas rituales de Plenitud Center.',
      eyebrow: 'Productos', h1: 'Para la práctica en casa.', lead: 'Arma tu pedido y envíalo por WhatsApp — todavía no hay pago en línea.',
      search: 'Buscar producto', searchPh: 'Ej. vela, incienso, copal', empty: 'No hay productos que coincidan con esa búsqueda.',
      eyebrowOne: 'Producto', choose: 'Elige', orderWa: 'Pedir por WhatsApp', back: '← Ver todos los productos',
      sort: 'Ordenar', sortFeatured: 'Destacados', sortLow: 'Precio: menor a mayor', sortHigh: 'Precio: mayor a menor',
      related: 'También te puede gustar', seeAll: 'Ver todos los productos',
    },
    guides: {
      title: 'Guías · Plenitud Center', description: 'El equipo que sostiene las terapias de Plenitud Center.', eyebrow: 'Guías',
      h1: 'Personas que sostienen el espacio, con amabilidad.', lead: 'Nuestro equipo es pequeño por decisión. Cada terapia la guía alguien que ha dedicado mucho tiempo a aprender a escuchar: primero a sí mismo, luego a los demás.',
      leads: 'Guía',
    },
    visit: {
      title: 'Visita · Plenitud Center', description: 'Dirección, horario y contacto de Plenitud Center.', eyebrow: 'Visita', h1: 'Cómo llegar',
      address: 'Av. Naciones Unidas 5461, Col. Vallarta Universidad, 45110 Zapopan, Jalisco.', contact: 'Contacto', contactLead: 'Por WhatsApp o llamada:',
      mapFrame: 'Mapa de Google con la ubicación de Plenitud Center', mapOpen: 'Abrir en Google Maps →',
      mapOff: 'El mapa de Google está apagado en Ajustes.', mapShow: 'Mostrar el mapa',
      call: 'Llamar', callTo: 'al', reserve: 'Reservar una terapia', spaceAlt: 'Sala amplia y luminosa con grandes ventanales y piso de madera',
      directions: 'Trazar ruta', directionsHint: 'abre Google Maps',
      firstEyebrow: 'Antes de venir', firstTitle: 'Tu primera visita.',
      first: [['Confirma tu cita', 'Corrobora la ubicación y el horario de tu cita antes de salir.'],
        ['Llega con tiempo', 'Unos minutos de margen para instalarte sin prisa.'],
        ['Pregunta lo que necesites', 'En recepción te damos indicaciones, o haz tus preguntas directamente a la persona que te atiende.']],
    },
    toTop: 'Volver arriba', waFab: 'escríbenos',
    notFound: { title: 'Página no encontrada · Plenitud Center', h1: 'Esta página no está aquí.', lead: 'Puede que el enlace haya cambiado o que la página ya no exista. Desde aquí puedes volver a lo que buscabas.', home: 'Ir al inicio', en: 'This page is not here.', enLink: 'Go to the English site' },
    built: 'Generado',
  },
  en: {
    htmlLang: 'en', dir: 'en/', toRoot: '../', switchLabel: 'Español', switchLang: 'es',
    skip: 'Skip to content', homeLabel: 'Plenitud Center, home', menu: 'Menu', mainNav: 'Main', reserve: 'Book',
    nav: { terapias: 'Therapies', productos: 'Products', guias: 'Guides', visita: 'Visit' },
    tagline: 'A place to come back to yourself.', address: 'Av. Naciones Unidas 5461<br />Col. Vallarta Universidad<br />45110 Zapopan, Jalisco, Mexico',
    openHours: 'Open Monday to Saturday, 9 a.m. to 4 p.m.', attention: 'We answer Monday to Saturday, 9 a.m. to 4 p.m.',
    fTherapies: 'Therapies', fSeeAll: 'See all', fRead: 'Read', fContact: 'Contact',
    demo: { label: 'Demo site notice', title: 'This is a demo site.', text: 'Products, services, prices, photos and testimonials are examples and do not yet reflect the real offer.', wa: 'For current information, message us on WhatsApp.', ok: 'Got it, close notice', footer: 'Demo site: content is illustrative and does not yet reflect what the business actually offers.' },
    settings: { open: 'Settings', title: 'Settings', lang: 'Language', langTo: 'Switch to Spanish', dark: 'Dark mode', contrast: 'High contrast',
      privacy: 'Privacy and cookies', privacyLead: 'This site sets no cookies of its own. Your settings and your order are stored only in this browser.',
      maps: 'Google map', mapsHint: 'When the map is shown on Visit, Google may store its own cookies.', done: 'Done' },
    dlg: { close: 'Close', step1: 'Step 1 of 2', step2: 'Step 2 of 2', t1: 'Which therapy calls you?', lead1: 'Pick one to start. You can change your mind at any time.', legend: 'Therapy', cancel: 'Cancel', next: 'Continue', t2: 'Who is the booking for?', lead2: 'We use this to write your WhatsApp message.', name: 'Name', req: '(required)', nameErr: 'Enter your name.', pref: 'Preferred day and time', optional: '(optional)', prefHint: 'Example: Thursday morning', back: 'Back', prepare: 'Prepare message', t3: 'Your message is ready.', lead3: 'The button opens WhatsApp with this text; just send it and we will confirm the time.', send: 'Send on WhatsApp' },
    cart: { open: 'Order', title: 'Your order', lead: 'Sending it opens WhatsApp with your list; we confirm availability and delivery there.', empty: 'Your order is empty. Add products from each product page.', clear: 'Empty order', send: 'Send order on WhatsApp', add: 'Add to order' },
    pricePending: 'Price to be confirmed', or: 'or', alsoAt: 'also on', options: 'options', option: 'option',
    waOrder: (prod, variant, price) => `Hi, I would like to order: ${prod}${variant ? ` (${variant})` : ''}${price ? ` · ${price}` : ''}. Is it available?`,
    waHello: 'Hi, I would like some information about Plenitud Center.',
    // WhatsApp messages always go out in Spanish (see whatsappLink); English pages say so next to each send button
    waLangNote: 'The message is sent in Spanish, the language our team works in.',
    seeMore: 'See more', seeMoreAbout: 'about', see: 'See',
    home: {
      title: 'Plenitud Center · A place to come back to yourself', description: 'Plenitud Center: body, energy and spiritual therapies, and products for your practice at home.',
      heroTitle: 'A place to come back <em>to yourself.</em>', heroLead: 'A space for body, energy and spiritual therapies, and for products that support that practice at home. Come as you are.',
      heroReserve: 'Book a therapy', heroSee: 'See therapies', more: 'Discover more',
      offerEyebrow: 'What we offer', offerTitle: 'Five paths, three families.', seeAllTherapies: 'See all therapies',
      takeEyebrow: 'To take home', takeTitle: 'What supports the practice at home.', takeLead: 'Incense, candles, resins and ritual tools to keep the rhythm between sessions.', seeProducts: 'See products',
      voiceEyebrow: 'A voice from the house',
      howEyebrow: 'How it works', howTitle: 'Three steps, no rush.',
      how: [['Choose your therapy', 'See what each one works on. If you are torn between two, ask us on WhatsApp.'],
        ['Book on WhatsApp', 'We write the message with your therapy and preferred time; you just send it.'],
        ['Come as you are', 'We confirm the time with you. On the day, wear comfortable clothes and allow a few minutes.']],
      guidesLead: 'Meet the people who guide each therapy.', guidesLink: 'Meet the team →',
    },
    quote: '"I arrived carrying a whole week. I left without it. The room itself felt patient."', quoteBy: 'Marisol G. · Member since 2024',
    therapies: {
      title: 'Therapies · Plenitud Center', description: 'Body, energy and spiritual therapies at Plenitud Center.',
      h1: 'Body, energy, spirit.', lead: 'Five ways to come back to your body and your personal space, grouped by what they work on first.',
      note: 'Wear comfortable clothes. What exactly to bring depends on each therapy — you will find it on its own page.',
      price: 'Price', duration: 'Duration', schedule: 'Hours', reserveThis: 'Book', expect: 'What to expect', back: '← See all therapies',
      guide: 'Your guide', helps: 'Helps with', filter: 'What are you looking for today?', all: 'All', none: 'No therapy matches that choice.',
    },
    products: {
      title: 'Products · Plenitud Center', description: 'Incense, candles, resins and ritual tools from Plenitud Center.',
      eyebrow: 'Products', h1: 'For your practice at home.', lead: 'Build your order and send it on WhatsApp — there is no online payment yet.',
      search: 'Search products', searchPh: 'e.g. candle, incense, copal', empty: 'No products match that search.',
      eyebrowOne: 'Product', choose: 'Choose a', orderWa: 'Order on WhatsApp', back: '← See all products',
      sort: 'Sort by', sortFeatured: 'Featured', sortLow: 'Price: low to high', sortHigh: 'Price: high to low',
      related: 'You may also like', seeAll: 'See all products',
    },
    guides: {
      title: 'Guides · Plenitud Center', description: 'The team behind the therapies at Plenitud Center.', eyebrow: 'Guides',
      h1: 'People who hold the space, with kindness.', lead: 'Our team is small by choice. Each therapy is guided by someone who has spent a long time learning to listen: first to themselves, then to others.',
      leads: 'Guides',
    },
    visit: {
      title: 'Visit · Plenitud Center', description: 'Address, hours and contact for Plenitud Center.', eyebrow: 'Visit', h1: 'How to get here',
      address: 'Av. Naciones Unidas 5461, Col. Vallarta Universidad, 45110 Zapopan, Jalisco, Mexico.', contact: 'Contact', contactLead: 'By WhatsApp or phone:',
      mapFrame: 'Google map showing where Plenitud Center is', mapOpen: 'Open in Google Maps →',
      mapOff: 'The Google map is turned off in Settings.', mapShow: 'Show the map',
      call: 'Call', callTo: '', reserve: 'Book a therapy', spaceAlt: 'Large, bright room with tall windows and a wooden floor',
      directions: 'Get directions', directionsHint: 'opens Google Maps',
      firstEyebrow: 'Before you come', firstTitle: 'Your first visit.',
      first: [['Confirm your appointment', 'Check the location and time of your appointment before you leave.'],
        ['Arrive with time to spare', 'A few minutes of margin so you can settle in without rushing.'],
        ['Ask whatever you need', 'Reception can give you directions, or ask the person attending you directly.']],
    },
    toTop: 'Back to top', waFab: 'message us (in Spanish)',
    built: 'Built',
  },
};

// The language being generated. build() sets both before each pass.
let LANG = 'es';
let L = UI.es;

// Catalog text in the current language: the item's `en` object overrides the Spanish field.
const tr = (item, field) => (LANG !== 'es' && item.en && item.en[field] != null ? item.en[field] : item[field]);
const imageOf = (item) => item.image && { file: item.image.file, alt: tr(item, 'imageAlt') ?? item.image.alt };
const catName = (key) => tr(categories[key], 'name');
// Links inside the current language use `prefix`; shared files (CSS, JS, media) sit at the real root.
const asset = (prefix) => prefix + L.toRoot;

// ---------- shared partials ----------

function headExtra(prefix, pagePath) {
  const a = asset(prefix);
  return `<script>
  (function () {
    var d = document.documentElement, s = null;
    d.classList.add('js');
    try { s = localStorage.getItem('plenitud-theme'); } catch (e) {}
    var m = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
    d.dataset.theme = (s === 'light' || s === 'dark' || s === 'high-contrast') ? s
      : (s === 'auto') ? (m('(prefers-contrast: more)') ? 'high-contrast' : m('(prefers-color-scheme: dark)') ? 'dark' : 'light')
      : 'light';
    // Arriving from the language toggle (site.js leaves a note): no splash, and the page
    // cross-fades in; any other arrival skips the cross-fade and gets the splash as usual.
    try { if (localStorage.getItem('plenitud-demo-ok')) d.classList.add('demo-ok'); } catch (e) {}
    var sw = null; try { sw = sessionStorage.getItem('plenitud-lang-switch'); } catch (e) {}
    if (sw) {
      d.classList.add('lang-switched');
      // Hold the first paint until site.js has run (it restores the scroll position),
      // so the cross-fade lands on the finished page instead of on one that is still changing.
      var hold = document.createElement('link');
      hold.rel = 'expect'; hold.href = '#page-ready'; hold.setAttribute('blocking', 'render');
      document.head.appendChild(hold);
    }
    window.addEventListener('pagereveal', function (e) {
      var vt = e.viewTransition;
      if (sw || !vt) return;
      vt.ready.catch(function () {});   // skipping rejects .ready; it is expected, not an error
      vt.skipTransition();
    });
  })();
</script>
<!-- The site has its own English version, so the browser should not offer to machine-translate it -->
<meta name="google" content="notranslate" />
<link rel="alternate" hreflang="es" href="${SITE_URL}${pagePath}" />
<link rel="alternate" hreflang="en" href="${SITE_URL}en/${pagePath}" />
<link rel="alternate" hreflang="x-default" href="${SITE_URL}${pagePath}" />
<link rel="preload" href="${a}design-system/fonts/Jost-Variable.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="${a}${versioned('design-system/colors_and_type.css')}" />
<link rel="stylesheet" href="${a}${versioned('design-system/components.css')}" />
<link rel="stylesheet" href="${a}${versioned('site.css')}" />`;
}

// Voces waits out of the menu until there are real testimonials (one sample quote stays on the home page)
const NAV_KEYS = ['terapias', 'productos', 'guias', 'visita'];

function nav(prefix, active, pagePath) {
  const home = prefix || './';
  const items = NAV_KEYS.map((key) => {
    const current = key === active ? ' aria-current="page"' : '';
    return `<li><a class="nav__link" href="${prefix}${key}/"${current}>${L.nav[key]}</a></li>`;
  }).join('\n        ');
  // Desktop: brand · links · Book · Settings. Mobile: brand · Settings · Menu, and Menu opens
  // #menu-principal as a panel under the bar (links, Book, hours). Language and theme live in
  // the Settings dialog; each layout has its own Settings button, the other one is display:none.
  return `<header class="nav">
  <div class="nav__bar">
    <a class="nav__brand" href="${home}" aria-label="${L.homeLabel}">
      <img src="${asset(prefix)}design-system/assets/logo-emblem-192.png" alt="" width="32" height="32" />
      <span>Plenitud</span>
    </a>
    ${settingsButton('nav__settings nav__settings--bar')}
    <button class="btn btn--ghost nav__toggle" type="button" aria-expanded="false" aria-controls="menu-principal">
      <span class="icon icon--menu" aria-hidden="true"></span><span>${L.menu}</span>
    </button>
    <nav aria-label="${L.mainNav}" class="nav__nav">
      <div class="nav__panel" id="menu-principal">
        <ul class="nav__list">
        ${items}
        </ul>
        <div class="nav__actions">
          <button class="btn btn--primary" type="button" data-reserve>${L.reserve}</button>
          ${settingsButton('nav__settings nav__settings--panel')}
        </div>
        <p class="caption nav__hours">${L.attention}</p>
      </div>
    </nav>
  </div>
  <!-- Order cart: floating, early in tab order; site.js shows it once something has been added -->
  <button class="btn btn--secondary cart-fab" type="button" data-cart-open hidden>${L.cart.open} <span class="cart-fab__count" data-cart-count aria-hidden="true">0</span></button>
  <!-- WhatsApp shares that corner: CSS hides it while the order button shows, so one button sits there at a time -->
  <a class="btn btn--secondary wa-fab" href="${waGeneral(CONTACTS[0])}"><span class="icon icon--chat" aria-hidden="true"></span>WhatsApp<span class="sr-only">, ${L.waFab}</span></a>
</header>`;
}

const settingsButton = (cls) => `<button class="btn btn--ghost icon-btn ${cls}" type="button" data-settings-open aria-haspopup="dialog" title="${L.settings.open}"><span class="icon icon--settings" aria-hidden="true"></span><span class="sr-only">${L.settings.open}</span></button>`;

// Same page in the other language: from es add "en/", from en drop it.
const switchHrefFor = (prefix, pagePath) => `${asset(prefix)}${UI[L.switchLang].dir}${pagePath}` || './';

/* Settings: language, light/dark, high contrast and the Google map (the only third-party
   cookies on the site). The language toggle is one link: a tap anywhere on it slides the
   knob and opens this page in the other language. The theme rows are role="switch". */
function settingsDialog(prefix, pagePath) {
  const S = L.settings;
  const langOpt = (lg) => `<span class="toggle__opt${lg === LANG ? ' is-current' : ''}" aria-hidden="true">${lg.toUpperCase()}</span>`;
  const sw = (id, label, attrs, icons = ['', '']) => `<li class="setting">
        <span class="setting__label" id="${id}">${label}</span>
        <button class="toggle" type="button" role="switch" aria-checked="false" aria-labelledby="${id}" ${attrs}><span class="toggle__knob" aria-hidden="true"></span><span class="toggle__opt" aria-hidden="true">${icons[0]}</span><span class="toggle__opt" aria-hidden="true">${icons[1]}</span></button>
      </li>`;
  const icon = (n) => `<span class="icon icon--${n}"></span>`;
  return `<dialog class="dialog settings" id="settings" aria-labelledby="settings-title">
  <div class="dialog__panel">
    <button class="btn btn--ghost dialog__close" type="button" data-close aria-label="${L.dlg.close}"><span class="icon icon--close" aria-hidden="true"></span></button>
    <h2 class="dialog__title" id="settings-title" tabindex="-1">${S.title}</h2>
    <ul class="settings__list" role="list">
      <li class="setting">
        <span class="setting__label" id="set-lang">${S.lang}</span>
        <a class="toggle toggle--lang${LANG === 'en' ? ' is-end' : ''}" href="${switchHrefFor(prefix, pagePath)}" hreflang="${L.switchLang}" data-lang-toggle aria-describedby="set-lang"><span class="toggle__knob" aria-hidden="true"></span>${langOpt('es')}${langOpt('en')}<span class="sr-only">${S.langTo}</span></a>
      </li>
      ${sw('set-dark', S.dark, 'data-theme-switch="dark"', [icon('sun'), icon('moon')])}
      ${sw('set-contrast', S.contrast, 'data-theme-switch="high-contrast"', ['', icon('check')])}
    </ul>
    <h3 class="h4 settings__heading">${S.privacy}</h3>
    <p class="small settings__lead">${S.privacyLead}</p>
    <ul class="settings__list" role="list">
      <li class="setting">
        <span class="setting__text"><span class="setting__label" id="set-maps">${S.maps}</span><span class="caption setting__hint" id="set-maps-hint">${S.mapsHint}</span></span>
        <button class="toggle" type="button" role="switch" aria-checked="true" aria-labelledby="set-maps" aria-describedby="set-maps-hint" data-maps-switch><span class="toggle__knob" aria-hidden="true"></span><span class="toggle__opt" aria-hidden="true"></span><span class="toggle__opt" aria-hidden="true">${icon('check')}</span></button>
      </li>
    </ul>
    <div class="dialog__actions">
      <button class="btn btn--primary" type="button" data-close>${S.done}</button>
    </div>
  </div>
</dialog>`;
}

/* Demo notice: a strip above the navigation until the visitor dismisses it (remembered in this
   browser; the pre-paint script hides it on later pages). Without JS it stays, without the button.
   The footer repeats it in one quiet line on every page. */
function demoNotice() {
  const D = L.demo;
  return `<aside class="demo-note" aria-label="${D.label}">
  <p class="small demo-note__text"><strong>${D.title}</strong> ${D.text} <a href="${waGeneral(CONTACTS[0])}">${D.wa}</a></p>
  <button class="btn btn--ghost icon-btn demo-note__ok" type="button" data-demo-ok title="${D.ok}"><span class="icon icon--close" aria-hidden="true"></span><span class="sr-only">${D.ok}</span></button>
</aside>`;
}

function footerPartial(prefix) {
  return `<footer class="footer" id="visita">
  <div class="container footer__inner">
    <div class="footer__grid">
      <div>
        <p class="footer__word">Plenitud</p>
        <p class="footer__tag">${L.tagline}</p>
        <address class="footer__muted">${L.address}<br />${L.openHours}</address>
      </div>
      <nav aria-labelledby="f-terapias">
        <h2 class="footer__heading" id="f-terapias">${L.fTherapies}</h2>
        <ul class="footer__links" role="list"><li><a href="${prefix}terapias/">${L.fSeeAll}</a></li><li><a href="${prefix}productos/">${L.nav.productos}</a></li></ul>
      </nav>
      <nav aria-labelledby="f-leer">
        <h2 class="footer__heading" id="f-leer">${L.fRead}</h2>
        <ul class="footer__links" role="list"><li><a href="${prefix}guias/">${L.nav.guias}</a></li><li><a href="${prefix}visita/">${L.nav.visita}</a></li></ul>
      </nav>
      <div>
        <h2 class="footer__heading" id="f-contacto">${L.fContact}</h2>
        <ul class="footer__links" role="list">
${CONTACTS.map((c) => `          <li><a href="${waGeneral(c)}">WhatsApp ${c.display}</a></li>`).join('\n')}
        </ul>
        <p class="footer__muted footer__hours">${L.attention}</p>
      </div>
    </div>
    <div class="footer__bottom">
      <p class="footer__muted">© Plenitud Center · 2026 · ${L.demo.footer}</p>
      <button class="btn btn--ghost footer__settings" type="button" data-settings-open aria-haspopup="dialog"><span class="icon icon--settings" aria-hidden="true"></span>${L.settings.open}</button>
    </div>
  </div>
</footer>`;
}

function reserveDialog() {
  const D = L.dlg;
  // data-* on each radio feed the (Spanish) WhatsApp message site.js writes in step 3
  const choices = terapias.map((t, i) => `        <label class="choice"><input type="radio" name="session" value="${t.slug}" data-name="${esc(t.name)}" data-detail="${esc([t.price != null ? money(t.price) : '', t.duration].filter(Boolean).join(' · '))}"${i === 0 ? ' checked' : ''} /><span class="choice__box"><span class="choice__title">${esc(tr(t, 'name'))}</span><span class="choice__meta">${esc(catName(t.category))}</span><span class="choice__check" aria-hidden="true"></span></span></label>`).join('\n');
  return `<dialog class="dialog" id="reserve" aria-labelledby="reserve-t1">
  <form class="dialog__panel" id="reserve-form" novalidate>
    <button class="btn btn--ghost dialog__close" type="button" data-close aria-label="${D.close}"><span class="icon icon--close" aria-hidden="true"></span></button>

    <div data-step="1">
      <p class="dialog__step">${D.step1}</p>
      <h2 class="dialog__title" id="reserve-t1" tabindex="-1">${D.t1}</h2>
      <p class="dialog__lead">${D.lead1}</p>
      <fieldset class="choice-group">
        <legend class="sr-only">${D.legend}</legend>
${choices}
      </fieldset>
      <div class="dialog__actions">
        <button class="btn btn--ghost" type="button" data-close>${D.cancel}</button>
        <button class="btn btn--primary" type="button" data-next>${D.next}</button>
      </div>
    </div>

    <div data-step="2" hidden>
      <p class="dialog__step">${D.step2}</p>
      <h2 class="dialog__title" id="reserve-t2" tabindex="-1">${D.t2}</h2>
      <p class="dialog__lead">${D.lead2}</p>
      <p class="alert alert--danger" id="form-status" role="alert" hidden></p>
      <div class="stack" style="--stack: var(--space-5)">
        <div class="field" data-field="name">
          <label class="field__label" for="f-name">${D.name} <span class="field__req">${D.req}</span></label>
          <input class="input" id="f-name" name="name" type="text" autocomplete="name" required aria-describedby="f-name-err" />
          <p class="field__error" id="f-name-err">${D.nameErr}</p>
        </div>
        <div class="field" data-field="pref">
          <label class="field__label" for="f-pref">${D.pref} <span class="field__req">${D.optional}</span></label>
          <p class="field__hint" id="f-pref-hint">${D.prefHint}</p>
          <input class="input" id="f-pref" name="pref" type="text" autocomplete="off" aria-describedby="f-pref-hint" />
        </div>
      </div>
      <div class="dialog__actions">
        <button class="btn btn--ghost" type="button" data-back>${D.back}</button>
        <button class="btn btn--primary" type="submit">${D.prepare}</button>
      </div>
    </div>

    <div data-step="3" hidden>
      <h2 class="dialog__title" id="reserve-t3" tabindex="-1">${D.t3}</h2>
      <p class="dialog__lead">${D.lead3}</p>
      ${waLangNote()}
      <p class="message-preview" id="reserve-summary"></p>
      <div class="dialog__actions">
        <button class="btn btn--ghost" type="button" data-close>${D.close}</button>
        <a class="btn btn--primary" data-booking-send href="https://wa.me/${CONTACTS[0].intl}">${D.send}</a>
      </div>
      ${altLineNote('data-booking-send')}
    </div>
  </form>
</dialog>`;
}

// The order list. Empty in the HTML: site.js renders the items from localStorage.
function cartDialog() {
  const C = L.cart;
  return `<dialog class="dialog" id="cart" aria-labelledby="cart-title">
  <div class="dialog__panel">
    <button class="btn btn--ghost dialog__close" type="button" data-close aria-label="${L.dlg.close}"><span class="icon icon--close" aria-hidden="true"></span></button>
    <h2 class="dialog__title" id="cart-title" tabindex="-1">${C.title}</h2>
    <p class="dialog__lead">${C.lead}</p>
    ${waLangNote()}
    <p class="small" data-cart-empty>${C.empty}</p>
    <ul class="cart-list" role="list" data-cart-list></ul>
    <p class="cart-total" data-cart-total></p>
    <p class="sr-only" role="status" data-cart-status></p>
    <div class="dialog__actions" data-cart-actions>
      <button class="btn btn--ghost" type="button" data-cart-clear>${C.clear}</button>
      <a class="btn btn--primary" data-cart-send href="https://wa.me/${CONTACTS[0].intl}">${C.send}</a>
    </div>
    ${altLineNote('data-cart-send')}
  </div>
</dialog>`;
}

// "Hours · also on the second line": the second reception line gets the same message
// as the main button (site.js fills every link carrying `attr`).
function altLineNote(attr) {
  const c = CONTACTS[1];
  return `<p class="caption contact-note dialog__note">${L.attention} · ${L.alsoAt} <a ${attr} href="https://wa.me/${c.intl}">WhatsApp ${c.display}</a></p>`;
}

/* DEMO: prices, durations, guide names and photos (Unsplash) are invented so the
   demo reads like the finished site. The JSON keeps `draft: true` on every item;
   replace the values with the real ones before launch. No image → neutral placeholder. */
const money = (n) => `$${n.toLocaleString('es-MX')} MXN`;

function priceBlock(price, note) {
  if (price == null) return `<p class="price price--pending">${L.pricePending}</p>`;
  return `<p class="price">${money(price)}${note ? ` <span class="price__note">${esc(note)}</span>` : ''}</p>`;
}

/* Photos: media/<name>.jpg is the 1200px original; tools/optimize-images.py writes WebP copies at
   480/800/1200px into media/w/. srcset + sizes let each screen download only the size it shows
   (a phone card gets ~20 KB instead of up to 550 KB); the JPG stays as src for old browsers. */
const IMG_WIDTHS = [480, 800, 1200];
function photoAttrs(image, prefix, sizes) {
  const stem = path.basename(image.file, path.extname(image.file));
  const set = IMG_WIDTHS.filter((w) => fs.existsSync(path.join(ROOT, `media/w/${stem}-${w}.webp`)))
    .map((w) => `${asset(prefix)}media/w/${stem}-${w}.webp ${w}w`).join(', ');
  return `src="${asset(prefix)}${image.file}"${set ? ` srcset="${set}" sizes="${sizes}"` : ''} alt="${esc(image.alt)}" decoding="async"`;
}

function cardMedia(image, prefix, ratio = 'square') {
  if (!image) return `<div class="card__media card__media--${ratio} card__media--empty" aria-hidden="true"></div>`;
  return `<img class="card__media card__media--${ratio}" ${photoAttrs(image, prefix, '(min-width: 64rem) 24rem, (min-width: 40rem) 46vw, 92vw')} loading="lazy" />`;
}

// The page's main photo is usually the largest thing on screen: fetch it first
// (`lead = false` for a photo further down the page, which loads lazily instead)
function detailMedia(image, prefix, lead = true) {
  if (!image) return `<div class="detail__media detail__media--empty" aria-hidden="true"></div>`;
  return `<figure class="detail__media"><img ${photoAttrs(image, prefix, '(min-width: 60rem) 34rem, 92vw')} ${lead ? 'fetchpriority="high"' : 'loading="lazy"'} /></figure>`;
}

// Business address as given by the owner; the map and the "open in Google Maps" link search for it.
const MAP_QUERY = 'Av. Naciones Unidas 5461, Vallarta Universidad, 45110 Zapopan, Jalisco, México';

// Reception lines (WhatsApp and calls). `intl` is the wa.me / tel: form: 52 + 10 digits.
const CONTACTS = [
  { display: '33 3599 2034', intl: '523335992034' },
  { display: '33 2490 9550', intl: '523324909550' },
];
// Reception works in Spanish, so every WhatsApp message is written in Spanish whatever
// the page language. Same message shape as site.js builds when the visitor picks another variant.
function whatsappLink(product, variant, price, number = CONTACTS[0].intl) {
  return `https://wa.me/${number}?text=${encodeURIComponent(UI.es.waOrder(product, variant, price))}`;
}
const waGeneral = (c) => `https://wa.me/${c.intl}?text=${encodeURIComponent(UI.es.waHello)}`;
const waLangNote = () => (L.waLangNote ? `<p class="small wa-lang-note">${L.waLangNote}</p>` : '');

/* Quiet line under a call to action: hours + both reception lines on WhatsApp.
   `attrs(c)` returns each link's attributes (product pages add the data site.js needs). */
function contactNote(attrs = (c) => `href="${waGeneral(c)}"`) {
  const links = CONTACTS.map((c) => `<a ${attrs(c)}>${c.display}</a>`).join(` ${L.or} `);
  return `<p class="caption contact-note">${L.attention} · WhatsApp ${links}</p>`;
}

const swatch = (color) => `<span class="swatch" style="--swatch: ${esc(color)}" aria-hidden="true"></span>`;

// Variants keep their Spanish names as keys (swatches); `en.variants` lists the
// English names in the same order.
const variantList = (p) => p.variants && p.variants.map((key, i) => ({ key, name: tr(p, 'variants')[i] }));

/* Cards summarise variants in one line (a few swatches + a count, or up to three
   names); the full list lives on the product page. */
const MAX_CARD_SWATCHES = 5;
function variantSummary(p) {
  const vs = variantList(p);
  if (!vs) return '';
  const label = tr(p, 'variantLabel') || L.options;
  if (p.swatches) {
    const shown = vs.slice(0, MAX_CARD_SWATCHES).map((v) => swatch(p.swatches[v.key])).join('');
    const more = vs.length - MAX_CARD_SWATCHES;
    return `<p class="variants"><span class="swatches">${shown}${more > 0 ? `<span class="swatches__more" aria-hidden="true">+${more}</span>` : ''}</span><span>${vs.length} ${esc(label)}</span></p>`;
  }
  if (vs.length <= 3) return `<p class="variants"><span>${vs.map((v) => esc(v.name)).join(' · ')}</span></p>`;
  return `<p class="variants"><span>${vs.length} ${esc(label)}</span></p>`;
}

/* DEMO, generic until the owner fills them in: what each therapy helps with (therapy filter)
   and which guide leads it. */
const NEEDS = {
  es: { estres: 'Estrés', descanso: 'Descanso', dolor: 'Dolor muscular', energia: 'Energía', claridad: 'Claridad' },
  en: { estres: 'Stress', descanso: 'Rest', dolor: 'Muscle pain', energia: 'Energy', claridad: 'Clarity' },
};
const THERAPY_NEEDS = {
  'masaje-corporal': ['dolor', 'estres', 'descanso'], reiki: ['estres', 'descanso', 'energia'], limpia: ['claridad', 'energia'],
  'flores-de-bach': ['estres', 'claridad', 'descanso'], biomagnetismo: ['dolor', 'energia'],
};
const needsOf = (t) => THERAPY_NEEDS[t.slug] || [];
const guideOf = (t) => GUIAS.find((g) => g.therapies.includes(t.slug));

// Opening hours as given by the owner: Monday to Saturday, 9:00 to 16:00; closed on Sunday.
// Days count from Sunday = 0. The open-now line (site.js) and the search-engine data both read them.
const HOURS = { open: 9, close: 16, days: [1, 2, 3, 4, 5, 6] };
const openStatus = () => `<p class="open-status" data-open-status data-open="${HOURS.open}" data-close="${HOURS.close}" data-days="${HOURS.days.join(' ')}" hidden><span class="open-status__dot" aria-hidden="true"></span><span data-open-text></span></p>`;

const GUIAS = [
  { name: 'Ana Lucía Ríos', focus: 'Masaje corporal', schedule: 'Martes a viernes', therapies: ['masaje-corporal'], en: { focus: 'Body massage', schedule: 'Tuesday to Friday', imageAlt: 'Portrait of Ana Lucía Ríos smiling in natural light' }, image: { file: 'media/guia-corporal.jpg', alt: 'Retrato de Ana Lucía Ríos sonriendo con luz natural' } },
  { name: 'Valeria Montes', focus: 'Reiki, flores de Bach y biomagnetismo', schedule: 'Miércoles a sábado', therapies: ['reiki', 'flores-de-bach', 'biomagnetismo'], en: { focus: 'Reiki, Bach flowers and biomagnetism', schedule: 'Wednesday to Saturday', imageAlt: 'Portrait of Valeria Montes wearing a bead necklace in a bright studio' }, image: { file: 'media/guia-energetica.jpg', alt: 'Retrato de Valeria Montes con collar de cuentas en un estudio luminoso' } },
  { name: 'Tomás Ibarra', focus: 'Limpias y acompañamiento espiritual', schedule: 'Jueves a sábado', therapies: ['limpia'], en: { focus: 'Limpias and spiritual guidance', schedule: 'Thursday to Saturday', imageAlt: 'Portrait of Tomás Ibarra smiling outdoors' }, image: { file: 'media/guia-espiritual.jpg', alt: 'Retrato de Tomás Ibarra sonriendo al aire libre' } },
];

/* Business card for search engines (address, phones, hours), on the home and Visit pages */
function localBusinessLd() {
  const pad = (h) => `${String(h).padStart(2, '0')}:00`;
  const data = {
    '@context': 'https://schema.org', '@type': 'HealthAndBeautyBusiness', name: 'Plenitud Center', url: SITE_URL,
    image: `${SITE_URL}media/espacio.jpg`, logo: `${SITE_URL}design-system/assets/logo-emblem.png`,
    telephone: CONTACTS.map((c) => `+${c.intl}`),
    address: { '@type': 'PostalAddress', streetAddress: 'Av. Naciones Unidas 5461, Col. Vallarta Universidad', addressLocality: 'Zapopan', addressRegion: 'Jalisco', postalCode: '45110', addressCountry: 'MX' },
    openingHours: `Mo-Sa ${pad(HOURS.open)}-${pad(HOURS.close)}`,
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

/* Short splash while the page settles: logo and name on the home page; on the rest, a
   vertical line and the page's own name below them. CSS shows it only with JS and fades
   it out on its own after a moment; it is decorative, so screen readers skip it. */
function loader(prefix, pageName) {
  return `<div class="loader" aria-hidden="true">
  <img class="loader__emblem" src="${asset(prefix)}design-system/assets/logo-emblem-192.png" alt="" width="72" height="72" />
  <p class="loader__name">Plenitud Center</p>${pageName ? `
  <span class="loader__rule"></span>
  <p class="loader__page">${esc(pageName)}</p>` : ''}
</div>`;
}

function layout({ prefix, active, pagePath, title, description, bodyHtml, mainId = 'contenido', home = false }) {
  return `<!doctype html>
<html lang="${L.htmlLang}" data-theme="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
${headExtra(prefix, pagePath)}${pagePath === '' || pagePath === 'visita/' ? `\n${localBusinessLd()}` : ''}
</head>
<body${home ? ' class="is-home"' : ''}>
${loader(prefix, pagePath ? title.split(' · ')[0] : '')}
<a class="skip-link" href="#${mainId}">${L.skip}</a>
${demoNotice()}

${nav(prefix, active, pagePath)}

<main id="${mainId}" tabindex="-1">
${bodyHtml}
</main>

${footerPartial(prefix)}

<!-- Long pages: site.js shows it after a couple of screens of scrolling -->
<a class="btn btn--secondary icon-btn to-top" href="#${mainId}" data-to-top hidden title="${L.toTop}"><span class="icon icon--up" aria-hidden="true"></span><span class="sr-only">${L.toTop}</span></a>

${reserveDialog()}

${cartDialog()}

${settingsDialog(prefix, pagePath)}

<script src="${asset(prefix)}${versioned('site.js')}"></script>
<span id="page-ready" hidden></span>
</body>
</html>
`;
}

// ---------- page bodies ----------

function homeBody(prefix) {
  const H = L.home;
  const featured = [
    terapias.find((t) => t.category === 'corporal'),
    terapias.find((t) => t.category === 'energetica'),
    terapias.find((t) => t.category === 'espiritual'),
  ].filter(Boolean);

  const productTiles = productos.filter((p) => p.image).slice(0, 4).map((p) => productTile(p, prefix)).join('\n');

  const cards = featured.map((t) => terapiaCard(t, prefix, 'h3', true)).join('\n');

  return `  <section class="hero" id="inicio" aria-labelledby="hero-title">
    <div class="container hero__inner">
      <img class="hero__emblem" src="${asset(prefix)}design-system/assets/logo-emblem-192.png" alt="" width="96" height="96" />
      <p class="label eyebrow">Plenitud · Center</p>
      <!-- PLACEHOLDER: tagline de ejemplo, confirmar si sigue aplicando al centro de terapias holísticas -->
      <h1 class="display-hero" id="hero-title">${H.heroTitle}</h1>
      <p class="lead">${H.heroLead}</p>
      <div class="hero__actions">
        <button class="btn btn--primary btn--lg" type="button" data-reserve>${H.heroReserve}</button>
        <a class="btn btn--secondary btn--lg" href="${prefix}terapias/">${H.heroSee}</a>
      </div>
      <p class="caption">${L.openHours}</p>
      ${openStatus()}
    </div>
    <!-- Cue that the page goes on below the full-screen hero -->
    <a class="hero__more" href="#como-funciona">${H.more} <span class="hero__more-arrow" aria-hidden="true">↓</span></a>
  </section>

  <section class="section section--sage" id="como-funciona" aria-labelledby="how-title">
    <div class="container">
      <header class="section__head">
        <p class="label eyebrow">${H.howEyebrow}</p>
        <h2 class="display-h2" id="how-title">${H.howTitle}</h2>
      </header>
${steps(H.how)}
    </div>
  </section>

  <section class="section" id="terapias" aria-labelledby="terapias-title">
    <div class="container">
      <header class="section__head">
        <p class="label eyebrow">${H.offerEyebrow}</p>
        <h2 class="display-h2" id="terapias-title">${H.offerTitle}</h2>
      </header>
      <ul class="grid grid--3" role="list">
${cards}
      </ul>
      <p class="section__more"><a class="btn btn--secondary btn--lg" href="${prefix}terapias/">${H.seeAllTherapies}</a></p>
    </div>
  </section>

  <section class="section section--sage" id="productos" aria-labelledby="productos-title">
    <div class="container">
      <header class="section__head">
        <p class="label eyebrow">${H.takeEyebrow}</p>
        <h2 class="display-h2" id="productos-title">${H.takeTitle}</h2>
        <p class="lead">${H.takeLead}</p>
      </header>
      <ul class="grid grid--4" role="list">
${productTiles}
      </ul>
      <p class="section__more"><a class="btn btn--secondary btn--lg" href="${prefix}productos/">${H.seeProducts}</a></p>
    </div>
  </section>

  <section class="section section--quote" id="testimonio" aria-labelledby="voces-title">
    <div class="container container--narrow">
      <h2 class="label eyebrow" id="voces-title">${H.voiceEyebrow}</h2>
      <!-- PLACEHOLDER: testimonio de ejemplo, NO es un testimonio real -->
      <figure class="quote">
        <blockquote><p class="display-quote">${L.quote}</p></blockquote>
        <figcaption class="caption">${L.quoteBy}</figcaption>
      </figure>
    </div>
  </section>

  <section class="section" id="guias-teaser" aria-labelledby="guias-teaser-title">
    <div class="container">
      <header class="section__head section__head--split">
        <div>
          <p class="label eyebrow">${L.guides.eyebrow}</p>
          <h2 class="display-h2" id="guias-teaser-title">${L.guides.h1}</h2>
        </div>
        <p class="lead">${H.guidesLead} <a href="${prefix}guias/">${H.guidesLink}</a></p>
      </header>
      <ul class="grid grid--3" role="list">
${guiaCards(prefix, 'h3')}
      </ul>
    </div>
  </section>`;
}

/* Numbered steps (home "how it works", Visit "first visit"). The number is real text, so a
   screen reader hears the order even though the list drops its bullets. */
function steps(items) {
  return `      <ol class="steps" role="list">
${items.map(([title, text], i) => `        <li class="step"><span class="step__num">${i + 1}</span><h3 class="h4 step__title">${esc(title)}</h3><p class="small step__text">${esc(text)}</p></li>`).join('\n')}
      </ol>`;
}

// Guide cards; on the Guides page each one also links to the therapies that person leads.
function guiaCards(prefix, heading, withTherapies = false) {
  return GUIAS.map((g, i) => {
    const led = withTherapies ? g.therapies.map((slug) => terapias.find((t) => t.slug === slug)).filter(Boolean) : [];
    const links = led.length ? `<p class="caption guide-links__label" id="leads-${i}">${L.guides.leads}</p><ul class="guide-links" role="list" aria-labelledby="leads-${i}">${led.map((t) => `<li><a href="${prefix}terapias/${t.slug}/">${esc(tr(t, 'name'))}</a></li>`).join('')}</ul>` : '';
    return `        <li><article class="card">${cardMedia(imageOf(g), prefix, 'portrait')}<${heading} class="card__title card__title--sm">${esc(g.name)}</${heading}><p class="card__body">${esc(tr(g, 'focus'))}</p>${links}<p class="card__meta">${esc(tr(g, 'schedule'))}</p></article></li>`;
  }).join('\n');
}

// Compact product card (home page, "you may also like")
function productTile(p, prefix) {
  return `        <li>
          <article class="card card--interactive card--compact">
            ${cardMedia(imageOf(p), prefix)}
            <h3 class="card__title card__title--sm">${esc(tr(p, 'name'))}</h3>
            <div class="card__footer">
              ${priceBlock(p.price)}
              <a class="card__action btn btn--ghost" href="${prefix}productos/${p.slug}/">${L.see} <span class="sr-only">${esc(tr(p, 'name'))}</span></a>
            </div>
          </article>
        </li>`;
}

// One therapy card, shared by the home page and the catalog. The eyebrow names the
// category only where cards of different categories sit side by side.
function terapiaCard(t, prefix, heading, showCategory = false) {
  const name = tr(t, 'name');
  const needs = needsOf(t);
  return `          <li data-needs="${needs.join(' ')}">
            <article class="card card--interactive">
              ${cardMedia(imageOf(t), prefix, 'wide')}
              ${showCategory ? `<p class="card__eyebrow">${esc(catName(t.category))}</p>` : ''}
              <${heading} class="card__title card__title--sm">${esc(name)}</${heading}>
              <p class="card__body">${esc(tr(t, 'summary'))}</p>
              ${needs.length ? `<p class="card__needs">${L.therapies.helps}: ${needs.map((n) => NEEDS[LANG][n]).join(' · ')}</p>` : ''}
              <div class="card__footer">
                ${priceBlock(t.price, t.duration)}
                <a class="card__action btn btn--ghost" href="${prefix}terapias/${t.slug}/">${L.seeMore} <span class="sr-only">${L.seeMoreAbout} ${esc(name)}</span></a>
              </div>
            </article>
          </li>`;
}

/* Therapy catalog: one grid, every card the same size (3 columns on desktop, 2 on tablets,
   1 on phones), ordered by family. Each card names its family; the three families are
   explained once above the filter. */
function terapiasIndexBody(prefix) {
  const T = L.therapies;
  const order = Object.keys(categories);
  const sorted = [...terapias].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  const families = order.map((k) => `        <div class="family"><dt class="family__name">${esc(catName(k))}</dt><dd class="family__text">${esc(tr(categories[k], 'summary'))}</dd></div>`).join('\n');

  return `  <section class="section" aria-labelledby="terapias-h1">
    <div class="container">
      <header class="section__head">
        <p class="label eyebrow">${L.nav.terapias}</p>
        <h1 class="display-h1" id="terapias-h1">${T.h1}</h1>
        <p class="lead">${T.lead}</p>
      </header>
      <dl class="families">
${families}
      </dl>
      <!-- Filter by need: shown by site.js; without it every therapy is listed -->
      <fieldset class="filter" data-js-only hidden>
        <legend class="h4">${T.filter}</legend>
        <div class="variant-picker__options">
          ${[['', T.all], ...Object.entries(NEEDS[LANG])].map(([k, v]) => `<label class="variant-chip"><input type="radio" name="need" value="${k}"${k ? '' : ' checked'} /><span class="variant-chip__box">${esc(v)}</span></label>`).join('\n          ')}
        </div>
      </fieldset>
      <p class="small filter-status" role="status" data-therapy-status></p>
      <ul class="grid grid--3" role="list" id="therapy-grid">
${sorted.map((t) => terapiaCard(t, prefix, 'h2', true)).join('\n')}
      </ul>
      <p class="small note">${T.note}</p>
    </div>
  </section>`;
}

function terapiaDetailBody(prefix, t) {
  const T = L.therapies;
  const name = tr(t, 'name');
  const expectItems = tr(t, 'expect').map((e) => `          <li>${esc(e)}</li>`).join('\n');
  return `  <section class="section" aria-labelledby="t-h1">
    <div class="container detail">
      ${detailMedia(imageOf(t), prefix)}
      <div class="detail__body">
        <p class="label eyebrow">${esc(catName(t.category))}</p>
        <h1 class="display-h1" id="t-h1">${esc(name)}</h1>
        <p class="lead">${esc(tr(t, 'body'))}</p>
        ${facts([[T.price, t.price != null ? money(t.price) : null], [T.duration, t.duration], [T.schedule, tr(t, 'schedule')], [T.guide, guideOf(t)?.name]])}
        ${needsOf(t).length ? `<p class="small detail__needs">${T.helps}: ${needsOf(t).map((n) => NEEDS[LANG][n]).join(' · ')}</p>` : ''}
        <p class="detail__cta"><button class="btn btn--primary btn--lg" type="button" data-reserve data-session="${esc(t.slug)}">${T.reserveThis} ${esc(name)}</button></p>
        ${contactNote()}
        <h2 class="h4">${T.expect}</h2>
        <ol class="body detail__list">
${expectItems}
        </ol>
        <p class="caption"><a href="${prefix}terapias/">${T.back}</a></p>
      </div>
    </div>
  </section>`;
}

function facts(rows) {
  const items = rows.filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  return items ? `<dl class="facts">${items}</dl>` : '';
}

function productosIndexBody(prefix) {
  const P = L.products;
  const cards = productos.map((p, i) => `        <li data-name="${esc(tr(p, 'name').toLowerCase())}" data-price="${p.price ?? ''}" data-order="${i}">
          <article class="card card--interactive">
            ${cardMedia(imageOf(p), prefix)}
            <h2 class="card__title card__title--sm">${esc(tr(p, 'name'))}</h2>
            <p class="card__body">${esc(tr(p, 'summary'))}</p>
            ${variantSummary(p)}
            <div class="card__footer">
              ${priceBlock(p.price, tr(p, 'priceNote'))}
              <a class="card__action btn btn--ghost" href="${prefix}productos/${p.slug}/">${L.see} <span class="sr-only">${esc(tr(p, 'name'))}</span></a>
            </div>
          </article>
        </li>`).join('\n');

  return `  <section class="section" aria-labelledby="productos-h1">
    <div class="container">
      <header class="section__head">
        <p class="label eyebrow">${P.eyebrow}</p>
        <h1 class="display-h1" id="productos-h1">${P.h1}</h1>
        <p class="lead">${P.lead}</p>
      </header>
      <div class="filters">
        <div class="filters__row">
          <div class="field filters__search">
            <label class="field__label" for="product-filter">${P.search}</label>
            <input class="input" id="product-filter" type="search" placeholder="${P.searchPh}" autocomplete="off" />
          </div>
          <div class="field" data-js-only hidden>
            <label class="field__label" for="product-sort">${P.sort}</label>
            <select class="select" id="product-sort">
              <option value="featured">${P.sortFeatured}</option>
              <option value="low">${P.sortLow}</option>
              <option value="high">${P.sortHigh}</option>
            </select>
          </div>
        </div>
        <p class="small filter-status" role="status" data-product-status></p>
      </div>
      <ul class="grid grid--3" role="list" id="product-grid">
${cards}
      </ul>
      <p class="small" id="product-empty" hidden style="margin-top: var(--space-6)">${P.empty}</p>
    </div>
  </section>`;
}

function productoDetailBody(prefix, p) {
  const P = L.products;
  const name = tr(p, 'name');
  const vs = variantList(p);
  const label = tr(p, 'variantLabel') || L.options;
  const one = tr(p, 'variantName') || L.option;
  // Native radios; the value is the Spanish name, which site.js copies into the WhatsApp
  // message. The first option starts selected so the link always names a concrete variant.
  const variants = vs
    ? `<fieldset class="variant-picker">
          <legend class="h4">${P.choose} ${esc(one)} <span class="variant-picker__count">(${vs.length} ${esc(label)})</span></legend>
          <div class="variant-picker__options">${vs.map((v, i) => `
            <label class="variant-chip"><input type="radio" name="variant" value="${esc(v.key)}"${i === 0 ? ' checked' : ''} /><span class="variant-chip__box">${p.swatches ? swatch(p.swatches[v.key]) : ''}${esc(v.name)}</span></label>`).join('')}
          </div>
        </fieldset>`
    : '';
  const note = tr(p, 'priceNote');
  // The direct WhatsApp order is written in Spanish (see whatsappLink)
  const oneEs = p.variantName || UI.es.option;
  const priceEs = p.price != null ? `${money(p.price)}${p.priceNote ? ` ${p.priceNote}` : ''}` : '';
  const orderAttrs = (c) => `data-whatsapp data-product="${esc(p.name)}" data-variant-name="${esc(oneEs)}" data-price="${esc(priceEs)}" href="${whatsappLink(p.name, vs ? `${oneEs}: ${vs[0].key}` : '', priceEs, c.intl)}"`;
  // The cart shows each item in the page's language and writes the message in Spanish, so it keeps both
  const texts = Object.fromEntries(['es', 'en'].map((lg) => {
    const t = (f) => (lg !== 'es' && p.en && p.en[f] != null ? p.en[f] : p[f]);
    return [lg, { name: t('name'), variantName: t('variantName') || UI[lg].option, note: t('priceNote') || '', variants: t('variants') || [] }];
  }));
  return `  <section class="section" aria-labelledby="p-h1">
    <div class="container detail">
      ${detailMedia(imageOf(p), prefix)}
      <div class="detail__body">
        <p class="label eyebrow">${P.eyebrowOne}</p>
        <h1 class="display-h1" id="p-h1">${esc(name)}</h1>
        <p class="lead">${esc(tr(p, 'summary'))}</p>
        ${priceBlock(p.price, note).replace('class="price', 'class="price price--lg')}
        ${variants}
        <!-- With JS: "add to order" is the main action and the direct link becomes secondary.
             Without JS the add button stays hidden and the direct WhatsApp link still works. -->
        <div class="detail__cta buy">
          <button class="btn btn--primary btn--lg" type="button" data-cart-add data-slug="${esc(p.slug)}" data-price="${p.price ?? ''}" data-texts="${esc(JSON.stringify(texts))}" hidden>${L.cart.add}</button>
          <a class="btn btn--secondary btn--lg" data-order-one ${orderAttrs(CONTACTS[0])}>${P.orderWa}</a>
        </div>
        <p class="small cart-added" role="status" data-cart-added></p>
        ${contactNote(orderAttrs)}
        ${waLangNote()}
        <p class="caption"><a href="${prefix}productos/">${P.back}</a></p>
      </div>
    </div>
  </section>
${relatedProducts(prefix, p)}`;
}

// Products aren't grouped (the catalog is varied), so "you may also like" shows the next three
// in catalog order, wrapping around: every product page points somewhere different.
function relatedProducts(prefix, p) {
  const P = L.products;
  const i = productos.indexOf(p);
  const picks = [...productos.slice(i + 1), ...productos.slice(0, i)].filter((x) => x.image).slice(0, 3);
  return `  <section class="section section--sage" aria-labelledby="related-title">
    <div class="container">
      <header class="section__head">
        <h2 class="display-h2" id="related-title">${P.related}</h2>
      </header>
      <ul class="grid grid--3" role="list">
${picks.map((x) => productTile(x, prefix)).join('\n')}
      </ul>
      <p class="section__more"><a class="btn btn--secondary btn--lg" href="${prefix}productos/">${P.seeAll}</a></p>
    </div>
  </section>`;
}

function guiasBody(prefix) {
  const G = L.guides;
  return `  <section class="section" aria-labelledby="guias-h1">
    <div class="container">
      <header class="section__head section__head--split">
        <div>
          <p class="label eyebrow">${G.eyebrow}</p>
          <h1 class="display-h1" id="guias-h1">${G.h1}</h1>
        </div>
        <p class="lead">${G.lead}</p>
      </header>
      <ul class="grid grid--3" role="list">
${guiaCards(prefix, 'h2', true)}
      </ul>
    </div>
  </section>`;
}

/* Visit: how to get here beside the map (text first on phones), then what to know before a
   first visit, then contact with the photo of the space, ending on the Book button. */
function visitaBody(prefix) {
  const V = L.visit;
  const espacio = { file: 'media/espacio.jpg', alt: V.spaceAlt };
  return `  <section class="section" aria-labelledby="visita-h1">
    <div class="container visit">
      <div class="detail__body">
        <p class="label eyebrow">${V.eyebrow}</p>
        <h1 class="display-h1" id="visita-h1">${V.h1}</h1>
        <!-- Pendiente: política de cancelación -->
        <p class="lead">${V.address}</p>
        <p class="body">${L.openHours}.</p>
        ${openStatus()}
        <p class="visit-actions"><a class="btn btn--secondary btn--lg" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(MAP_QUERY)}">${V.directions} <span class="sr-only">(${V.directionsHint})</span></a></p>
      </div>
      <div class="visit__map">
        <div class="map" data-map>
          <div class="map__off" hidden><p class="body">${V.mapOff}</p><button class="btn btn--secondary" type="button" data-map-show>${V.mapShow}</button></div>
          <iframe src="https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&amp;z=16&amp;hl=${LANG}&amp;output=embed" title="${V.mapFrame}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <p class="small map__link"><a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(MAP_QUERY)}">${V.mapOpen}</a></p>
      </div>
    </div>
  </section>
  <section class="section section--sage" aria-labelledby="first-title">
    <div class="container">
      <header class="section__head">
        <p class="label eyebrow">${V.firstEyebrow}</p>
        <h2 class="display-h2" id="first-title">${V.firstTitle}</h2>
      </header>
${steps(V.first)}
    </div>
  </section>
  <section class="section" aria-labelledby="contacto-h2">
    <div class="container detail">
      ${detailMedia(espacio, prefix, false)}
      <div class="detail__body">
        <h2 class="display-h2" id="contacto-h2">${V.contact}</h2>
        <p class="body">${V.contactLead}</p>
        <ul class="body contact-list" role="list">
${CONTACTS.map((c) => `          <li><a href="${waGeneral(c)}">WhatsApp ${c.display}</a> · <a href="tel:+${c.intl}">${V.call} <span class="sr-only">${V.callTo} ${c.display}</span></a></li>`).join('\n')}
        </ul>
        <p class="caption">${L.attention}</p>
        <p class="detail__cta"><button class="btn btn--primary btn--lg" type="button" data-reserve>${V.reserve}</button></p>
      </div>
    </div>
  </section>`;
}

// ---------- write everything ----------

function build(lang) {
  LANG = lang;
  L = UI[lang];
  const out = (p) => `${L.dir}${p}index.html`;
  const page = (pagePath, depth, opts) => write(out(pagePath), layout({ prefix: prefixFor(depth), pagePath, ...opts }));

  page('', 0, { active: null, title: L.home.title, description: L.home.description, bodyHtml: homeBody(prefixFor(0)), home: true });
  page('terapias/', 1, { active: 'terapias', title: L.therapies.title, description: L.therapies.description, bodyHtml: terapiasIndexBody(prefixFor(1)) });
  for (const t of terapias) {
    page(`terapias/${t.slug}/`, 2, { active: 'terapias', title: `${tr(t, 'name')} · Plenitud Center`, description: tr(t, 'summary'), bodyHtml: terapiaDetailBody(prefixFor(2), t) });
  }
  page('productos/', 1, { active: 'productos', title: L.products.title, description: L.products.description, bodyHtml: productosIndexBody(prefixFor(1)) });
  for (const p of productos) {
    page(`productos/${p.slug}/`, 2, { active: 'productos', title: `${tr(p, 'name')} · Plenitud Center`, description: tr(p, 'summary'), bodyHtml: productoDetailBody(prefixFor(2), p) });
  }
  page('guias/', 1, { active: 'guias', title: L.guides.title, description: L.guides.description, bodyHtml: guiasBody(prefixFor(1)) });
  page('visita/', 1, { active: 'visita', title: L.visit.title, description: L.visit.description, bodyHtml: visitaBody(prefixFor(1)) });

  console.log(`${L.built} (${lang}): 1 inicio, 1 terapias/ + ${terapias.length}, 1 productos/ + ${productos.length}, guías, visita.`);
}

for (const lang of Object.keys(UI)) build(lang);

/* GitHub Pages serves 404.html for any missing address, at whatever depth, so every link
   on it is absolute (SITE_URL). Spanish page with an English line for English visitors. */
{
  LANG = 'es'; L = UI.es;
  const N = L.notFound;
  write('404.html', layout({ prefix: SITE_URL, pagePath: '', active: null, title: N.title, description: N.lead, bodyHtml: `  <section class="section" aria-labelledby="nf-h1">
    <div class="container container--narrow not-found">
      <p class="label eyebrow">404</p>
      <h1 class="display-h1" id="nf-h1">${N.h1}</h1>
      <p class="lead">${N.lead}</p>
      <div class="hero__actions not-found__actions">
        <a class="btn btn--primary btn--lg" href="${SITE_URL}">${N.home}</a>
        <a class="btn btn--secondary btn--lg" href="${SITE_URL}terapias/">${L.home.heroSee}</a>
        <a class="btn btn--secondary btn--lg" href="${SITE_URL}productos/">${L.home.seeProducts}</a>
      </div>
      <p class="body" lang="en">${N.en} <a href="${SITE_URL}en/">${N.enLink}</a>.</p>
    </div>
  </section>` }));
}
