import { Mission, Agent, Task, SystemStats, LogEntry } from '../types';

export const MISSIONS: Mission[] = [
  { id: 1, emoji: '🟢', name: 'Foundation', description: 'Core agent, task scanning, MongoDB, learning', status: 'completed', steps: ['Project structure', 'Agent core', 'Platform connection', 'Task scanning', 'Confidence filter', 'AI execution', 'Verification', 'MongoDB storage', 'Templates', 'Delays'], completedSteps: 10 },
  { id: 2, emoji: '🟡', name: 'Task Reuse & Learning', description: 'Similarity detection, template reuse, skill system', status: 'completed', steps: ['Similarity detection', 'Template reuse', 'Verification v2', 'Skill system'], completedSteps: 4 },
  { id: 3, emoji: '🟠', name: 'Multi-Agent System', description: 'Multiple agents, task queue, shared learning', status: 'completed', steps: ['Agent factory', 'Task queue', 'Shared memory', 'Coordination'], completedSteps: 4 },
  { id: 4, emoji: '🔵', name: 'Multi-Platform', description: 'Platform adapters for multiple services', status: 'in_progress', steps: ['Platform adapters', 'Auth manager', 'Platform router'], completedSteps: 3 },
  { id: 5, emoji: '🟣', name: 'Human-like System', description: 'Delays, breaks, random behavior', status: 'locked', steps: ['Delay engine', 'Break scheduler', 'Randomizer'], completedSteps: 0 },
  { id: 6, emoji: '🔴', name: 'Profile Management', description: 'Profile creation, stats tracking', status: 'locked', steps: ['Profile factory', 'Stats tracker'], completedSteps: 0 },
  { id: 7, emoji: '🟤', name: 'Autonomous Expansion', description: 'Create agents, users, platforms', status: 'locked', steps: ['Agent spawner', 'User creator', 'Platform registrar'], completedSteps: 0 },
  { id: 8, emoji: '🟠', name: 'Revenue Optimization', description: 'Task scoring, high-value detection', status: 'locked', steps: ['Task scorer', 'Revenue predictor'], completedSteps: 0 },
  { id: 9, emoji: '🔵', name: 'Communication', description: 'Message handling, human-like replies', status: 'locked', steps: ['Message parser', 'Reply generator'], completedSteps: 0 },
  { id: 10, emoji: '🟣', name: 'Reliability', description: 'Fallback AI, retry system', status: 'locked', steps: ['Fallback AI', 'Retry engine'], completedSteps: 0 },
  { id: 11, emoji: '🟢', name: 'Sandbox', description: 'Test tasks before execution', status: 'locked', steps: ['Sandbox runner', 'Result comparator'], completedSteps: 0 },
  { id: 12, emoji: '🟡', name: 'Future Planning', description: 'forecastFuture(), planNextMission()', status: 'locked', steps: ['Forecaster', 'Mission planner', 'Achievement report'], completedSteps: 0 },
  { id: 13, emoji: '🟠', name: 'Dashboard', description: 'React + Tailwind UI, Stats + Logs', status: 'locked', steps: ['UI layout', 'Stats panel', 'Log viewer'], completedSteps: 0 },
  { id: 14, emoji: '🔵', name: 'Security', description: '.env, Encryption, Logging', status: 'locked', steps: ['Env manager', 'Encryption', 'Audit log'], completedSteps: 0 },
  { id: 15, emoji: '🔴', name: 'Advanced AI', description: 'Confidence prediction, Knowledge graph', status: 'locked', steps: ['Confidence model', 'Knowledge graph'], completedSteps: 0 },
  { id: 16, emoji: '🟣', name: 'Full Autonomy', description: 'Self-running, auto scaling', status: 'locked', steps: ['Orchestrator', 'Auto scaler'], completedSteps: 0 },
];

export const AGENTS: Agent[] = [
  { id: 'agent-001', name: 'Alpha-1', status: 'executing', platform: 'MockPlatform', tasksCompleted: 47, successRate: 98.2, currentTask: 'Write product description for electronics', skills: ['writing', 'research', 'data-entry'], revenue: 234.50, confidence: 0.97 },
  { id: 'agent-002', name: 'Beta-1', status: 'learning', platform: 'MockPlatform', tasksCompleted: 31, successRate: 96.8, currentTask: null, skills: ['writing', 'translation'], revenue: 156.00, confidence: 0.94 },
  { id: 'agent-003', name: 'Gamma-1', status: 'idle', platform: 'MockPlatform', tasksCompleted: 12, successRate: 100, currentTask: null, skills: ['data-entry', 'research'], revenue: 67.25, confidence: 0.91 },
];

export const TASKS: Task[] = [
  { id: 't-001', title: 'Write 500-word blog post about AI trends', platform: 'MockPlatform', confidence: 0.97, status: 'executing', reward: 15.00, agentId: 'agent-001', timestamp: new Date(Date.now() - 120000), isTemplate: false },
  { id: 't-002', title: 'Translate product specs EN→ES (200 words)', platform: 'MockPlatform', confidence: 0.95, status: 'verifying', reward: 8.50, agentId: 'agent-002', timestamp: new Date(Date.now() - 60000), isTemplate: true },
  { id: 't-003', title: 'Data entry: 50 product SKUs into spreadsheet', platform: 'MockPlatform', confidence: 0.99, status: 'completed', reward: 12.00, agentId: 'agent-003', timestamp: new Date(Date.now() - 300000), isTemplate: true },
  { id: 't-004', title: 'Create Python web scraper for pricing data', platform: 'MockPlatform', confidence: 0.61, status: 'skipped', reward: 45.00, agentId: null, timestamp: new Date(Date.now() - 400000), isTemplate: false },
  { id: 't-005', title: 'Write email sequence (5 emails) for SaaS', platform: 'MockPlatform', confidence: 0.93, status: 'scanning', reward: 25.00, agentId: null, timestamp: new Date(), isTemplate: false },
];

export const SYSTEM_STATS: SystemStats = {
  totalAgents: 3,
  activeTasks: 2,
  totalRevenue: 457.75,
  templatesStored: 2,
  successRate: 98.1,
  tasksToday: 12,
  uptime: '4h 32m',
  humanInterventions: 0,
};

export const LOG_ENTRIES: LogEntry[] = [
  { id: 'l-1', type: 'info', message: 'System initialized. Scanning MockPlatform for tasks...', timestamp: new Date(Date.now() - 500000) },
  { id: 'l-2', type: 'success', message: '[Alpha-1] Task t-003 completed. Revenue: $12.00. Storing template.', timestamp: new Date(Date.now() - 300000) },
  { id: 'l-3', type: 'learn', message: '[System] Template stored: "data-entry-spreadsheet". Similarity index updated.', timestamp: new Date(Date.now() - 295000) },
  { id: 'l-4', type: 'warning', message: '[System] Task t-004 skipped. Confidence 0.61 < threshold 0.85.', timestamp: new Date(Date.now() - 400000) },
  { id: 'l-5', type: 'info', message: '[Beta-1] Reusing template for translation task. Confidence boost: +0.03', timestamp: new Date(Date.now() - 60000) },
  { id: 'l-6', type: 'success', message: '[Alpha-1] Executing: "Write 500-word blog post about AI trends"', timestamp: new Date(Date.now() - 120000) },
  { id: 'l-7', type: 'info', message: '[Gamma-1] Entering idle state. Break scheduled for 2 minutes.', timestamp: new Date(Date.now() - 30000) },
  { id: 'l-8', type: 'info', message: '[System] Scanning for new tasks... Found 3 candidates.', timestamp: new Date() },
];
