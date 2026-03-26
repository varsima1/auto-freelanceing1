// ─────────────────────────────────────────────────────────────
// ErrorLogPanel.tsx — Error log with auto-fix rate display
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export interface ErrorEntry {
  id: string;
  timestamp: Date;
  type: 'task_failed' | 'verify_failed' | 'platform_error' | 'confidence_low' | 'auto_fixed';
  message: string;
  agentId: string;
  resolved: boolean;
  fixAttempts: number;
}

interface Props {
  errors: ErrorEntry[];
}

const TYPE_CONFIG: Record<ErrorEntry['type'], { icon: string; color: string; label: string }> = {
  task_failed:      { icon: '💥', color: 'text-red-400',    label: 'Task Failed'     },
  verify_failed:    { icon: '⚠️', color: 'text-orange-400', label: 'Verify Failed'   },
  platform_error:   { icon: '🔌', color: 'text-yellow-400', label: 'Platform Error'  },
  confidence_low:   { icon: '📉', color: 'text-blue-400',   label: 'Low Confidence'  },
  auto_fixed:       { icon: '🔧', color: 'text-green-400',  label: 'Auto Fixed'      },
};

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function ErrorLogPanel({ errors }: Props) {
  const [filter, setFilter] = useState<ErrorEntry['type'] | 'all'>('all');
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const total      = errors.length;
  const resolved   = errors.filter(e => e.resolved).length;
  const autoFixed  = errors.filter(e => e.type === 'auto_fixed').length;
  const autoFixRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  const filtered = filter === 'all' ? errors : errors.filter(e => e.type === filter);

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Errors',   value: total,        color: 'text-red-400'   },
          { label: 'Auto-Fixed',     value: resolved,     color: 'text-green-400' },
          { label: 'Fix Rate',       value: `${autoFixRate}%`, color: autoFixRate >= 80 ? 'text-green-400' : 'text-yellow-400' },
          { label: 'Human Needed',   value: total - resolved, color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Auto-Fix Rate Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400 font-medium">🔧 Auto-Fix Rate</span>
          <span className={`text-sm font-bold font-mono ${autoFixRate >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
            {autoFixRate}%
          </span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${autoFixRate >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
            style={{ width: `${autoFixRate}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {autoFixed} errors auto-resolved • {total - resolved} pending human review
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-3 py-1 rounded-full border transition-all ${
            filter === 'all' ? 'border-gray-400 text-white bg-gray-700' : 'border-gray-700 text-gray-500 hover:border-gray-500'
          }`}
        >
          All ({total})
        </button>
        {(Object.keys(TYPE_CONFIG) as ErrorEntry['type'][]).map(type => {
          const cfg = TYPE_CONFIG[type];
          const count = errors.filter(e => e.type === type).length;
          if (count === 0) return null;
          return (
            <button key={type} onClick={() => setFilter(type)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                filter === type ? 'border-gray-400 text-white bg-gray-700' : 'border-gray-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              {cfg.icon} {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Error List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-600 py-8 text-sm">
            ✅ No errors in this category
          </div>
        ) : (
          filtered.map(err => {
            const cfg = TYPE_CONFIG[err.type];
            return (
              <div key={err.id}
                className={`bg-gray-900 border rounded-lg p-3 flex items-start gap-3 transition-all ${
                  err.resolved ? 'border-gray-800 opacity-60' : 'border-red-900/40'
                }`}
              >
                <span className="text-lg flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className="text-xs text-gray-500 font-mono">{err.agentId}</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className="text-xs text-gray-600">{timeAgo(err.timestamp)}</span>
                    {err.resolved && (
                      <span className="text-xs bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">✓ fixed</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{err.message}</p>
                  {err.fixAttempts > 0 && (
                    <p className="text-xs text-gray-600 mt-0.5">Fix attempts: {err.fixAttempts}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
