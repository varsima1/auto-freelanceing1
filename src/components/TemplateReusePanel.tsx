/**
 * TemplateReusePanel.tsx
 * Responsibility: Show template adaptations, version history, speed boost UI.
 */

import { useState } from 'react';
import { AdaptedTemplate } from '../engine/templateAdapter';

interface Props {
  adaptations: AdaptedTemplate[];
}

const TYPE_COLORS: Record<string, string> = {
  writing:     'bg-blue-500/20 text-blue-300 border-blue-500/30',
  translation: 'bg-green-500/20 text-green-300 border-green-500/30',
  data_entry:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  coding:      'bg-purple-500/20 text-purple-300 border-purple-500/30',
  email:       'bg-pink-500/20 text-pink-300 border-pink-500/30',
  default:     'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const TYPE_ICONS: Record<string, string> = {
  writing: '✍️', translation: '🌐', data_entry: '📊',
  coding: '💻', email: '📧', default: '🔧',
};

function SpeedBoostBar({ pct }: { pct: number }) {
  const color = pct >= 60 ? 'bg-green-500' : pct >= 45 ? 'bg-yellow-500' : 'bg-blue-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold ${pct >= 60 ? 'text-green-400' : pct >= 45 ? 'text-yellow-400' : 'text-blue-400'}`}>
        +{pct}% faster
      </span>
    </div>
  );
}

function VersionBadge({ version }: { version: number }) {
  return (
    <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs font-mono">
      v{version}
    </span>
  );
}

function SlotChip({ slot, value }: { slot: string; value: string }) {
  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-0.5 text-xs">
      <span className="text-yellow-400 font-mono">{slot}</span>
      <span className="text-gray-500">→</span>
      <span className="text-cyan-300">"{value}"</span>
    </div>
  );
}

export default function TemplateReusePanel({ adaptations }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedAdaptation = adaptations.find(a => a.templateId === selected);

  if (adaptations.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-8 text-center">
        <div className="text-4xl mb-3">🧩</div>
        <p className="text-gray-400">No template adaptations yet.</p>
        <p className="text-gray-500 text-sm mt-1">Templates are adapted when similarity score ≥ 35%</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{adaptations.length}</div>
          <div className="text-xs text-gray-400 mt-0.5">Adaptations</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {adaptations.length > 0
              ? Math.round(adaptations.reduce((s, a) => s + a.speedBoostPct, 0) / adaptations.length)
              : 0}%
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Avg Speed Boost</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {adaptations.reduce((s, a) => s + a.versions.length, 0)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Total Versions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Adaptation list */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Recent Adaptations
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {adaptations.map((a) => (
              <button
                key={`${a.templateId}-${a.versions.length}`}
                onClick={() => setSelected(selected === a.templateId ? null : a.templateId)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selected === a.templateId
                    ? 'border-cyan-500/50 bg-cyan-500/5'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{TYPE_ICONS[a.taskType] ?? '🔧'}</span>
                    <span className="text-sm text-white truncate font-medium">
                      {a.adaptedFor}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <VersionBadge version={a.versions.length} />
                    <span className={`px-1.5 py-0.5 rounded border text-xs ${TYPE_COLORS[a.taskType] ?? TYPE_COLORS.default}`}>
                      {a.taskType}
                    </span>
                  </div>
                </div>
                <SpeedBoostBar pct={a.speedBoostPct} />
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          {selectedAdaptation ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{TYPE_ICONS[selectedAdaptation.taskType] ?? '🔧'}</span>
                <h3 className="text-white font-semibold">{selectedAdaptation.taskType} template</h3>
              </div>

              {/* Adapted content */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Adapted Output</p>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <p className="text-cyan-300 text-sm font-mono">{selectedAdaptation.adaptedContent}</p>
                </div>
              </div>

              {/* Original template */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Original Template</p>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <p className="text-gray-400 text-sm font-mono">{selectedAdaptation.originalContent}</p>
                </div>
              </div>

              {/* Slot replacements */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Slot Replacements</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(selectedAdaptation.slotsReplaced).map(([slot, val]) => (
                    <SlotChip key={slot} slot={slot} value={val} />
                  ))}
                </div>
              </div>

              {/* Version history */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Version History ({selectedAdaptation.versions.length})
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedAdaptation.versions.map((v) => (
                    <div key={v.version} className="flex items-center justify-between text-xs bg-gray-900 rounded px-2 py-1">
                      <div className="flex items-center gap-2">
                        <VersionBadge version={v.version} />
                        <span className="text-gray-400 truncate max-w-32">{v.adaptedFor}</span>
                      </div>
                      <span className="text-green-400 font-medium">+{v.speedBoostPct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="text-3xl mb-3">👈</div>
              <p className="text-gray-400">Select an adaptation to see details</p>
              <p className="text-gray-600 text-sm mt-1">Slot fills, version history, speed boost</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
