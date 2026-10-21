// All portfolio content lives here. Edit this file to update both the Read and Play views.

export const ME = {
  name: 'Praveen Narayan Bhat',
  role: 'Backend Software Engineer',
  company: 'JPMorgan Chase',
  location: 'Bengaluru, India',
  email: 'bhatpraveen721@gmail.com',
  links: {
    github: 'https://github.com/praveenbhat73',
    linkedin: 'https://www.linkedin.com/in/praveen-bhat-858783203/',
    geeksforgeeks: 'https://auth.geeksforgeeks.org/user/praveen721',
    kaggle: 'https://www.kaggle.com/praveennbhat/code',
    resume: 'https://drive.google.com/file/d/1w1x4eN0pBpqb5ZRfcght3emsv77sd4iw/view?usp=sharing',
  },
};

export const CASES = [
  {
    id: 'invoice',
    title: 'Invoice processing pipeline',
    tag: 'Data pipelines',
    metric: { value: 'Lakhs', label: 'of invoices' },
    problem: 'Invoices arrive in lakhs and have to be processed with low latency.',
    architecture:
      'Event-driven and asynchronous. Kafka streams the events between stages and AWS S3 provides storage.',
    stack: ['Java', 'Spring Boot', 'Kafka', 'AWS S3', 'MongoDB'],
    scale: 'Lakhs of invoices.',
    impact:
      'Low-latency, high-throughput processing. I tuned the MongoDB query and processing logic to keep reads and writes efficient at that volume.',
  },
  {
    id: 'batch',
    title: '1.5M-record batch system',
    tag: 'Distributed systems',
    metric: { value: '1.5M+', label: 'records' },
    problem:
      'Process 1.5M+ records reliably while many workers write to MongoDB at the same time.',
    architecture:
      'A scheduler framework triggers the work, concurrent workers process it, and Kafka distributes the load.',
    stack: ['Java', 'Scheduler framework', 'Concurrency', 'Kafka', 'MongoDB'],
    scale: '1.5M+ records.',
    impact:
      'Resolved MongoDB write conflicts and shutdown errors and cut the error rate to near zero. Teammates now use the approach as a reference.',
  },
  {
    id: 'stream',
    title: 'Streaming-first APIs',
    tag: 'Performance',
    metric: { value: '10s → 2s', label: 'for 3K records' },
    problem: 'Buffering and blocking calls slowed API responses.',
    architecture:
      'REST APIs redesigned to stream results, and synchronous services converted to a fully non-blocking reactive design.',
    stack: ['Java', 'Spring WebFlux', 'Reactive programming', 'REST APIs'],
    scale: '3K-record requests, with processing logic optimized across 1.2M+ records.',
    impact: '80% faster, a 5x speedup, by removing buffering and the major bottlenecks.',
  },
  {
    id: 'erp',
    title: 'ERP interface layer and payments',
    tag: 'Platform',
    metric: { value: 'HA', label: 'on Kubernetes' },
    problem:
      'ERP platforms needed a dependable support layer, and payment flows need secure, high-volume handling.',
    architecture:
      'A reactive Java ERP interface layer deployed on Kubernetes, and microservices behind the payments backend.',
    stack: ['Java', 'Spring Boot', 'Kubernetes', 'Microservices'],
    scale: 'High-volume transaction processing.',
    impact:
      'High availability and fault tolerance for the ERP layer. The payments backend is being built to be secure and scalable.',
  },
  {
    id: 'reliab',
    title: 'Testing, observability and resilience',
    tag: 'Reliability',
    metric: { value: '3 tools', label: 'Grafana, Dynatrace, Splunk' },
    problem: 'Production systems need proof they hold up, and a warning when they do not.',
    architecture:
      'JUnit tests judged by mutation coverage, dashboards, logs and alerts across the project, and chaos experiments on production systems.',
    stack: ['JUnit', 'Grafana', 'Dynatrace', 'Splunk', 'Chaos engineering'],
    scale: 'The whole project.',
    impact:
      'Failures surface early through alerts, tests catch what line coverage misses, and resilience is checked before an outage does it for us.',
  },
  {
    id: 'agent',
    title: 'Deployment automation with AI agents',
    tag: 'AI and automation',
    metric: { value: 'Manual → auto', label: 'deployment reports' },
    problem: 'Deployments and health checks were done by hand.',
    architecture:
      'An event-driven workflow captures deployment snapshots and tech health checks, then emails the right audience automatically.',
    stack: ['Python', 'AI agents'],
    scale: 'Deployment and health-check reporting.',
    impact: 'Replaced a manual process and cut manual hours.',
  },
  {
    id: 'fullstack',
    title: 'Full-stack features on an internal UI platform',
    tag: 'Full-stack',
    metric: { value: 'React', label: '+ Spring Boot' },
    problem: 'An internal UI platform needed new features that span the front end and the backend.',
    architecture: 'A React front end on top of Spring Boot services, built and shipped end to end.',
    stack: ['React', 'JavaScript', 'Spring Boot', 'Java', 'REST APIs'],
    scale: 'An internal UI platform.',
    impact: 'Delivered full-stack features with UI/UX principles applied to improve usability.',
  },
];

