// Static site generator for Plenitud Center. No framework, no runtime dependency:
// this script reads data/terapias.json + data/productos.json and writes plain
// HTML files the same way a person would have typed them by hand. Re-run after
// editing either JSON file or any template function below.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const terapiasData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/terapias.json'), 'utf8'));
const productosData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/productos.json'), 'utf8'));
const { categories, terapias } = terapiasData;
const { productos } = productosData;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const prefixFor = (depth) => '../'.repeat(depth);

function write(relPath, html) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

// ---------- shared partials ----------

function headExtra(prefix) {
  return `<script>
  (function () {
    var d = document.documentElement, s = null;
    d.classList.add('js');
    try { s = localStorage.getItem('plenitud-theme'); } catch (e) {}
    var m = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
    d.dataset.theme = (s === 'light' || s === 'dark' || s === 'high-contrast') ? s
      : (s === 'auto') ? (m('(prefers-contrast: more)') ? 'high-contrast' : m('(prefers-color-scheme: dark)') ? 'dark' : 'light')
      : 'light';
  })();
</script>
<link rel="preload" href="${prefix}design-system/fonts/Jost-Variable.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="${prefix}design-system/colors_and_type.css" />
<link rel="stylesheet" href="${prefix}design-system/components.css" />
<link rel="stylesheet" href="${prefix}site.css" />`;
}

const NAV_ITEMS = [
  { key: 'terapias', label: 'Terapias', href: 'terapias/' },
  { key: 'productos', label: 'Productos', href: 'productos/' },
  { key: 'guias', label: 'Guías', href: 'guias/' },
  { key: 'voces', label: 'Voces', href: 'voces/' },
  { key: 'visita', label: 'Visita', href: 'visita/' },
];

function nav(prefix, active) {
  const home = prefix || './';
  const items = NAV_ITEMS.map((it) => {
    const current = it.key === active ? ' aria-current="page"' : '';
    return `<li><a class="nav__link" href="${prefix}${it.href}"${current}>${it.label}</a></li>`;
  }).join('\n        ');
  return `<header class="nav">
  <div class="nav__bar">
    <a class="nav__brand" href="${home}" aria-label="Plenitud Center, inicio">
      <img src="${prefix}design-system/assets/logo-emblem.png" alt="" width="32" height="32" />
      <span>Plenitud</span>
    </a>
    <button class="btn btn--ghost nav__toggle" type="button" aria-expanded="false" aria-controls="menu-principal">
      <span class="icon icon--menu" aria-hidden="true"></span><span>Menú</span>
    </button>
    <nav aria-label="Principal" class="nav__nav">
      <ul class="nav__list" id="menu-principal">
        ${items}
        <li><button class="btn btn--primary" type="button" data-reserve>Reservar</button></li>
      </ul>
    </nav>
  </div>
</header>`;
}

function footerPartial(prefix) {
  return `<footer class="footer" id="visita">
  <div class="container footer__inner">
    <div class="footer__grid">
      <div>
        <p class="footer__word">Plenitud</p>
        <p class="footer__tag">Un lugar para volver a ti.</p>
        <!-- PLACEHOLDER: dirección de ejemplo, confirmar dirección real -->
        <address class="footer__muted">Calle de la Calma 14<br />Patio del estudio, segundo piso<br />Abierto de martes a domingo</address>
      </div>
      <nav aria-labelledby="f-terapias">
        <h2 class="footer__heading" id="f-terapias">Terapias</h2>
        <ul class="footer__links" role="list"><li><a href="${prefix}terapias/">Ver todas</a></li><li><a href="${prefix}productos/">Productos</a></li></ul>
      </nav>
      <nav aria-labelledby="f-leer">
        <h2 class="footer__heading" id="f-leer">Leer</h2>
        <ul class="footer__links" role="list"><li><a href="${prefix}voces/">Voces</a></li><li><a href="${prefix}guias/">Guías</a></li></ul>
      </nav>
      <div>
        <h2 class="footer__heading" id="f-contacto">Contacto</h2>
        <!-- PLACEHOLDER: correo de ejemplo, confirmar correo real -->
        <ul class="footer__links" role="list"><li><a href="mailto:hola@plenitud.center">hola@plenitud.center</a></li></ul>
      </div>
    </div>
    <div class="footer__bottom">
      <p class="footer__muted">© Plenitud Center · 2026</p>
      <div class="field field--inline">
        <label class="field__label" for="theme">Apariencia</label>
        <select class="select" id="theme">
          <option value="auto">Automática</option>
          <option value="light">Clara</option>
          <option value="dark">Oscura</option>
          <option value="high-contrast">Alto contraste</option>
        </select>
      </div>
    </div>
  </div>
</footer>`;
}

