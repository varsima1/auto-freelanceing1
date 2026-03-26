/**
 * agentFactory.ts
 * Responsibility: Spawn, track, and manage multiple agents.
 * Each agent has a unique ID, name, role, specialization, and AbortController.
 */

export type AgentRole = 'writing-specialist' | 'coding-specialist' | 'translation-specialist' | 'general';

export interface AgentInstance {
  id:             string;
  name:           string;
  role:           AgentRole;
  specialization: string[];   // task types this agent prefers
  color:          string;     // UI color accent
  emoji:          string;
  abortController: AbortController;
  isRunning:      boolean;
  tasksCompleted: number;
  totalEarned:    number;
  startedAt:      Date;
}

const AGENT_DEFINITIONS: Omit<AgentInstance,
  'abortController' | 'isRunning' | 'tasksCompleted' | 'totalEarned' | 'startedAt'
>[] = [
  {
    id:             'agent-001',
    name:           'Alpha-1',
    role:           'writing-specialist',
    specialization: ['writing', 'copywriting', 'email', 'blog'],
    color:          'cyan',
    emoji:          '✍️',
  },
  {
    id:             'agent-002',
    name:           'Beta-2',
    role:           'coding-specialist',
    specialization: ['coding', 'python', 'automation', 'scraper'],
    color:          'purple',
    emoji:          '💻',
  },
  {
    id:             'agent-003',
    name:           'Gamma-3',
    role:           'translation-specialist',
    specialization: ['translation', 'localization', 'data_entry'],
    color:          'green',
    emoji:          '🌐',
  },
];

class AgentFactory {
  private agents: Map<string, AgentInstance> = new Map();

  /** Spawn all predefined agents */
  spawnAll(): AgentInstance[] {
    AGENT_DEFINITIONS.forEach(def => {
      if (!this.agents.has(def.id)) {
        const instance: AgentInstance = {
          ...def,
          abortController: new AbortController(),
          isRunning:       false,
          tasksCompleted:  0,
          totalEarned:     0,
          startedAt:       new Date(),
        };
        this.agents.set(def.id, instance);
      }
    });
    return this.getAll();
  }

  /** Spawn a new custom agent on-the-fly */
  spawnNew(name: string, role: AgentRole, specialization: string[]): AgentInstance {
    const id = `agent-${Date.now()}`;
    const colors: Record<AgentRole, string> = {
      'writing-specialist':     'cyan',
      'coding-specialist':      'purple',
      'translation-specialist': 'green',
      'general':                'yellow',
    };
    const emojis: Record<AgentRole, string> = {
      'writing-specialist':     '✍️',
      'coding-specialist':      '💻',
      'translation-specialist': '🌐',
      'general':                '🤖',
    };
    const instance: AgentInstance = {
      id, name, role, specialization,
      color:           colors[role],
      emoji:           emojis[role],
      abortController: new AbortController(),
      isRunning:       false,
      tasksCompleted:  0,
      totalEarned:     0,
      startedAt:       new Date(),
    };
    this.agents.set(id, instance);
    return instance;
  }

  getAll(): AgentInstance[] {
    return Array.from(this.agents.values());
  }

  get(id: string): AgentInstance | undefined {
    return this.agents.get(id);
  }

  markRunning(id: string, running: boolean): void {
    const a = this.agents.get(id);
    if (a) a.isRunning = running;
  }

  recordCompletion(id: string, reward: number): void {
    const a = this.agents.get(id);
    if (a) {
      a.tasksCompleted++;
      a.totalEarned = +(a.totalEarned + reward).toFixed(2);
    }
  }

  stopAll(): void {
    this.agents.forEach(a => {
      a.abortController.abort();
      a.isRunning = false;
    });
  }

  restartAgent(id: string): void {
    const a = this.agents.get(id);
    if (a) {
      a.abortController.abort();
      a.abortController = new AbortController();
      a.isRunning       = false;
    }
  }
}

export const agentFactory = new AgentFactory();
