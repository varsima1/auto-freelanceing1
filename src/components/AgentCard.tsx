import { Agent } from '../types';

interface Props { agent: Agent; }

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  active:    { color: 'text-green-400',  dot: 'bg-green-400',  label: 'Active' },
  idle:      { color: 'text-gray-400',   dot: 'bg-gray-400',   label: 'Idle' },
  executing: { color: 'text-cyan-400',   dot: 'bg-cyan-400 animate-pulse', label: 'Executing' },
  learning:  { color: 'text-violet-400', dot: 'bg-violet-400 animate-pulse', label: 'Learning' },
  sleeping:  { color: 'text-blue-400',   dot: 'bg-blue-400',   label: 'Sleeping' },
};

export default function AgentCard({ agent }: Props) {
  const cfg = statusConfig[agent.status];
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-violet-600/30 border border-cyan-500/20 flex items-center justify-center text-sm">
            🤖
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{agent.name}</p>
            <p className="text-gray-600 text-xs">{agent.platform}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Current Task */}
      <div className="bg-gray-800/60 rounded-lg px-3 py-2 mb-3 min-h-[40px] flex items-center">
        {agent.currentTask
          ? <p className="text-gray-300 text-xs leading-relaxed">{agent.currentTask}</p>
          : <p className="text-gray-600 text-xs italic">No active task</p>
        }
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <p className="text-green-400 font-bold text-sm">${agent.revenue.toFixed(2)}</p>
          <p className="text-gray-600 text-xs">Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-cyan-400 font-bold text-sm">{agent.tasksCompleted}</p>
          <p className="text-gray-600 text-xs">Tasks Done</p>
        </div>
        <div className="text-center">
          <p className="text-violet-400 font-bold text-sm">{agent.successRate}%</p>
          <p className="text-gray-600 text-xs">Success</p>
        </div>
      </div>

      {/* Confidence Bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600 text-xs">Confidence</span>
          <span className="text-gray-400 text-xs">{(agent.confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-cyan-400 to-violet-500 h-1.5 rounded-full"
            style={{ width: `${agent.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1 mt-3">
        {agent.skills.map(s => (
          <span key={s} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">{s}</span>
        ))}
      </div>
    </div>
  );
}
