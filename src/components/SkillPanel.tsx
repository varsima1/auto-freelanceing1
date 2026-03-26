/**
 * SkillPanel.tsx
 * Responsibility: Display skill tree with XP bars, levels, and level-up history.
 */

import { Skill, LevelUpEvent, SkillLevel, LEVEL_ORDER } from '../engine/skillEngine';

interface Props {
  skills: Skill[];
  levelUps: LevelUpEvent[];
  totalXP: number;
}

const LEVEL_COLORS: Record<SkillLevel, { badge: string; bar: string; glow: string }> = {
  Beginner:     { badge: 'bg-gray-700 text-gray-300',   bar: 'bg-gray-500',   glow: '' },
  Intermediate: { badge: 'bg-blue-900 text-blue-300',   bar: 'bg-blue-500',   glow: 'shadow-blue-500/30' },
  Expert:       { badge: 'bg-purple-900 text-purple-300', bar: 'bg-purple-500', glow: 'shadow-purple-500/40' },
  Master:       { badge: 'bg-yellow-900 text-yellow-300', bar: 'bg-yellow-400', glow: 'shadow-yellow-400/50' },
};

const LEVEL_STARS: Record<SkillLevel, string> = {
  Beginner: '⭐', Intermediate: '⭐⭐', Expert: '⭐⭐⭐', Master: '⭐⭐⭐⭐',
};

function SkillCard({ skill }: { skill: Skill }) {
  const colors = LEVEL_COLORS[skill.level];
  const isMaster = skill.level === 'Master';

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-500 transition-all ${isMaster ? 'border-yellow-600/50 shadow-lg shadow-yellow-400/10' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{skill.icon}</span>
          <div>
            <p className="text-white font-semibold text-sm">{skill.name}</p>
            <p className="text-gray-500 text-xs">{skill.tasksCompleted} tasks</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.badge}`}>
          {skill.level}
        </span>
      </div>

      {/* XP Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">{LEVEL_STARS[skill.level]}</span>
          <span className="text-gray-400 font-mono">
            {isMaster ? `${skill.xp} XP MAX` : `${skill.xp} / ${skill.xp + skill.xpToNextLevel} XP`}
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${colors.bar} ${colors.glow ? 'shadow ' + colors.glow : ''}`}
            style={{ width: `${isMaster ? 100 : skill.xpProgress}%` }}
          />
        </div>
        {!isMaster && (
          <p className="text-gray-600 text-xs mt-1">
            {skill.xpToNextLevel} XP to {LEVEL_ORDER[LEVEL_ORDER.indexOf(skill.level) + 1]}
          </p>
        )}
        {isMaster && (
          <p className="text-yellow-500 text-xs mt-1 font-semibold">🏆 Maximum Level Achieved!</p>
        )}
      </div>

      {/* Level Progress Dots */}
      <div className="flex gap-1 mt-2">
        {LEVEL_ORDER.map((lvl) => {
          const reached = LEVEL_ORDER.indexOf(skill.level) >= LEVEL_ORDER.indexOf(lvl);
          return (
            <div
              key={lvl}
              className={`flex-1 h-1 rounded-full ${reached ? colors.bar : 'bg-gray-700'}`}
              title={lvl}
            />
          );
        })}
      </div>
    </div>
  );
}

function LevelUpFeed({ events }: { events: LevelUpEvent[] }) {
  if (events.length === 0) return (
    <div className="text-center py-6 text-gray-600 text-sm">
      No level-ups yet. Keep completing tasks! 🚀
    </div>
  );

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {events.map((e, i) => (
        <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2 border border-yellow-700/30">
          <span className="text-yellow-400 text-lg">🎉</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">
              {e.skillName} leveled up!
            </p>
            <p className="text-gray-400 text-xs">
              <span className="text-gray-500">{e.from}</span>
              {' → '}
              <span className={e.to === 'Master' ? 'text-yellow-400 font-bold' : 'text-blue-400 font-bold'}>
                {e.to}
              </span>
            </p>
          </div>
          <span className="text-gray-600 text-xs whitespace-nowrap">
            {e.timestamp.toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SkillPanel({ skills, levelUps, totalXP }: Props) {
  const masterCount   = skills.filter(s => s.level === 'Master').length;
  const expertCount   = skills.filter(s => s.level === 'Expert').length;
  const avgProgress   = skills.length
    ? Math.round(skills.reduce((sum, s) => sum + s.xpProgress, 0) / skills.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total XP',    value: totalXP.toLocaleString(), color: 'text-yellow-400', icon: '⚡' },
          { label: 'Masters',     value: masterCount,              color: 'text-yellow-400', icon: '🏆' },
          { label: 'Experts',     value: expertCount,              color: 'text-purple-400', icon: '⭐⭐⭐' },
          { label: 'Avg Progress',value: `${avgProgress}%`,        color: 'text-blue-400',   icon: '📈' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-500 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Skill Tree Grid */}
      <div>
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
          🌳 Skill Tree — {skills.length} Skills
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {skills.map(skill => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>

      {/* Level-Up History */}
      <div>
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
          🎉 Level-Up History — {levelUps.length} events
        </h3>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <LevelUpFeed events={levelUps} />
        </div>
      </div>

      {/* XP Legend */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
          📊 XP Thresholds
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { level: 'Beginner',     xp: '0',    color: 'text-gray-400',   dot: 'bg-gray-500' },
            { level: 'Intermediate', xp: '100',  color: 'text-blue-400',   dot: 'bg-blue-500' },
            { level: 'Expert',       xp: '300',  color: 'text-purple-400', dot: 'bg-purple-500' },
            { level: 'Master',       xp: '700',  color: 'text-yellow-400', dot: 'bg-yellow-400' },
          ].map(t => (
            <div key={t.level} className="text-center">
              <div className={`w-3 h-3 rounded-full ${t.dot} mx-auto mb-1`} />
              <p className={`text-xs font-semibold ${t.color}`}>{t.level}</p>
              <p className="text-gray-600 text-xs">{t.xp} XP</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