function reserveDialog() {
  const choices = terapias.map((t, i) => `        <label class="choice"><input type="radio" name="session" value="${t.slug}"${i === 0 ? ' checked' : ''} /><span class="choice__box"><span class="choice__title">${esc(t.name)}</span><span class="choice__meta">${esc(categories[t.category].name)}</span><span class="choice__check" aria-hidden="true"></span></span></label>`).join('\n');
  return `<dialog class="dialog" id="reserve" aria-labelledby="reserve-t1">
  <form class="dialog__panel" id="reserve-form" novalidate>
    <button class="btn btn--ghost dialog__close" type="button" data-close aria-label="Cerrar"><span class="icon icon--close" aria-hidden="true"></span></button>

    <div data-step="1">
      <p class="dialog__step">Paso 1 de 2</p>
      <h2 class="dialog__title" id="reserve-t1" tabindex="-1">¿Qué terapia te llama?</h2>
      <p class="dialog__lead">Elige una para empezar. Puedes cambiar de opinión cuando quieras.</p>
      <fieldset class="choice-group">
        <legend class="sr-only">Terapia</legend>
${choices}
      </fieldset>
      <div class="dialog__actions">
        <button class="btn btn--ghost" type="button" data-close>Cancelar</button>
        <button class="btn btn--primary" type="button" data-next>Continuar</button>
      </div>
    </div>

    <div data-step="2" hidden>
      <p class="dialog__step">Paso 2 de 2</p>
      <h2 class="dialog__title" id="reserve-t2" tabindex="-1">¿Dónde te escribimos?</h2>
      <p class="dialog__lead">Recibirás una nota breve con la dirección y qué traer.</p>
      <p class="alert alert--danger" id="form-status" role="alert" hidden></p>
      <div class="stack" style="--stack: var(--space-5)">
        <div class="field" data-field="name">
          <label class="field__label" for="f-name">Nombre <span class="field__req">(obligatorio)</span></label>
          <input class="input" id="f-name" name="name" type="text" autocomplete="name" required aria-describedby="f-name-err" />
          <p class="field__error" id="f-name-err">Escribe tu nombre.</p>
        </div>
        <div class="field" data-field="email">
          <label class="field__label" for="f-email">Correo electrónico <span class="field__req">(obligatorio)</span></label>
          <p class="field__hint" id="f-email-hint">Ejemplo: nombre@correo.com</p>
          <input class="input" id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="f-email-hint f-email-err" />
          <p class="field__error" id="f-email-err">Escribe un correo válido, por ejemplo nombre@correo.com.</p>
        </div>
      </div>
      <div class="dialog__actions">
        <button class="btn btn--ghost" type="button" data-back>Atrás</button>
        <button class="btn btn--primary" type="submit">Confirmar reserva</button>
      </div>
    </div>

    <div data-step="3" hidden>
      <h2 class="dialog__title" id="reserve-t3" tabindex="-1">Listo, te esperamos.</h2>
      <p class="alert alert--success" role="status" style="margin-top: var(--space-5)"><span class="icon icon--check" aria-hidden="true"></span><span class="alert__body" id="reserve-summary"></span></p>
      <div class="dialog__actions"><button class="btn btn--primary" type="button" data-close>Cerrar</button></div>
    </div>
  </form>
</dialog>`;
}

function draftTag() {
  return `<span class="tag tag--warning">Contenido de ejemplo</span>`;
}

