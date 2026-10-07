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
| `index.html` | Home: clay shelf hero → laptop that opens and launches the project cards → stacked project cards → about (photo fan, journey) → contact |
| `work/*.html` | Case studies: SafeSpace, Retail Vision, Photography |
| `assets/css/style.css` | All styles (tokens at the top) |
| `assets/js/main.js` | Sidebar pill, pink cursor + "Click to Open", hero pop-in, laptop fly-out, card stacking, photo fan, reveals |
| `assets/work/` | Retail Vision screens exported from the Figma file |
| `assets/img/desk.svg` | Desk illustration under the shelf |

## Add your photos

Put a photo of yourself at `assets/me/dev.jpg` (portrait crop). It goes in the centre of the About Me photo fan; until then a DG monogram shows there.


Drop your photos into `assets/photos/` named `01.jpg` … `09.jpg` (portrait crops look best for 01–05).
They show up automatically in the About photo fan, the "Life Behind the Lens" strip and the Photography card.
Until then, those frames show tinted placeholders.
