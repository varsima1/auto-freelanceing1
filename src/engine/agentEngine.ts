/**
 * agentEngine.ts
 * Responsibility: Core agent state machine.
 * Drives an agent through: idle → scanning → filtering → executing
 * → verifying → (fixing → reverifying) → learning → idle
 * Now wired to: learningEngine, templateStore, db
 */

import { PipelineStage, PipelineState, PIPELINE_STEPS, simulateAIOutput } from './taskPipeline';
import { filterByConfidence, simulateConfidence } from './confidenceFilter';
import { learn, logError } from './learningEngine';
import { templateStore, TemplateMatch } from '../store/templateStore';
import { templateMatcher } from './templateMatcher';
import { adaptTemplate, AdaptedTemplate } from './templateAdapter';
import { runVerification, runFixVerification, VerificationReport } from './verificationEngine';
import { skillEngine } from './skillEngine';
import type { LevelUpEvent } from './skillEngine';
import { sharedMemory } from './sharedMemory';

export interface AgentEngineCallbacks {
  onStageChange: (state: PipelineState) => void;
  onLog: (type: 'info' | 'success' | 'warning' | 'error' | 'learn', msg: string) => void;
  onTaskComplete: (reward: number, isNewTemplate: boolean, templateMatch: TemplateMatch | null) => void;
  onTaskSkipped: (reason: string) => void;
  onLearn: (result: { taskType: string; isNewTemplate: boolean; skillsUpdated: string[] }) => void;
  onVerification?: (report: VerificationReport) => void;
  onAdaptation?: (adapted: AdaptedTemplate) => void;
  onSkillGain?: (event: { xpGained: number; levelUp: LevelUpEvent | null }) => void;
  onShare?: (msg: { type: string; payload: Record<string, unknown> }) => void;
}

// Human-like delay: adds ±30% jitter to base ms
function humanDelay(baseMs: number): number {
  const jitter = baseMs * 0.3 * (Math.random() * 2 - 1);
  return Math.max(500, Math.round(baseMs + jitter));
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise(resolve => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(id); resolve(); }, { once: true });
  });
}

const MOCK_TASKS = [
  { title: 'Write product description for smartwatch',  confidence: 0, reward: 12.00 },
  { title: 'Data entry: 30 product rows into sheet',    confidence: 0, reward: 9.50  },
  { title: 'Translate FAQ page EN to ES (150 words)',   confidence: 0, reward: 7.00  },
  { title: 'Build Python scraper for Amazon pricing',   confidence: 0, reward: 55.00 },
  { title: 'Write email welcome sequence (3 emails)',   confidence: 0, reward: 18.00 },
  { title: 'Data entry: invoice records (20 items)',    confidence: 0, reward: 8.00  },
  { title: 'Write blog post intro for SaaS product',   confidence: 0, reward: 14.00 },
  { title: 'Translate product page EN to FR',          confidence: 0, reward: 11.00 },
  { title: 'Code automation script for CSV parsing',   confidence: 0, reward: 38.00 },
];

const makeState = (
  stage: PipelineStage, idx: number, taskTitle: string,
  confidence: number, reward: number,
  needsFix = false, error: string | null = null,
  templateMatch: TemplateMatch | null = null
): PipelineState => ({
  currentStage: stage, stageIndex: idx, progress: 0,
  needsFix, taskTitle, confidence, reward, error, templateMatch,
});