function layout({ prefix, active, title, description, bodyHtml, mainId = 'contenido' }) {
  return `<!doctype html>
<html lang="es" data-theme="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
${headExtra(prefix)}
</head>
<body>
<a class="skip-link" href="#${mainId}">Saltar al contenido</a>

${nav(prefix, active)}

<main id="${mainId}" tabindex="-1">
${bodyHtml}
</main>

${footerPartial(prefix)}

${reserveDialog()}

<script src="${prefix}site.js"></script>
</body>
</html>
`;
}

// ---------- page bodies ----------

function homeBody(prefix) {
  const featured = [
    terapias.find((t) => t.category === 'corporal'),
    terapias.find((t) => t.category === 'energetica'),
    terapias.find((t) => t.category === 'espiritual'),
  ].filter(Boolean);

  const cards = featured.map((t) => `        <li>
          <article class="card card--interactive">
            <p class="card__eyebrow">${esc(categories[t.category].name)}</p>
            <h3 class="card__title">${esc(t.name)}</h3>
            <p class="card__body">${esc(t.summary)}</p>
            <a class="card__action btn btn--ghost" href="${prefix}terapias/${t.slug}/">Conoce la terapia <span class="sr-only">${esc(t.name)}</span></a>
          </article>
        </li>`).join('\n');

  return `  <section class="hero" id="inicio" aria-labelledby="hero-title">
    <div class="container hero__inner">
      <img class="hero__emblem" src="${prefix}design-system/assets/logo-emblem.png" alt="" width="96" height="96" />
      <p class="label eyebrow">Plenitud · Center</p>
      <!-- PLACEHOLDER: tagline de ejemplo, confirmar si sigue aplicando al centro de terapias holísticas -->
      <h1 class="display-hero" id="hero-title">Un lugar para volver <em>a ti.</em></h1>
      <p class="lead">Un espacio de terapias corporales, energéticas y espirituales, y de productos para sostener esa práctica en casa. Llega como estás.</p>
      <div class="hero__actions">
        <button class="btn btn--primary btn--lg" type="button" data-reserve>Reservar una terapia</button>
        <a class="btn btn--secondary btn--lg" href="${prefix}terapias/">Ver terapias</a>
      </div>
      <!-- PLACEHOLDER: horario de ejemplo, confirmar horario real -->
      <p class="caption">Abierto de martes a domingo · del amanecer al anochecer</p>
    </div>
  </section>

  <section class="section" id="terapias" aria-labelledby="terapias-title">
    <div class="container">
      <header class="section__head">
        <p class="label eyebrow">Lo que ofrecemos</p>
        <h2 class="display-h2" id="terapias-title">Diez caminos, tres familias.</h2>
      </header>
      <ul class="grid grid--3" role="list">
${cards}
      </ul>
      <p class="caption note" style="margin-top: var(--space-6)"><a class="btn btn--ghost" href="${prefix}terapias/">Ver todas las terapias →</a></p>
    </div>
  </section>

  <section class="section section--sage" id="productos" aria-labelledby="productos-title">
    <div class="container">
      <header class="section__head">
        <p class="label eyebrow">Para llevar</p>
        <h2 class="display-h2" id="productos-title">Lo que sostiene la práctica en casa.</h2>
        <p class="lead">Incienso, velas, resinas y herramientas rituales para seguir el ritmo entre sesión y sesión.</p>
      </header>
      <p><a class="btn btn--secondary btn--lg" href="${prefix}productos/">Ver productos</a></p>
    </div>
  </section>

  <section class="section section--quote" id="testimonio" aria-labelledby="voces-title">
    <div class="container container--narrow">
      <h2 class="label eyebrow" id="voces-title">Una voz de la casa</h2>
      <!-- PLACEHOLDER: testimonio de ejemplo, NO es un testimonio real -->
      <figure class="quote">
        <blockquote><p class="display-quote">"Llegué cargando una semana. Salí sin ella. La sala misma se sentía paciente."</p></blockquote>
        <figcaption class="caption">Marisol G. · Miembro desde 2024</figcaption>
      </figure>
      <p class="caption" style="margin-top: var(--space-6)"><a href="${prefix}voces/">Leer más voces →</a></p>
    </div>
  </section>

  <section class="section" id="guias-teaser" aria-labelledby="guias-teaser-title">
    <div class="container">
      <header class="section__head section__head--split">
        <div>
          <p class="label eyebrow">Guías</p>
          <h2 class="display-h2" id="guias-teaser-title">Personas que sostienen el espacio, con amabilidad.</h2>
        </div>
        <p class="lead">Conoce a quienes guían cada terapia. <a href="${prefix}guias/">Ver el equipo →</a></p>
      </header>
    </div>
  </section>`;
}

