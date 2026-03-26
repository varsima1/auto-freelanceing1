import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import SystemStats from './components/SystemStats';
import AgentCard from './components/AgentCard';
import TaskFeed from './components/TaskFeed';
import MissionPanel from './components/MissionPanel';
import SystemLog from './components/SystemLog';
import AgentPipeline from './components/AgentPipeline';
import TemplatePanel from './components/TemplatePanel';
import TemplateReusePanel from './components/TemplateReusePanel';
import VerificationPanel from './components/VerificationPanel';
import PlatformPanel from './components/PlatformPanel';
import ErrorLogPanel, { ErrorEntry } from './components/ErrorLogPanel';
import SimilarityPanel from './components/SimilarityPanel';
import SkillPanel from './components/SkillPanel';
import MultiAgentPanel from './components/MultiAgentPanel';
import AgentCommsLog from './components/AgentCommsLog';
import { AdaptedTemplate } from './engine/templateAdapter';
import { VerificationReport } from './engine/verificationEngine';
import { skillEngine } from './engine/skillEngine';
import type { Skill, LevelUpEvent } from './engine/skillEngine';
import { agentFactory, AgentInstance } from './engine/agentFactory';
import { taskQueue, QueueTask } from './engine/taskQueue';
import { MISSIONS, AGENTS, TASKS, SYSTEM_STATS, LOG_ENTRIES } from './data/mockData';
import { Agent, Task, LogEntry, SystemStats as Stats } from './types';
import { PipelineState } from './engine/taskPipeline';
import { runAgentCycle } from './engine/agentEngine';
import { templateStore } from './store/templateStore';
import { DBTemplate } from './store/db';
import { platformAdapter, PlatformState } from './platform/platformAdapter';
import { platformRouter, PlatformStats, RouteDecision } from './platform/platformRouter';
import { upworkAdapter }     from './platform/platforms/upworkAdapter';
import { fiverrAdapter }     from './platform/platforms/fiverrAdapter';
import { freelancerAdapter } from './platform/platforms/freelancerAdapter';
import { toptalAdapter }     from './platform/platforms/toptalAdapter';
import PlatformRouterPanel   from './components/PlatformRouterPanel';
import './platform/breakScheduler';

// ── Register all platform adapters once ──────────────────────
if (!platformRouter.isRegistered('upwork')) {
  platformRouter.registerAdapter(upworkAdapter);
  platformRouter.registerAdapter(fiverrAdapter);
  platformRouter.registerAdapter(freelancerAdapter);
  platformRouter.registerAdapter(toptalAdapter);
}

const INIT_PIPELINE: PipelineState = {
  currentStage: 'idle', stageIndex: -1, progress: 0,
  needsFix: false, taskTitle: '', confidence: 0, reward: 0, error: null,
};

const TABS = [
  { id: 'overview',     label: '⚡ Overview'    },
  { id: 'multiagent',  label: '🤖 Multi-Agent' },
  { id: 'comms',       label: '🤝 Comms'       },
  { id: 'pipeline',    label: '🔄 Pipeline'    },
  { id: 'skills',      label: '🎯 Skills'      },
  { id: 'similarity',  label: '🧬 Similarity'  },
  { id: 'reuse',       label: '🧩 Reuse'       },
  { id: 'verification',label: '🔬 Verify'      },
  { id: 'templates',   label: '📋 Templates'   },
  { id: 'platforms',   label: '🔌 Platforms'   },
  { id: 'router',      label: '🔀 Router'      },
  { id: 'errors',      label: '⚠️ Errors'      },
  { id: 'tasks',       label: '📋 Tasks'       },
  { id: 'logs',        label: '📄 Logs'        },
] as const;

type TabId = typeof TABS[number]['id'];



const INITIAL_ERRORS: ErrorEntry[] = [
  { id:'e-1', timestamp:new Date(Date.now()-600000), type:'confidence_low',  message:'Task skipped: confidence 0.61 < threshold 0.85', agentId:'agent-001', resolved:true,  fixAttempts:0 },
  { id:'e-2', timestamp:new Date(Date.now()-400000), type:'verify_failed',   message:'Output verification failed. Auto-fix applied.',   agentId:'agent-001', resolved:true,  fixAttempts:1 },
  { id:'e-3', timestamp:new Date(Date.now()-200000), type:'auto_fixed',      message:'Re-verification passed after fix.',               agentId:'agent-001', resolved:true,  fixAttempts:1 },
  { id:'e-4', timestamp:new Date(Date.now()-100000), type:'platform_error',  message:'MockPlatform ping timeout. Retrying...',          agentId:'system',    resolved:true,  fixAttempts:2 },
];

