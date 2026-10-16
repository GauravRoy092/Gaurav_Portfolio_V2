import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_COMMANDS = {
  status: {
    command: 'claude status --target=fleet',
    title: 'Fleet Status & Role',
    output: [
      { type: 'comment', text: '# Fetching active system profile for Gaurav Roy...' },
      { type: 'success', text: '● Identity: Gaurav Roy — Robotics Engineer @ GreyOrange' },
      { type: 'info', text: '  ├─ Domain: Autonomous Mobile Robots (AMR) & Industrial Automation' },
      { type: 'info', text: '  ├─ Focus: Linux Diagnostic Tooling, Fleet Telemetry, Systems Optimization' },
      { type: 'info', text: '  ├─ Location: Gurugram / Delhi, India' },
      { type: 'info', text: '  └─ Google Certified: Professional Data Analytics (Sept 2026)' },
      { type: 'meta', text: 'Status: 🟢 Production systems operational · 21+ months telemetry experience' },
    ],
    tokens: 142,
    latency: '34ms',
  },
  telemetry: {
    command: 'claude run telemetry-pipeline --diagnostics',
    title: 'Robotics Telemetry',
    output: [
      { type: 'comment', text: '# Inspecting GreyOrange bot telemetry log analytics pipeline...' },
      { type: 'success', text: '✓ Telemetry Stream: Linux/Ubuntu kernel diagnostics connected' },
      { type: 'data', text: '  [Metric] Bot Activity Logs: Behavioral pattern clustering enabled' },
      { type: 'data', text: '  [Impact] Predictive Maintenance: Reduced unexpected dock stall rates' },
      { type: 'data', text: '  [Backend] Cross-functional pod telemetry integrated into production backend' },
      { type: 'info', text: '  [Integrity] Continuous automated data validation across active bots' },
      { type: 'meta', text: 'Execution: Telemetry pipelines driving measurable operational throughput' },
    ],
    tokens: 186,
    latency: '41ms',
  },
  riskStudy: {
    command: 'claude analyze ./credit_portfolio_exposure.py',
    title: '2.26M+ Risk Study',
    output: [
      { type: 'comment', text: '# Synthesizing large-scale consumer credit portfolio diagnostics...' },
      { type: 'info', text: 'Dataset Scale: 2,260,000+ historical loan records segmented via SQL' },
      { type: 'data', text: '  ! Finding 1: Volume vs. Risk Paradox (Small business loans peaked ~30% default)' },
      { type: 'data', text: '  ! Finding 2: High income did NOT insulate from default under severe DTI leverage' },
      { type: 'data', text: '  ! Finding 3: Renters had ~5% higher baseline default despite lower average loan sizes' },
      { type: 'success', text: '✓ Shipped: Dynamic Plotly Express & ipywidgets interactive exposure dashboard' },
      { type: 'meta', text: 'Repository: github.com/GauravRoy092/credit_portfolio_exposure' },
    ],
    tokens: 224,
    latency: '52ms',
  },
  stack: {
    command: 'claude cat system_architecture.json',
    title: 'Technical Stack',
    output: [
      { type: 'comment', text: '# Core systems, engineering toolchain & data pipelines:' },
      { type: 'json-key', text: '  "systems":   ["Linux & Ubuntu", "Bot Telemetry", "Log Diagnostics", "Pipeline Arch"],' },
      { type: 'json-key', text: '  "analytics": ["SQL (Advanced)", "Python", "Power BI", "Excel", "EDA", "Plotly"],' },
      { type: 'json-key', text: '  "practices": ["Predictive Maintenance", "Cross-Functional Pods", "Systems Thinking"]' },
      { type: 'success', text: '✓ Environment: Configured for high-throughput data reliability' },
    ],
    tokens: 118,
    latency: '26ms',
  },
};