function terapiasIndexBody(prefix) {
  const byCategory = Object.keys(categories).map((catKey) => {
    const cat = categories[catKey];
    const items = terapias.filter((t) => t.category === catKey);
    const cards = items.map((t) => `          <li>
            <article class="card card--interactive">
              ${t.draft ? draftTag() : ''}
              <h3 class="card__title card__title--sm">${esc(t.name)}</h3>
              <p class="card__body">${esc(t.summary)}</p>
              <a class="card__action btn btn--ghost" href="${prefix}terapias/${t.slug}/">Leer más <span class="sr-only">sobre ${esc(t.name)}</span></a>
            </article>
          </li>`).join('\n');
    return `      <div class="stack" style="--stack: var(--space-4); margin-bottom: var(--space-8)">
        <h2 class="h4">${esc(cat.name)}</h2>
        <p class="small">${esc(cat.summary)}</p>
        <ul class="grid grid--3" role="list">
${cards}
        </ul>
      </div>`;
  }).join('\n');

  return `  <section class="section" aria-labelledby="terapias-h1">
    <div class="container">
      <header class="section__head">
        <p class="label eyebrow">Terapias</p>
        <h1 class="display-h1" id="terapias-h1">Corporal, energética, espiritual.</h1>
        <p class="lead">Diez formas de volver al cuerpo y al espacio personal, agrupadas por lo que trabajan primero.</p>
      </header>
${byCategory}
      <p class="small note">Trae ropa cómoda. Qué traer exactamente depende de cada terapia — lo encuentras en su propia página.</p>
    </div>
  </section>`;
}

function terapiaDetailBody(prefix, t) {
  const cat = categories[t.category];
  const expectItems = t.expect.map((e) => `          <li>${esc(e)}</li>`).join('\n');
  return `  <section class="section" aria-labelledby="t-h1">
    <div class="container container--narrow">
      <p class="label eyebrow">${esc(cat.name)}</p>
      <h1 class="display-h1" id="t-h1">${esc(t.name)}</h1>
      ${t.draft ? draftTag() : ''}
      <p class="lead" style="margin-top: var(--space-4)">${esc(t.body)}</p>

      <h2 class="h4" style="margin-top: var(--space-8)">Qué esperar</h2>
      <ol class="body" style="padding-left: 1.25em">
${expectItems}
      </ol>

      <div class="meta-row" style="margin-top: var(--space-6)">
        <span>Duración: ${t.duration ? esc(t.duration) : 'pendiente'}</span>
        <span>Horario: ${t.schedule ? esc(t.schedule) : 'pendiente'}</span>
        <span>Precio: ${t.price ? esc(t.price) : 'pendiente'}</span>
      </div>

      <p style="margin-top: var(--space-7)">
        <button class="btn btn--primary btn--lg" type="button" data-reserve data-session="${esc(t.slug)}">Reservar ${esc(t.name)}</button>
      </p>
      <p class="caption" style="margin-top: var(--space-5)"><a href="${prefix}terapias/">← Ver todas las terapias</a></p>
    </div>
  </section>`;
}

