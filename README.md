# Praveen Narayan Bhat: portfolio (React + Vite)

Two views of the same content:

- **Read**: a modern, sectioned portfolio (hero, about, journey, selected work, tech stack, projects, recognition, contact).
- **Play**: "Pipeline quest", a small canvas game. Walk to each building to open a part of the portfolio.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build locally
```

Open `http://localhost:5173/#play` to land straight in the game.

## Edit your content

Everything you see lives in **`src/data.js`**: work cases, skills, projects, awards, journey and the game buildings. Both views read from it, so one edit updates both.

## Structure

```
src/
  data.js                  all content
  App.jsx                  view switch and theme
  styles.css               design tokens, light and dark themes
  components/
    Header.jsx             nav, Read/Play switch, theme toggle
    Read.jsx               the sectioned portfolio
    Game.jsx               game UI: HUD, joystick, panels
    blocks.jsx             shared pieces (cases, skills, projects...)
  game/engine.js           canvas game engine, no React inside
```

## Deploy

- **Vercel**: import the repo, framework preset "Vite". No other settings.
- **GitHub Pages / Netlify**: build with `npm run build` and publish `dist/`.

## Using Next.js instead

The components are plain React. To move to Next.js, copy `src/` into your app, add `'use client'` at the top of `App.jsx`, `Game.jsx`, `Read.jsx` and `Header.jsx`, and import `styles.css` in `app/layout.js`.
