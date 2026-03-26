/**
 * db.ts
 * Responsibility: In-memory database (MongoDB-ready mock).
 * Collections: tasks, templates, errors, skills.
 * Real MongoDB swap: replace store Maps with mongoose models.
 */

export interface DBTask {
  id: string;
  title: string;
  platform: string;
  confidence: number;
  reward: number;
  status: 'completed' | 'skipped' | 'failed';
  agentId: string;
  output: string;
  verified: boolean;
  timestamp: Date;
}

export interface DBTemplate {
  id: string;
  taskType: string;        // normalized task category
  keywords: string[];      // extracted from task title
  solution: string;        // AI output that passed verification
  reward: number;
  usedCount: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBError {
  id: string;
  agentId: string;
  taskTitle: string;
  issue: string;
  fixed: boolean;
  timestamp: Date;
}

export interface DBSkill {
  id: string;             // skill name
  agentId: string;
  level: number;          // 0–100
  taskCount: number;
  lastUpdated: Date;
}

// ── In-Memory Collections ──────────────────────────────────────────────────
const tasksCollection   = new Map<string, DBTask>();
const templatesCollection = new Map<string, DBTemplate>();
const errorsCollection  = new Map<string, DBError>();
const skillsCollection  = new Map<string, DBSkill>();

// ── Task CRUD ──────────────────────────────────────────────────────────────
export const db = {
  // Tasks
  insertTask(task: DBTask): void {
    tasksCollection.set(task.id, task);
  },
  getTask(id: string): DBTask | undefined {
    return tasksCollection.get(id);
  },
  getAllTasks(): DBTask[] {
    return Array.from(tasksCollection.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  },
  countTasks(): number {
    return tasksCollection.size;
  },

  // Templates
  insertTemplate(tpl: DBTemplate): void {
    templatesCollection.set(tpl.id, tpl);
  },
  updateTemplate(id: string, patch: Partial<DBTemplate>): void {
    const existing = templatesCollection.get(id);
    if (existing) templatesCollection.set(id, { ...existing, ...patch, updatedAt: new Date() });
  },
  getAllTemplates(): DBTemplate[] {
    return Array.from(templatesCollection.values()).sort(
      (a, b) => b.usedCount - a.usedCount
    );
  },
  countTemplates(): number {
    return templatesCollection.size;
  },

  // Errors
  insertError(err: DBError): void {
    errorsCollection.set(err.id, err);
  },
  getAllErrors(): DBError[] {
    return Array.from(errorsCollection.values());
  },

  // Skills
  upsertSkill(skill: DBSkill): void {
    skillsCollection.set(`${skill.agentId}::${skill.id}`, skill);
  },
  getSkillsForAgent(agentId: string): DBSkill[] {
    return Array.from(skillsCollection.values()).filter(s => s.agentId === agentId);
  },

  // Stats
  getDBStats() {
    return {
      tasks: tasksCollection.size,
      templates: templatesCollection.size,
      errors: errorsCollection.size,
      skills: skillsCollection.size,
    };
  },
};
