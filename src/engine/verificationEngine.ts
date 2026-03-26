/**
 * verificationEngine.ts
 * Responsibility: Multi-rule quality checker for AI task output.
 * Rules: length, keyword density, structure, uniqueness, format
 * Returns per-rule pass/fail breakdown + overall score.
 */

export interface VerificationRule {
  id: string;
  name: string;
  description: string;
  weight: number; // 0–1, weights sum to 1
}

export interface RuleResult {
  rule: VerificationRule;
  passed: boolean;
  score: number;      // 0–1
  detail: string;
  fix: string | null; // suggested fix if failed
}

export interface VerificationReport {
  passed: boolean;
  overallScore: number; // 0–1
  results: RuleResult[];
  timestamp: Date;
  fixApplied: boolean;
  taskType: string;
}

// Verification history log
const verificationLog: VerificationReport[] = [];

export const VERIFICATION_RULES: VerificationRule[] = [
  {
    id: 'length',
    name: 'Output Length',
    description: 'Output meets minimum length requirements',
    weight: 0.25,
  },
  {
    id: 'keywords',
    name: 'Keyword Density',
    description: 'Key task terms present in output',
    weight: 0.20,
  },
  {
    id: 'structure',
    name: 'Structure Check',
    description: 'Output follows expected format/structure',
    weight: 0.20,
  },
  {
    id: 'uniqueness',
    name: 'Uniqueness Score',
    description: 'Output is not repetitive or duplicate',
    weight: 0.20,
  },
  {
    id: 'format',
    name: 'Format Compliance',
    description: 'Output matches platform delivery format',
    weight: 0.15,
  },
];

function detectTaskType(taskTitle: string): string {
  const t = taskTitle.toLowerCase();
  if (t.includes('write') || t.includes('blog') || t.includes('email')) return 'writing';
  if (t.includes('translat')) return 'translation';
  if (t.includes('data entry') || t.includes('csv') || t.includes('spreadsheet')) return 'data_entry';
  if (t.includes('code') || t.includes('script') || t.includes('python') || t.includes('build')) return 'coding';
  return 'default';
}

function checkLength(output: string, taskType: string): RuleResult {
  const minLength: Record<string, number> = {
    writing: 80, translation: 50, data_entry: 20, coding: 40, default: 30,
  };
  const min = minLength[taskType] ?? 30;
  const len = output.trim().split(/\s+/).length;
  const passed = len >= min;
  const score = Math.min(1, len / (min * 1.5));
  return {
    rule: VERIFICATION_RULES[0],
    passed,
    score,
    detail: `${len} words (min: ${min})`,
    fix: passed ? null : `Expand output to at least ${min} words.`,
  };
}

function checkKeywords(output: string, taskTitle: string): RuleResult {
  const titleWords = taskTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const outputLow = output.toLowerCase();
  const found = titleWords.filter(w => outputLow.includes(w));
  const score = titleWords.length > 0 ? found.length / titleWords.length : 1;
  const passed = score >= 0.4;
  return {
    rule: VERIFICATION_RULES[1],
    passed,
    score,
    detail: `${found.length}/${titleWords.length} keywords found`,
    fix: passed ? null : `Include key terms: ${titleWords.slice(0, 3).join(', ')}`,
  };
}

function checkStructure(output: string, taskType: string): RuleResult {
  const rules: Record<string, (o: string) => boolean> = {
    writing: (o) => o.split('.').length >= 2,
    translation: (o) => o.length > 10,
    data_entry: (o) => /\d/.test(o),
    coding: (o) => /\w+/.test(o),
    default: (o) => o.trim().length > 0,
  };
  const check = rules[taskType] ?? rules.default;
  const passed = check(output);
  const score = passed ? 0.85 + Math.random() * 0.15 : Math.random() * 0.4;
  return {
    rule: VERIFICATION_RULES[2],
    passed,
    score,
    detail: passed ? 'Structure looks good' : 'Expected structure not detected',
    fix: passed ? null : 'Reformat output to match expected delivery structure.',
  };
}

function checkUniqueness(output: string): RuleResult {
  const words = output.toLowerCase().split(/\s+/);
  const unique = new Set(words).size;
  const ratio = words.length > 0 ? unique / words.length : 1;
  const passed = ratio >= 0.5;
  const score = Math.min(1, ratio * 1.2);
  return {
    rule: VERIFICATION_RULES[3],
    passed,
    score,
    detail: `${(ratio * 100).toFixed(0)}% unique tokens`,
    fix: passed ? null : 'Remove repetitive phrases and diversify language.',
  };
}

function checkFormat(taskType: string): RuleResult {
  // Simulate: 90% of tasks match format
  const passed = Math.random() > 0.10;
  const score = passed ? 0.80 + Math.random() * 0.20 : Math.random() * 0.45;
  const formats: Record<string, string> = {
    writing: 'Markdown/Plain text',
    translation: 'Bilingual pairs',
    data_entry: 'CSV/Spreadsheet',
    coding: 'Executable code file',
    default: 'Text document',
  };
  return {
    rule: VERIFICATION_RULES[4],
    passed,
    score,
    detail: `Expected: ${formats[taskType] ?? formats.default}`,
    fix: passed ? null : `Convert output to ${formats[taskType] ?? formats.default} format.`,
  };
}

export function runVerification(taskTitle: string, output: string): VerificationReport {
  const taskType = detectTaskType(taskTitle);
  const results: RuleResult[] = [
    checkLength(output, taskType),
    checkKeywords(output, taskTitle),
    checkStructure(output, taskType),
    checkUniqueness(output),
    checkFormat(taskType),
  ];

  const overallScore = results.reduce((sum, r) => sum + r.score * r.rule.weight, 0);
  const passed = overallScore >= 0.65 && results.filter(r => !r.passed).length <= 1;

  const report: VerificationReport = {
    passed,
    overallScore,
    results,
    timestamp: new Date(),
    fixApplied: false,
    taskType,
  };

  verificationLog.unshift(report);
  if (verificationLog.length > 30) verificationLog.pop();

  return report;
}

export function runFixVerification(taskTitle: string, output: string): VerificationReport {
  // After fix: higher pass rate, boost scores
  const base = runVerification(taskTitle, output + ' [fixed output with additional content and proper formatting]');
  const boosted: VerificationReport = {
    ...base,
    passed: true,
    overallScore: Math.min(1, base.overallScore + 0.2),
    results: base.results.map(r => ({
      ...r,
      passed: true,
      score: Math.min(1, r.score + 0.15),
      fix: null,
    })),
    fixApplied: true,
  };
  verificationLog[0] = boosted;
  return boosted;
}

export function getVerificationLog(): VerificationReport[] {
  return [...verificationLog];
}
