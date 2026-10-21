import { useState, useEffect } from 'react';
import { ME, CASES, SKILLS, EXPLORING, PROJECTS, REPOS, AWARDS, CERTS, JOURNEY } from '../data.js';

const ICONS = {
  github: (
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  mail: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  arrow: <path d="M5 12h14M12 5l7 7-7 7" />,
  download: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  ext: <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  play: <polygon points="6 3 20 12 6 21 6 3" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  award: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.48 12.89L17 22l-5-3-5 3 1.52-9.11" />
    </>
  ),
  pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
};

export function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return;
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return reduced;
}

export function ExternalLink({ href, children }) {
  return (
    <a className="link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <Icon name="ext" size={14} />
    </a>
  );
}

export function ResumeBlock() {
  return (
    <div className="resume-card">
      <div>
        <h3>Download my resume</h3>
        <p>View my experience, skills and education.</p>
      </div>
      <a className="btn primary" href={ME.links.resume} target="_blank" rel="noopener noreferrer">
        <Icon name="download" />
        Download resume
      </a>
    </div>
  );
}

export function Chips({ items }) {
  return (
    <ul className="chips">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

export function CaseDetail({ c }) {
  return (
    <article className="case">
      <header className="case-head">
        <div>
          <span className="tag">{c.tag}</span>
          <h3>{c.title}</h3>
        </div>
        <div className="metric">
          <b>{c.metric.value}</b>
          <span>{c.metric.label}</span>
        </div>
      </header>
      <dl className="rows">
        <div>
          <dt>Problem</dt>
          <dd>{c.problem}</dd>
        </div>
        <div>
          <dt>Architecture</dt>
          <dd>{c.architecture}</dd>
        </div>
        <div>
          <dt>Scale</dt>
          <dd>{c.scale}</dd>
        </div>
        <div>
          <dt>Impact</dt>
          <dd>{c.impact}</dd>
        </div>
      </dl>
      <Chips items={c.stack} />
    </article>
  );
}

export function CaseList({ ids }) {
  return (
    <div className="case-list">
      {ids.map((id) => (
        <CaseDetail key={id} c={CASES.find((x) => x.id === id)} />
      ))}
    </div>
  );
}

export function SkillsGrid() {
  return (
    <div className="bento">
      {SKILLS.map((g) => (
        <section key={g.group} className={'bento-card' + (g.wide ? ' wide' : '')}>
          <h3>{g.group}</h3>
          <Chips items={g.items} />
        </section>
      ))}
    </div>
  );
}

export function ProjectCards() {
  return (
    <>
      <div className="project-grid">
        {PROJECTS.map((p) => (
          <article key={p.name} className="project-card">
            <h3>{p.name}</h3>
            <p>{p.desc}</p>
            <Chips items={p.tags} />
            {p.links.length > 0 && (
              <div className="links">
                {p.links.map((l) => (
                  <ExternalLink key={l.href} href={l.href}>
                    {l.label}
                  </ExternalLink>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      <h3 className="sub">More on GitHub</h3>
      <div className="repo-grid">
        {REPOS.map((r) => (
          <a key={r.name} className="repo" href={ME.links.github + '/' + r.name} target="_blank" rel="noopener noreferrer">
            <b>{r.name}</b>
            <span>{r.lang}</span>
          </a>
        ))}
      </div>
    </>
  );
}

export function AwardsBlock() {
  return (
    <div className="award-grid">
      {AWARDS.map((a) => (
        <div className="award" key={a.title}>
          <span className="award-ic">
            <Icon name="award" size={20} />
          </span>
          <div>
            <b>{a.title}</b>
            <p>{a.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecognitionBlock() {
  return (
    <div className="stack-blocks">
      <AwardsBlock />
      <h3 className="sub">Education</h3>
      <ul className="plain">
        {JOURNEY.filter((j) => !j.bullets).map((j) => (
          <li key={j.title}>
            <b>{j.title}</b>, {j.org}. {j.when}. {j.note}
          </li>
        ))}
      </ul>
      <h3 className="sub">Certifications</h3>
      <Chips items={CERTS} />
    </div>
  );
}

export function AboutBlock() {
  return (
    <div className="about-block">
      <p>
        I'm a backend engineer at {ME.company} in {ME.location}. I work on payment systems and high-volume data pipelines in Java, and I like problems where concurrency, messaging and databases all have to agree with each other.
      </p>
      <p>Backend is my main focus, but I'm comfortable across the stack. I've built React front ends and full-stack features, and I work with Python, machine learning and AI agents that take over the manual parts of engineering work.</p>
      <h3 className="sub">Now exploring</h3>
      <Chips items={EXPLORING} />
    </div>
  );
}

export function ContactBlock() {
  return (
    <div className="contact-block">
      <p>I'm open to backend-first roles, including full-stack and AI/ML work. Email is the fastest way to reach me.</p>
      <div className="links big">
        <a className="btn primary" href={'mailto:' + ME.email}>
          <Icon name="mail" />
          {ME.email}
        </a>
        <a className="btn" href={ME.links.linkedin} target="_blank" rel="noopener noreferrer">
          <Icon name="linkedin" />
          LinkedIn
        </a>
        <a className="btn" href={ME.links.github} target="_blank" rel="noopener noreferrer">
          <Icon name="github" />
          GitHub
        </a>
      </div>
    </div>
  );
}
