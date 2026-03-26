/**
 * templateAdapter.ts
 * Responsibility: Auto-adapt templates to new tasks via slot-filling.
 * Tracks version history per template.
 */

export interface TemplateVersion {
  version: number;
  adaptedAt: Date;
  originalTask: string;
  adaptedFor: string;
  slotsReplaced: Record<string, string>;
  speedBoostPct: number; // % faster than fresh execution
}

export interface AdaptedTemplate {
  templateId: string;
  taskType: string;
  adaptedFor: string;
  originalContent: string;
  adaptedContent: string;
  slotsReplaced: Record<string, string>;
  speedBoostPct: number;
  versions: TemplateVersion[];
}

// In-memory version history store: templateId → versions[]
const versionHistory = new Map<string, TemplateVersion[]>();
const adaptationLog: AdaptedTemplate[] = [];

// Slot definitions: placeholders that get extracted + replaced
const SLOT_PATTERNS: Array<{ key: string; pattern: RegExp; extractor: (task: string) => string }> = [
  {
    key: '{{PRODUCT}}',
    pattern: /for\s+([a-zA-Z0-9\s]+?)(?:\s+page|\s+in|\s+to|\s+with|$)/i,
    extractor: (task) => {
      const m = task.match(/for\s+([a-zA-Z0-9\s]+?)(?:\s+page|\s+in|\s+to|\s+with|$)/i);
      return m?.[1]?.trim() ?? 'the product';
    },
  },
  {
    key: '{{LANG_FROM}}',
    pattern: /\b(EN|FR|ES|DE|IT|PT|JA|ZH)\b/i,
    extractor: (task) => {
      const m = task.match(/\b(EN|FR|ES|DE|IT|PT|JA|ZH)\b/i);
      return m?.[1]?.toUpperCase() ?? 'EN';
    },
  },
  {
    key: '{{LANG_TO}}',
    pattern: /\bto\s+(EN|FR|ES|DE|IT|PT|JA|ZH)\b/i,
    extractor: (task) => {
      const m = task.match(/\bto\s+(EN|FR|ES|DE|IT|PT|JA|ZH)\b/i);
      return m?.[1]?.toUpperCase() ?? 'ES';
    },
  },
  {
    key: '{{COUNT}}',
    pattern: /(\d+)\s+(?:rows?|items?|records?|words?|emails?)/i,
    extractor: (task) => {
      const m = task.match(/(\d+)\s+(?:rows?|items?|records?|words?|emails?)/i);
      return m?.[1] ?? '30';
    },
  },
  {
    key: '{{TASK_TYPE}}',
    pattern: /^(\w+)/,
    extractor: (task) => task.split(' ')[0] ?? 'Write',
  },
];

function extractSlots(taskTitle: string): Record<string, string> {
  const slots: Record<string, string> = {};
  for (const slotDef of SLOT_PATTERNS) {
    slots[slotDef.key] = slotDef.extractor(taskTitle);
  }
  return slots;
}

function buildTemplateContent(taskType: string): string {
  const templates: Record<string, string> = {
    writing: 'Write {{TASK_TYPE}} for {{PRODUCT}} — 500+ words, SEO-optimized, professional tone.',
    translation: 'Translate content {{LANG_FROM}} → {{LANG_TO}} for {{PRODUCT}}. Count: {{COUNT}} words.',
    data_entry: 'Process {{COUNT}} records. Validate fields. Export clean CSV.',
    coding: 'Build {{TASK_TYPE}} script for {{PRODUCT}}. Test coverage > 90%. Documented.',
    email: 'Write {{COUNT}}-email sequence for {{PRODUCT}}. Include CTAs and subject lines.',
    default: '{{TASK_TYPE}} task for {{PRODUCT}}. Deliver high-quality output.',
  };
  return templates[taskType] ?? templates.default;
}

function applySlots(content: string, slots: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(slots)) {
    while (result.includes(key)) {
      result = result.replace(key, value);
    }
  }
  return result;
}

export function adaptTemplate(
  templateId: string,
  taskType: string,
  newTaskTitle: string,
  similarityScore: number
): AdaptedTemplate {
  const slots = extractSlots(newTaskTitle);
  const originalContent = buildTemplateContent(taskType);
  const adaptedContent = applySlots(originalContent, slots);

  // Speed boost: higher similarity = more reuse = faster
  const speedBoostPct = Math.round(30 + similarityScore * 40); // 30–70% faster

  const existing = versionHistory.get(templateId) ?? [];
  const newVersion: TemplateVersion = {
    version: existing.length + 1,
    adaptedAt: new Date(),
    originalTask: taskType,
    adaptedFor: newTaskTitle,
    slotsReplaced: slots,
    speedBoostPct,
  };

  const updated = [...existing, newVersion].slice(-10); // keep last 10 versions
  versionHistory.set(templateId, updated);

  const result: AdaptedTemplate = {
    templateId,
    taskType,
    adaptedFor: newTaskTitle,
    originalContent,
    adaptedContent,
    slotsReplaced: slots,
    speedBoostPct,
    versions: updated,
  };

  adaptationLog.unshift(result);
  if (adaptationLog.length > 20) adaptationLog.pop();

  return result;
}

export function getAdaptationLog(): AdaptedTemplate[] {
  return [...adaptationLog];
}

export function getVersionHistory(templateId: string): TemplateVersion[] {
  return versionHistory.get(templateId) ?? [];
}

export function getVersionHistoryAll(): Map<string, TemplateVersion[]> {
  return versionHistory;
}