export const SKILLS = [
  {
    group: 'Backend and architecture',
    wide: true,
    items: [
      'Spring Boot', 'Spring WebFlux', 'Reactive programming', 'REST APIs', 'API design',
      'Backend services', 'Microservices', 'Distributed systems', 'Event-driven architecture',
      'Asynchronous processing', 'System design',
    ],
  },
  { group: 'Languages', items: ['Java', 'Python', 'SQL', 'JavaScript'] },
  { group: 'Messaging and data', items: ['Apache Kafka', 'MongoDB', 'SQL', 'AWS S3'] },
  {
    group: 'Cloud and DevOps',
    items: ['Kubernetes', 'Docker', 'CI/CD (Jenkins)', 'Git', 'GitHub', 'Chaos engineering', 'High availability', 'Fault tolerance'],
  },
  { group: 'Observability', items: ['Grafana', 'Dynatrace', 'Splunk', 'Monitoring', 'Logging', 'Alerting'] },
  { group: 'Testing', items: ['JUnit', 'Unit testing', 'Mutation coverage'] },
  { group: 'Frontend and full-stack', wide: true, items: ['React', 'Redux', 'JavaScript', 'HTML', 'CSS', 'Material UI', 'REST integration', 'Responsive design'] },
  { group: 'AI and ML', wide: true, items: ['Python', 'AI/ML agents', 'Machine learning', 'Deep learning', 'Computer vision'] },
  { group: 'Core CS', items: ['Data structures and algorithms', 'Operating systems', 'Computer networks'] },
];

export const EXPLORING = [
  'Python frameworks', 'AI and ML agents', 'Generative AI and LLMs', 'RAG',
  'LangChain', 'LlamaIndex', 'MLflow', 'Model Context Protocol',
];

export const PROJECTS = [
  {
    name: 'Cineflicks',
    desc: 'A movie browsing app with a voice assistant, so you can find films by talking to it.',
    tags: ['React', 'Redux', 'Material UI', 'Alan AI'],
    links: [
      { label: 'Live demo', href: 'https://cineflicks.vercel.app/' },
      { label: 'Code', href: 'https://github.com/praveenbhat73/Cineflicks' },
    ],
  },
  {
    name: 'Self-driving AI car',
    desc: 'A deep learning driving simulation that uses computer vision to steer.',
    tags: ['Python', 'Deep learning', 'Computer vision'],
    links: [{ label: 'Code', href: 'https://github.com/praveenbhat73/self_driving_car' }],
  },
  {
    name: 'NFT marketplace',
    desc: 'A Web3 marketplace where users mint, buy and sell NFTs. Published as a research paper.',
    tags: ['React', 'Solidity', 'Ethereum'],
    links: [],
  },
];

export const REPOS = [
  { name: 'system_design_arena', lang: 'TypeScript' },
  { name: 'enIgmA', lang: 'TypeScript' },
  { name: 'fullstack_dashboard', lang: 'JavaScript' },
  { name: 'social', lang: 'JavaScript' },
];

export const AWARDS = [
  { title: 'Rising Star Award', note: 'JPMorgan Chase' },
  { title: 'SEP Recognition Award', note: 'JPMorgan Chase' },
  { title: 'Finalist, Code For Good Hackathon', note: 'JPMorgan Chase' },
  { title: 'Top 10 performer in college', note: 'CGPA 9.56 / 10' },
  { title: 'Published research paper', note: 'NFT marketplaces, Web3 and blockchain' },
];

export const CERTS = ['Kafka Event Driven Architecture', 'Java Reactive Programming', 'Machine Learning'];

export const JOURNEY = [
  {
    when: 'Jan 2024 to now',
    title: 'Software Engineer',
    org: 'JPMorgan Chase, Bengaluru',
    bullets: [
      'Building secure, high-volume payment systems backends with reactive Java and microservices.',
      'Designed the Kafka and MongoDB pipeline behind 1.5M+ records and lakhs of invoices.',
      'Cut API processing from 10s to 2s with a streaming-first design.',
      'Set up Grafana, Dynatrace and Splunk observability with alerting across the project.',
      'Delivered full-stack features with React and Spring Boot for an internal UI platform.',
      'Built a Python AI-agent tool that automates deployment snapshots and health-check emails.',
    ],
  },
  {
    when: '2020 to 2024',
    title: 'B.E. in Computer Science',
    org: 'National Institute of Engineering, Mysore',
    note: 'CGPA 9.56 / 10. Top 10 performer in college.',
  },
  {
    when: '2018 to 2020',
    title: 'Pre-University in Science',
    org: 'SSLS PU College, Alike',
    note: '95%',
  },
];

// Buildings in the Play view. `x` and `y` are positions in the game world.
export const STATIONS = [
  { id: 'base', name: 'Base camp', kicker: 'About me', icon: '🏕️', color: '#4F7CFF', x: 280, y: 700 },
  { id: 'plant', name: 'Pipeline plant', kicker: 'Data pipelines at scale', icon: '🏭', color: '#F0712F', x: 640, y: 330 },
  { id: 'reactor', name: 'Reactor lab', kicker: 'Speed, ERP and payments', icon: '⚡', color: '#8B5CF6', x: 1100, y: 250 },
  { id: 'watch', name: 'Watchtower', kicker: 'Reliability and automation', icon: '🔭', color: '#14B8A6', x: 1560, y: 330 },
  { id: 'forge', name: 'Skill forge', kicker: 'Toolbox', icon: '🔨', color: '#E39B12', x: 1920, y: 700 },
  { id: 'arcade', name: 'Project arcade', kicker: 'Things I built', icon: '🕹️', color: '#EC4899', x: 1560, y: 1070 },
  { id: 'trophy', name: 'Trophy hall', kicker: 'Awards and education', icon: '🏆', color: '#D4A017', x: 1100, y: 1150 },
  { id: 'contact', name: 'Contact portal', kicker: 'Say hello', icon: '📡', color: '#0EA5E9', x: 640, y: 1070 },
];
