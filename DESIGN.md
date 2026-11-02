# Plenitud Center — Sistema de diseño accesible

Fuente de verdad para construir páginas de Plenitud Center. Objetivo: **WCAG 2.2 AA** (AAA en el tema `high-contrast`). Si una instrucción de la tarea choca con este documento en accesibilidad, gana este documento y se avisa al usuario.

## 1. Marca

Centro de bienestar. Mundo visual: verdes salvia cálidos, cremas y tinta suave; mucho aire, movimiento lento, ningún borde duro. Voz: calmada, sin prisa; **invita, no vende**. Segunda persona ("llega como estás"). Sin signos de exclamación, sin emoji, sin palabras de moda ("transforma tu vida", "journey"). Mayúsculas solo por CSS en etiquetas y botones de 4 palabras como máximo. Palabras rituales en español (calma, raíz, silencio). Separador de metadatos: `·`.

Proporción de color: 70 % fondos (`bg`, `bg-muted`), 20 % salvia, 10 % tinta, 1–2 % acento.

## 2. Estructura de archivos y carga

```
design-system/  tokens.css  colors_and_type.css  components.css  fonts/  assets/  tokens.json
reference/      index.html  site.css  site.js      <- página de referencia que SÍ pasa axe; copia sus patrones
checks/         a11y.mjs                            <- prueba automática
```

En cada página, en este orden, y sin cargar fuentes de terceros:

```html
<html lang="es" data-theme="light">
<script>/* tema antes del primer pintado: copiar de reference/index.html */</script>
<link rel="stylesheet" href="design-system/colors_and_type.css">  <!-- importa tokens.css -->
<link rel="stylesheet" href="design-system/components.css">
```

Temas: `light`, `dark`, `high-contrast` vía `data-theme` en `<html>`. Por defecto sigue `prefers-contrast: more` → `high-contrast`, luego `prefers-color-scheme: dark` → `dark`. Ofrece un selector de apariencia (ver `reference`).

## 3. Reglas obligatorias (resumen; detalle en la sección 8)

1. Usa **solo tokens semánticos** (`var(--fg)`, `var(--brand)`, `var(--border-control)`…). Nunca valores hex sueltos ni la escala cruda (`--sage-600`) para texto o controles.
2. HTML nativo primero; ARIA solo si no existe elemento nativo.
3. Un `h1` por página, encabezados sin saltos, landmarks `header`/`nav[aria-label]`/`main`/`footer`, enlace "Saltar al contenido" como primer foco.
4. Foco visible siempre (lo da `:focus-visible` en `colors_and_type.css`). Prohibido `outline: none` sin reemplazo.
5. Objetivos táctiles ≥ 44 px (`--target-min`).
6. Texto: cuerpo 18 px (`.body`), nunca < 16 px; apoyo 15 px (`.small`) o 14 px (`.caption`); etiquetas 13 px (`.label`) es el mínimo absoluto. Todo en `rem`.
7. Cormorant Garamond peso 300 solo desde 56 px; peso 400 desde 32 px; 500 a 28 px. Nunca en cuerpo ni bajo 24 px.
8. Nada se comunica solo con color; estados llevan icono y texto.
9. Movimiento lento (`--dur-base` 320 ms, `--ease-calm`); respeta `prefers-reduced-motion`. Sin autoplay, sin contenido solo al pasar el cursor.
10. Sin scroll horizontal a 320 px. Contenedor `.container`; texto de lectura `max-width: var(--measure)`.
11. Imágenes con `alt` real; decorativas con `alt=""`. Iconos decorativos `aria-hidden="true"`.
12. `lang` en `<html>` y en cada frase de otro idioma. El idioma de la página lo decide el usuario.

## 4. Tokens

Todos viven en `design-system/tokens.css` (generado desde `tokens.json`). Valores por tema, ya verificados por código:

