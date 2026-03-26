import { LogEntry } from '../types';

interface Props { logs: LogEntry[]; }

const typeConfig: Record<string, { color: string; bg: string; icon: string }> = {
  info:    { color: 'text-blue-400',   bg: 'bg-blue-500/10',   icon: 'ℹ' },
  success: { color: 'text-green-400',  bg: 'bg-green-500/10',  icon: '✓' },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: '⚠' },
  error:   { color: 'text-red-400',    bg: 'bg-red-500/10',    icon: '✗' },
  learn:   { color: 'text-violet-400', bg: 'bg-violet-500/10', icon: '🧠' },
};

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function SystemLog({ logs }: Props) {
  const sorted = [...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">System Log</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-gray-600 text-xs">Live</span>
        </div>
      </div>
      <div className="divide-y divide-gray-800/40 max-h-64 overflow-y-auto font-mono">
        {sorted.map(log => {
          const cfg = typeConfig[log.type];
          return (
            <div key={log.id} className={`px-4 py-2.5 flex items-start gap-3 hover:bg-gray-800/20 ${cfg.bg}`}>
              <span className={`text-xs font-bold mt-0.5 flex-shrink-0 w-4 text-center ${cfg.color}`}>{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${cfg.color}`}>{log.message}</p>
              </div>
              <span className="text-gray-700 text-xs flex-shrink-0 ml-2">{formatTime(log.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