export default function App() {
  const [selectedMission, setSelectedMission] = useState(1);
  const [agents, setAgents]   = useState<Agent[]>(AGENTS);
  const [tasks,  setTasks]    = useState<Task[]>(TASKS);
  const [logs,   setLogs]     = useState<LogEntry[]>(LOG_ENTRIES);
  const [stats,  setStats]    = useState<Stats>(SYSTEM_STATS);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [pipeline, setPipeline]   = useState<PipelineState>(INIT_PIPELINE);
  const [templates, setTemplates] = useState<DBTemplate[]>([]);
  const [platforms, setPlatforms] = useState<PlatformState[]>(platformAdapter.getAllStates());
  const [errors,    setErrors]    = useState<ErrorEntry[]>(INITIAL_ERRORS);
  const [adaptations,   setAdaptations]   = useState<AdaptedTemplate[]>([]);
  const [verifications, setVerifications] = useState<VerificationReport[]>([]);
  const [liveVerification, setLiveVerification] = useState<VerificationReport | null>(null);
  const [skills,   setSkills]   = useState<Skill[]>(skillEngine.getAllSkills());
  const [levelUps, setLevelUps] = useState<LevelUpEvent[]>([]);
  const [totalXP,  setTotalXP]  = useState<number>(skillEngine.getTotalXP());

  // ── Mission 3: Multi-Agent State ─────────────────────────────────────────
  const [agentInstances, setAgentInstances] = useState<AgentInstance[]>([]);
  const [pipelines, setPipelines] = useState<Record<string, PipelineState>>({});
  const [queueTasks, setQueueTasks] = useState<QueueTask[]>([]);
  const [queueStats, setQueueStats] = useState(taskQueue.getStats());

  // ── Mission 4: Platform Router State ─────────────────────────────────────
  const [routerStats,    setRouterStats]    = useState<PlatformStats[]>(platformRouter.getAllStats());
  const [routeLog,       setRouteLog]       = useState<RouteDecision[]>([]);
  const [totalRouted,    setTotalRouted]    = useState(0);


  const currentMission = MISSIONS.find(m => m.id === selectedMission)!;

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [
      { id:`l-${Date.now()}-${Math.random()}`, type, message, timestamp:new Date() },
      ...prev,
    ].slice(0, 50));
  }, []);

  const refreshTemplates = useCallback(() => {
    setTemplates(templateStore.getTopTemplates(12));
  }, []);

  // ── Single agent callbacks factory ───────────────────────────────────────
  const makeCallbacks = useCallback((agentId: string, agentName: string) => ({
    onStageChange: (state: PipelineState) => {
      // Update per-agent pipeline map
      setPipelines(prev => ({ ...prev, [agentId]: state }));
      // Keep primary agent-001 pipeline for overview tab
      if (agentId === 'agent-001') setPipeline(state);
      setAgents(prev => prev.map(a =>
        a.id === agentId
          ? { ...a,
              status: state.currentStage === 'executing' ? 'executing'
                    : state.currentStage === 'learning'  ? 'learning' : 'active',
              currentTask: !['idle','completed','skipped'].includes(state.currentStage)
                ? state.taskTitle : null,
            }
          : a
      ));
      // Update factory instance
      setAgentInstances(agentFactory.getAll());
    },
    onLog: addLog,
    onTaskComplete: (reward: number, isNewTemplate: boolean) => {
      agentFactory.recordCompletion(agentId, reward);
      setAgentInstances(agentFactory.getAll());
      setStats(prev => ({
        ...prev,
        totalRevenue: +(prev.totalRevenue + reward).toFixed(2),
        tasksToday:   prev.tasksToday + 1,
        templatesStored: templateStore.getCount(),
      }));
      setPipelines(prev => {
        const p = prev[agentId];
        if (!p) return prev;
        const newTask: Task = {
          id: `t-${Date.now()}`, title: p.taskTitle,
          platform: 'SharedQueue', confidence: p.confidence,
          status: 'completed', reward, agentId, timestamp: new Date(),
          isTemplate: isNewTemplate,
        };
        setTasks(tprev => [newTask, ...tprev].slice(0, 25));
        // Update queue
        setQueueTasks(taskQueue.getAll().slice(-20).reverse());
        setQueueStats(taskQueue.getStats());
        return prev;
      });
      setAgents(prev => prev.map(a =>
        a.id === agentId
          ? { ...a, tasksCompleted: a.tasksCompleted + 1, revenue: +(a.revenue + reward).toFixed(2) }
          : a
      ));
      refreshTemplates();
    },
    onTaskSkipped: (_reason: string) => {
      setQueueStats(taskQueue.getStats());
    },
    onLearn: (result: { taskType: string; isNewTemplate: boolean; skillsUpdated: string[] }) => {
      refreshTemplates();
      setStats(prev => ({ ...prev, templatesStored: templateStore.getCount() }));
      addLog('learn', `🧠 [${agentName}] Skills: ${result.skillsUpdated.join(', ')} (${result.taskType})`);
    },
    onVerification: (report: VerificationReport) => {
      setLiveVerification(report);
      setVerifications(prev => [report, ...prev].slice(0, 20));
    },
    onAdaptation: (adapted: AdaptedTemplate) => {
      setAdaptations(prev => {
        const idx = prev.findIndex(a => a.templateId === adapted.templateId);
        if (idx >= 0) { const u = [...prev]; u[idx] = adapted; return u; }
        return [adapted, ...prev].slice(0, 15);
      });
    },
    onSkillGain: ({ levelUp }: { xpGained: number; levelUp: LevelUpEvent | null }) => {
      setSkills(skillEngine.getAllSkills());
      setTotalXP(skillEngine.getTotalXP());
      if (levelUp) setLevelUps(prev => [levelUp, ...prev].slice(0, 20));
    },
  }), [addLog, refreshTemplates]);

  // ── Spawn all 3 agents and run in parallel ───────────────────────────────
  useEffect(() => {
    const instances = agentFactory.spawnAll();
    setAgentInstances(instances);
    setQueueTasks(taskQueue.getAll().slice(0, 20));
    setQueueStats(taskQueue.getStats());

    // Run each agent with its own AbortController
    instances.forEach(inst => {
      agentFactory.markRunning(inst.id, true);
      runAgentCycle(inst.id, inst.name, makeCallbacks(inst.id, inst.name), inst.abortController.signal);
    });

    return () => { agentFactory.stopAll(); };
  }, [makeCallbacks]);

  // ── Platform simulation ──────────────────────────────────────────────────
  useEffect(() => {
    platformAdapter.connect('mock').then(() => setPlatforms(platformAdapter.getAllStates()));
    const id = setInterval(() => {
      platformAdapter.simulateNetworkEvents();
      setPlatforms(platformAdapter.getAllStates());
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // ── Mission 4: Platform Router simulation ────────────────────────────────
  useEffect(() => {
    const PLATFORM_IDS = ['upwork','fiverr','freelancer','toptal'] as const;
    const AGENT_IDS    = ['Alpha-1','Beta-2','Gamma-3'];
    const id = setInterval(() => {
      // Simulate a routing decision
      const platformId = PLATFORM_IDS[Math.floor(Math.random() * PLATFORM_IDS.length)];
      const agentId    = AGENT_IDS[Math.floor(Math.random() * AGENT_IDS.length)];
      const earning    = +(10 + Math.random() * 90).toFixed(2);
      const reasons    = ['specialization match','general routing','high-value task','template reuse boost'];
      const reason     = `${platformId.toUpperCase()}: ${reasons[Math.floor(Math.random() * reasons.length)]} | net $${earning}`;
      const decision: RouteDecision = {
        taskId: `t-${Date.now()}`,
        platform: platformId,
        agentId,
        reason,
        expectedEarning: earning,
        timestamp: new Date(),
      };
      platformRouter.addEarning(platformId, earning);
      setRouterStats(platformRouter.getAllStats());
      setRouteLog(prev => [decision, ...prev].slice(0, 40));
      setTotalRouted(prev => prev + 1);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // ── Error generation from primary pipeline ───────────────────────────────
  useEffect(() => {
    if (pipeline.currentStage === 'skipped' && pipeline.taskTitle) {
      const e: ErrorEntry = {
        id:`e-${Date.now()}`, timestamp:new Date(), type:'confidence_low' as const,
        message:`Task skipped: confidence ${pipeline.confidence.toFixed(2)} < 0.85`,
        agentId:'agent-001', resolved:true, fixAttempts:0,
      };
      setErrors(prev => [e, ...prev].slice(0, 30));
    }
    if (pipeline.needsFix && pipeline.currentStage === 'fixing') {
      const e: ErrorEntry = {
        id:`e-${Date.now()}`, timestamp:new Date(), type:'verify_failed' as const,
        message:`Verify failed: ${pipeline.taskTitle}. Auto-fix triggered.`,
        agentId:'agent-001', resolved:false, fixAttempts:1,
      };
      setErrors(prev => [e, ...prev].slice(0, 30));
    }
  }, [pipeline.currentStage, pipeline.taskTitle, pipeline.needsFix, pipeline.confidence]);

  // ── Uptime Counter ───────────────────────────────────────────────────────
  useEffect(() => {
    let seconds = 4 * 3600 + 32 * 60;
    const id = setInterval(() => {
      seconds++;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      setStats(prev => ({ ...prev, uptime: `${h}h ${m}m ${s}s` }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar missions={MISSIONS} selectedMission={selectedMission} onSelectMission={setSelectedMission} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-gray-900/80 border-b border-gray-800 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1 flex-wrap">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-all
                  ${activeTab === tab.id ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0 ml-4">
            <span>⏱ <span className="text-gray-300 font-mono">{stats.uptime}</span></span>
            <span className="text-emerald-400 font-mono">📋 {templateStore.getCount()} templates</span>
            <span className="text-cyan-400 font-mono">🤖 {agentInstances.filter(a=>a.isRunning).length} agents</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <SystemStats stats={stats} />

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5"><MissionPanel mission={currentMission} /></div>
              <div className="col-span-7 flex flex-col gap-4">
                <div>
                  <h3 className="text-gray-500 text-xs uppercase tracking-widest mb-3">Active Agents</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {agents.map(a => <AgentCard key={a.id} agent={a} />)}
                  </div>
                </div>
                <TaskFeed tasks={tasks} />
              </div>
              <div className="col-span-8"><AgentPipeline state={pipeline} agentName="Alpha-1" /></div>
              <div className="col-span-4"><TemplatePanel templates={templates} totalCount={templateStore.getCount()} /></div>
              <div className="col-span-12"><SystemLog logs={logs} /></div>
            </div>
          )}

          {/* MULTI-AGENT */}
          {activeTab === 'multiagent' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-semibold">🤖 Multi-Agent System — 3 Agents Running in Parallel</h2>
                <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded-full">Mission 3 — Step 1</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-2">🏭 Agent Factory + Shared Task Queue</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon:'🏭', name:'Agent Factory',    desc:'Spawns agents with unique IDs, roles, specializations, own AbortController' },
                    { icon:'🗂️', name:'Shared Queue',     desc:'claim() → no two agents take same task. release() if confidence fails.' },
                    { icon:'🧠', name:'Shared Learning',  desc:'All agents share templateStore + skillEngine. Knowledge compounds.' },
                  ].map(s => (
                    <div key={s.name} className="bg-gray-800/60 rounded-lg p-3">
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="text-sm font-semibold text-white mb-1">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <MultiAgentPanel
                agents={agentInstances}
                pipelines={pipelines}
                queueStats={queueStats}
                recentTasks={queueTasks}
              />
            </div>
          )}

          {/* COMMS */}
          {activeTab === 'comms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-semibold">🤝 Inter-Agent Communication — Shared Memory</h2>
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Mission 3 — Step 2</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-2">
                {[
                  { icon:'📡', name:'Broadcast Layer', desc:'Agents send typed messages (template_shared, task_completed, skill_leveled) to all others in real-time.' },
                  { icon:'📚', name:'Shared Knowledge', desc:'New templates are instantly broadcast. All agents can reuse discoveries without re-learning.' },
                  { icon:'🤝', name:'Collaboration Score', desc:'Each agent earns a score based on templates shared, messages sent, and network contribution.' },
                ].map(s => (
                  <div key={s.name} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-sm font-semibold text-white mb-1">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.desc}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <AgentCommsLog />
              </div>
            </div>
          )}

          {/* PIPELINE */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">🔄 Live Agent Pipeline — Alpha-1</h2>
              <AgentPipeline state={pipeline} agentName="Alpha-1" />
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon:'🔍', name:'Scan',      desc:'Platform scanned for new tasks every cycle.' },
                  { icon:'⚖️', name:'Filter',    desc:'Confidence < 0.85 → task skipped automatically.' },
                  { icon:'📋', name:'Template',  desc:'Cosine+Bigram TF-IDF similarity check.' },
                  { icon:'⚡', name:'Execute',   desc:'AI processes the task. Template reused if found.' },
                  { icon:'🔬', name:'Verify',    desc:'Output checked against 5 quality rules.' },
                  { icon:'🔧', name:'Fix',       desc:'Auto-fix applied if verification fails.' },
                  { icon:'✅', name:'Re-Verify', desc:'Fixed output verified again before completion.' },
                  { icon:'🧠', name:'Learn',     desc:'Template stored. Skill scores updated in DB.' },
                ].map(s => (
                  <div key={s.name} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-sm font-semibold text-white mb-1">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.desc}</div>
                  </div>
                ))}
              </div>
              <SystemLog logs={logs} />
            </div>
          )}

          {/* SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-semibold">🎯 Skill Tree — XP & Level System</h2>
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Mission 2 ✅ Complete</span>
                <span className="ml-auto text-xs text-yellow-400 font-mono">⚡ {totalXP} Total XP</span>
              </div>
              <SkillPanel skills={skills} levelUps={levelUps} totalXP={totalXP} />
            </div>
          )}

          {/* SIMILARITY */}
          {activeTab === 'similarity' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-semibold">🧬 Task Similarity Detection Engine</h2>
                <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full">Mission 2 — Step 1</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-2">🔬 Blended Similarity Score</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon:'📐', name:'Cosine TF-IDF', weight:'50%', desc:'Builds TF-IDF vectors from unigrams + bigrams.' },
                    { icon:'🎯', name:'Jaccard',         weight:'30%', desc:'Token set intersection / union.' },
                    { icon:'🔗', name:'Bigram N-gram',   weight:'20%', desc:'Consecutive word pairs for phrase matching.' },
                  ].map(a => (
                    <div key={a.name} className="bg-gray-800/60 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{a.icon}</span>
                        <span className="text-sm font-semibold text-white">{a.name}</span>
                        <span className="ml-auto text-xs text-blue-400 font-mono">{a.weight}</span>
                      </div>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <SimilarityPanel />
            </div>
          )}

          {/* TEMPLATE REUSE */}
          {activeTab === 'reuse' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-semibold">🧩 Template Reuse System</h2>
                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">Mission 2 — Step 2</span>
              </div>
              <TemplateReusePanel adaptations={adaptations} />
            </div>
          )}

          {/* VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-semibold">🔬 Multi-Rule Verification Engine</h2>
                <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full">Mission 2 — Step 2</span>
              </div>
              <VerificationPanel reports={verifications} liveReport={liveVerification} />
            </div>
          )}

          {/* TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">📋 Template Library</h2>
              <TemplatePanel templates={templates} totalCount={templateStore.getCount()} />
            </div>
          )}

          {/* PLATFORMS */}
          {activeTab === 'platforms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-semibold">🔌 Platform Connections</h2>
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Mission 1 ✅</span>
              </div>
              <PlatformPanel
                platforms={platforms}
                onConnect={(id) => {
                  platformAdapter.connect(id as 'upwork'|'fiverr'|'freelancer'|'mock')
                    .then(() => setPlatforms(platformAdapter.getAllStates()));
                }}
              />
            </div>
          )}

          {/* PLATFORM ROUTER — Mission 4 */}
          {activeTab === 'router' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">Mission 4 — Multi-Platform</span>
                <span className="text-xs text-gray-500">4 platforms × 3 agents × unified router</span>
              </div>
              {/* Platform feature cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { emoji:'🟢', name:'Upwork',     fee:'20%', type:'Hourly/Fixed',   tasks:'5 types',  color:'green'  },
                  { emoji:'🟡', name:'Fiverr',     fee:'20%', type:'Gig-based',      tasks:'5 types',  color:'yellow' },
                  { emoji:'🔵', name:'Freelancer', fee:'10%', type:'Bid system',     tasks:'5 types',  color:'blue'   },
                  { emoji:'🔴', name:'Toptal',     fee:'0%',  type:'Premium/Expert', tasks:'4 types',  color:'red'    },
                ].map(p => (
                  <div key={p.name} className={`bg-gray-800 border border-${p.color}-500/20 rounded-xl p-3`}>
                    <div className="text-2xl mb-1">{p.emoji}</div>
                    <div className={`font-bold text-${p.color}-400 text-sm`}>{p.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{p.type}</div>
                    <div className="text-xs text-gray-500">{p.tasks} · {p.fee} fee</div>
                  </div>
                ))}
              </div>
              <PlatformRouterPanel
                platformStats={routerStats}
                routeLog={routeLog}
                totalRouted={totalRouted}
              />
            </div>
          )}

          {/* ERRORS */}
          {activeTab === 'errors' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">⚠️ Error Log & Auto-Fix Rate</h2>
              <ErrorLogPanel errors={errors} />
            </div>
          )}

          {/* TASKS */}
          {activeTab === 'tasks' && (
            <div>
              <h2 className="text-white font-semibold mb-4">
                Task Feed <span className="ml-2 text-xs text-gray-500">({tasks.length} tasks)</span>
              </h2>
              <TaskFeed tasks={tasks} />
            </div>
          )}

          {/* LOGS */}
          {activeTab === 'logs' && (
            <div>
              <h2 className="text-white font-semibold mb-4">
                System Log <span className="ml-2 text-xs text-gray-500">({logs.length} entries)</span>
              </h2>
              <SystemLog logs={logs} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
