import { Task } from '../types';

interface Props { tasks: Task[]; }

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  scanning:  { bg: 'bg-blue-500/10',   text: 'text-blue-400',   label: 'Scanning',  icon: '🔍' },
  filtered:  { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Filtered',  icon: '⚙️' },
  executing: { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   label: 'Executing', icon: '▶️' },
  verifying: { bg: 'bg-violet-500/10', text: 'text-violet-400', label: 'Verifying', icon: '🔎' },
  completed: { bg: 'bg-green-500/10',  text: 'text-green-400',  label: 'Completed', icon: '✅' },
  skipped:   { bg: 'bg-red-500/10',    text: 'text-red-400',    label: 'Skipped',   icon: '⛔' },
};

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function TaskFeed({ tasks }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Task Feed</h3>
        <span className="text-gray-600 text-xs">{tasks.length} tasks</span>
      </div>
      <div className="divide-y divide-gray-800/60">
        {tasks.map(task => {
          const cfg = statusConfig[task.status];
          const confColor = task.confidence >= 0.85 ? 'text-green-400' : 'text-red-400';
          return (
            <div key={task.id} className="px-4 py-3 hover:bg-gray-800/30 transition-all">
              <div className="flex items-start gap-3">
                <span className="text-base mt-0.5 flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-gray-300 text-xs leading-relaxed flex-1 truncate">{task.title}</p>
                    <span className="text-green-400 text-xs font-semibold flex-shrink-0">${task.reward.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                    <span className={`text-xs font-medium ${confColor}`}>
                      {task.confidence >= 0.85 ? '✓' : '✗'} {(task.confidence * 100).toFixed(0)}% conf
                    </span>
                    {task.isTemplate && <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">📋 Template</span>}
                    {task.agentId && <span className="text-xs text-gray-600">{task.agentId}</span>}
                    <span className="text-gray-700 text-xs ml-auto">{timeAgo(task.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
