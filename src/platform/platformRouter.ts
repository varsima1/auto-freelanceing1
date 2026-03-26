// ─────────────────────────────────────────────────────────────
// platformRouter.ts — Unified platform router
// Routes tasks across Upwork / Fiverr / Freelancer / Toptal
// Handles auth, commission, routing decisions
// ─────────────────────────────────────────────────────────────

export type PlatformId = 'upwork' | 'fiverr' | 'freelancer' | 'toptal';

export interface UnifiedTask {
  id: string;
  title: string;
  description: string;
  budget: number;
  commission: number;
  netEarning: number;
  category: string;
  platform: PlatformId;
  skills: string[];
  difficulty: number;
  confidence: number;
  estimatedMinutes: number;
}

export interface PlatformCapabilities {
  maxConcurrentTasks: number;
  supportedCategories: string[];
  minConfidenceRequired: number;
  avgResponseTimeMs: number;
  requiresProfile: boolean;
}

export interface SubmitResult {
  success: boolean;
  taskId: string;
  message: string;
  timestamp: Date;
}

export interface PlatformStatus {
  connected: boolean;
  tasksAvailable: number;
  dailyLimit: number;
  usedToday: number;
}

export interface PlatformAdapter {
  id: PlatformId;
  name: string;
  emoji: string;
  commissionRate: number;
  capabilities: PlatformCapabilities;
  fetchTasks: () => Promise<UnifiedTask[]>;
  submitResult: (taskId: string, result: string) => Promise<SubmitResult>;
  getStatus: () => PlatformStatus;
}

export interface RouteDecision {
  taskId: string;
  platform: PlatformId;
  agentId: string;
  reason: string;
  expectedEarning: number;
  timestamp: Date;
}

export interface PlatformStats {
  id: PlatformId;
  name: string;
  emoji: string;
  tasksCompleted: number;
  totalEarned: number;
  avgEarning: number;
  successRate: number;
  isActive: boolean;
  commissionRate: number;
  lastActivity: Date | null;
}

// ── Platform Router Class ─────────────────────────────────────
class PlatformRouter {
  private adapters: Map<PlatformId, PlatformAdapter> = new Map();
  private routeLog: RouteDecision[] = [];
  private platformStats: Map<PlatformId, PlatformStats> = new Map();
  private taskAssignments: Map<string, PlatformId> = new Map();

  registerAdapter(adapter: PlatformAdapter): void {
    this.adapters.set(adapter.id, adapter);
    this.platformStats.set(adapter.id, {
      id: adapter.id,
      name: adapter.name,
      emoji: adapter.emoji,
      tasksCompleted: 0,
      totalEarned: 0,
      avgEarning: 0,
      successRate: 1.0,
      isActive: true,
      commissionRate: adapter.commissionRate,
      lastActivity: null,
    });
  }

  // ── Fetch tasks from ALL platforms concurrently ───────────────
  async fetchAllTasks(): Promise<UnifiedTask[]> {
    const results = await Promise.allSettled(
      Array.from(this.adapters.values()).map(a => a.fetchTasks())
    );
    const tasks: UnifiedTask[] = [];
    results.forEach(r => {
      if (r.status === 'fulfilled') tasks.push(...r.value);
    });
    return tasks.sort((a, b) => b.netEarning - a.netEarning);
  }

  // ── Route best task to agent based on specialization ─────────
  routeTask(task: UnifiedTask, agentId: string, agentSpecialization: string): RouteDecision {
    const specializationBonus = task.skills.includes(agentSpecialization) ? 'specialization match' : 'general routing';
    const decision: RouteDecision = {
      taskId: task.id,
      platform: task.platform,
      agentId,
      reason: `${task.platform.toUpperCase()}: ${specializationBonus} | net $${task.netEarning}`,
      expectedEarning: task.netEarning,
      timestamp: new Date(),
    };
    this.routeLog.unshift(decision);
    if (this.routeLog.length > 50) this.routeLog.pop();
    this.taskAssignments.set(task.id, task.platform);
    return decision;
  }

  // ── Submit result to correct platform ────────────────────────
  async submitResult(taskId: string, result: string): Promise<SubmitResult> {
    const platformId = this.taskAssignments.get(taskId);
    const adapter = platformId ? this.adapters.get(platformId) : null;
    if (!adapter) return { success: false, taskId, message: 'Platform not found', timestamp: new Date() };
    const res = await adapter.submitResult(taskId, result);
    if (res.success && platformId) this.recordCompletion(platformId, 0);
    return res;
  }

  recordCompletion(platformId: PlatformId, earning: number): void {
    const stats = this.platformStats.get(platformId);
    if (!stats) return;
    stats.tasksCompleted++;
    stats.totalEarned = +(stats.totalEarned + earning).toFixed(2);
    stats.avgEarning = stats.tasksCompleted > 0 ? +(stats.totalEarned / stats.tasksCompleted).toFixed(2) : 0;
    stats.lastActivity = new Date();
  }

  addEarning(platformId: PlatformId, earning: number): void {
    const stats = this.platformStats.get(platformId);
    if (!stats) return;
    stats.totalEarned = +(stats.totalEarned + earning).toFixed(2);
    stats.tasksCompleted++;
    stats.avgEarning = +(stats.totalEarned / stats.tasksCompleted).toFixed(2);
    stats.lastActivity = new Date();
  }

  getAllStats(): PlatformStats[] {
    return Array.from(this.platformStats.values());
  }

  getRouteLog(): RouteDecision[] {
    return [...this.routeLog];
  }

  getAdapterIds(): PlatformId[] {
    return Array.from(this.adapters.keys());
  }

  isRegistered(id: PlatformId): boolean {
    return this.adapters.has(id);
  }
}

export const platformRouter = new PlatformRouter();
