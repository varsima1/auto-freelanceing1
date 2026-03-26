// ─────────────────────────────────────────────────────────────
// PlatformPanel.tsx — Platform connection status display
// ─────────────────────────────────────────────────────────────
import { PlatformState } from '../platform/platformAdapter';

interface Props {
  platforms: PlatformState[];
  onConnect: (id: string) => void;
}

const STATUS_CONFIG = {
  connected:     { color: 'text-green-400',  bg: 'bg-green-500',  dot: 'animate-pulse', label: 'LIVE'          },
  disconnected:  { color: 'text-gray-500',   bg: 'bg-gray-600',   dot: '',              label: 'OFFLINE'       },
  reconnecting:  { color: 'text-yellow-400', bg: 'bg-yellow-500', dot: 'animate-ping',  label: 'CONNECTING...' },
  rate_limited:  { color: 'text-orange-400', bg: 'bg-orange-500', dot: '',              label: 'RATE LIMITED'  },
};

export default function PlatformPanel({ platforms, onConnect }: Props) {
  const connected = platforms.filter(p => p.status === 'connected').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Platform Connections</h3>
          <p className="text-xs text-gray-500 mt-0.5">{connected}/{platforms.length} platforms active</p>
        </div>
        <div className="text-xs text-gray-600 font-mono">
          Mock mode • Real APIs in Mission 4
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-2 gap-3">
        {platforms.map(p => {
          const cfg = STATUS_CONFIG[p.status];
          return (
            <div key={p.id}
              className={`bg-gray-900 border rounded-xl p-4 transition-all ${
                p.status === 'connected' ? 'border-gray-700' : 'border-gray-800'
              }`}
            >
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p.emoji}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{p.name}</div>
                    <div className={`text-xs font-mono font-bold ${cfg.color}`}>{cfg.label}</div>
                  </div>
                </div>
                {/* Status dot */}
                <div className="relative flex items-center justify-center w-6 h-6">
                  {p.status === 'connected' && (
                    <div className={`absolute w-3 h-3 rounded-full ${cfg.bg} opacity-40 ${cfg.dot}`} />
                  )}
                  <div className={`w-2 h-2 rounded-full ${cfg.bg}`} />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Tasks Scanned</span>
                  <span className="text-gray-300 font-mono">{p.tasksScanned}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Accepted</span>
                  <span className="text-green-400 font-mono">{p.tasksAccepted}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Earned</span>
                  <span className="text-emerald-400 font-mono">${p.totalEarned.toFixed(2)}</span>
                </div>
                {p.status === 'connected' && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Ping</span>
                    <span className="text-blue-400 font-mono">{p.pingMs}ms</span>
                  </div>
                )}
              </div>

              {/* Connect button for offline platforms */}
              {p.status === 'disconnected' && (
                <button
                  onClick={() => onConnect(p.id)}
                  className="mt-3 w-full text-xs py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all border border-gray-700"
                >
                  Connect
                </button>
              )}
              {p.status === 'reconnecting' && (
                <div className="mt-3 w-full text-xs py-1.5 rounded-lg bg-yellow-900/20 text-yellow-500 text-center border border-yellow-900/30">
                  Connecting...
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Break Scheduler Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span>⏰</span>
          <span className="text-sm font-semibold text-white">Break Scheduler</span>
          <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full ml-auto">Active</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="text-center">
            <div className="text-gray-300 font-mono">2–8s</div>
            <div className="text-gray-600 mt-0.5">Micro pause</div>
          </div>
          <div className="text-center">
            <div className="text-gray-300 font-mono">30–90s</div>
            <div className="text-gray-600 mt-0.5">Short break</div>
          </div>
          <div className="text-center">
            <div className="text-gray-300 font-mono">5–10m</div>
            <div className="text-gray-600 mt-0.5">Long break</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600 border-t border-gray-800 pt-2">
          Prevents detection • Simulates real worker patterns • ±30% timing jitter
        </div>
      </div>
    </div>
  );
}