const ClaudeCodeTerminal = () => {
  const [activeTab, setActiveTab] = useState('status');
  const [copied, setCopied] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [customInput, setCustomInput] = useState('');
  const [customSession, setCustomSession] = useState(null);
  const inputRef = useRef(null);

  const currentDisplay = customSession || PRESET_COMMANDS[activeTab];

  // Typewriter effect: reveal lines one at a time
  useEffect(() => {
    setVisibleLines(0);
    setIsTyping(true);
    const totalLines = currentDisplay.output.length;
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      setVisibleLines(current);
      if (current >= totalLines) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [activeTab, customSession]);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(currentDisplay.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentDisplay.command]);

  // Keyboard navigation between tabs
  useEffect(() => {
    const keys = Object.keys(PRESET_COMMANDS);
    const handleKeyDown = (e) => {
      // Only navigate tabs if user is not actively typing in the input
      if (document.activeElement === inputRef.current) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const idx = keys.indexOf(activeTab);
        if (e.key === 'ArrowRight' && idx < keys.length - 1) {
          setCustomSession(null);
          setActiveTab(keys[idx + 1]);
        } else if (e.key === 'ArrowLeft' && idx > 0) {
          setCustomSession(null);
          setActiveTab(keys[idx - 1]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const handleTabClick = (key) => {
    setCustomSession(null);
    setActiveTab(key);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const raw = customInput.trim();
    if (!raw) return;

    const cmdLower = raw.toLowerCase();
    setCustomInput('');

    if (cmdLower === 'help') {
      setCustomSession({
        command: raw,
        title: 'CLI Help',
        output: [
          { type: 'comment', text: '# Claude Code Interactive Shell v1.0 — Available commands:' },
          { type: 'info', text: '  status       Inspect active robotics engineer profile & role' },
          { type: 'info', text: '  telemetry    Run bot telemetry pipeline diagnostics' },
          { type: 'info', text: '  risk         Review 2.26M+ credit risk case study findings' },
          { type: 'info', text: '  stack        Print technical systems and analytical stack' },
          { type: 'info', text: '  whoami       Identity & primary engineering competencies' },
          { type: 'info', text: '  contact      Print email, phone, location & profiles' },
          { type: 'info', text: '  skills       List engineering, analytics & core practices' },
          { type: 'info', text: '  clear        Reset terminal to initial status view' },
          { type: 'meta', text: 'Tip: You can also click the quick tabs at the top or type custom prompts!' },
        ],
        tokens: 94,
        latency: '18ms',
      });
    } else if (cmdLower === 'clear') {
      setCustomSession(null);
      setActiveTab('status');
    } else if (cmdLower === 'whoami') {
      setCustomSession({
        command: raw,
        title: 'whoami',
        output: [
          { type: 'success', text: 'Gaurav Roy — Robotics Engineer @ GreyOrange' },
          { type: 'info', text: 'Location: Delhi / Gurugram, India' },
          { type: 'info', text: 'Focus: Systems Optimization · Bot Telemetry · Linux Kernel Tooling' },
          { type: 'data', text: 'Certified: Google Professional Data Analytics' },
        ],
        tokens: 48,
        latency: '12ms',
      });
    } else if (cmdLower === 'contact') {
      setCustomSession({
        command: raw,
        title: 'Contact Channels',
        output: [
          { type: 'comment', text: '# Direct communication coordinates for Gaurav Roy:' },
          { type: 'info', text: '  Email:    royg4250@gmail.com' },
          { type: 'info', text: '  Phone:    +91 07303528514' },
          { type: 'info', text: '  GitHub:   github.com/GauravRoy092' },
          { type: 'info', text: '  LinkedIn: linkedin.com/in/gaurav-roy-6580b222b' },
          { type: 'success', text: '✓ Channels active and reachable for systems discussions.' },
        ],
        tokens: 72,
        latency: '22ms',
      });
    } else if (cmdLower === 'skills') {
      setCustomSession({
        command: raw,
        title: 'Engineering Skills',
        output: [
          { type: 'comment', text: '# Categorized technical toolchain:' },
          { type: 'data', text: '  [Robotics/Linux] Linux & Ubuntu, Bot Telemetry, Log Analytics, Pipelines' },
          { type: 'data', text: '  [Analytics/BI]   SQL (Advanced), Python, Power BI, Excel, EDA, Plotly' },
          { type: 'data', text: '  [Practices]      Predictive Maintenance, Cross-functional Pods, Quality QA' },
          { type: 'meta', text: 'High throughput and production-grade reliability focus.' },
        ],
        tokens: 88,
        latency: '24ms',
      });
    } else if (cmdLower.includes('telemetry')) {
      handleTabClick('telemetry');
    } else if (cmdLower.includes('risk')) {
      handleTabClick('riskStudy');
    } else if (cmdLower.includes('status')) {
      handleTabClick('status');
    } else if (cmdLower.includes('stack')) {
      handleTabClick('stack');
    } else {
      // Dynamic simulated Claude agent response
      setCustomSession({
        command: `claude query "${raw}"`,
        title: 'Claude Response',
        output: [
          { type: 'comment', text: `# Analyzing query with Claude 3.7 Sonnet...` },
          { type: 'success', text: `✓ Query parsed: "${raw}"` },
          { type: 'info', text: `  Gaurav Roy specializes in engineering telemetry pipelines and analyzing large-scale operational data.` },
          { type: 'data', text: `  At GreyOrange, he optimizes autonomous robotic fleets using Linux diagnostic tooling.` },
          { type: 'data', text: `  His risk analysis work spans 2.26M+ records with empirical mathematical modeling.` },
          { type: 'meta', text: `Type 'help' to see standard commands, or explore the navigation above.` },
        ],
        tokens: 136,
        latency: '39ms',
      });
    }
  };

  return (
    <div className="claude-terminal" role="region" aria-label="Interactive Claude Code terminal showcase">
      {/* Terminal Top Chrome */}
      <div className="claude-terminal-header">
        <div className="terminal-dots">
          <span className="terminal-dot dot-close" />
          <span className="terminal-dot dot-minimize" />
          <span className="terminal-dot dot-maximize" />
        </div>
        <div className="terminal-title">
          <span className="terminal-spark">✦</span>
          <span>claude-code — ~/gaurav-roy/systems</span>
        </div>
        <div className="terminal-badge">
          <span className="status-indicator" />
          <span>v1.0 · sonnet</span>
        </div>
      </div>

      {/* Command Selector Tabs */}
      <div className="claude-terminal-tabs" role="tablist" aria-label="Terminal command tabs">
        {Object.entries(PRESET_COMMANDS).map(([key, item]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={!customSession && activeTab === key}
            className={`terminal-tab-btn ${!customSession && activeTab === key ? 'active' : ''}`}
            onClick={() => handleTabClick(key)}
          >
            <span className="tab-prompt-sym">❯</span>
            <span>{item.title}</span>
          </button>
        ))}
        <span className="terminal-kbd-hint" aria-hidden="true">type 'help' or ← →</span>
      </div>

      {/* Terminal Body */}
      <div className="claude-terminal-body">
        {/* Active Command Line Header */}
        <div className="terminal-prompt-line">
          <span className="terminal-prompt-prefix">
            <span className="prompt-user">gaurav</span>
            <span className="prompt-at">@</span>
            <span className="prompt-host">greyorange</span>
            <span className="prompt-path">:~</span>
            <span className="prompt-symbol">❯</span>
          </span>
          <span className="terminal-command-text">{currentDisplay.command}</span>
          <button
            type="button"
            className="terminal-copy-btn"
            onClick={handleCopy}
            title="Copy command"
            aria-label="Copy command"
          >
            {copied ? (
              <><span className="copy-check">✓</span> Copied</>
            ) : (
              <><span className="copy-icon">⧉</span> Copy</>
            )}
          </button>
        </div>

        {/* Claude Code Session Response */}
        <div className="terminal-response-area" role="tabpanel">
          <div className="claude-response-header">
            <span className="claude-spark-badge">
              <span className="spark-glyph">✦</span> Claude Code
            </span>
            <span className="claude-timing">
              {isTyping ? (
                <span className="typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span>processing...</span>
                </span>
              ) : (
                <>{currentDisplay.tokens} tokens · {currentDisplay.latency}</>
              )}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentDisplay.command}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="terminal-output-lines"
            >
              {currentDisplay.output.map((line, idx) => (
                <div
                  key={idx}
                  className={`terminal-output-line line-${line.type} ${idx < visibleLines ? 'line-visible' : 'line-hidden'}`}
                >
                  {line.text}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Interactive CLI Input Line */}
        <form className="terminal-input-form" onSubmit={handleFormSubmit}>
          <span className="terminal-prompt-prefix">
            <span className="prompt-symbol">❯</span>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-text-input"
            placeholder="Type 'help', 'skills', 'contact', 'telemetry' or a question and press Enter..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
          <button type="submit" className="terminal-run-btn" title="Run command">
            ↵ Run
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClaudeCodeTerminal;
