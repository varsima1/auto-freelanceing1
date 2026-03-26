/**
 * AgentCommsLog.tsx
 * Responsibility: Displays inter-agent communication feed,
 * shared knowledge library, and collaboration stats.
 */

import { useState, useEffect } from 'react';
import { sharedMemory, AgentMessage, SharedKnowledge, AgentCollabStats } from '../engine/sharedMemory';

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  template_shared:  { icon: '📤', color: 'text-blue-400',   label: 'Template Shared'  },
  skill_leveled:    { icon: '⬆️', color: 'text-yellow-400', label: 'Skill Level Up'   },
  task_completed:   { icon: '✅', color: 'text-green-400',  label: 'Task Completed'   },
  task_claimed:     { icon: '🔒', color: 'text-purple-400', label: 'Task Claimed'     },
  broadcast:        { icon: '📡', color: 'text-cyan-400',   label: 'Broadcast'        },
  warning:          { icon: '⚠️', color: 'text-orange-400', label: 'Warning'          },
};

const AGENT_COLORS: Record<string, string> = {
  'agent-001': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'agent-002': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'agent-003': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

function MessageRow({ msg }: { msg: AgentMessage }) {
  const cfg = TYPE_CONFIG[msg.type] ?? TYPE_CONFIG.broadcast;
  const agentColor = AGENT_COLORS[msg.fromAgentId] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  const timeStr = msg.timestamp.toLocaleTimeString();

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/40 hover:border-gray-600/60 transition-colors">
      <span className="text-lg mt-0.5">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${agentColor}`}>
            {msg.fromAgentName}
          </span>
          <span className="text-gray-500 text-xs">→</span>
          <span className="text-xs text-gray-400">
            {msg.toAgentId === 'all' ? '🌐 All Agents' : msg.toAgentId}
          </span>
          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
          <span className="text-gray-600 text-xs ml-auto font-mono">{timeStr}</span>
        </div>
        <div className="mt-1 text-xs text-gray-400 font-mono">
          {Object.entries(msg.payload).map(([k, v]) => (
            <span key={k} className="mr-3">
              <span className="text-gray-500">{k}:</span>{' '}
              <span className="text-gray-300">{String(v)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function KnowledgeRow({ k }: { k: SharedKnowledge }) {
  const pct = Math.round(k.successRate * 100);
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/40 border border-gray-700/30">
      <span className="text-blue-400 text-sm">📚</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white font-mono truncate">{k.templateId}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {k.taskType}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">by {k.sharedBy}</span>
          <span className="text-gray-600">·</span>
          <span className="text-xs text-gray-500">used by {k.usedBy.length} agents</span>
          <div className="flex-1 h-1 bg-gray-700 rounded ml-2">
            <div className="h-1 bg-green-500 rounded" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-green-400 font-mono">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

function CollabCard({ stat }: { stat: AgentCollabStats }) {
  const agentColor = AGENT_COLORS[stat.agentId] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  return (
    <div className={`p-3 rounded-lg border ${agentColor.replace('text-', 'border-').replace('/30', '/40')} bg-gray-800/50`}>
      <div className={`text-sm font-bold ${agentColor.split(' ')[1]}`}>{stat.agentName}</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="text-center p-1.5 rounded bg-gray-700/40">
          <div className="text-blue-400 font-bold text-lg">{stat.templatesShared}</div>
          <div className="text-gray-500">Shared</div>
        </div>
        <div className="text-center p-1.5 rounded bg-gray-700/40">
          <div className="text-purple-400 font-bold text-lg">{stat.templatesReceived}</div>
          <div className="text-gray-500">Received</div>
        </div>
        <div className="text-center p-1.5 rounded bg-gray-700/40">
          <div className="text-cyan-400 font-bold text-lg">{stat.messagesOut}</div>
          <div className="text-gray-500">Sent</div>
        </div>
        <div className="text-center p-1.5 rounded bg-gray-700/40">
          <div className="text-yellow-400 font-bold text-lg">{stat.collaborationScore}</div>
          <div className="text-gray-500">Score</div>
        </div>
      </div>
    </div>
  );
}

type SubTab = 'comms' | 'knowledge' | 'collab';

export default function AgentCommsLog() {
  const [messages, setMessages]   = useState<AgentMessage[]>(sharedMemory.getMessages());
  const [knowledge, setKnowledge] = useState<SharedKnowledge[]>(sharedMemory.getAllKnowledge());
  const [collabStats, setCollabStats] = useState<AgentCollabStats[]>(sharedMemory.getAllStats());
  const [subTab, setSubTab]       = useState<SubTab>('comms');
  const [filter, setFilter]       = useState<string>('all');

  useEffect(() => {
    const unsub = sharedMemory.subscribe(() => {
      setMessages(sharedMemory.getMessages());
      setKnowledge(sharedMemory.getAllKnowledge());
      setCollabStats(sharedMemory.getAllStats());
    });
    const interval = setInterval(() => {
      setMessages(sharedMemory.getMessages());
      setKnowledge(sharedMemory.getAllKnowledge());
      setCollabStats(sharedMemory.getAllStats());
    }, 2000);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  const filteredMsgs = filter === 'all'
    ? messages
    : messages.filter(m => m.type === filter);

  const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: 'comms',     label: `📡 Comms (${messages.length})`     },
    { id: 'knowledge', label: `📚 Knowledge (${knowledge.length})` },
    { id: 'collab',    label: '🤝 Collab Stats'                    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">🤝 Inter-Agent Communication</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Agents share templates, discoveries, and coordinate in real-time
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div className="text-green-400 font-bold text-sm">{messages.length} messages</div>
          <div>{knowledge.length} shared templates</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === t.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {/* Comms Tab */}
      {subTab === 'comms' && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {['all', 'template_shared', 'task_completed', 'task_claimed', 'skill_leveled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  filter === f
                    ? 'bg-blue-600/40 text-blue-300 border border-blue-500/50'
                    : 'bg-gray-800 text-gray-500 hover:text-gray-300'
                }`}
              >{f === 'all' ? '🌐 All' : TYPE_CONFIG[f]?.icon + ' ' + TYPE_CONFIG[f]?.label}</button>
            ))}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {filteredMsgs.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">
                No messages yet — agents will start communicating soon...
              </div>
            ) : (
              filteredMsgs.map(msg => <MessageRow key={msg.id} msg={msg} />)
            )}
          </div>
        </div>
      )}

      {/* Knowledge Tab */}
      {subTab === 'knowledge' && (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {knowledge.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              No shared knowledge yet — templates will appear as agents complete tasks...
            </div>
          ) : (
            knowledge.map(k => <KnowledgeRow key={k.templateId} k={k} />)
          )}
        </div>
      )}

      {/* Collab Stats Tab */}
      {subTab === 'collab' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collabStats.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-600 text-sm">
              Agents registering... stats will appear shortly.
            </div>
          ) : (
            collabStats.map(s => <CollabCard key={s.agentId} stat={s} />)
          )}
          {collabStats.length > 0 && (
            <div className="col-span-3 p-3 rounded-lg bg-gray-800/40 border border-gray-700/30">
              <div className="text-xs font-bold text-gray-300 mb-2">🌐 Network Summary</div>
              <div className="grid grid-cols-4 gap-3 text-xs text-center">
                <div><div className="text-white font-bold text-lg">{messages.length}</div><div className="text-gray-500">Total Messages</div></div>
                <div><div className="text-blue-400 font-bold text-lg">{knowledge.length}</div><div className="text-gray-500">Shared Templates</div></div>
                <div><div className="text-green-400 font-bold text-lg">{collabStats.reduce((s, a) => s + a.templatesShared, 0)}</div><div className="text-gray-500">Templates Broadcast</div></div>
                <div><div className="text-yellow-400 font-bold text-lg">{collabStats.reduce((s, a) => s + a.collaborationScore, 0)}</div><div className="text-gray-500">Total Collab Score</div></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
