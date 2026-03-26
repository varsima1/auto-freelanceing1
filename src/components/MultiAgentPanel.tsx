/**
 * MultiAgentPanel.tsx
 * Responsibility: Display all running agents in parallel with individual pipeline states.
 */

import { AgentInstance } from '../engine/agentFactory';
import { PipelineState } from '../engine/taskPipeline';
import { QueueTask }     from '../engine/taskQueue';

interface Props {
  agents:       AgentInstance[];
  pipelines:    Record<string, PipelineState>;
  queueStats:   { total: number; available: number; claimed: number; completed: number; skipped: number };
  recentTasks:  QueueTask[];
}

const COLOR_MAP: Record<string, string> = {
  cyan:   'border-cyan-500/40 bg-cyan-500/5',
  purple: 'border-purple-500/40 bg-purple-500/5',
  green:  'border-green-500/40 bg-green-500/5',
  yellow: 'border-yellow-500/40 bg-yellow-500/5',
};

const BADGE_MAP: Record<string, string> = {
  cyan:   'bg-cyan-500/20 text-cyan-300',
  purple: 'bg-purple-500/20 text-purple-300',
  green:  'bg-green-500/20 text-green-300',
  yellow: 'bg-yellow-500/20 text-yellow-300',
};

const STAGE_COLORS: Record<string, string> = {
  idle:        'text-gray-500',
  scanning:    'text-blue-400',
  filtering:   'text-yellow-400',
  executing:   'text-cyan-400',
  verifying:   'text-purple-400',
  fixing:      'text-orange-400',
  reverifying: 'text-teal-400',
  learning:    'text-pink-400',
  completed:   'text-green-400',
  skipped:     'text-red-400',
};

const STAGE_ICONS: Record<string, string> = {
  idle:        '💤',
  scanning:    '🔍',
  filtering:   '⚖️',
  executing:   '⚡',
  verifying:   '🔬',
  fixing:      '🔧',
  reverifying: '✅',
  learning:    '🧠',
  completed:   '💰',
  skipped:     '⏭',
};

const STATUS_DOT: Record<string, string> = {
  idle:        'bg-gray-500',
  scanning:    'bg-blue-400 animate-pulse',
  filtering:   'bg-yellow-400 animate-pulse',
  executing:   'bg-cyan-400 animate-pulse',
  verifying:   'bg-purple-400 animate-pulse',
  fixing:      'bg-orange-400 animate-pulse',
  reverifying: 'bg-teal-400 animate-pulse',
  learning:    'bg-pink-400 animate-pulse',
  completed:   'bg-green-400',
  skipped:     'bg-red-400',
};

export default function MultiAgentPanel({ agents, pipelines, queueStats, recentTasks }: Props) {
  return (
    <div className="space-y-6">

      {/* Queue Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Tasks', value: queueStats.total,     color: 'text-white'        },
          { label: 'Available',   value: queueStats.available, color: 'text-blue-400'     },
          { label: 'Claimed',     value: queueStats.claimed,   color: 'text-yellow-400'   },
          { label: 'Completed',   value: queueStats.completed, color: 'text-green-400'    },
          { label: 'Skipped',     value: queueStats.skipped,   color: 'text-red-400'      },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map(agent => {
          const pipeline = pipelines[agent.id] ?? { currentStage: 'idle', confidence: 0, reward: 0, taskTitle: '' };
          const stage    = pipeline.currentStage as string;
          const colClass = COLOR_MAP[agent.color] ?? COLOR_MAP.cyan;
          const badgeClass = BADGE_MAP[agent.color] ?? BADGE_MAP.cyan;

          return (
            <div key={agent.id} className={`border rounded-xl p-4 ${colClass}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <div className="font-bold text-white">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[stage] ?? 'bg-gray-500'}`} />
                  <span className={`text-xs font-mono ${STAGE_COLORS[stage] ?? 'text-gray-400'}`}>
                    {STAGE_ICONS[stage]} {stage.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Role Badge */}
              <div className={`inline-block text-xs px-2 py-0.5 rounded-full mb-3 ${badgeClass}`}>
                {agent.role}
              </div>

              {/* Current Task */}
              <div className="bg-gray-900/50 rounded-lg p-2 mb-3 min-h-[40px]">
                {pipeline.taskTitle ? (
                  <p className="text-xs text-gray-300 truncate">{pipeline.taskTitle}</p>
                ) : (
                  <p className="text-xs text-gray-600 italic">Waiting for task...</p>
                )}
              </div>

              {/* Confidence Bar */}
              {pipeline.confidence > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Confidence</span>
                    <span className={pipeline.confidence >= 0.85 ? 'text-green-400' : 'text-red-400'}>
                      {(pipeline.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pipeline.confidence >= 0.85 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pipeline.confidence * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-900/40 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-green-400">${agent.totalEarned.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Earned</div>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-blue-400">{agent.tasksCompleted}</div>
                  <div className="text-xs text-gray-500">Tasks Done</div>
                </div>
              </div>

              {/* Specializations */}
              <div className="flex flex-wrap gap-1 mt-3">
                {agent.specialization.map(s => (
                  <span key={s} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shared Task Queue */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          🗂️ Shared Task Queue — Recent Activity
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentTasks.slice(0, 15).map(task => (
            <div key={task.id} className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.status === 'completed' ? 'bg-green-400'
                  : task.status === 'claimed' ? 'bg-yellow-400 animate-pulse'
                  : task.status === 'skipped' ? 'bg-red-400'
                  : 'bg-gray-500'
                }`} />
                <span className="text-xs text-gray-300 truncate">{task.title}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                <span className="text-xs text-gray-500">{task.platform}</span>
                <span className="text-xs text-green-400">${task.reward.toFixed(2)}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  task.status === 'completed' ? 'bg-green-500/20 text-green-400'
                  : task.status === 'claimed' ? 'bg-yellow-500/20 text-yellow-400'
                  : task.status === 'skipped' ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-700 text-gray-400'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
          {recentTasks.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">Waiting for tasks...</p>
          )}
        </div>
      </div>
    </div>
  );
}
