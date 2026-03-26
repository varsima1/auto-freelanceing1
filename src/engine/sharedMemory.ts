/**
 * sharedMemory.ts
 * Responsibility: Coordination layer for multi-agent shared learning.
 * Agents broadcast discoveries, share templates, avoid duplicate work.
 */

export type MessageType =
  | 'template_shared'
  | 'skill_leveled'
  | 'task_completed'
  | 'task_claimed'
  | 'broadcast'
  | 'warning';

export interface AgentMessage {
  id: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: 'all' | string;
  type: MessageType;
  payload: Record<string, unknown>;
  timestamp: Date;
  read: boolean;
}

export interface SharedKnowledge {
  templateId: string;
  taskType: string;
  sharedBy: string;
  sharedAt: Date;
  usedBy: string[];
  successRate: number;
}

export interface AgentCollabStats {
  agentId: string;
  agentName: string;
  templatesShared: number;
  templatesReceived: number;
  messagesOut: number;
  messagesIn: number;
  collaborationScore: number;
}

class SharedMemory {
  private messages: AgentMessage[] = [];
  private knowledge: Map<string, SharedKnowledge> = new Map();
  private collabStats: Map<string, AgentCollabStats> = new Map();
  private listeners: ((msg: AgentMessage) => void)[] = [];
  private maxMessages = 100;

  // Register an agent with the shared memory system
  registerAgent(agentId: string, agentName: string): void {
    if (!this.collabStats.has(agentId)) {
      this.collabStats.set(agentId, {
        agentId,
        agentName,
        templatesShared: 0,
        templatesReceived: 0,
        messagesOut: 0,
        messagesIn: 0,
        collaborationScore: 0,
      });
    }
  }

  // Broadcast a message from one agent to all (or specific) agents
  broadcast(
    fromAgentId: string,
    fromAgentName: string,
    type: MessageType,
    payload: Record<string, unknown>,
    toAgentId: 'all' | string = 'all'
  ): AgentMessage {
    const msg: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fromAgentId,
      fromAgentName,
      toAgentId,
      type,
      payload,
      timestamp: new Date(),
      read: false,
    };

    this.messages = [msg, ...this.messages].slice(0, this.maxMessages);

    // Update collab stats for sender
    const senderStats = this.collabStats.get(fromAgentId);
    if (senderStats) {
      senderStats.messagesOut += 1;
      senderStats.collaborationScore = this._calcScore(senderStats);
    }

    // Update collab stats for receivers
    this.collabStats.forEach((stats, agentId) => {
      if (agentId !== fromAgentId) {
        stats.messagesIn += 1;
        if (type === 'template_shared') stats.templatesReceived += 1;
        stats.collaborationScore = this._calcScore(stats);
      }
    });

    // Notify listeners
    this.listeners.forEach(l => l(msg));
    return msg;
  }

  // Share a discovered template with all agents
  shareTemplate(
    fromAgentId: string,
    fromAgentName: string,
    templateId: string,
    taskType: string,
    successRate: number
  ): void {
    const existing = this.knowledge.get(templateId);
    if (existing) {
      existing.successRate = Math.max(existing.successRate, successRate);
      return;
    }

    const knowledge: SharedKnowledge = {
      templateId,
      taskType,
      sharedBy: fromAgentName,
      sharedAt: new Date(),
      usedBy: [],
      successRate,
    };

    this.knowledge.set(templateId, knowledge);

    // Update sharer stats
    const stats = this.collabStats.get(fromAgentId);
    if (stats) {
      stats.templatesShared += 1;
      stats.collaborationScore = this._calcScore(stats);
    }

    this.broadcast(fromAgentId, fromAgentName, 'template_shared', {
      templateId,
      taskType,
      successRate: successRate.toFixed(2),
    });
  }

  // Mark a template as used by an agent
  markTemplateUsed(agentId: string, templateId: string): void {
    const k = this.knowledge.get(templateId);
    if (k && !k.usedBy.includes(agentId)) {
      k.usedBy.push(agentId);
    }
  }

  // Check if a template is already known (avoid duplicate work)
  isKnown(templateId: string): boolean {
    return this.knowledge.has(templateId);
  }

  // Get all shared knowledge
  getAllKnowledge(): SharedKnowledge[] {
    return Array.from(this.knowledge.values())
      .sort((a, b) => b.sharedAt.getTime() - a.sharedAt.getTime());
  }

  // Get messages for display
  getMessages(limit = 30): AgentMessage[] {
    return this.messages.slice(0, limit);
  }

  // Get all collab stats
  getAllStats(): AgentCollabStats[] {
    return Array.from(this.collabStats.values());
  }

  // Subscribe to new messages
  subscribe(listener: (msg: AgentMessage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get total messages count
  getMessageCount(): number {
    return this.messages.length;
  }

  private _calcScore(stats: AgentCollabStats): number {
    return Math.round(
      stats.templatesShared * 10 +
      stats.templatesReceived * 3 +
      stats.messagesOut * 1.5 +
      stats.messagesIn * 0.5
    );
  }
}

export const sharedMemory = new SharedMemory();
