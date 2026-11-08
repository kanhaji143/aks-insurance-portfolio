# Amit Kumar Shukla — Insurance Portfolio Website

A bilingual (English / Hindi) individual insurance portfolio website built with
React + Vite + Tailwind CSS v4, intended for static hosting on Firebase (Spark plan).

## Stack

- React 19 + Vite 7
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- No backend, no database — all content is data-driven

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
```

## Structure

- `src/content/` — all copy (EN/HI), site settings, insurer calculator links
- `src/components/layout/` — Header, Footer, Container
- `src/components/sections/` — page sections
- `public/` — logo SVG and advisor photo placeholder

## Data rules

- Regulatory designations and insurer tie-ups are NOT published until verified.
- Calculator links live in `src/content/calculators.json`; disabled/missing links stay hidden.
- The advisor photo is a placeholder until an approved image is supplied.
