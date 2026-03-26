// ─────────────────────────────────────────────────────────────
// fiverrAdapter.ts — Fiverr platform mock
// Gig-based marketplace, 20% commission, fast turnaround
// ─────────────────────────────────────────────────────────────

import { UnifiedTask, PlatformAdapter, PlatformCapabilities } from '../platformRouter';

const TASKS: UnifiedTask[] = [
  { id:'fv-1', title:'Write 10 product descriptions', description:'E-commerce listings, 100 words each', budget:30, commission:0.20, netEarning:24, category:'writing', platform:'fiverr', skills:['writing','copywriting'], difficulty:0.3, confidence:0.96, estimatedMinutes:30 },
  { id:'fv-2', title:'Data entry — 200 records', description:'Enter PDF data into Excel spreadsheet', budget:25, commission:0.20, netEarning:20, category:'data_entry', platform:'fiverr', skills:['data_entry','excel'], difficulty:0.2, confidence:0.98, estimatedMinutes:40 },
  { id:'fv-3', title:'Translate EN→FR product page', description:'E-commerce product page localization', budget:40, commission:0.20, netEarning:32, category:'translation', platform:'fiverr', skills:['translation','french'], difficulty:0.4, confidence:0.91, estimatedMinutes:45 },
  { id:'fv-4', title:'Logo description copywriting', description:'Write brand story and tagline', budget:20, commission:0.20, netEarning:16, category:'writing', platform:'fiverr', skills:['writing'], difficulty:0.25, confidence:0.97, estimatedMinutes:20 },
  { id:'fv-5', title:'Proofread 5-page document', description:'Grammar, style, and clarity check', budget:15, commission:0.20, netEarning:12, category:'writing', platform:'fiverr', skills:['writing','proofreading'], difficulty:0.2, confidence:0.99, estimatedMinutes:25 },
];

export const fiverrAdapter: PlatformAdapter = {
  id: 'fiverr',
  name: 'Fiverr',
  emoji: '🟡',
  commissionRate: 0.20,
  capabilities: {
    maxConcurrentTasks: 5,
    supportedCategories: ['writing','data_entry','translation','design','video'],
    minConfidenceRequired: 0.80,
    avgResponseTimeMs: 600,
    requiresProfile: true,
  } as PlatformCapabilities,

  fetchTasks: async () => {
    await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
    return TASKS.map(t => ({
      ...t,
      id: `${t.id}-${Date.now()}`,
      budget: +(t.budget * (0.85 + Math.random() * 0.3)).toFixed(2),
    }));
  },

  submitResult: async (taskId: string, _result: string) => {
    await new Promise(r => setTimeout(r, 300));
    return { success: true, taskId, message: 'Fiverr delivery marked complete', timestamp: new Date() };
  },

  getStatus: () => ({
    connected: true,
    tasksAvailable: TASKS.length,
    dailyLimit: 20,
    usedToday: Math.floor(Math.random() * 6),
  }),
};
