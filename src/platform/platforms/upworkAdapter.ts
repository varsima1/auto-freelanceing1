// ─────────────────────────────────────────────────────────────
// upworkAdapter.ts — Upwork platform mock
// Hourly + fixed price contracts, 20% commission fee
// ─────────────────────────────────────────────────────────────

import { UnifiedTask, PlatformAdapter, PlatformCapabilities } from '../platformRouter';

const TASKS: UnifiedTask[] = [
  { id:'uw-1', title:'Write SEO blog post (1000 words)', description:'Need engaging AI-focused blog content', budget:45, commission:0.20, netEarning:36, category:'writing', platform:'upwork', skills:['writing','seo'], difficulty:0.4, confidence:0.92, estimatedMinutes:45 },
  { id:'uw-2', title:'Fix React useState bug', description:'useState not re-rendering component correctly', budget:80, commission:0.20, netEarning:64, category:'coding', platform:'upwork', skills:['react','coding'], difficulty:0.6, confidence:0.88, estimatedMinutes:30 },
  { id:'uw-3', title:'Translate legal doc EN→ES', description:'3-page legal contract translation required', budget:60, commission:0.20, netEarning:48, category:'translation', platform:'upwork', skills:['translation','spanish'], difficulty:0.5, confidence:0.90, estimatedMinutes:60 },
  { id:'uw-4', title:'Python automation script', description:'Automate file renaming and folder sorting', budget:95, commission:0.20, netEarning:76, category:'coding', platform:'upwork', skills:['python','automation'], difficulty:0.55, confidence:0.89, estimatedMinutes:50 },
  { id:'uw-5', title:'Product copywriting x5', description:'Write 5 compelling product descriptions', budget:35, commission:0.20, netEarning:28, category:'writing', platform:'upwork', skills:['writing','copywriting'], difficulty:0.3, confidence:0.95, estimatedMinutes:35 },
];

export const upworkAdapter: PlatformAdapter = {
  id: 'upwork',
  name: 'Upwork',
  emoji: '🟢',
  commissionRate: 0.20,
  capabilities: {
    maxConcurrentTasks: 3,
    supportedCategories: ['writing','coding','translation','design'],
    minConfidenceRequired: 0.85,
    avgResponseTimeMs: 1200,
    requiresProfile: true,
  } as PlatformCapabilities,

  fetchTasks: async () => {
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    return TASKS.map(t => ({
      ...t,
      id: `${t.id}-${Date.now()}`,
      budget: +(t.budget * (0.9 + Math.random() * 0.2)).toFixed(2),
    }));
  },

  submitResult: async (taskId: string, _result: string) => {
    await new Promise(r => setTimeout(r, 500));
    return { success: true, taskId, message: 'Upwork submission accepted', timestamp: new Date() };
  },

  getStatus: () => ({
    connected: true,
    tasksAvailable: TASKS.length,
    dailyLimit: 10,
    usedToday: Math.floor(Math.random() * 4),
  }),
};
