import { useState } from 'react';
import { ME, CASES, JOURNEY } from '../data.js';
import {
  Icon, Chips, CaseDetail, SkillsGrid, ProjectCards, AwardsBlock, AboutBlock, ContactBlock, usePrefersReducedMotion,
} from './blocks.jsx';

function Section({ id, title, lead, children }) {
  return (
    <section className="section" id={id}>
      <div className="container">
        <div className="section-head">
          <h2>{title}</h2>
          {lead && <p>{lead}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function PipelineViz({ reduced }) {
  const nodes = [
    { x: 8, name: 'Scheduler', sub: 'triggers' },
    { x: 136, name: 'Kafka', sub: 'streams' },
    { x: 264, name: 'Workers', sub: 'concurrent' },
    { x: 392, name: 'MongoDB', sub: 'persists' },
  ];
  const dots = [0, 0.8, 1.6, 2.4, 3.2];
  return (
    <svg className="viz" viewBox="0 0 480 170" role="img" aria-label="A scheduler triggers work, Kafka streams it, concurrent workers process it and MongoDB stores the result">
      <path d="M8 85 H472" className="track" />
      {dots.map((d, i) =>
        reduced ? (
          <circle key={i} cx={60 + i * 90} cy="85" r="4.5" className="dot" />
        ) : (
          <circle key={i} cx="0" cy="0" r="4.5" className="dot">
            <animateMotion dur="4s" begin={'-' + d + 's'} repeatCount="indefinite" path="M8 85 H472" />
          </circle>
        )
      )}
      {nodes.map((n) => (
        <g key={n.name}>
          <rect x={n.x} y="59" width="80" height="52" rx="14" className="node" />
          <text x={n.x + 40} y="82" textAnchor="middle" className="node-t">
            {n.name}
          </text>
          <text x={n.x + 40} y="99" textAnchor="middle" className="node-s">
            {n.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Hero({ onPlay }) {
  const reduced = usePrefersReducedMotion();
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="status">
            <span className="dot-live" />
            Open to backend-first and full-stack roles
          </p>
          <h1>Backend engineer building systems that keep up with millions of records.</h1>
          <p className="lead">
            I'm Praveen. Mainly backend: at {ME.company} I design event-driven Java services, Kafka pipelines and reactive APIs. I also build React front ends and Python AI/ML agents.
          </p>
          <ul className="focus" aria-label="Areas of work">
            <li className="main">Backend, main focus</li>
            <li>React and full-stack</li>
            <li>AI and ML agents</li>
          </ul>
          <div className="cta">
            <button type="button" className="btn primary" onClick={onPlay}>
              <Icon name="play" size={16} />
              Play the portfolio
            </button>
            <a className="btn" href="#impact">
              Read my work
              <Icon name="arrow" size={16} />
            </a>
          </div>
          <div className="hero-meta">
            <span>
              <Icon name="pin" size={16} />
              {ME.location}
            </span>
            <a href={ME.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Icon name="github" size={18} />
            </a>
            <a href={ME.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Icon name="linkedin" size={18} />
            </a>
            <a href={'mailto:' + ME.email} aria-label="Email">
              <Icon name="mail" size={18} />
            </a>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-top">
            <b>How a 1.5M-record run flows</b>
            <span>live</span>
          </div>
          <PipelineViz reduced={reduced} />
          <div className="tiles">
            <div>
              <b>1.5M+</b>
              <span>records in one scheduled system</span>
            </div>
            <div>
              <b>10s → 2s</b>
              <span>API time for 3K records</span>
            </div>
            <div>
              <b>≈ 0</b>
              <span>write-conflict errors after my fix</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <Section id="about" title="About" lead="What I do and what I care about.">
      <div className="about-grid">
        <AboutBlock />
        <aside className="facts">
          <dl>
            <div>
              <dt>Role</dt>
              <dd>Software Engineer, {ME.company}</dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>2.5+ years, since January 2024</dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>Backend and distributed systems, plus React and AI/ML</dd>
            </div>
            <div>
              <dt>Education</dt>
              <dd>B.E. Computer Science, CGPA 9.56 / 10</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{ME.location}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </Section>
  );
}

function Journey() {
  return (
    <Section id="journey" title="Journey" lead="From school to production systems.">
      <ol className="timeline">
        {JOURNEY.map((j) => (
          <li key={j.title} className="tl-item">
            <div className="tl-when">{j.when}</div>
            <div className="tl-card">
              <h3>{j.title}</h3>
              <p className="tl-org">{j.org}</p>
              {j.note && <p>{j.note}</p>}
              {j.bullets && (
                <ul className="ticks">
                  {j.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Impact() {
  const [active, setActive] = useState(CASES[0].id);
  const current = CASES.find((c) => c.id === active);
  return (
    <Section id="impact" title="Selected work" lead="Seven pieces of work at JPMorgan Chase, from the problem to the result.">
      <div className="impact">
        <div className="tabs" role="tablist" aria-label="Case studies">
          {CASES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active === c.id}
              className={'tab' + (active === c.id ? ' on' : '')}
              onClick={() => setActive(c.id)}
            >
              <span>{c.title}</span>
              <small>{c.tag}</small>
            </button>
          ))}
        </div>
        <div role="tabpanel">
          <CaseDetail c={current} />
        </div>
      </div>
    </Section>
  );
}

function Recognition() {
  return (
    <Section id="recognition" title="Recognition" lead="Awards and certifications.">
      <AwardsBlock />
      <h3 className="sub">Certifications</h3>
      <Chips items={['Kafka Event Driven Architecture', 'Java Reactive Programming', 'Machine Learning']} />
    </Section>
  );
}

export default function Read({ onPlay }) {
  return (
    <main className="read">
      <Hero onPlay={onPlay} />
      <About />
      <Journey />
      <Impact />
      <Section id="stack" title="Tech stack" lead="What I work with, grouped by the job it does.">
        <SkillsGrid />
      </Section>
      <Section id="projects" title="Projects" lead="Things I built outside of work.">
        <ProjectCards />
      </Section>
      <Recognition />
      <section className="section" id="contact">
        <div className="container">
          <div className="cta-card">
            <h2>Let's build something that scales.</h2>
            <ContactBlock />
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="container">
          <span>{ME.name}, {ME.location}</span>
          <button type="button" className="link-btn" onClick={onPlay}>
            Play the portfolio
          </button>
        </div>
      </footer>
    </main>
  );
}
