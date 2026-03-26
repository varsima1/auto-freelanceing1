// ─────────────────────────────────────────────────────────────
// freelancerAdapter.ts — Freelancer.com platform mock
// Bid-based system, 10% commission, competitive pricing
// ─────────────────────────────────────────────────────────────

import { UnifiedTask, PlatformAdapter, PlatformCapabilities } from '../platformRouter';

const TASKS: UnifiedTask[] = [
  { id:'fl-1', title:'Python web scraping script', description:'Scrape 500 product listings with Playwright', budget:120, commission:0.10, netEarning:108, category:'coding', platform:'freelancer', skills:['python','automation','coding'], difficulty:0.65, confidence:0.87, estimatedMinutes:60 },
  { id:'fl-2', title:'Summarize 5 AI research papers', description:'Executive summaries, 300 words each', budget:55, commission:0.10, netEarning:49.5, category:'writing', platform:'freelancer', skills:['writing','research'], difficulty:0.5, confidence:0.91, estimatedMinutes:50 },
  { id:'fl-3', title:'Build REST API endpoint', description:'Node.js Express CRUD endpoint with auth', budget:150, commission:0.10, netEarning:135, category:'coding', platform:'freelancer', skills:['coding','nodejs','api'], difficulty:0.7, confidence:0.86, estimatedMinutes:75 },
  { id:'fl-4', title:'Data cleaning CSV 1000 rows', description:'Remove duplicates, standardize formats', budget:40, commission:0.10, netEarning:36, category:'data_entry', platform:'freelancer', skills:['data_entry','python'], difficulty:0.35, confidence:0.94, estimatedMinutes:35 },
  { id:'fl-5', title:'Write technical documentation', description:'API docs for 3 endpoints, with examples', budget:70, commission:0.10, netEarning:63, category:'writing', platform:'freelancer', skills:['writing','technical'], difficulty:0.55, confidence:0.89, estimatedMinutes:55 },
];

export const freelancerAdapter: PlatformAdapter = {
  id: 'freelancer',
  name: 'Freelancer',
  emoji: '🔵',
  commissionRate: 0.10,
  capabilities: {
    maxConcurrentTasks: 4,
    supportedCategories: ['coding','writing','data_entry','engineering'],
    minConfidenceRequired: 0.85,
    avgResponseTimeMs: 1500,
    requiresProfile: true,
  } as PlatformCapabilities,

  fetchTasks: async () => {
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
    return TASKS.map(t => ({
      ...t,
      id: `${t.id}-${Date.now()}`,
      budget: +(t.budget * (0.88 + Math.random() * 0.25)).toFixed(2),
    }));
  },

  submitResult: async (taskId: string, _result: string) => {
    await new Promise(r => setTimeout(r, 700));
    return { success: true, taskId, message: 'Freelancer bid accepted, work submitted', timestamp: new Date() };
  },

  getStatus: () => ({
    connected: true,
    tasksAvailable: TASKS.length,
    dailyLimit: 8,
    usedToday: Math.floor(Math.random() * 3),
  }),
};