function productosIndexBody(prefix) {
  const cards = productos.map((p) => {
    const variants = p.variants ? `<p class="meta-row">${p.variants.map((v) => `<span>${esc(v)}</span>`).join('')}</p>` : '';
    return `        <li data-name="${esc(p.name.toLowerCase())}">
          <article class="card card--interactive">
            <div class="thumb" aria-hidden="true"></div>
            ${p.draft ? draftTag() : ''}
            <h2 class="card__title card__title--sm">${esc(p.name)}</h2>
            <p class="card__body">${esc(p.summary)}</p>
            ${variants}
            <p class="card__meta">${p.price ? esc(p.price) : 'Precio por confirmar'}</p>
            <a class="card__action btn btn--ghost" href="${prefix}productos/${p.slug}/">Ver producto <span class="sr-only">${esc(p.name)}</span></a>
          </article>
        </li>`;
  }).join('\n');

  return `  <section class="section" aria-labelledby="productos-h1">
    <div class="container">
      <header class="section__head">
        <p class="label eyebrow">Productos</p>
        <h1 class="display-h1" id="productos-h1">Para la práctica en casa.</h1>
        <p class="lead">Catálogo informativo: para comprar, escribe directamente — todavía no hay pago en línea.</p>
      </header>
      <div class="field" style="max-width: 24rem; margin-bottom: var(--space-7)">
        <label class="field__label" for="product-filter">Buscar producto</label>
        <input class="input" id="product-filter" type="search" placeholder="Ej. vela, incienso, copal" autocomplete="off" />
      </div>
      <ul class="grid grid--3" role="list" id="product-grid">
${cards}
      </ul>
      <p class="small" id="product-empty" hidden style="margin-top: var(--space-6)">No hay productos que coincidan con esa búsqueda.</p>
    </div>
  </section>`;
}

function productoDetailBody(prefix, p) {
  const variants = p.variants
    ? `<h2 class="h4" style="margin-top: var(--space-7)">Opciones</h2><div class="meta-row">${p.variants.map((v) => `<span class="tag">${esc(v)}</span>`).join('')}</div>`
    : '';
  const subject = encodeURIComponent(`Pregunta sobre ${p.name}`);
  return `  <section class="section" aria-labelledby="p-h1">
    <div class="container container--narrow">
      <div class="thumb thumb--lg" aria-hidden="true"></div>
      <p class="label eyebrow">Producto</p>
      <h1 class="display-h1" id="p-h1">${esc(p.name)}</h1>
      ${p.draft ? draftTag() : ''}
      <p class="lead" style="margin-top: var(--space-4)">${esc(p.summary)}</p>
      ${variants}
      <p class="meta-row" style="margin-top: var(--space-6)"><span>${p.price ? esc(p.price) : 'Precio por confirmar'}</span></p>
      <p style="margin-top: var(--space-7)">
        <a class="btn btn--primary btn--lg" href="mailto:hola@plenitud.center?subject=${subject}">Preguntar por este producto</a>
      </p>
      <p class="caption" style="margin-top: var(--space-5)"><a href="${prefix}productos/">← Ver todos los productos</a></p>
    </div>
  </section>`;
}

function guiasBody(prefix) {
  const slots = [
    ['Corporal', 'Nombre — pendiente'],
    ['Energética', 'Nombre — pendiente'],
    ['Espiritual', 'Nombre — pendiente'],
  ];
  const cards = slots.map(([cat, name]) => `        <li><article class="card"><div class="portrait" aria-hidden="true"></div>${draftTag()}<h2 class="card__title card__title--sm">${esc(name)}</h2><p class="card__body">${esc(cat)} · especialidad pendiente</p><p class="card__meta">Horario pendiente</p></article></li>`).join('\n');
  return `  <section class="section" aria-labelledby="guias-h1">
    <div class="container">
      <header class="section__head section__head--split">
        <div>
          <p class="label eyebrow">Guías</p>
          <h1 class="display-h1" id="guias-h1">Personas que sostienen el espacio, con amabilidad.</h1>
        </div>
        <p class="lead">Nuestro equipo es pequeño por decisión. Cada terapia la guía alguien que ha dedicado mucho tiempo a aprender a escuchar: primero a sí mismo, luego a los demás.</p>
      </header>
      <ul class="grid grid--3" role="list">
${cards}
      </ul>
      <p class="caption note">Tarjetas de marcador: a la espera de nombres, fotos reales (con <code>alt</code> descriptivo), especialidad y horario de cada guía.</p>
    </div>
  </section>`;
}

