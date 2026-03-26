/**
 * AgentPipeline.tsx
 * Responsibility: Visualize the agent's Execute → Verify → Fix → Complete pipeline.
 */

import { PipelineState, PIPELINE_STEPS, PipelineStage } from '../engine/taskPipeline';
import { CONFIDENCE_THRESHOLD } from '../engine/confidenceFilter';

interface Props {
  state: PipelineState;
  agentName: string;
}

const STAGE_COLORS: Record<PipelineStage, string> = {
  idle:        'bg-gray-700 text-gray-400',
  scanning:    'bg-blue-900 text-blue-300 ring-2 ring-blue-500 animate-pulse',
  filtering:   'bg-yellow-900 text-yellow-300 ring-2 ring-yellow-500 animate-pulse',
  executing:   'bg-cyan-900 text-cyan-300 ring-2 ring-cyan-500 animate-pulse',
  verifying:   'bg-purple-900 text-purple-300 ring-2 ring-purple-500 animate-pulse',
  fixing:      'bg-orange-900 text-orange-300 ring-2 ring-orange-500 animate-pulse',
  reverifying: 'bg-green-900 text-green-300 ring-2 ring-green-500 animate-pulse',
  learning:    'bg-pink-900 text-pink-300 ring-2 ring-pink-500 animate-pulse',
  completed:   'bg-green-800 text-green-200 ring-2 ring-green-400',
  skipped:     'bg-red-900 text-red-300 ring-2 ring-red-500',
};

const CONNECTOR_STAGES = ['scanning','filtering','executing','verifying','fixing','reverifying','learning','completed'] as PipelineStage[];

export default function AgentPipeline({ state, agentName }: Props) {
  const isActive = state.currentStage !== 'idle';
  const isSkipped = state.currentStage === 'skipped';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-white font-semibold text-sm">{agentName} — Pipeline</span>
        </div>
        {isActive && (
          <span className="text-xs text-gray-400 font-mono">
            Stage: <span className="text-cyan-300">{state.currentStage.toUpperCase()}</span>
          </span>
        )}
      </div>

      {/* Task Info */}
      {isActive && (
        <div className="mb-4 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Current Task</p>
          <p className="text-sm text-white font-medium truncate">{state.taskTitle}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className={`text-xs font-mono ${state.confidence >= CONFIDENCE_THRESHOLD ? 'text-green-400' : 'text-red-400'}`}>
              Confidence: {state.confidence.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-yellow-400">
              Reward: ${state.reward.toFixed(2)}
            </span>
            {state.needsFix && (
              <span className="text-xs font-mono text-orange-400">⚠ Fix Applied</span>
            )}
          </div>
        </div>
      )}

      {/* Pipeline Steps */}
      <div className="flex items-center gap-1 flex-wrap">
        {PIPELINE_STEPS.map((step, idx) => {
          const isCurrentStage = state.currentStage === step.stage;
          const isPast = !isSkipped && CONNECTOR_STAGES.indexOf(state.currentStage as PipelineStage) > idx;
          const isFixStage = step.stage === 'fixing' || step.stage === 'reverifying';

          return (
            <div key={step.stage} className="flex items-center gap-1">
              {/* Step Badge */}
              <div className={`
                flex flex-col items-center px-2 py-1.5 rounded-lg text-center min-w-[64px]
                transition-all duration-500
                ${isCurrentStage
                  ? STAGE_COLORS[step.stage]
                  : isPast
                    ? 'bg-gray-800 text-gray-300 opacity-80'
                    : 'bg-gray-800/40 text-gray-600'}
                ${isFixStage && !state.needsFix && !isPast ? 'opacity-30' : ''}
              `}>
                <span className="text-base leading-none">{step.icon}</span>
                <span className="text-[10px] mt-0.5 leading-tight font-medium">{step.label}</span>
              </div>

              {/* Connector */}
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`h-px w-3 transition-all duration-500 ${isPast || isCurrentStage ? 'bg-gray-500' : 'bg-gray-800'}`} />
              )}
            </div>
          );
        })}

        {/* Skipped badge */}
        {isSkipped && (
          <div className="ml-2 px-3 py-1.5 bg-red-900/60 rounded-lg border border-red-700">
            <span className="text-xs text-red-300 font-mono">⛔ SKIPPED (low confidence)</span>
          </div>
        )}
      </div>

      {/* Confidence Threshold Rule */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
        <span className="font-mono">Threshold: {CONFIDENCE_THRESHOLD}</span>
        <span>·</span>
        <span>if confidence &lt; {CONFIDENCE_THRESHOLD} → skipTask()</span>
        <span>·</span>
        <span>Execute → Verify → Fix → Re-Verify → Learn</span>
      </div>
    </div>
  );
}