export async function runAgentCycle(
  agentId: string,
  agentName: string,
  callbacks: AgentEngineCallbacks,
  signal: AbortSignal
): Promise<void> {
  const { onStageChange, onLog, onTaskComplete, onTaskSkipped, onLearn, onVerification, onAdaptation, onSkillGain } = callbacks;

  // Register agent in shared memory coordination layer
  sharedMemory.registerAgent(agentId, agentName);
  sharedMemory.broadcast(agentId, agentName, 'broadcast', { status: 'online', agentId });

  while (!signal.aborted) {
    // ── SCANNING ────────────────────────────────────────────────────────────
    const task = { ...MOCK_TASKS[Math.floor(Math.random() * MOCK_TASKS.length)] };
    task.confidence = simulateConfidence(task.title);

    onStageChange(makeState('scanning', 0, task.title, task.confidence, task.reward));
    onLog('info', `[${agentName}] 🔍 Scanning platform... found: "${task.title}"`);
    await sleep(humanDelay(PIPELINE_STEPS[0].durationMs), signal);
    if (signal.aborted) break;

    // ── FILTERING ───────────────────────────────────────────────────────────
    onStageChange(makeState('filtering', 1, task.title, task.confidence, task.reward));
    const filter = filterByConfidence(task.confidence);
    onLog('info', `[${agentName}] ⚖️  Confidence: ${filter.reason}`);
    await sleep(humanDelay(PIPELINE_STEPS[1].durationMs), signal);
    if (signal.aborted) break;

    if (!filter.passed) {
      onStageChange(makeState('skipped', 1, task.title, task.confidence, task.reward));
      onLog('warning', `[${agentName}] ⏭ Skipped. ${filter.reason}`);
      onTaskSkipped(filter.reason);
      await sleep(humanDelay(2000), signal);
      continue;
    }

    // ── TEMPLATE CHECK (upgraded: cosine+bigram TF-IDF) ─────────────────────
    const enhanced    = templateMatcher.findBestMatch(task.title);
    const simScore    = enhanced.similarity?.score ?? 0;
    const simMethod   = enhanced.similarity?.method ?? 'none';
    // Build compatible TemplateMatch for downstream pipeline display
    const templateMatch: TemplateMatch = {
      found:      enhanced.found,
      template:   enhanced.template,
      similarity: simScore,
    };
    if (enhanced.found && enhanced.template) {
      onLog('learn',
        `[${agentName}] 📋 Template match! Score: ${(simScore * 100).toFixed(0)}% ` +
        `(${simMethod}) — reusing solution`
      );
    } else if (enhanced.similarity && simScore > 0) {
      onLog('info',
        `[${agentName}] 🔍 Best template score: ${(simScore * 100).toFixed(0)}% ` +
        `(below ${(templateMatcher.getThreshold() * 100).toFixed(0)}% threshold)`
      );
    }

    // ── ADAPT TEMPLATE if match found ────────────────────────────────────────
    let adapted: AdaptedTemplate | null = null;
    if (enhanced.found && enhanced.template) {
      adapted = adaptTemplate(
        enhanced.template.id ?? 'tmpl-' + enhanced.template.taskType,
        enhanced.template.taskType,
        task.title,
        simScore
      );
      if (onAdaptation) onAdaptation(adapted);
      onLog('learn', `[${agentName}] 🧩 Template adapted! Slot fills: ${Object.keys(adapted.slotsReplaced).length} | Speed: +${adapted.speedBoostPct}%`);
    }

    // ── EXECUTING ───────────────────────────────────────────────────────────
    const execDuration = adapted
      ? PIPELINE_STEPS[2].durationMs * (1 - adapted.speedBoostPct / 100)
      : PIPELINE_STEPS[2].durationMs;
    onStageChange(makeState('executing', 2, task.title, task.confidence, task.reward, false, null, templateMatch));
    onLog('info', `[${agentName}] ⚡ Executing task via AI...${adapted ? ` (${adapted.speedBoostPct}% faster via template)` : ''}`);
    await sleep(humanDelay(execDuration), signal);
    if (signal.aborted) break;

    const output = simulateAIOutput(task.title);

    // ── VERIFYING (multi-rule) ───────────────────────────────────────────────
    onStageChange(makeState('verifying', 3, task.title, task.confidence, task.reward, false, null, templateMatch));
    onLog('info', `[${agentName}] 🔬 Running 5-rule verification...`);
    await sleep(humanDelay(PIPELINE_STEPS[3].durationMs), signal);
    if (signal.aborted) break;

    const verify1 = runVerification(task.title, output);
    if (onVerification) onVerification(verify1);
    onLog(
      verify1.passed ? 'info' : 'warning',
      `[${agentName}] 🔬 Verification: ${(verify1.overallScore * 100).toFixed(0)}% — ${verify1.passed ? 'PASSED' : `FAILED (${verify1.results.filter(r => !r.passed).length} rules)`}`
    );

    if (!verify1.passed) {
      // ── FIXING ─────────────────────────────────────────────────────────
      const failedRule = verify1.results.find(r => !r.passed);
      onStageChange(makeState('fixing', 4, task.title, task.confidence, task.reward, true, failedRule?.fix ?? 'Output quality check failed', templateMatch));
      onLog('warning', `[${agentName}] 🔧 Auto-fix: ${failedRule?.rule.name ?? 'Unknown rule'}`);
      logError(agentId, task.title, failedRule?.fix ?? 'Unknown', true);
      await sleep(humanDelay(PIPELINE_STEPS[4].durationMs), signal);
      if (signal.aborted) break;

      // ── RE-VERIFYING ───────────────────────────────────────────────────
      onStageChange(makeState('reverifying', 5, task.title, task.confidence, task.reward, true, null, templateMatch));
      onLog('info', `[${agentName}] ✅ Re-verifying after fix...`);
      const verify2 = runFixVerification(task.title, output);
      if (onVerification) onVerification(verify2);
      await sleep(humanDelay(PIPELINE_STEPS[5].durationMs), signal);
      if (signal.aborted) break;
    }

    // ── LEARNING ────────────────────────────────────────────────────────────
    onStageChange(makeState('learning', 6, task.title, task.confidence, task.reward, false, null, templateMatch));
    const learnResult = learn(agentId, task.title, output, task.reward, true);
    // Gain XP in skill engine
    const skillResult = skillEngine.gainXP(learnResult.taskType);
    if (onSkillGain) onSkillGain({ xpGained: skillResult.xpGained, levelUp: skillResult.levelUp });
    if (skillResult.levelUp) {
      onLog('success', `[${agentName}] 🎉 LEVEL UP! ${skillResult.levelUp.skillName}: ${skillResult.levelUp.from} → ${skillResult.levelUp.to}`);
    }
    onLog('learn', `[${agentName}] 🧠 Learned! Type: ${learnResult.taskType} | +${skillResult.xpGained} XP | Skills: ${learnResult.skillsUpdated.join(', ')}`);
    if (learnResult.isNewTemplate) {
      onLog('learn', `[${agentName}] 💾 New template stored → ${learnResult.taskType}`);
      // Share new template with all agents via shared memory
      sharedMemory.shareTemplate(
        agentId, agentName,
        `tmpl-${learnResult.taskType}-${Date.now()}`,
        learnResult.taskType,
        0.85 + Math.random() * 0.14
      );
    }
    // Broadcast task completion
    sharedMemory.broadcast(agentId, agentName, 'task_completed', {
      taskType: learnResult.taskType,
      reward: `$${task.reward.toFixed(2)}`,
      xpGained: skillResult.xpGained,
    });
    if (skillResult.levelUp) {
      sharedMemory.broadcast(agentId, agentName, 'skill_leveled', {
        skill: skillResult.levelUp.skillName,
        from: skillResult.levelUp.from,
        to: skillResult.levelUp.to,
      });
    }
    onLearn(learnResult);
    await sleep(humanDelay(PIPELINE_STEPS[6].durationMs), signal);
    if (signal.aborted) break;

    // ── COMPLETED ───────────────────────────────────────────────────────────
    onStageChange(makeState('completed', 7, task.title, task.confidence, task.reward, false, null, templateMatch));
    onLog('success', `[${agentName}] 💰 Complete! +$${task.reward.toFixed(2)} | Templates: ${templateStore.getCount()}`);
    onTaskComplete(task.reward, learnResult.isNewTemplate, templateMatch);

    await sleep(humanDelay(3000), signal);
  }
}
