import { Icon } from './blocks.jsx';

const LINKS = [
  ['About', '#about'],
  ['Resume', '#resume'],
  ['Journey', '#journey'],
  ['Work', '#impact'],
  ['Stack', '#stack'],
  ['Projects', '#projects'],
  ['Contact', '#contact'],
];

export default function Header({ mode, setMode, theme, setTheme }) {
  return (
    <header className="nav">
      <div className="nav-in">
        <a
          className="brand"
          href="#read"
          onClick={(e) => {
            e.preventDefault();
            setMode('read');
          }}
        >
          <span className="mono">PB</span>
          <span className="brand-name">Praveen Bhat</span>
        </a>
        {mode === 'read' && (
          <nav className="nav-links" aria-label="Sections">
            {LINKS.map((l) => (
              <a key={l[1]} href={l[1]}>
                {l[0]}
              </a>
            ))}
          </nav>
        )}
        <div className="nav-tools">
          <div className="seg" role="group" aria-label="Choose a view">
            <button type="button" className={mode === 'read' ? 'on' : ''} aria-pressed={mode === 'read'} onClick={() => setMode('read')}>
              Read
            </button>
            <button type="button" className={mode === 'play' ? 'on' : ''} aria-pressed={mode === 'play'} onClick={() => setMode('play')}>
              Play
            </button>
          </div>
          <button type="button" className="icon-btn" aria-label="Toggle color theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        </div>
      </div>
    </header>
  );
}
