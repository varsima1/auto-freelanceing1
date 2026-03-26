/**
 * VerificationPanel.tsx
 * Responsibility: Show per-rule verification breakdown, pass/fail, fix details.
 */

import { VerificationReport, RuleResult } from '../engine/verificationEngine';

interface Props {
  reports: VerificationReport[];
  liveReport: VerificationReport | null;
}

function RuleRow({ result }: { result: RuleResult }) {
  const scoreColor =
    result.score >= 0.8 ? 'text-green-400' :
    result.score >= 0.6 ? 'text-yellow-400' : 'text-red-400';
  const barColor =
    result.score >= 0.8 ? 'bg-green-500' :
    result.score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className={`p-3 rounded-lg border transition-all ${
      result.passed
        ? 'border-green-500/20 bg-green-500/5'
        : 'border-red-500/20 bg-red-500/5'
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{result.passed ? '✅' : '❌'}</span>
          <span className="text-sm font-medium text-white">{result.rule.name}</span>
          <span className="text-xs text-gray-500">×{result.rule.weight.toFixed(2)}</span>
        </div>
        <span className={`text-sm font-bold font-mono ${scoreColor}`}>
          {(result.score * 100).toFixed(0)}%
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1.5">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${result.score * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{result.detail}</span>
        {result.fix && (
          <span className="text-xs text-orange-400 italic">🔧 {result.fix}</span>
        )}
      </div>
    </div>
  );
}

function ReportCard({ report, isLive }: { report: VerificationReport; isLive?: boolean }) {
  const scoreColor =
    report.overallScore >= 0.8 ? 'text-green-400' :
    report.overallScore >= 0.65 ? 'text-yellow-400' : 'text-red-400';

  const ringColor =
    report.overallScore >= 0.8 ? 'border-green-500/30' :
    report.overallScore >= 0.65 ? 'border-yellow-500/30' : 'border-red-500/30';

  return (
    <div className={`bg-gray-800/50 rounded-xl border p-4 ${isLive ? 'border-cyan-500/40' : ringColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
          )}
          <span className={`font-bold text-sm ${isLive ? 'text-cyan-300' : 'text-white'}`}>
            {isLive ? 'LIVE VERIFICATION' : report.taskType.toUpperCase()}
          </span>
          {report.fixApplied && (
            <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded text-xs">
              🔧 Fixed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-bold font-mono ${scoreColor}`}>
            {(report.overallScore * 100).toFixed(0)}%
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            report.passed
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}>
            {report.passed ? 'PASS' : 'FAIL'}
          </span>
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-2">
        {report.results.map((r) => (
          <RuleRow key={r.rule.id} result={r} />
        ))}
      </div>

      {/* Weighted score breakdown */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Weighted Score = Σ(rule_score × weight)</span>
          <span className={`font-mono font-bold ${scoreColor}`}>
            {(report.overallScore * 100).toFixed(1)}% / 100%
          </span>
        </div>
        <div className="mt-1.5 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              report.overallScore >= 0.8 ? 'bg-green-500' :
              report.overallScore >= 0.65 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${report.overallScore * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">Pass threshold: 65% with ≤1 rule failure</p>
      </div>
    </div>
  );
}

export default function VerificationPanel({ reports, liveReport }: Props) {
  const passCount = reports.filter(r => r.passed).length;
  const avgScore = reports.length > 0
    ? reports.reduce((s, r) => s + r.overallScore, 0) / reports.length
    : 0;
  const fixCount = reports.filter(r => r.fixApplied).length;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Verifications', value: reports.length, color: 'text-white' },
          { label: 'Pass Rate',     value: `${reports.length > 0 ? Math.round(passCount / reports.length * 100) : 0}%`, color: 'text-green-400' },
          { label: 'Avg Score',     value: `${(avgScore * 100).toFixed(0)}%`, color: 'text-blue-400' },
          { label: 'Auto-Fixed',    value: fixCount, color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Live report */}
      {liveReport && <ReportCard report={liveReport} isLive />}

      {/* History */}
      {reports.length === 0 && !liveReport ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-8 text-center">
          <div className="text-4xl mb-3">🔬</div>
          <p className="text-gray-400">No verification reports yet.</p>
          <p className="text-gray-500 text-sm mt-1">Reports appear as agent executes tasks</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Verification History ({reports.length})
          </h3>
          {reports.slice(0, 5).map((r, i) => (
            <ReportCard key={i} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}
