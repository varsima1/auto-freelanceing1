export type MissionStatus = 'completed' | 'in_progress' | 'pending' | 'locked';

export interface Mission {
  id: number;
  name: string;
  emoji: string;
  description: string;
  status: MissionStatus;
  steps: string[];
  completedSteps: number;
}

export type AgentStatus = 'active' | 'idle' | 'executing' | 'learning' | 'sleeping';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  platform: string;
  tasksCompleted: number;
  successRate: number;
  currentTask: string | null;
  skills: string[];
  revenue: number;
  confidence: number;
}

export type TaskStatus = 'scanning' | 'filtered' | 'executing' | 'verifying' | 'completed' | 'skipped';

export interface Task {
  id: string;
  title: string;
  platform: string;
  confidence: number;
  status: TaskStatus;
  reward: number;
  agentId: string | null;
  timestamp: Date;
  isTemplate: boolean;
}

export interface SystemStats {
  totalAgents: number;
  activeTasks: number;
  totalRevenue: number;
  templatesStored: number;
  successRate: number;
  tasksToday: number;
  uptime: string;
  humanInterventions: number;
}

export interface LogEntry {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'learn';
  message: string;
  timestamp: Date;
  agentId?: string;
}
