// ─────────────────────────────────────────────────────────────
// toptalAdapter.ts — Toptal platform mock
// Premium marketplace, 0% fee, high bar, expert tasks only
// ─────────────────────────────────────────────────────────────

import { UnifiedTask, PlatformAdapter, PlatformCapabilities } from '../platformRouter';

const TASKS: UnifiedTask[] = [
  { id:'tt-1', title:'Architect microservices system', description:'Design event-driven microservices with Kafka', budget:350, commission:0, netEarning:350, category:'coding', platform:'toptal', skills:['coding','architecture','kafka'], difficulty:0.9, confidence:0.86, estimatedMinutes:120 },
  { id:'tt-2', title:'ML model optimization report', description:'Analyze and optimize TensorFlow model performance', budget:280, commission:0, netEarning:280, category:'coding', platform:'toptal', skills:['python','ml','coding'], difficulty:0.85, confidence:0.87, estimatedMinutes:100 },
  { id:'tt-3', title:'Technical whitepaper — blockchain', description:'8-page technical whitepaper on Layer 2 scaling', budget:400, commission:0, netEarning:400, category:'writing', platform:'toptal', skills:['writing','blockchain','technical'], difficulty:0.88, confidence:0.88, estimatedMinutes:180 },
  { id:'tt-4', title:'API security audit', description:'Penetration test REST API, produce report', budget:500, commission:0, netEarning:500, category:'coding', platform:'toptal', skills:['coding','security','api'], difficulty:0.95, confidence:0.85, estimatedMinutes:240 },
];

export const toptalAdapter: PlatformAdapter = {
  id: 'toptal',
  name: 'Toptal',
  emoji: '🔴',
  commissionRate: 0.00,
  capabilities: {
    maxConcurrentTasks: 2,
    supportedCategories: ['coding','writing','finance','design'],
    minConfidenceRequired: 0.90,
    avgResponseTimeMs: 2000,
    requiresProfile: true,
  } as PlatformCapabilities,

  fetchTasks: async () => {
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 500));
    // Toptal tasks are premium — fewer but higher value
    const available = TASKS.filter(() => Math.random() > 0.4);
    return available.map(t => ({
      ...t,
      id: `${t.id}-${Date.now()}`,
      budget: +(t.budget * (0.95 + Math.random() * 0.1)).toFixed(2),
    }));
  },

  submitResult: async (taskId: string, _result: string) => {
    await new Promise(r => setTimeout(r, 1000));
    return { success: true, taskId, message: 'Toptal work reviewed and approved', timestamp: new Date() };
  },

  getStatus: () => ({
    connected: true,
    tasksAvailable: TASKS.length,
    dailyLimit: 3,
    usedToday: Math.floor(Math.random() * 2),
  }),
};