function vocesBody() {
  return `  <section class="section section--quote" aria-labelledby="voces-h1">
    <div class="container container--narrow">
      <h1 class="display-h1" id="voces-h1">Voces de la casa</h1>
      <!-- PLACEHOLDER: testimonio de ejemplo, NO es un testimonio real -->
      <figure class="quote" style="margin-top: var(--space-8)">
        <blockquote><p class="display-quote">"Llegué cargando una semana. Salí sin ella. La sala misma se sentía paciente."</p></blockquote>
        <figcaption class="caption">Marisol G. · Miembro desde 2024</figcaption>
      </figure>
      <p class="small note" style="margin-top: var(--space-8)">Esta página está lista para más testimonios reales — se agregan aquí según lleguen, con autorización para publicar el nombre.</p>
    </div>
  </section>`;
}

function visitaBody() {
  return `  <section class="section" aria-labelledby="visita-h1">
    <div class="container container--narrow">
      <p class="label eyebrow">Visita</p>
      <h1 class="display-h1" id="visita-h1">Cómo llegar</h1>
      <!-- PLACEHOLDER: dirección y horario de ejemplo -->
      <p class="lead" style="margin-top: var(--space-4)">Calle de la Calma 14, patio del estudio, segundo piso.</p>
      <p class="body">Abierto de martes a domingo, del amanecer al anochecer.</p>
      <h2 class="h4" style="margin-top: var(--space-8)">Contacto</h2>
      <!-- PLACEHOLDER: correo de ejemplo -->
      <p class="body"><a href="mailto:hola@plenitud.center">hola@plenitud.center</a></p>
      <p class="small note" style="margin-top: var(--space-6)">Pendiente: dirección exacta, horario por día, política de cancelación, mapa y un canal de contacto real (correo o WhatsApp).</p>
      <p style="margin-top: var(--space-7)"><button class="btn btn--primary btn--lg" type="button" data-reserve>Reservar una terapia</button></p>
    </div>
  </section>`;
}

// ---------- write everything ----------

write('index.html', layout({
  prefix: prefixFor(0), active: null,
  title: 'Plenitud Center · Un lugar para volver a ti',
  description: 'Plenitud Center: terapias corporales, energéticas y espirituales, y productos para la práctica en casa.',
  bodyHtml: homeBody(prefixFor(0)),
}));

write('terapias/index.html', layout({
  prefix: prefixFor(1), active: 'terapias',
  title: 'Terapias · Plenitud Center',
  description: 'Terapias corporales, energéticas y espirituales en Plenitud Center.',
  bodyHtml: terapiasIndexBody(prefixFor(1)),
}));

for (const t of terapias) {
  write(`terapias/${t.slug}/index.html`, layout({
    prefix: prefixFor(2), active: 'terapias',
    title: `${t.name} · Plenitud Center`,
    description: t.summary,
    bodyHtml: terapiaDetailBody(prefixFor(2), t),
  }));
}

write('productos/index.html', layout({
  prefix: prefixFor(1), active: 'productos',
  title: 'Productos · Plenitud Center',
  description: 'Incienso, velas, resinas y herramientas rituales de Plenitud Center.',
  bodyHtml: productosIndexBody(prefixFor(1)),
}));

for (const p of productos) {
  write(`productos/${p.slug}/index.html`, layout({
    prefix: prefixFor(2), active: 'productos',
    title: `${p.name} · Plenitud Center`,
    description: p.summary,
    bodyHtml: productoDetailBody(prefixFor(2), p),
  }));
}

write('guias/index.html', layout({
  prefix: prefixFor(1), active: 'guias',
  title: 'Guías · Plenitud Center',
  description: 'El equipo que sostiene las terapias de Plenitud Center.',
  bodyHtml: guiasBody(prefixFor(1)),
}));

write('voces/index.html', layout({
  prefix: prefixFor(1), active: 'voces',
  title: 'Voces · Plenitud Center',
  description: 'Testimonios de Plenitud Center.',
  bodyHtml: vocesBody(),
}));

write('visita/index.html', layout({
  prefix: prefixFor(1), active: 'visita',
  title: 'Visita · Plenitud Center',
  description: 'Dirección, horario y contacto de Plenitud Center.',
  bodyHtml: visitaBody(),
}));

console.log(`Generado: 1 inicio, 1 terapias/ + ${terapias.length} detalle, 1 productos/ + ${productos.length} detalle, guías, voces, visita.`);
