/**
 * taskQueue.ts
 * Responsibility: Shared task queue across all agents.
 * Guarantees: no two agents claim the same task (claim/release/complete).
 */

export type QueueTaskStatus = 'available' | 'claimed' | 'completed' | 'skipped';
export type QueueTaskType   = 'writing' | 'coding' | 'translation' | 'data_entry' | 'general';

export interface QueueTask {
  id:          string;
  title:       string;
  type:        QueueTaskType;
  reward:      number;
  confidence:  number;
  status:      QueueTaskStatus;
  claimedBy:   string | null;
  claimedAt:   Date | null;
  completedAt: Date | null;
  platform:    string;
}

const TASK_POOL: Omit<QueueTask, 'id' | 'status' | 'claimedBy' | 'claimedAt' | 'completedAt'>[] = [
  { title: 'Write product description for smartwatch',  type: 'writing',     reward: 12.00, confidence: 0, platform: 'Upwork'      },
  { title: 'Build Python scraper for Amazon pricing',   type: 'coding',      reward: 55.00, confidence: 0, platform: 'Upwork'      },
  { title: 'Translate FAQ page EN to ES (150 words)',   type: 'translation',  reward: 7.00,  confidence: 0, platform: 'Fiverr'      },
  { title: 'Data entry: 30 product rows into sheet',   type: 'data_entry',  reward: 9.50,  confidence: 0, platform: 'Freelancer'  },
  { title: 'Write email welcome sequence (3 emails)',   type: 'writing',     reward: 18.00, confidence: 0, platform: 'Upwork'      },
  { title: 'Code automation script for CSV parsing',   type: 'coding',      reward: 38.00, confidence: 0, platform: 'Upwork'      },
  { title: 'Write blog post intro for SaaS product',   type: 'writing',     reward: 14.00, confidence: 0, platform: 'Fiverr'      },
  { title: 'Translate product page EN to FR',          type: 'translation',  reward: 11.00, confidence: 0, platform: 'Freelancer'  },
  { title: 'Data entry: invoice records (20 items)',   type: 'data_entry',  reward: 8.00,  confidence: 0, platform: 'Fiverr'      },
  { title: 'Write SEO meta descriptions (10 pages)',   type: 'writing',     reward: 16.00, confidence: 0, platform: 'Upwork'      },
  { title: 'Build REST API with Express.js',           type: 'coding',      reward: 72.00, confidence: 0, platform: 'Upwork'      },
  { title: 'Translate user manual EN to DE',           type: 'translation',  reward: 22.00, confidence: 0, platform: 'Freelancer'  },
  { title: 'Data entry: customer records CRM import',  type: 'data_entry',  reward: 11.00, confidence: 0, platform: 'Fiverr'      },
  { title: 'Write LinkedIn profile summary (exec)',    type: 'writing',     reward: 25.00, confidence: 0, platform: 'Upwork'      },
  { title: 'Fix React component rendering bug',        type: 'coding',      reward: 45.00, confidence: 0, platform: 'Freelancer'  },
];

class TaskQueue {
  private tasks: QueueTask[] = [];
  private counter = 0;

  constructor() {
    this.refill();
  }

  private makeId(): string {
    return `q-${Date.now()}-${++this.counter}`;
  }

  /** Refill queue with fresh tasks */
  private refill(): void {
    TASK_POOL.forEach(def => {
      this.tasks.push({
        ...def,
        id:          this.makeId(),
        confidence:  this.simulateConfidence(def.title),
        status:      'available',
        claimedBy:   null,
        claimedAt:   null,
        completedAt: null,
      });
    });
  }

  private simulateConfidence(title: string): number {
    const keywords = ['write', 'translate', 'data entry', 'build', 'code', 'scraper', 'fix'];
    const matches  = keywords.filter(k => title.toLowerCase().includes(k)).length;
    const base     = 0.70 + matches * 0.04;
    return Math.min(0.99, +(base + (Math.random() * 0.1 - 0.05)).toFixed(2));
  }

  /**
   * Claim the next available task that matches agent specialization.
   * Returns null if nothing available.
   */
  claim(agentId: string, preferredTypes: QueueTaskType[]): QueueTask | null {
    // Refill if running low
    const available = this.tasks.filter(t => t.status === 'available');
    if (available.length < 3) this.refill();

    // Find best match: preferred type first, then any available
    let task = available.find(t => preferredTypes.includes(t.type));
    if (!task) task = available[0];
    if (!task) return null;

    task.status    = 'claimed';
    task.claimedBy = agentId;
    task.claimedAt = new Date();
    return task;
  }

  /** Release task back to available (if agent can't process) */
  release(taskId: string): void {
    const t = this.tasks.find(t => t.id === taskId);
    if (t && t.status === 'claimed') {
      t.status    = 'available';
      t.claimedBy = null;
      t.claimedAt = null;
    }
  }

  /** Mark task as completed */
  complete(taskId: string): void {
    const t = this.tasks.find(t => t.id === taskId);
    if (t) {
      t.status      = 'completed';
      t.completedAt = new Date();
    }
  }

  /** Mark task as skipped (confidence < threshold) */
  skip(taskId: string): void {
    const t = this.tasks.find(t => t.id === taskId);
    if (t) {
      t.status    = 'skipped';
      t.claimedBy = null;
    }
  }

  getAll():       QueueTask[] { return [...this.tasks]; }
  getAvailable(): QueueTask[] { return this.tasks.filter(t => t.status === 'available'); }
  getCompleted(): QueueTask[] { return this.tasks.filter(t => t.status === 'completed'); }
  getClaimed():   QueueTask[] { return this.tasks.filter(t => t.status === 'claimed');   }

  getStats() {
    return {
      total:     this.tasks.length,
      available: this.tasks.filter(t => t.status === 'available').length,
      claimed:   this.tasks.filter(t => t.status === 'claimed').length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
      skipped:   this.tasks.filter(t => t.status === 'skipped').length,
    };
  }
}

export const taskQueue = new TaskQueue();
