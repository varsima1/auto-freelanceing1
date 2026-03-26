/**
 * taskPipeline.ts
 * Responsibility: Execute → Verify → Fix → Verify → Complete pipeline.
 * Each stage has a duration (ms) used for UI animation.
 */

export type PipelineStage =
  | 'idle'
  | 'scanning'
  | 'filtering'
  | 'executing'
  | 'verifying'
  | 'fixing'
  | 'reverifying'
  | 'learning'
  | 'completed'
  | 'skipped';

export interface PipelineStep {
  stage: PipelineStage;
  label: string;
  icon: string;
  durationMs: number;
  color: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  { stage: 'scanning',    label: 'Scan Tasks',      icon: '🔍', durationMs: 2000, color: 'text-blue-400'   },
  { stage: 'filtering',   label: 'Confidence Check', icon: '⚖️',  durationMs: 1500, color: 'text-yellow-400' },
  { stage: 'executing',   label: 'AI Execute',       icon: '⚡', durationMs: 4000, color: 'text-cyan-400'   },
  { stage: 'verifying',   label: 'Verify Output',    icon: '🔬', durationMs: 2000, color: 'text-purple-400' },
  { stage: 'fixing',      label: 'Auto-Fix',         icon: '🔧', durationMs: 2000, color: 'text-orange-400' },
  { stage: 'reverifying', label: 'Re-Verify',        icon: '✅', durationMs: 1500, color: 'text-green-400'  },
  { stage: 'learning',    label: 'Learn & Store',    icon: '🧠', durationMs: 1500, color: 'text-pink-400'   },
  { stage: 'completed',   label: 'Completed',        icon: '💰', durationMs: 1000, color: 'text-green-300'  },
];

export interface PipelineState {
  currentStage: PipelineStage;
  stageIndex: number;
  progress: number;
  needsFix: boolean;
  taskTitle: string;
  confidence: number;
  reward: number;
  error: string | null;
  templateMatch?: { found: boolean; similarity: number; template: { taskType: string } | null } | null;
}

export function getStepByStage(stage: PipelineStage): PipelineStep | undefined {
  return PIPELINE_STEPS.find(s => s.stage === stage);
}

// Simulate verification: 80% pass first time, 20% need fix
export function simulateVerification(): { passed: boolean; issue: string | null } {
  const passed = Math.random() > 0.20;
  return {
    passed,
    issue: passed ? null : 'Output length below threshold. Re-generating...',
  };
}

// Simulate AI execution output
export function simulateAIOutput(taskTitle: string): string {
  const outputs: Record<string, string> = {
    write: 'Generated 523-word article with proper structure and SEO keywords.',
    translate: 'Translated 200 words EN→ES. Verified terminology accuracy.',
    data: 'Processed 50 SKUs. All fields populated. CSV exported.',
    email: 'Generated 5-email sequence with subject lines and CTAs.',
    default: 'Task output generated successfully.',
  };
  const key = Object.keys(outputs).find(k => taskTitle.toLowerCase().includes(k)) ?? 'default';
  return outputs[key];
}
