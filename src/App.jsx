import { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Read from './components/Read.jsx';
import Game from './components/Game.jsx';

function initialTheme() {
  try {
    const saved = localStorage.getItem('pb-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (e) {}
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [mode, setMode] = useState(() => (window.location.hash === '#play' ? 'play' : 'read'));
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('pb-theme', theme);
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle('playing', mode === 'play');
    try {
      window.history.replaceState(null, '', mode === 'play' ? '#play' : '#read');
    } catch (e) {}
    if (mode === 'read') window.scrollTo(0, 0);
  }, [mode]);

  return (
    <>
      <Header mode={mode} setMode={setMode} theme={theme} setTheme={setTheme} />
      {mode === 'read' ? <Read onPlay={() => setMode('play')} /> : <Game onExit={() => setMode('read')} />}
    </>
  );
}
