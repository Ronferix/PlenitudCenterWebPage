# Plenitud Center — instrucciones para Claude Code

Antes de escribir cualquier HTML/CSS/JS de interfaz, **lee `DESIGN.md` completo**. Es la fuente de verdad visual y de accesibilidad (WCAG 2.2 AA).

Reglas que nunca se rompen:
- Carga `design-system/colors_and_type.css` y `design-system/components.css`; no uses Google Fonts ni CDNs de fuentes o iconos.
- Colores solo con tokens semánticos (`var(--fg)`, `var(--brand)`, `var(--border-control)`…). Nada de hex sueltos ni `--sage-600` para texto o botones.
- HTML nativo (`button`, `a`, `dialog`, `fieldset`, `nav`, `main`…) antes que ARIA; nunca `div` clicable.
- Un `h1`, landmarks con nombre, enlace "Saltar al contenido", foco siempre visible, objetivos ≥ 44 px, formularios con etiqueta visible y errores asociados.
- Copia los patrones de `reference/index.html` (menú, diálogo, formulario, tarjetas, tema).
- Antes de dar la tarea por terminada: `node checks/a11y.mjs <página>` debe dar 0 fallos y completa la lista manual de `DESIGN.md` §8. No afirmes que la página es accesible sin ambas cosas.
- Si falta algo (foto, texto, idioma), pregunta o deja un marcador claramente señalado; no inventes datos de contacto ni testimonios.
