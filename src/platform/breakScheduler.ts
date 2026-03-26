// ─────────────────────────────────────────────────────────────
// breakScheduler.ts — Human-like break timing system
// Prevents bot detection, simulates real worker patterns
// ─────────────────────────────────────────────────────────────

export type BreakType = 'micro' | 'short' | 'long' | 'overnight';

export interface BreakEvent {
  type: BreakType;
  duration: number; // ms
  reason: string;
  scheduledAt: Date;
}

export interface SchedulerState {
  isOnBreak: boolean;
  currentBreak: BreakEvent | null;
  nextBreak: BreakEvent | null;
  totalBreaks: number;
  totalBreakTime: number; // ms
  sessionStart: Date;
  tasksThisSession: number;
}

// ── Break Configuration ──────────────────────────────────────
const BREAK_CONFIG = {
  micro: { minMs: 2_000,   maxMs: 8_000,   label: 'Micro pause'    }, // 2–8 sec
  short: { minMs: 30_000,  maxMs: 90_000,  label: 'Short break'    }, // 30–90 sec
  long:  { minMs: 300_000, maxMs: 600_000, label: 'Long break'     }, // 5–10 min
  overnight: { minMs: 0,   maxMs: 0,       label: 'Overnight rest' },
};

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min));

class BreakScheduler {
  private state: SchedulerState = {
    isOnBreak: false,
    currentBreak: null,
    nextBreak: null,
    totalBreaks: 0,
    totalBreakTime: 0,
    sessionStart: new Date(),
    tasksThisSession: 0,
  };

  private listeners: Array<(state: SchedulerState) => void> = [];

  getState(): SchedulerState {
    return { ...this.state };
  }

  onStateChange(cb: (state: SchedulerState) => void) {
    this.listeners.push(cb);
  }

  private emit() {
    this.listeners.forEach(cb => cb(this.getState()));
  }

  recordTask() {
    this.state.tasksThisSession++;
  }

  // Decide if a break is needed based on tasks + random chance
  shouldTakeBreak(): BreakType | null {
    const tasks = this.state.tasksThisSession;

    // Micro break: every 2–4 tasks randomly
    if (tasks > 0 && tasks % rand(2, 4) === 0 && Math.random() < 0.4) return 'micro';

    // Short break: every 6–10 tasks
    if (tasks > 0 && tasks % rand(6, 10) === 0) return 'short';

    // Long break: every 20–30 tasks
    if (tasks > 0 && tasks % rand(20, 30) === 0) return 'long';

    return null;
  }

  // Schedule and execute a break (returns promise that resolves when done)
  async takeBreak(type: BreakType): Promise<BreakEvent> {
    const cfg = BREAK_CONFIG[type];
    const duration = type === 'overnight' ? 8 * 3600_000 : rand(cfg.minMs, cfg.maxMs);

    const event: BreakEvent = {
      type,
      duration,
      reason: cfg.label,
      scheduledAt: new Date(),
    };

    this.state.isOnBreak = true;
    this.state.currentBreak = event;
    this.emit();

    // For UI purposes cap actual wait at 3s max (real system would wait full duration)
    const uiDelay = Math.min(duration, 3000);
    await new Promise(r => setTimeout(r, uiDelay));

    this.state.isOnBreak = false;
    this.state.currentBreak = null;
    this.state.totalBreaks++;
    this.state.totalBreakTime += duration;
    this.emit();

    return event;
  }

  // Schedule next break preview
  scheduleNext() {
    const types: BreakType[] = ['micro', 'micro', 'short', 'short', 'long'];
    const type = types[Math.floor(Math.random() * types.length)];
    const cfg = BREAK_CONFIG[type];
    const duration = type === 'overnight' ? 0 : rand(cfg.minMs, cfg.maxMs);

    this.state.nextBreak = {
      type, duration,
      reason: cfg.label,
      scheduledAt: new Date(Date.now() + duration),
    };
    this.emit();
  }

  formatDuration(ms: number): string {
    if (ms < 1000)     return `${ms}ms`;
    if (ms < 60_000)   return `${Math.round(ms / 1000)}s`;
    if (ms < 3600_000) return `${Math.round(ms / 60_000)}m`;
    return `${Math.round(ms / 3600_000)}h`;
  }
}

export const breakScheduler = new BreakScheduler();
