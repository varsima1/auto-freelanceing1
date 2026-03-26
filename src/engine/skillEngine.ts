/**
 * skillEngine.ts
 * Responsibility: XP-based skill tree system.
 * Tracks XP per skill, levels: Beginner → Intermediate → Expert → Master
 */

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Expert' | 'Master';

export interface Skill {
  id: string;
  name: string;
  category: string;
  xp: number;
  level: SkillLevel;
  xpToNextLevel: number;
  xpProgress: number; // 0–100 percent to next level
  tasksCompleted: number;
  lastUsed: Date;
  icon: string;
}

export interface LevelUpEvent {
  skillId: string;
  skillName: string;
  from: SkillLevel;
  to: SkillLevel;
  timestamp: Date;
}

// XP thresholds per level
const LEVEL_THRESHOLDS: Record<SkillLevel, number> = {
  Beginner:     0,
  Intermediate: 100,
  Expert:       300,
  Master:       700,
};

const LEVEL_ORDER: SkillLevel[] = ['Beginner', 'Intermediate', 'Expert', 'Master'];

// XP earned per task type
const XP_REWARDS: Record<string, number> = {
  writing:      18,
  coding:       35,
  translation:  15,
  data_entry:   10,
  research:     20,
  design:       25,
  marketing:    22,
};

// Default skill definitions
const DEFAULT_SKILLS: Omit<Skill, 'xp' | 'level' | 'xpToNextLevel' | 'xpProgress' | 'tasksCompleted' | 'lastUsed'>[] = [
  { id: 'sk-writing',     name: 'Content Writing',   category: 'writing',     icon: '✍️'  },
  { id: 'sk-coding',      name: 'Code Generation',   category: 'coding',      icon: '💻'  },
  { id: 'sk-translation', name: 'Translation',       category: 'translation', icon: '🌐'  },
  { id: 'sk-data',        name: 'Data Entry',        category: 'data_entry',  icon: '📊'  },
  { id: 'sk-research',    name: 'Research',          category: 'research',    icon: '🔍'  },
  { id: 'sk-marketing',   name: 'Marketing Copy',    category: 'marketing',   icon: '📣'  },
];

function getLevel(xp: number): SkillLevel {
  if (xp >= LEVEL_THRESHOLDS.Master)       return 'Master';
  if (xp >= LEVEL_THRESHOLDS.Expert)       return 'Expert';
  if (xp >= LEVEL_THRESHOLDS.Intermediate) return 'Intermediate';
  return 'Beginner';
}

function getXpToNext(xp: number): number {
  if (xp >= LEVEL_THRESHOLDS.Master)       return 0;
  if (xp >= LEVEL_THRESHOLDS.Expert)       return LEVEL_THRESHOLDS.Master - xp;
  if (xp >= LEVEL_THRESHOLDS.Intermediate) return LEVEL_THRESHOLDS.Expert - xp;
  return LEVEL_THRESHOLDS.Intermediate - xp;
}

function getXpProgress(xp: number): number {
  if (xp >= LEVEL_THRESHOLDS.Master) return 100;
  if (xp >= LEVEL_THRESHOLDS.Expert) {
    const range = LEVEL_THRESHOLDS.Master - LEVEL_THRESHOLDS.Expert;
    return Math.round(((xp - LEVEL_THRESHOLDS.Expert) / range) * 100);
  }
  if (xp >= LEVEL_THRESHOLDS.Intermediate) {
    const range = LEVEL_THRESHOLDS.Expert - LEVEL_THRESHOLDS.Intermediate;
    return Math.round(((xp - LEVEL_THRESHOLDS.Intermediate) / range) * 100);
  }
  return Math.round((xp / LEVEL_THRESHOLDS.Intermediate) * 100);
}

function buildSkill(base: typeof DEFAULT_SKILLS[0], xp: number, tasks: number): Skill {
  return {
    ...base,
    xp,
    level: getLevel(xp),
    xpToNextLevel: getXpToNext(xp),
    xpProgress: getXpProgress(xp),
    tasksCompleted: tasks,
    lastUsed: new Date(),
  };
}

class SkillEngine {
  private skills: Map<string, Skill> = new Map();
  private levelUpHistory: LevelUpEvent[] = [];

  constructor() {
    // Seed with initial XP so some skills are already progressed
    const seeds: Record<string, { xp: number; tasks: number }> = {
      'sk-writing':     { xp: 145, tasks: 12 },
      'sk-coding':      { xp: 85,  tasks: 5  },
      'sk-translation': { xp: 60,  tasks: 8  },
      'sk-data':        { xp: 210, tasks: 24 },
      'sk-research':    { xp: 30,  tasks: 3  },
      'sk-marketing':   { xp: 55,  tasks: 6  },
    };
    DEFAULT_SKILLS.forEach(base => {
      const seed = seeds[base.id] ?? { xp: 0, tasks: 0 };
      this.skills.set(base.id, buildSkill(base, seed.xp, seed.tasks));
    });
  }

  gainXP(taskType: string): { skill: Skill; xpGained: number; levelUp: LevelUpEvent | null } {
    const skillId = this.getSkillIdForType(taskType);
    const existing = this.skills.get(skillId);
    if (!existing) return { skill: this.skills.values().next().value!, xpGained: 0, levelUp: null };

    const xpGained = XP_REWARDS[taskType] ?? 10;
    const prevLevel = existing.level;
    const newXp = existing.xp + xpGained;

    const updated: Skill = {
      ...existing,
      xp: newXp,
      level: getLevel(newXp),
      xpToNextLevel: getXpToNext(newXp),
      xpProgress: getXpProgress(newXp),
      tasksCompleted: existing.tasksCompleted + 1,
      lastUsed: new Date(),
    };
    this.skills.set(skillId, updated);

    let levelUp: LevelUpEvent | null = null;
    if (updated.level !== prevLevel) {
      levelUp = {
        skillId,
        skillName: existing.name,
        from: prevLevel,
        to: updated.level,
        timestamp: new Date(),
      };
      this.levelUpHistory = [levelUp, ...this.levelUpHistory].slice(0, 20);
    }

    return { skill: updated, xpGained, levelUp };
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getLevelUpHistory(): LevelUpEvent[] {
    return this.levelUpHistory;
  }

  getTotalXP(): number {
    return Array.from(this.skills.values()).reduce((sum, s) => sum + s.xp, 0);
  }

  private getSkillIdForType(taskType: string): string {
    const map: Record<string, string> = {
      writing: 'sk-writing', coding: 'sk-coding',
      translation: 'sk-translation', data_entry: 'sk-data',
      research: 'sk-research', marketing: 'sk-marketing',
    };
    return map[taskType] ?? 'sk-writing';
  }
}

export const skillEngine = new SkillEngine();
export { LEVEL_ORDER, LEVEL_THRESHOLDS };
