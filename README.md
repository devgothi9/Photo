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
| `index.html` | Home: Dev's portrait with his experience pinned around it → About (skills, roots) → laptop that opens and launches the projects → SafeSpace & Retail Vision cards → Life (photography) → contact. Both case studies live in `<template>` tags at the bottom and open full-screen over the page (deep links: `#safespace`, `#retail-vision`). |
| `assets/css/style.css` | All styles (tokens at the top) |
| `assets/js/main.js` | Sidebar pill, pink cursor + labels, photo-wall entrance and parallax, lightbox, laptop fly-out, card stacking, case-study overlay, About tilt, reveals |
| `assets/photos/sm`, `assets/photos/lg` | Dev's photographs (from the devphotography repo) as WebP: small for the page, large for the lightbox |
| `assets/me/dev.webp` | About Me photo |
| `assets/work/` | Retail Vision screens exported from the Figma file |
