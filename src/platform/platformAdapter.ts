// ─────────────────────────────────────────────────────────────
// platformAdapter.ts — Mock platform connection layer
// Simulates Upwork / Fiverr / Freelancer style task sources
// Ready to swap in real API calls per platform
// ─────────────────────────────────────────────────────────────

export type PlatformId = 'upwork' | 'fiverr' | 'freelancer' | 'mock';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'rate_limited';

export interface PlatformTask {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  platform: PlatformId;
  postedAt: Date;
  estimatedHours: number;
  requiredSkills: string[];
}

export interface PlatformState {
  id: PlatformId;
  name: string;
  emoji: string;
  status: ConnectionStatus;
  tasksScanned: number;
  tasksAccepted: number;
  totalEarned: number;
  lastPing: Date;
  pingMs: number;
}

// ── Mock task pool per platform ──────────────────────────────
const PLATFORM_TASKS: Record<PlatformId, PlatformTask[]> = {
  upwork: [
    { id: 'u1', title: 'Write SEO blog post', description: 'Need 1000 word blog post about AI', budget: 45, category: 'writing', platform: 'upwork', postedAt: new Date(), estimatedHours: 2, requiredSkills: ['writing', 'seo'] },
    { id: 'u2', title: 'Fix React bug', description: 'useState not updating correctly', budget: 80, category: 'coding', platform: 'upwork', postedAt: new Date(), estimatedHours: 1, requiredSkills: ['coding', 'react'] },
    { id: 'u3', title: 'Translate document EN→ES', description: 'Legal document translation', budget: 60, category: 'translation', platform: 'upwork', postedAt: new Date(), estimatedHours: 3, requiredSkills: ['translation'] },
  ],
  fiverr: [
    { id: 'f1', title: 'Product description writing', description: '10 product descriptions for e-commerce', budget: 30, category: 'writing', platform: 'fiverr', postedAt: new Date(), estimatedHours: 2, requiredSkills: ['writing'] },
    { id: 'f2', title: 'Data entry spreadsheet', description: 'Enter 200 records from PDF to Excel', budget: 25, category: 'data_entry', platform: 'fiverr', postedAt: new Date(), estimatedHours: 4, requiredSkills: ['data_entry'] },
  ],
  freelancer: [
    { id: 'fl1', title: 'Python script for web scraping', description: 'Scrape product data from e-commerce site', budget: 120, category: 'coding', platform: 'freelancer', postedAt: new Date(), estimatedHours: 3, requiredSkills: ['coding', 'python'] },
    { id: 'fl2', title: 'Summarize research papers', description: 'Summarize 5 AI research papers', budget: 55, category: 'writing', platform: 'freelancer', postedAt: new Date(), estimatedHours: 2, requiredSkills: ['writing', 'research'] },
  ],
  mock: [
    { id: 'm1', title: 'Mock task alpha', description: 'Test task for system validation', budget: 10, category: 'writing', platform: 'mock', postedAt: new Date(), estimatedHours: 1, requiredSkills: ['writing'] },
  ],
};

// ── Platform Adapter Class ───────────────────────────────────
class PlatformAdapter {
  private states: Map<PlatformId, PlatformState> = new Map();

  constructor() {
    this.initPlatforms();
  }

  private initPlatforms() {
    const platforms: Array<{ id: PlatformId; name: string; emoji: string }> = [
      { id: 'upwork',     name: 'Upwork',     emoji: '🟢' },
      { id: 'fiverr',     name: 'Fiverr',     emoji: '🟡' },
      { id: 'freelancer', name: 'Freelancer', emoji: '🔵' },
      { id: 'mock',       name: 'MockPlatform', emoji: '⚪' },
    ];

    platforms.forEach(p => {
      this.states.set(p.id, {
        id: p.id,
        name: p.name,
        emoji: p.emoji,
        status: p.id === 'mock' ? 'connected' : 'disconnected',
        tasksScanned: 0,
        tasksAccepted: 0,
        totalEarned: 0,
        lastPing: new Date(),
        pingMs: 0,
      });
    });
  }

  // Connect a platform (mock: always succeeds)
  async connect(platformId: PlatformId): Promise<boolean> {
    const state = this.states.get(platformId);
    if (!state) return false;

    state.status = 'reconnecting';
    // Simulate connection delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    state.status = 'connected';
    state.lastPing = new Date();
    state.pingMs = Math.floor(50 + Math.random() * 150);
    return true;
  }

  // Scan tasks from a platform
  scanTasks(platformId: PlatformId): PlatformTask[] {
    const state = this.states.get(platformId);
    if (!state || state.status !== 'connected') return [];

    const tasks = PLATFORM_TASKS[platformId] || [];
    state.tasksScanned += tasks.length;
    state.lastPing = new Date();
    state.pingMs = Math.floor(50 + Math.random() * 200);
    return tasks;
  }

  // Record a task acceptance
  acceptTask(platformId: PlatformId, reward: number) {
    const state = this.states.get(platformId);
    if (!state) return;
    state.tasksAccepted++;
    state.totalEarned += reward;
  }

  // Get all platform states
  getAllStates(): PlatformState[] {
    return Array.from(this.states.values());
  }

  // Simulate random disconnection/reconnection
  simulateNetworkEvents() {
    this.states.forEach((state, id) => {
      if (id === 'mock') return;
      const roll = Math.random();
      if (roll < 0.05 && state.status === 'connected') {
        state.status = 'disconnected';
      } else if (roll < 0.15 && state.status === 'disconnected') {
        state.status = 'reconnecting';
        setTimeout(() => {
          const s = this.states.get(id);
          if (s) s.status = 'connected';
        }, 2000);
      }
    });
  }
}

export const platformAdapter = new PlatformAdapter();
