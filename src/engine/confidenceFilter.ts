/**
 * confidenceFilter.ts
 * Responsibility: Filter tasks based on confidence threshold.
 * Only tasks with confidence >= THRESHOLD are accepted.
 */

export const CONFIDENCE_THRESHOLD = 0.85;

export interface FilterResult {
  passed: boolean;
  confidence: number;
  threshold: number;
  reason: string;
}

export function filterByConfidence(confidence: number): FilterResult {
  const passed = confidence >= CONFIDENCE_THRESHOLD;
  return {
    passed,
    confidence,
    threshold: CONFIDENCE_THRESHOLD,
    reason: passed
      ? `Confidence ${confidence.toFixed(2)} ≥ ${CONFIDENCE_THRESHOLD} → ACCEPTED`
      : `Confidence ${confidence.toFixed(2)} < ${CONFIDENCE_THRESHOLD} → SKIPPED`,
  };
}

export function simulateConfidence(taskTitle: string): number {
  // Deterministic mock: hash title length + known task type bonuses
  const base = 0.70;
  const bonus =
    (taskTitle.includes('write') || taskTitle.includes('Write') ? 0.15 : 0) +
    (taskTitle.includes('data') || taskTitle.includes('Data') ? 0.18 : 0) +
    (taskTitle.includes('Translate') || taskTitle.includes('translate') ? 0.16 : 0) +
    (taskTitle.includes('scraper') || taskTitle.includes('Python') ? -0.15 : 0) +
    (taskTitle.includes('email') || taskTitle.includes('Email') ? 0.12 : 0);
  return Math.min(0.99, Math.max(0.40, +(base + bonus + Math.random() * 0.08).toFixed(2)));
}
