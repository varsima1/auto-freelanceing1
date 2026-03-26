/**
 * SimilarityPanel.tsx
 * Responsibility: Visualize real-time task similarity detection.
 * Shows: live match log, score breakdown (cosine/jaccard/bigram), matched terms.
 */

import { useState, useEffect } from 'react';
import { templateMatcher, MatchEvent } from '../engine/templateMatcher';

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-gray-300">{pct}%</span>
    </div>
  );
}

function MatchCard({ event }: { event: MatchEvent }) {
  const pct = Math.round(event.score * 100);
  const isMatch = event.found;

  return (
    <div className={`rounded-lg p-3 border ${
      isMatch
        ? 'bg-green-900/20 border-green-700/40'
        : 'bg-gray-800/60 border-gray-700/40'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 mb-0.5">Query</div>
          <div className="text-sm text-white font-medium truncate">
            {event.queryTitle}
          </div>
          {event.matchedTitle && (
            <>
              <div className="text-xs text-gray-400 mt-1 mb-0.5">Matched Type</div>
              <div className="text-xs text-green-400 font-mono">{event.matchedTitle}</div>
            </>
          )}
        </div>
        <div className={`shrink-0 text-center px-2 py-1 rounded-lg ${
          isMatch ? 'bg-green-700/40 text-green-300' : 'bg-gray-700/60 text-gray-400'
        }`}>
          <div className="text-lg font-bold font-mono">{pct}%</div>
          <div className="text-xs">{isMatch ? '✅ match' : '❌ miss'}</div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="space-y-1.5 mb-2">
        <ScoreBar label="Cosine TF-IDF" value={event.cosine}       color="bg-blue-500" />
        <ScoreBar label="Jaccard"       value={event.jaccard}       color="bg-yellow-500" />
        <ScoreBar label="Bigram N-gram" value={event.bigramOverlap} color="bg-purple-500" />
        <ScoreBar label="Blended Score" value={event.score}         color={isMatch ? 'bg-green-500' : 'bg-red-500'} />
      </div>

      {/* Matched terms + method */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 font-mono">[{event.method}]</span>
        {event.matchedTerms.slice(0, 5).map(t => (
          <span key={t} className="text-xs bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded font-mono">
            {t}
          </span>
        ))}
        {event.matchedTerms.length > 5 && (
          <span className="text-xs text-gray-500">+{event.matchedTerms.length - 5} more</span>
        )}
      </div>

      {/* Timestamp */}
      <div className="text-xs text-gray-600 mt-1.5">
        {event.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
}

// ── Interactive Scorer ──────────────────────────────────────────────────────
function LiveScorer() {
  const [textA, setTextA] = useState('Write product description for smartwatch');
  const [textB, setTextB] = useState('Write product description for fitness tracker');
  const [result, setResult] = useState(() =>
    templateMatcher.scoreTexts(
      'Write product description for smartwatch',
      'Write product description for fitness tracker',
    )
  );

  function recalculate() {
    setResult(templateMatcher.scoreTexts(textA, textB));
  }

  return (
    <div className="bg-gray-800/70 rounded-xl border border-gray-700/50 p-4 mb-6">
      <h3 className="text-sm font-semibold text-white mb-3">🧪 Live Similarity Scorer</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Text A</label>
          <textarea
            value={textA}
            onChange={e => setTextA(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white resize-none h-16 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Text B</label>
          <textarea
            value={textB}
            onChange={e => setTextB(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white resize-none h-16 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <button
        onClick={recalculate}
        className="mb-4 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
      >
        ⚡ Calculate Similarity
      </button>

      <div className="space-y-1.5">
        <ScoreBar label="Cosine TF-IDF" value={result.cosine}       color="bg-blue-500" />
        <ScoreBar label="Jaccard"       value={result.jaccard}       color="bg-yellow-500" />
        <ScoreBar label="Bigram N-gram" value={result.bigramOverlap} color="bg-purple-500" />
        <ScoreBar label="Blended Score" value={result.score}         color={result.score >= 0.35 ? 'bg-green-500' : 'bg-red-500'} />
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        <span className={`text-xs px-2 py-1 rounded-full font-mono ${
          result.score >= 0.35
            ? 'bg-green-800/40 text-green-300'
            : 'bg-red-800/40 text-red-300'
        }`}>
          {result.score >= 0.35 ? '✅ Template match' : '❌ No match'}
        </span>
        <span className="text-xs bg-gray-700/60 text-gray-400 px-2 py-1 rounded-full font-mono">
          method: {result.method}
        </span>
        {result.matchedTerms.slice(0, 6).map(t => (
          <span key={t} className="text-xs bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded font-mono">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Panel ──────────────────────────────────────────────────────────────
export default function SimilarityPanel() {
  const [events, setEvents] = useState<MatchEvent[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(templateMatcher.getMatchLog());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const matchCount = events.filter(e => e.found).length;
  const avgScore   = events.length
    ? events.reduce((s, e) => s + e.score, 0) / events.length
    : 0;

  return (
    <div>
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Match Events', value: events.length, color: 'text-blue-400' },
          { label: 'Template Hits', value: matchCount,   color: 'text-green-400' },
          { label: 'Avg Score',    value: `${Math.round(avgScore * 100)}%`, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/60 rounded-xl border border-gray-700/40 p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Algorithm legend */}
      <div className="flex gap-3 flex-wrap mb-4">
        {[
          { color: 'bg-blue-500',   label: 'Cosine TF-IDF (50%)' },
          { color: 'bg-yellow-500', label: 'Jaccard (30%)' },
          { color: 'bg-purple-500', label: 'Bigram N-gram (20%)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Live scorer */}
      <LiveScorer />

      {/* Live match log */}
      <h3 className="text-sm font-semibold text-gray-300 mb-3">
        📡 Live Match Log <span className="text-gray-500 font-normal">(auto-refreshes every 1.5s)</span>
      </h3>
      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm">Waiting for agent to process tasks...</div>
          <div className="text-xs mt-1">Match events appear as the agent scans templates</div>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(e => <MatchCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
