// ─────────────────────────────────────────────────────────────
// PlatformRouterPanel.tsx — Live platform routing dashboard
// Shows per-platform stats, route log, earnings breakdown
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { PlatformStats, RouteDecision } from '../platform/platformRouter';

interface Props {
  platformStats: PlatformStats[];
  routeLog: RouteDecision[];
  totalRouted: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  upwork:     'text-green-400  border-green-500/30  bg-green-500/10',
  fiverr:     'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  freelancer: 'text-blue-400   border-blue-500/30   bg-blue-500/10',
  toptal:     'text-red-400    border-red-500/30    bg-red-500/10',
};

const PLATFORM_BAR: Record<string, string> = {
  upwork:     'bg-green-500',
  fiverr:     'bg-yellow-500',
  freelancer: 'bg-blue-500',
  toptal:     'bg-red-500',
};

export default function PlatformRouterPanel({ platformStats, routeLog, totalRouted }: Props) {
  const [subTab, setSubTab] = useState<'stats' | 'routing' | 'earnings'>('stats');

  const totalEarned = platformStats.reduce((s, p) => s + p.totalEarned, 0);
  const totalTasks  = platformStats.reduce((s, p) => s + p.tasksCompleted, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">🔌 Platform Router</h2>
          <p className="text-xs text-gray-400 mt-0.5">Unified task routing across 4 platforms</p>
        </div>
        <div className="flex gap-3 text-center">
          <div className="bg-gray-800 rounded-lg px-3 py-1.5">
            <div className="text-lg font-bold text-green-400">${totalEarned.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Total Earned</div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-1.5">
            <div className="text-lg font-bold text-blue-400">{totalTasks}</div>
            <div className="text-xs text-gray-500">Tasks Routed</div>
          </div>
          <div className="bg-gray-800 rounded-lg px-3 py-1.5">
            <div className="text-lg font-bold text-purple-400">{totalRouted}</div>
            <div className="text-xs text-gray-500">Decisions</div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {(['stats','routing','earnings'] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
              ${subTab === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {t === 'stats' ? '📊 Platform Stats' : t === 'routing' ? '🔀 Route Log' : '💰 Earnings'}
          </button>
        ))}
      </div>

      {/* Platform Stats */}
      {subTab === 'stats' && (
        <div className="grid grid-cols-2 gap-3">
          {platformStats.map(p => {
            const colorClass = PLATFORM_COLORS[p.id] || 'text-gray-400 border-gray-700 bg-gray-800';
            const barClass   = PLATFORM_BAR[p.id] || 'bg-gray-500';
            const pct = totalEarned > 0 ? (p.totalEarned / totalEarned) * 100 : 0;
            return (
              <div key={p.id} className={`border rounded-xl p-4 ${colorClass}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.emoji}</span>
                    <span className="font-bold text-sm">{p.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                    {p.isActive ? '● LIVE' : '○ OFF'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div><span className="text-gray-500">Tasks:</span> <span className="font-bold">{p.tasksCompleted}</span></div>
                  <div><span className="text-gray-500">Avg:</span> <span className="font-bold">${p.avgEarning.toFixed(2)}</span></div>
                  <div><span className="text-gray-500">Fee:</span> <span className="font-bold">{(p.commissionRate * 100).toFixed(0)}%</span></div>
                  <div><span className="text-gray-500">Net:</span> <span className="font-bold text-green-400">${p.totalEarned.toFixed(2)}</span></div>
                </div>
                {/* Share bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Revenue share</span><span>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${barClass} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {p.lastActivity && (
                  <div className="text-xs text-gray-600 mt-2">
                    Last: {p.lastActivity.toLocaleTimeString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Route Log */}
      {subTab === 'routing' && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {routeLog.length === 0 && (
            <div className="text-center text-gray-600 py-8 text-sm">
              ⏳ Waiting for routing decisions…
            </div>
          )}
          {routeLog.map((r, i) => {
            const colorClass = PLATFORM_COLORS[r.platform] || 'text-gray-400';
            return (
              <div key={i} className="bg-gray-800 rounded-lg p-3 flex items-start gap-3 border border-gray-700">
                <span className="text-lg mt-0.5">🔀</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold uppercase ${colorClass}`}>{r.platform}</span>
                    <span className="text-gray-500 text-xs">→</span>
                    <span className="text-gray-300 text-xs font-medium">{r.agentId}</span>
                    <span className="ml-auto text-green-400 text-xs font-bold">${r.expectedEarning.toFixed(2)}</span>
                  </div>
                  <div className="text-gray-500 text-xs mt-1 truncate">{r.reason}</div>
                  <div className="text-gray-700 text-xs mt-0.5">{r.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Earnings Breakdown */}
      {subTab === 'earnings' && (
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Revenue Breakdown by Platform</div>
            {platformStats.map(p => {
              const pct = totalEarned > 0 ? (p.totalEarned / totalEarned) * 100 : 0;
              const barClass = PLATFORM_BAR[p.id] || 'bg-gray-500';
              return (
                <div key={p.id} className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300 font-medium">{p.emoji} {p.name}</span>
                    <span className="text-green-400 font-bold">${p.totalEarned.toFixed(2)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${barClass} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{p.tasksCompleted} tasks × ${p.avgEarning.toFixed(2)} avg</span>
                    <span>{(p.commissionRate * 100).toFixed(0)}% fee deducted</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">${totalEarned.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">Total Net Earned</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{totalTasks}</div>
              <div className="text-xs text-gray-500 mt-1">Tasks Completed</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-400">
                ${totalTasks > 0 ? (totalEarned / totalTasks).toFixed(2) : '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Avg Per Task</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
