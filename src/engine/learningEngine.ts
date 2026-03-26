/**
 * learningEngine.ts
 * Responsibility: learn(), updateSkill(), storeTemplate().
 * Called after every successful task execution.
 * Updates db.skills + templateStore.
 */

import { db, DBSkill, DBTask, DBError } from '../store/db';
import { templateStore } from '../store/templateStore';

export interface LearningResult {
  templateId: string;
  isNewTemplate: boolean;
  skillsUpdated: string[];
  taskType: string;
}

// Map task types to skill names
const TASK_TYPE_SKILLS: Record<string, string[]> = {
  writing:     ['copywriting', 'creativity', 'grammar'],
  translation: ['translation', 'linguistics'],
  data_entry:  ['accuracy', 'speed', 'attention_to_detail'],
  coding:      ['python', 'web_scraping', 'automation'],
  design:      ['visual_design', 'creativity'],
  general:     ['versatility', 'problem_solving'],
};

/**
 * Main learning function — called after every completed task.
 * Stores template, updates skills, logs to DB.
 */
export function learn(
  agentId: string,
  taskTitle: string,
  output: string,
  reward: number,
  verified: boolean
): LearningResult {
  // 1. Store task record
  const taskRecord: DBTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: taskTitle,
    platform: 'MockPlatform',
    confidence: 0.9,
    reward,
    status: 'completed',
    agentId,
    output,
    verified,
    timestamp: new Date(),
  };
  db.insertTask(taskRecord);

  // 2. Store / update template
  const prevCount = templateStore.getCount();
  const template = templateStore.storeTemplate(taskTitle, output, reward);
  const isNewTemplate = templateStore.getCount() > prevCount;

  // 3. Update agent skills
  const taskType = template.taskType;
  const skillNames = TASK_TYPE_SKILLS[taskType] || TASK_TYPE_SKILLS['general'];
  const updatedSkills: string[] = [];

  for (const skillName of skillNames) {
    const existing = db.getSkillsForAgent(agentId).find(s => s.id === skillName);
    const newLevel = existing
      ? Math.min(100, existing.level + (verified ? 2 : 1))
      : (verified ? 52 : 50);

    const skill: DBSkill = {
      id: skillName,
      agentId,
      level: newLevel,
      taskCount: (existing?.taskCount ?? 0) + 1,
      lastUpdated: new Date(),
    };
    db.upsertSkill(skill);
    updatedSkills.push(skillName);
  }

  return {
    templateId: template.id,
    isNewTemplate,
    skillsUpdated: updatedSkills,
    taskType,
  };
}

/**
 * Log a verification error to DB for future analysis.
 */
export function logError(agentId: string, taskTitle: string, issue: string, fixed: boolean): void {
  const err: DBError = {
    id: `err-${Date.now()}`,
    agentId,
    taskTitle,
    issue,
    fixed,
    timestamp: new Date(),
  };
  db.insertError(err);
}

/**
 * Get current skill levels for an agent.
 */
export function getAgentSkills(agentId: string): Record<string, number> {
  const skills = db.getSkillsForAgent(agentId);
  return Object.fromEntries(skills.map(s => [s.id, s.level]));
}