| Token | Claro | Oscuro | Alto contraste | Uso |
|---|---|---|---|---|
| `--bg` | `#FBF9F4` | `#1B1E17` | `#FFFFFF` | Page background. Default canvas under every section. |
| `--bg-elevated` | `#FFFFFF` | `#252920` | `#FFFFFF` | Raised surface: cards, inputs, dialog panel. |
| `--bg-muted` | `#F5F1E8` | `#20231B` | `#F2F2EE` | Muted section and cream card ground. |
| `--bg-sage` | `#ECEEE0` | `#262C21` | `#E8EBDD` | Sage-tinted section and card ground. |
| `--fg` | `#2A2D24` | `#F3EFE4` | `#14160F` | Primary text on bg, bg-elevated, bg-muted and bg-sage. |
| `--fg-muted` | `#5C5F53` | `#C4C7BA` | `#2B2E24` | Secondary text on bg, bg-elevated, bg-muted and bg-sage (min 4.5:1 on all four). |
| `--fg-soft` | `#6C5F45` | `#ABAE9F` | `#3A3526` | Meta text (schedules, captions) on bg, bg-elevated, bg-muted and bg-sage. |
| `--on-brand` | `#FFFFFF` | `#14170F` | `#FFFFFF` | Label on brand, brand-hover and brand-active fills. |
| `--brand` | `#6B7754` | `#ADB695` | `#3F4A2E` | Primary action fill (buttons, selected states). Label is on-brand. |
| `--brand-hover` | `#556045` | `#C5CCB1` | `#14160F` | Hover fill of a primary action. |
| `--brand-active` | `#3F4A2E` | `#DCE0CC` | `#000000` | Pressed fill of a primary action. |
| `--brand-deep` | `#556045` | `#C5CCB1` | `#3F4A2E` | Legacy name for sage as text: same as brand-text. |
| `--brand-text` | `#556045` | `#C5CCB1` | `#3F4A2E` | Brand-colored text and icons (links, eyebrows, ghost buttons) on bg, bg-elevated and bg-sage. |
| `--brand-soft` | `#DCE0CC` | `#3A4331` | `#DCE0CC` | Soft brand fill: selected option ground, hover wash. Text on it is fg. |
| `--border` | `#DDD4BE` | `#3A3F33` | `#6E7065` | Decorative hairline between cards and sections. Not a control boundary. |
| `--border-soft` | `#ECE6D7` | `#2F342A` | `#9A9D8E` | Faintest divider inside a card. |
| `--border-strong` | `#B8A98A` | `#6C725F` | `#4A4D40` | Legacy decorative stroke. For controls use border-control. |
| `--border-control` | `#8C7E60` | `#8A8F7B` | `#4A4D40` | Boundary of inputs, selects, radios, secondary buttons: 3:1 or more on bg, bg-elevated, bg-muted and bg-sage. |
| `--focus-ring` | `#556045` | `#DCE0CC` | `#14160F` | Keyboard focus outline, 3px solid, 3px offset. 3:1 or more on every surface and on the footer ground. |
| `--selected-border` | `#556045` | `#C5CCB1` | `#14160F` | Border of a selected option. Pair with a check icon and aria-checked: never color alone. |
| `--focus-ring-on-dark` | `#FBF9F4` | `#DCE0CC` | `#FFFFFF` | Keyboard focus outline on footer-bg and any dark ground. 3:1 or more. |
| `--overlay` | `rgba(42,45,36,0.55)` | `rgba(0,0,0,0.65)` | `rgba(0,0,0,0.75)` | Dialog scrim. |
| `--success` | `#556045` | `#BFD3A0` | `#2F3A22` | Success text and icon on bg and success-bg. Always paired with a word or icon. |
| `--success-bg` | `#ECEEE0` | `#26331F` | `#E8EBDD` | Success banner ground. |
| `--warning` | `#6F5010` | `#E8C987` | `#5A4000` | Warning text and icon on bg and warning-bg. Always paired with a word or icon. |
| `--warning-bg` | `#F8EFD9` | `#33291A` | `#FFF4D6` | Warning banner ground. |
| `--danger` | `#9A4A2E` | `#F2AE92` | `#8A2F12` | Error text and icon on bg and danger-bg. Always paired with a word or icon. |
| `--danger-bg` | `#F8E9E2` | `#3A241C` | `#FDE9E1` | Error banner ground. |
| `--info` | `#3A6770` | `#A9CBD2` | `#1F4E58` | Info text and icon on bg and info-bg. Always paired with a word or icon. |
| `--info-bg` | `#E6EFF0` | `#1E2D31` | `#E1EEF0` | Info banner ground. |
| `--footer-bg` | `#3F4A2E` | `#12150E` | `#14160F` | Footer ground. |
| `--footer-fg` | `#FBF9F4` | `#F3EFE4` | `#FFFFFF` | Text on footer-bg. |
| `--footer-fg-muted` | `#DCE0CC` | `#C4C7BA` | `#E6E8DC` | Secondary text and headings on footer-bg. |

