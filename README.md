# Dev Gothi — Portfolio

A static portfolio site (HTML/CSS/JS, no build step). The animations use GSAP + ScrollTrigger + SplitText and Lenis smooth scroll, vendored in `assets/vendor/`.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Deploy by pointing Vercel / Netlify / GitHub Pages at the repo root. There is no build step.

## Structure

| Path | What |
| --- | --- |
| `index.html` | Home: desk-scene hero (every object is a link) → laptop that opens and launches the projects → SafeSpace & Retail Vision cards → About → Life → contact. Both case studies live in `<template>` tags at the bottom and open full-screen over the page (deep links: `#safespace`, `#retail-vision`). |
| `assets/css/style.css` | All styles (tokens at the top) |
| `assets/js/main.js` | Sidebar pill, pink cursor + labels, hero entrance, laptop fly-out, card stacking, case-study overlay, reveals |
| `assets/img/hero-desk.webp` | Hero scene. Hotspot positions are percentages of this image — re-check them if you swap it. |
| `assets/me/dev.webp` | About Me photo |
| `assets/work/` | Retail Vision screens exported from the Figma file |

## Add your photography

Drop your photos into `assets/photos/` as `01.jpg` … `05.jpg` (portrait crops look best).
They appear as the polaroids in the Life section; until then the polaroids show warm tinted placeholders.
