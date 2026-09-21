import { useState, useEffect, useRef } from 'react';
import { PipelineGame } from '../game/engine.js';
import { STATIONS, ME } from '../data.js';
import {
  Icon, AboutBlock, CaseList, SkillsGrid, ProjectCards, RecognitionBlock, ContactBlock, usePrefersReducedMotion,
} from './blocks.jsx';

const BODY = {
  base: () => <AboutBlock />,
  plant: () => <CaseList ids={['invoice', 'batch']} />,
  reactor: () => <CaseList ids={['stream', 'erp']} />,
  watch: () => <CaseList ids={['reliab', 'agent']} />,
  forge: () => (
    <>
      <SkillsGrid />
      <h3 className="sub">Full-stack work</h3>
      <CaseList ids={['fullstack']} />
    </>
  ),
  arcade: () => <ProjectCards />,
  trophy: () => <RecognitionBlock />,
  contact: () => <ContactBlock />,
};

function fmtRecords(n) {
  if (n === 12) return '1.5M';
  if (n === 0) return '0';
  return n * 125 + 'K';
}

function Finale({ full, onRead, onKeep }) {
  return (
    <div className="finale">
      <p>
        You opened every station
        {full ? ' and collected all 12 record chips, so you processed 1.5M records, the same scale as the real batch system.' : '.'}
      </p>
      <p>{full ? 'No write conflicts left.' : 'There are still record chips out there if you want the full 1.5M.'}</p>
      <div className="links big">
        <a className="btn primary" href={'mailto:' + ME.email}>
          <Icon name="mail" />
          Email me
        </a>
        <button type="button" className="btn" onClick={onRead}>
          Read the full story
        </button>
        <button type="button" className="btn" onClick={onKeep}>
          Keep exploring
        </button>
      </div>
    </div>
  );
}

export default function Game({ onExit }) {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef(null);
  const miniRef = useRef(null);
  const joyRef = useRef(null);
  const knobRef = useRef(null);
  const closeRef = useRef(null);
  const engine = useRef(null);
  const toastTimer = useRef(0);
  const [hud, setHud] = useState({ found: [], records: 0, nearId: null });
  const [panel, setPanel] = useState(null);
  const [intro, setIntro] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const g = new PipelineGame(
      canvasRef.current,
      miniRef.current,
      {
        onState: (s) => setHud(s),
        onOpen: (id) => {
          setDrawer(false);
          setPanel({ id: id });
        },
        onToast: (m) => {
          setToast(m);
          clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(() => setToast(''), 2600);
        },
        onFinale: (info) => {
          setDrawer(false);
          setPanel({ finale: true, full: info.full });
        },
      },
      { reduced: reduced }
    );
    engine.current = g;
    g.start();
    return () => {
      g.stop();
      clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (engine.current) engine.current.setUiLock(intro);
  }, [intro]);

  useEffect(() => {
    if (panel && closeRef.current) closeRef.current.focus();
  }, [panel]);

  const closePanel = () => {
    setPanel(null);
    if (engine.current) engine.current.closeStation();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (panel) closePanel();
      else if (drawer) setDrawer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel, drawer]);

  const travel = (id) => {
    setIntro(false);
    setDrawer(false);
    engine.current.travel(id);
  };

  const joyMove = (e) => {
    const r = joyRef.current.getBoundingClientRect();
    const m = (r.width / 2) * 0.8;
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > m) {
      dx = (dx / d) * m;
      dy = (dy / d) * m;
    }
    engine.current.setJoystick(dx / m, dy / m);
    knobRef.current.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  };
  const joyEnd = () => {
    if (engine.current) engine.current.setJoystick(0, 0);
    if (knobRef.current) knobRef.current.style.transform = '';
  };

  const near = hud.nearId ? STATIONS.find((s) => s.id === hud.nearId) : null;
  const station = panel && panel.id ? STATIONS.find((s) => s.id === panel.id) : null;
  const Body = station ? BODY[station.id] : null;
  const stationPct = (hud.found.length / STATIONS.length) * 100;
  const recordPct = (hud.records / 12) * 100;

  return (
    <section className="game" aria-label="Pipeline quest, a playable version of this portfolio">
      <canvas ref={canvasRef} className="cv" aria-hidden="true" onClick={(e) => engine.current.tap(e.clientX, e.clientY)} />

      <div className="hud" aria-live="polite">
        <div className="hud-card">
          <span>
            Stations <b>{hud.found.length}/{STATIONS.length}</b>
          </span>
          <i className="bar">
            <u style={{ width: stationPct + '%' }} />
          </i>
        </div>
        <div className="hud-card">
          <span>
            Records <b>{fmtRecords(hud.records)}</b> / 1.5M
          </span>
          <i className="bar gold">
            <u style={{ width: recordPct + '%' }} />
          </i>
        </div>
      </div>

      <div className="hud-r">
        <button type="button" className="glass-btn" aria-expanded={drawer} onClick={() => setDrawer(!drawer)}>
          <Icon name="list" size={16} />
          Stations
        </button>
        <canvas ref={miniRef} className="mini" width="192" height="124" aria-hidden="true" />
      </div>

      <div
        ref={joyRef}
        className="joy"
        aria-label="Movement joystick"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          joyMove(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons) joyMove(e);
        }}
        onPointerUp={joyEnd}
        onPointerCancel={joyEnd}
      >
        <div ref={knobRef} className="knob" />
      </div>
      <p className="keys">Arrow keys or WASD to move. E to open.</p>

      {near && !panel && !intro && (
        <button type="button" className="act" onClick={() => engine.current.openStation(near.id)}>
          Open {near.name}
          <Icon name="arrow" size={16} />
        </button>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      {drawer && (
        <div className="drawer">
          <h2>Jump to a station</h2>
          <ul>
            {STATIONS.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => travel(s.id)}>
                  <span>
                    {s.icon} {s.name}
                  </span>
                  {hud.found.indexOf(s.id) !== -1 && <Icon name="check" size={16} />}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="drawer-skip" onClick={onExit}>
            Read it instead
          </button>
        </div>
      )}

      {panel && <div className="scrim" onClick={closePanel} />}
      {panel && (
        <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
          <header className="sheet-head">
            <div>
              <h2 id="sheet-title">{station ? station.name : 'Quest complete'}</h2>
              <p>{station ? station.kicker : 'Every station discovered'}</p>
            </div>
            <button ref={closeRef} type="button" className="icon-btn" aria-label="Close" onClick={closePanel}>
              <Icon name="close" />
            </button>
          </header>
          <div className="sheet-body">
            {station && <Body />}
            {panel.finale && <Finale full={panel.full} onRead={onExit} onKeep={closePanel} />}
          </div>
        </section>
      )}

      {intro && (
        <div className="intro">
          <div className="intro-card">
            <h2>Pipeline quest</h2>
            <p>Each building holds part of my work. Walk to its door to open it.</p>
            <ul>
              <li>
                <span className="lg gold" />
                Collect the record chips. Twelve of them make 1.5M records.
              </li>
              <li>
                <span className="lg red" />
                Dodge the 409 write conflicts. A hit sends a chip back to its spot.
              </li>
              <li>
                <span className="lg mint" />
                Open all 8 stations to finish.
              </li>
            </ul>
            <div className="links big">
              <button type="button" className="btn primary" onClick={() => setIntro(false)}>
                Start
              </button>
              <button type="button" className="btn" onClick={onExit}>
                Read it instead
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
