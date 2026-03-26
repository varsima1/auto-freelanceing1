/**
 * TemplatePanel.tsx
 * Responsibility: Display live template library from templateStore.
 * Shows top templates, task types, usage counts, success rates.
 */

import { DBTemplate } from '../store/db';

interface Props {
  templates: DBTemplate[];
  totalCount: number;
}

const TYPE_COLORS: Record<string, string> = {
  writing:     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  translation: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  data_entry:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  coding:      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  design:      'bg-pink-500/20 text-pink-300 border-pink-500/30',
  general:     'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const TYPE_ICONS: Record<string, string> = {
  writing: '✍️', translation: '🌐', data_entry: '📊',
  coding: '💻', design: '🎨', general: '⚙️',
};

export default function TemplatePanel({ templates, totalCount }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-white font-semibold text-sm">Template Library</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            <span className="text-emerald-400 font-mono font-bold">{totalCount}</span> stored
          </span>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
            REUSE ACTIVE
          </span>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <div className="text-3xl mb-2">🧠</div>
          <p className="text-sm">No templates yet. Agent is learning...</p>
          <p className="text-xs mt-1 text-gray-700">Templates appear after first completed task</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((tpl, i) => (
            <div
              key={tpl.id}
              className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2.5 hover:border-gray-600 transition-colors"
            >
              {/* Rank */}
              <span className="text-gray-600 text-xs font-mono w-5 text-center">#{i + 1}</span>

              {/* Type badge */}
              <span className={`px-1.5 py-0.5 rounded border text-xs font-medium shrink-0 ${TYPE_COLORS[tpl.taskType] ?? TYPE_COLORS.general}`}>
                {TYPE_ICONS[tpl.taskType] ?? '⚙️'} {tpl.taskType.replace('_', ' ')}
              </span>

              {/* Keywords */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate">
                  {tpl.keywords.slice(0, 5).join(', ')}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-emerald-400 font-mono">×{tpl.usedCount}</p>
                  <p className="text-xs text-gray-600">uses</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-400 font-mono">{tpl.successRate}%</p>
                  <p className="text-xs text-gray-600">success</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-yellow-400 font-mono">${tpl.reward.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">reward</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Learning Indicator */}
      <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
        <p className="text-xs text-gray-500">
          Learning loop active — templates improve with every completed task
        </p>
      </div>
    </div>
  );
}
