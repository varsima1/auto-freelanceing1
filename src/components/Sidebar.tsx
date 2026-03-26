import { Mission } from '../types';

interface SidebarProps {
  missions: Mission[];
  selectedMission: number;
  onSelectMission: (id: number) => void;
}

const statusStyle: Record<string, string> = {
  completed: 'bg-green-500/20 text-green-400 border border-green-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 animate-pulse',
  pending: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  locked: 'bg-gray-800/60 text-gray-600 border border-gray-700/30',
};

const statusLabel: Record<string, string> = {
  completed: '✓',
  in_progress: '▶',
  pending: '○',
  locked: '🔒',
};

export default function Sidebar({ missions, selectedMission, onSelectMission }: SidebarProps) {
  return (
    <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-lg flex items-center justify-center text-lg">
            🧠
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">AutonomousAI</h1>
            <p className="text-gray-500 text-xs">Multi-Agent System v1.0</p>
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <p className="text-gray-600 text-xs uppercase tracking-widest px-2 mb-3 mt-1">Missions</p>
        {missions.map((m) => (
          <button
            key={m.id}
            onClick={() => m.status !== 'locked' && onSelectMission(m.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 group
              ${selectedMission === m.id ? 'bg-gray-800 ring-1 ring-cyan-500/40' : 'hover:bg-gray-800/60'}
              ${m.status === 'locked' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-base w-6 text-center flex-shrink-0">{m.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-medium truncate ${selectedMission === m.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  M{m.id}: {m.name}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${statusStyle[m.status]}`}>
                  {statusLabel[m.status]}
                </span>
              </div>
              {m.status === 'in_progress' && (
                <div className="mt-1.5 bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-violet-500 h-1 rounded-full transition-all"
                    style={{ width: `${(m.completedSteps / m.steps.length) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-gray-500 text-xs">System Online</span>
        </div>
        <p className="text-gray-700 text-xs mt-1">Human interventions: <span className="text-green-400">0</span></p>
      </div>
    </aside>
  );
}
