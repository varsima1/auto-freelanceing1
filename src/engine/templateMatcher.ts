/**
 * templateMatcher.ts
 * Responsibility: Upgrade templateStore matching with similarity engine.
 * Uses: computeSimilarity + rankBySimilarity from similarityEngine.
 * Replaces the Jaccard-only approach in templateStore for live matching.
 */

import { db, DBTemplate } from '../store/db';
import { computeSimilarity, rankBySimilarity, SimilarityResult } from './similarityEngine';

const MATCH_THRESHOLD = 0.35; // blended score ≥ 0.35 → reuse template

// ── Enhanced Match Result ───────────────────────────────────────────────────
export interface EnhancedMatch {
  found: boolean;
  template: DBTemplate | null;
  similarity: SimilarityResult | null;
  rank: number;           // position among all candidates (1 = best)
  totalCandidates: number;
}

// ── Recent Match Log (for SimilarityPanel) ──────────────────────────────────
export interface MatchEvent {
  id: string;
  timestamp: Date;
  queryTitle: string;
  matchedTitle: string | null;
  score: number;
  cosine: number;
  jaccard: number;
  bigramOverlap: number;
  method: string;
  matchedTerms: string[];
  found: boolean;
}

const matchLog: MatchEvent[] = [];
const MAX_LOG = 20;

function logMatch(event: MatchEvent) {
  matchLog.unshift(event);
  if (matchLog.length > MAX_LOG) matchLog.pop();
}

// ── Core Matcher ─────────────────────────────────────────────────────────────
export const templateMatcher = {

  /** Find best template match using full similarity engine */
  findBestMatch(taskTitle: string): EnhancedMatch {
    const allTemplates = db.getAllTemplates();

    if (allTemplates.length === 0) {
      logMatch({
        id: `m-${Date.now()}`,
        timestamp: new Date(),
        queryTitle: taskTitle,
        matchedTitle: null,
        score: 0, cosine: 0, jaccard: 0, bigramOverlap: 0,
        method: 'none', matchedTerms: [],
        found: false,
      });
      return { found: false, template: null, similarity: null, rank: 0, totalCandidates: 0 };
    }

    // Build candidates from template keywords + type
    const candidates = allTemplates.map(t => ({
      item: t,
      text: `${t.taskType} ${t.keywords.join(' ')}`,
    }));

    const ranked = rankBySimilarity(taskTitle, candidates);
    const best   = ranked[0];
    const sim    = best.result;

    const found = sim.score >= MATCH_THRESHOLD;

    logMatch({
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
      queryTitle: taskTitle,
      matchedTitle: found ? best.item.taskType : null,
      score: sim.score,
      cosine: sim.cosine,
      jaccard: sim.jaccard,
      bigramOverlap: sim.bigramOverlap,
      method: sim.method,
      matchedTerms: sim.matchedTerms,
      found,
    });

    if (!found) {
      return { found: false, template: null, similarity: sim, rank: 1, totalCandidates: allTemplates.length };
    }

    return {
      found: true,
      template: best.item,
      similarity: sim,
      rank: 1,
      totalCandidates: allTemplates.length,
    };
  },

  /** Get recent match events (for UI) */
  getMatchLog(): MatchEvent[] {
    return [...matchLog];
  },

  /** Score any two arbitrary texts (for the SimilarityPanel demo) */
  scoreTexts(a: string, b: string): SimilarityResult {
    return computeSimilarity(a, b);
  },

  /** Get threshold */
  getThreshold(): number {
    return MATCH_THRESHOLD;
  },
};
