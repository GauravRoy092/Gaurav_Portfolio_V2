export const personalInfo = {
  name: 'Gaurav Roy',
  title: 'Robotics Engineer @ GreyOrange',
  tagline: 'Data Analytics · Systems Optimization · Linux',
  location: 'Delhi, India',
  email: 'royg4250@gmail.com',
  phone: '07303528514',
  portfolio: 'gauravroy-portfolio.netlify.app',
  github: 'GauravRoy092',
  linkedin: 'gaurav-roy-6580b222b'
}

export const summary = 'Robotics Engineer at GreyOrange with a strong foundation in data analytics, Linux-based systems optimization, and cross-functional problem solving. Google Certified in Data Analytics. Passionate about leveraging telemetry data and automation to drive operational efficiency at scale. Experienced in building dashboards, analyzing large-scale datasets, and translating raw signals into actionable intelligence that powers better decision-making.'

export const skills = {
  engineering: ['Linux & Ubuntu Systems', 'Robotic Systems Telemetry', 'Log Analytics', 'Backend Systems Integration', 'Data Pipeline Architecture', 'Predictive Maintenance'],
  analytics: ['Excel (Advanced)', 'Power BI', 'SQL', 'Python', 'Google Sheets', 'Exploratory Data Analysis', 'AI Tools'],
  core: ['Cross-functional Collaboration', 'Systems Thinking', 'Strategic Problem Solving', 'Data-Driven Decision Making', 'Technical Communication', 'Agile Workflows']
}

export const experience = [
  {
    company: 'GreyOrange',
    role: 'Robotics Engineer',
    type: 'Full-time',
    location: 'Gurugram, India · Hybrid',
    duration: 'Feb 2026 – Present',
    period: '8 months',
    bullets: [
      'Leveraged Linux-based diagnostic tooling to perform deep analytics on robotic system telemetry, driving measurable improvements in operational throughput and system reliability.',
      'Engineered data pipelines for bot activity log analysis, uncovering behavioral patterns that informed predictive maintenance strategies and improved fleet performance metrics.',
      'Partnered with cross-functional engineering pods to architect seamless analytics integrations into production backend systems, enabling real-time observability across the robotic fleet.'
    ],
    tags: ['Linux', 'Data Analytics', 'Robotics', 'EDA']
  },
  {
    company: 'DotPe',
    role: 'Business Operations Associate',
    type: 'Internship',
    location: 'Gurugram, India · Hybrid',
    duration: 'May 2025 – Nov 2025',
    period: '7 months',
    bullets: [
      'Validated 5,000+ operational records across distributed platforms, implementing data integrity checks that maintained 99%+ accuracy across the pipeline.',
      'Designed and shipped interactive dashboards powered by SQL and Power BI, synthesizing 53,000+ records into actionable business intelligence for leadership.',
      'Delivered data-driven insights that directly influenced operational optimization strategy at scale, contributing to measurable efficiency gains across 1,000+ retail outlets.'
    ],
    tags: ['Power BI', 'SQL', 'Operations', 'Data Validation']
  },
  {
    company: 'Engineers India Limited (EIL)',
    role: 'Vocational Trainee — Data Validation & Systems Support',
    type: 'Training',
    location: 'Gurugram, India',
    duration: 'Apr 2023 – Sept 2023',
    period: '6 months',
    bullets: [
      'Participated in requirements gathering and validation for 5,000+ records across 3 system modules, enhancing data integrity by 10% through systematic quality assurance.',
      'Documented process flows and integration designs for 2 enterprise projects using Jira, preparing clear technical documentation and end-user training materials.',
      'Built strong stakeholder relationships across 10+ internal and external teams, managing tasks independently and demonstrating adaptability in a fast-paced engineering environment.'
    ],
    tags: ['Jira', 'Documentation', 'Data Validation']
  }
]

