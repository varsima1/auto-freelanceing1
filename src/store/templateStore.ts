/**
 * templateStore.ts
 * Responsibility: Store, retrieve, and match task templates.
 * Uses keyword overlap for similarity detection.
 * Score >= SIMILARITY_THRESHOLD → template reuse.
 */

import { db, DBTemplate } from './db';

const SIMILARITY_THRESHOLD = 0.40; // 40% keyword overlap = match

// ── Keyword Extractor ──────────────────────────────────────────────────────
function extractKeywords(title: string): string[] {
  const stopWords = new Set(['a','an','the','for','to','in','on','of','with','and','or','into']);
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(w => w.length > 2 && !stopWords.has(w));
}

// ── Jaccard Similarity ─────────────────────────────────────────────────────
function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(w => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// ── Task Type Normalizer ───────────────────────────────────────────────────
function normalizeTaskType(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('write') || lower.includes('email') || lower.includes('description'))
    return 'writing';
  if (lower.includes('translate') || lower.includes('translation'))
    return 'translation';
  if (lower.includes('data entry') || lower.includes('spreadsheet') || lower.includes('sheet'))
    return 'data_entry';
  if (lower.includes('scraper') || lower.includes('python') || lower.includes('code') || lower.includes('build'))
    return 'coding';
  if (lower.includes('design') || lower.includes('image') || lower.includes('logo'))
    return 'design';
  return 'general';
}

// ── Public API ─────────────────────────────────────────────────────────────
export interface TemplateMatch {
  found: boolean;
  template: DBTemplate | null;
  similarity: number;
}

export const templateStore = {

  /** Find the best matching template for a task title */
  findMatch(taskTitle: string): TemplateMatch {
    const keywords = extractKeywords(taskTitle);
    const taskType = normalizeTaskType(taskTitle);
    const allTemplates = db.getAllTemplates();

    let bestMatch: DBTemplate | null = null;
    let bestScore = 0;

    for (const tpl of allTemplates) {
      // Boost if same task type
      const typeBonus = tpl.taskType === taskType ? 0.15 : 0;
      const sim = jaccardSimilarity(keywords, tpl.keywords) + typeBonus;
      if (sim > bestScore) {
        bestScore = sim;
        bestMatch = tpl;
      }
    }

    return {
      found: bestScore >= SIMILARITY_THRESHOLD,
      template: bestScore >= SIMILARITY_THRESHOLD ? bestMatch : null,
      similarity: +bestScore.toFixed(2),
    };
  },

  /** Store a new template (or update if very similar one exists) */
  storeTemplate(taskTitle: string, solution: string, reward: number): DBTemplate {
    const match = templateStore.findMatch(taskTitle);

    if (match.found && match.template) {
      // Update existing template
      const updated: DBTemplate = {
        ...match.template,
        usedCount: match.template.usedCount + 1,
        successRate: Math.min(100, match.template.successRate + 1),
        updatedAt: new Date(),
      };
      db.updateTemplate(updated.id, updated);
      return updated;
    }

    // Create new template
    const keywords = extractKeywords(taskTitle);
    const taskType = normalizeTaskType(taskTitle);
    const newTemplate: DBTemplate = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      taskType,
      keywords,
      solution,
      reward,
      usedCount: 1,
      successRate: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.insertTemplate(newTemplate);
    return newTemplate;
  },

  /** Get all templates sorted by use count */
  getTopTemplates(limit = 10): DBTemplate[] {
    return db.getAllTemplates().slice(0, limit);
  },

  getCount(): number {
    return db.countTemplates();
  },
};