Pares garantizados (cada texto sobre cada fondo que su descripción nombra): texto ≥ 4.5:1 (≥ 7:1 en `high-contrast`); `border-control`, `focus-ring`, `selected-border` ≥ 3:1 sobre `bg`, `bg-elevated`, `bg-muted` y `bg-sage`. **No inventes combinaciones nuevas**; si hace falta un color, añade un token y verifica el contraste con la fórmula WCAG.

Escala cruda de marca (solo logotipo, decoración y para derivar tokens): `--sage-50…900`, `--bone-50…300`, `--clay-400…700`, `--ink-500…900`, `--terracotta`, `--honey`, `--water` (+ gemelos de texto `-700/-800`). `--sage-600` (#808A65) es el verde del logotipo: 3.5:1 sobre `bg`, **no es texto ni fondo de botón**.

**Espaciado:** `--space-1…10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Secciones: `--space-8` en móvil, `--space-9` en escritorio.
**Radios:** `--r-xs` 4, `--r-sm` 8 (inputs), `--r-md` 14 (opciones), `--r-lg` 24 (tarjetas, diálogo), `--r-xl` 36, `--r-pill` (botones, tags).
**Sombras:** `--shadow-xs/sm/md/lg`, difusas y cálidas; nunca duras.
**Capa:** `--container` 75rem, `--measure` 40rem, `--target-min` 2.75rem.
**Movimiento:** `--dur-quick` 180, `--dur-base` 320, `--dur-slow` 560 ms; `--ease-calm`, `--ease-rise`.

## 5. Tipografía

Fuentes autoalojadas en `design-system/fonts/` (SIL OFL): **Cormorant Garamond** (display, 300/400/500 + cursiva 400) y **Jost** (cuerpo, variable 300–700). Clases tipográficas (de `tokens.css` + `colors_and_type.css`):

| Clase | Tamaño | Peso | Uso |
|---|---|---|---|
| `.display-hero` | 3.5→6.5rem fluido | 300 | Héroe, 3–6 palabras, una vez por página |
| `.display-h1` | 2.5→4.5rem | 300 (400 en móvil) | Título de página |
| `.display-h2` | 2→3rem | 400 | Encabezado de sección |
| `.display-h3` | 1.75rem | 500 | Tarjetas |
| `.display-quote` | 1.75→2.75rem | 400 cursiva | Cita |
| `.h4` | 1.375rem | 500 | Subtítulos en Jost |
| `.lead` | 1.375rem | 400 | Introducción (`fg-muted`, máx. `--measure`) |
| `.body` | 1.125rem / 1.65 | 400 | Texto corrido |
| `.small` | 0.9375rem | 400 | Descripciones, ayudas, errores |
| `.caption` | 0.875rem | 400 | Metadatos (`fg-soft`) |
| `.label` | 0.8125rem, tracking .14em | 500 MAYÚSC. | Eyebrows, etiquetas (con `.eyebrow` para color) |
| `.button` | 0.875rem, tracking .12em | 500 MAYÚSC. | Botones y enlaces de navegación |

Énfasis en un titular: una palabra en `<em>` (cursiva, `brand-text`). Párrafos con `text-wrap: pretty`. El script (Caveat) está retirado.

## 6. Componentes (clases de `components.css`)

Copia el marcado de `reference/index.html`; este es el contrato.

- **Botón** `.btn .btn--primary|--secondary|--ghost` (+ `--lg`). `<button>` si actúa, `<a>` si navega. Un solo primario por vista. Deshabilitar con `aria-disabled="true"`.
- **Campo** `.field > label.field__label[for] + (p.field__hint) + .input|.select|.textarea + p.field__error`. Inválido: `.field.is-invalid` + `aria-invalid="true"` + `aria-describedby`. Obligatorio: texto "(obligatorio)". `autocomplete` correcto. Errores: texto, icono, foco al primer campo y resumen `role="alert"`.
- **Opción** `.choice-group` (`fieldset` + `legend`) con `label.choice > input[type=radio|checkbox] + .choice__box`. Seleccionada = borde 2 px + relleno + marca.
- **Tarjeta** `.card` (`--sage`, `--cream`), `.card__eyebrow/.card__title/.card__body/.card__meta`; clicable: `.card--interactive` con **un** `.card__action` (enlace o botón con nombre que incluya el título).
- **Tag** `.tag` (`--sage`, `--solid`, `--danger`, `--warning`); meta: `.meta-row`.
- **Alerta** `.alert` (`--success|--warning|--danger`) con icono `.icon--check|alert|info`; `role="status"` o `role="alert"`.
- **Nav** `header.nav > .nav__bar` con marca, `button.nav__toggle[aria-expanded][aria-controls]`, `nav[aria-label] > ul.nav__list`. Página actual: `aria-current="page"`.
- **Diálogo** `<dialog class="dialog" aria-labelledby>` + `showModal()`; títulos con `tabindex="-1"` que reciben el foco al abrir y al cambiar de paso. Esc cierra; el foco vuelve al origen.
- **Pie** `.footer` (fondo `footer-bg`); foco con `focus-ring-on-dark`.
- **Iconos**: `<span class="icon icon--check" aria-hidden="true">` (máscara CSS, trazo 2 px, hereda color). Phosphor "thin" está retirado.

## 7. Composición de página

Hero centrado (emblema, `.label.eyebrow`, `.display-hero`, `.lead`, dos botones, línea de horario) → sección de tarjetas en `ul[role=list]` con rejilla `repeat(auto-fit, minmax(min(100%, 17.5rem), 1fr))` → cita en `figure/blockquote/figcaption` → equipo sobre `bg-sage` → pie. Los cambios de sección se hacen con bloques de color, no con bordes. Asimetría 2/3 + 1/3, nunca 50/50. Solo la navegación es fija. Sin carruseles, sin degradados salvo el lavado radial salvia→fondo del héroe, sin glassmorfismo en tarjetas o modales. Imágenes cálidas, luz natural, sin saturación fuerte. El emblema nunca se recolorea.

## 8. Lista de verificación antes de entregar

**Automática** (obligatoria): `npm i -D playwright @axe-core/playwright && npx playwright install chromium && node checks/a11y.mjs <tu-pagina.html>` → 0 fallos en los 3 temas a 1280 px y 320 px.

**Manual**:
- [ ] Solo teclado: orden lógico, foco visible y no tapado por la nav, sin trampas, Esc cierra diálogos.
- [ ] Un `h1`, jerarquía continua, landmarks únicos y con nombre.
- [ ] Cada control tiene nombre accesible; enlaces repetidos ("Reservar") se distinguen por contexto.
- [ ] Formularios: etiqueta visible, `autocomplete`, error asociado, foco al primer error.
- [ ] Contraste: no se usó ningún color fuera de los tokens semánticos.
- [ ] Zoom 200 % y ventana de 320 px: sin scroll horizontal ni recortes; espaciado de texto WCAG 1.4.12 tolerado.
- [ ] `prefers-reduced-motion`, oscuro y alto contraste revisados.
- [ ] Imágenes con `alt` correcto; decorativas con `alt=""`.
- [ ] Idioma declarado; sin `href="#"` vacíos; títulos de página únicos y descriptivos.
- [ ] Lector de pantalla (NVDA/VoiceOver) recorre página y diálogo con sentido.

axe detecta solo una parte de los problemas: no declares "accesible" sin la revisión manual.

## 9. Pendientes conocidos

Fotografía real; decisión de idioma de la página; el `README.md` original de la marca es inglés-primario. Reemplaza los retratos marcadores por imágenes con `alt`.
