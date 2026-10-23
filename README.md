# Cinemacity Starlight — The Brand House

A standalone static brandbook. HTML, CSS, JavaScript, original photography and vector identity assets. No build command, backend, login or platform runtime is required.

## Publish on GitHub Pages

1. Upload the complete contents of this folder to the repository root. Keep the `assets/` folder and its nested `brand-kit/` directory intact.
2. In repository Settings → Pages, choose **Deploy from a branch**.
3. Select `main` and `/ (root)`, then Save.
4. Wait for the Pages deployment. Open the exact published URL shown by GitHub.

GitHub Pages availability depends on the repository visibility and account plan. On GitHub Free it is available for public repositories; private repositories require an eligible paid plan. See https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

A custom domain can be configured after ownership and DNS access are established. No custom domain is claimed by this package.

## Entry points

- `index.html`: continuous cinematic brand journey, dark/light modes, grain and motion controls.
- `assets.html`: original logos, solid colours and patterns, with SVG downloads.
- `handbook.html`: online handbook.

Use `assets.html#patterns` to link directly to the selected patterns. This package uses relative paths, so it also works below a GitHub Pages project path. Use the `.html` entry points when hosting on GitHub Pages.

## Assets and editing

The essentials ZIP contains exactly22SVGs. The selected Art Deco patterns are02,04,08,09. Each includes two colour fields and a transparent repeat tile. The unfinished PDF and Illustrator masters are intentionally absent.

The existing font license is preserved at `assets/BodoniModa-OFL.txt`. Native logos, photography, generated application concepts and all other brand assets remain the property of their respective rights holders. No general reuse licence is granted by publication of this repository.

Edit the files directly; no installation step is required. For a local preview, serve this folder with any static HTTP server, for example `python -m http.server 8080`, then open `http://localhost:8080/`.