export const projects = [
  {
    title: 'Consumer Credit Exposure & Portfolio Risk Diagnostics',
    domain: 'Consumer Finance & Credit Risk',
    featured: true,
    date: 'Sept 2026',
    scale: '2.26M+ Loan Records',
    tech: ['Python', 'SQL', 'Plotly', 'Pandas', 'Seaborn', 'ipywidgets', 'Jupyter'],
    githubUrl: 'https://github.com/GauravRoy092/credit_portfolio_exposure',
    image: '/images/projects/credit_risk_heatmap.png',
    summary: 'Analyzed a large-scale, real-world consumer credit dataset (~2.26 million historical loan records) to mathematically isolate core drivers of default risk, volume paradoxes, and capital allocation vulnerabilities.',
    bullets: [
      'Engineered SQL aggregation pipelines across 2.26M+ records, segmenting borrowers into custom income tiers, housing status, and purpose-driven risk cohorts.',
      'Discovered the Volume vs. Risk Paradox: While Debt Consolidation drove origination volumes, Small Business loans exhibited peak default risk with nearly 30% charge-off rates.',
      'Debunked the "Income Insulation Myth": Statistically proved high-income borrowers default at rates comparable to lower-income tiers due to severe debt-to-income (DTI) over-leverage.',
      'Isolated Collateral Discrepancies: Identified that renters exhibit a baseline default rate ~5% higher than active mortgage holders despite securing lower average principal sizes.',
      'Architected an interactive diagnostics dashboard with Plotly Express and ipywidgets featuring dynamic heatmap gradients to evaluate portfolio exposure and charge-off velocity in real time.'
    ],
    insights: [
      {
        title: 'Volume vs. Risk Paradox',
        description: 'Debt Consolidation drove the majority of originations, but Small Business loans showed peak default risk (~30% charge-off).'
      },
      {
        title: 'Income Insulation Myth',
        description: 'High annual income does not proportionally mitigate default risk; elevated DTI leverage caused similar default rates across income tiers.'
      },
      {
        title: 'Collateral Discrepancy',
        description: 'Renters exhibited a baseline default rate ~5% higher than mortgage holders despite borrowing smaller average principal amounts.'
      }
    ],
    phases: [
      {
        phase: 'Phase 1',
        title: 'Data Architecture & SQL Aggregation',
        description: 'Segmented borrowers into income brackets and isolated baseline default percentages across housing collateral with custom SQL querying.'
      },
      {
        phase: 'Phase 2',
        title: 'Exploratory Data Analysis (EDA)',
        description: 'Constructed visual wireframes with Matplotlib & Seaborn, mapping historical macro default distribution and 10-year origination trajectories.',
        image: '/images/projects/origination_volume_trend.png'
      },
      {
        phase: 'Phase 3 & 4',
        title: 'Business Logic & Interactive Dashboard',
        description: 'Transitioned queries into an interactive Plotly Express & ipywidgets dashboard featuring heatmap gradients to highlight capital exposure in real time.',
        image: '/images/projects/credit_risk_heatmap.png'
      }
    ],
    hasDemo: true
  },
  {
    title: 'Inventory Quality & Operations Analytics',
    tech: ['Excel', 'Power BI', 'Data Modeling'],
    date: 'Jan 2024',
    bullets: [
      'Analyzed 53,000+ records (~₹17M in inventory value) to surface 8+ business growth opportunities, translating raw data into clear optimization strategies.',
      'Designed 4 interactive dashboards tracking 18 KPIs, reducing manual reporting overhead by 25% and enabling self-serve analytics for stakeholders.'
    ],
    hasDemo: false
  },
  {
    title: 'Web Data Collection & Automation',
    tech: ['AI Tools', 'Excel', 'Automation'],
    date: 'Jan 2024',
    bullets: [
      'Developed automated data collection workflows using AI-powered tools to aggregate data from 6+ heterogeneous sources, capturing 3,500+ records with minimal manual intervention.',
      'Documented end-to-end solution architecture and data preparation processes, enabling efficient troubleshooting and seamless post-production support.'
    ],
    hasDemo: false
  }
]

export const education = {
  degree: 'B.Tech',
  institution: 'GTBIT, GGSIPU Delhi',
  field: 'Electronics & Communication Engineering (ECE)',
  cgpa: '7.71',
  duration: '2021 – 2025'
}

export const certifications = [
  {
    title: 'Google Data Analytics Professional Certificate',
    issuer: 'Google',
    date: 'Sept 2026',
    credentialUrl: 'https://drive.google.com/file/d/14Zjb03LreuKHPV159e3-3ucDxii6RKds/view?usp=sharing',
    color: '#4285F4'
  }
]
