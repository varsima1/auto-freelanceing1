import { Mission } from '../types';

interface Props { mission: Mission; }

const stepStatus = (mission: Mission, index: number) => {
  if (index < mission.completedSteps) return 'done';
  if (index === mission.completedSteps && mission.status === 'in_progress') return 'active';
  return 'pending';
};

export default function MissionPanel({ mission }: Props) {
  const progress = Math.round((mission.completedSteps / mission.steps.length) * 100);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{mission.emoji}</span>
        <div className="flex-1">
          <h2 className="text-white font-bold">Mission {mission.id}: {mission.name}</h2>
          <p className="text-gray-500 text-sm mt-0.5">{mission.description}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium
          ${mission.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : ''}
          ${mission.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ''}
          ${mission.status === 'pending' ? 'bg-gray-700 text-gray-400' : ''}
          ${mission.status === 'locked' ? 'bg-gray-800 text-gray-600' : ''}
        `}>
          {mission.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500">Progress</span>
          <span className="text-gray-400">{mission.completedSteps}/{mission.steps.length} steps ({progress}%)</span>
        </div>
        <div className="bg-gray-800 rounded-full h-2">
          <div className="bg-gradient-to-r from-cyan-400 to-violet-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {mission.steps.map((step, i) => {
          const s = stepStatus(mission, i);
          return (
            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg
              ${s === 'done' ? 'bg-green-500/10' : ''}
              ${s === 'active' ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : ''}
              ${s === 'pending' ? 'bg-gray-800/40' : ''}
            `}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0
                ${s === 'done' ? 'bg-green-500 text-white' : ''}
                ${s === 'active' ? 'bg-cyan-500 text-white' : ''}
                ${s === 'pending' ? 'bg-gray-700 text-gray-500' : ''}
              `}>
                {s === 'done' ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${s === 'done' ? 'text-green-400' : s === 'active' ? 'text-cyan-300' : 'text-gray-500'}`}>
                {step}
              </span>
              {s === 'active' && (
                <span className="ml-auto text-xs text-cyan-400 animate-pulse">▶ In Progress</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
