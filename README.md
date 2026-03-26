# 🧠 AutonomousAI — Multi-Agent System Dashboard

A fully autonomous multi-agent AI system visualized as a React + Tailwind dashboard.

## 🚀 Quick Start
```bash
npm install
npm run dev     # Development
npm run build   # Production build
```

## ✅ Completed Missions

### 🟢 Mission 1 — Foundation (COMPLETE)
- Project structure (React + Vite + Tailwind dark theme)
- Agent core state machine (idle→scan→filter→execute→verify→learn)
- Mock platform connection (Upwork/Fiverr/Freelancer adapters)
- Task scanning with live mock task pool
- Confidence filter (`< 0.85 → SKIP`)
- AI execution simulation with template reuse
- Verification pipeline (Execute→Verify→Fix→Re-Verify→Complete)
- In-memory MongoDB mock (tasks, templates, skills, errors collections)
- Template system with Jaccard similarity store/retrieve
- Break scheduler with micro/short/long breaks + ±30% jitter

### 🟡 Mission 2 — Task Reuse & Learning (COMPLETE)
- **similarityEngine.ts** — TF-IDF cosine + Jaccard + bigram blended scorer
- **templateMatcher.ts** — Ranked template matching with match event log
- **templateAdapter.ts** — Slot-filling (`{{PRODUCT}}`, `{{LANG_FROM}}`), version history, speed boost
- **verificationEngine.ts** — 5-rule weighted quality checker (length, keywords, structure, uniqueness, format)
- **skillEngine.ts** — XP system, 4 levels (Beginner→Intermediate→Expert→Master)
- Live Similarity tab (interactive scorer + match log)
- Live Reuse tab (adaptation log + version history)
- Live Verify tab (per-rule pass/fail + fix suggestions)
- Live Skills tab (XP bars + level-up history)

### 🟠 Mission 3 — Multi-Agent System (COMPLETE)
- **agentFactory.ts** — Spawns Alpha-1 (✍️), Beta-2 (💻), Gamma-3 (🌐)
- **taskQueue.ts** — Shared queue with `claim()`/`release()`/`complete()` — no duplicates
- **sharedMemory.ts** — Inter-agent broadcast, template sharing, collab scoring
- 3 agents running in parallel with individual pipeline states
- Multi-Agent tab with queue stats and per-agent cards
- Comms tab with 3 sub-views: feed, knowledge library, collab stats

### 🔵 Mission 4 — Multi-Platform (IN PROGRESS — Step 1 Complete)
- **platformRouter.ts** — Unified router with `registerAdapter()`, `routeTask()`, `fetchAllTasks()`, earnings tracking
- **upworkAdapter.ts** — Hourly/fixed contracts, 20% fee, 5 task types
- **fiverrAdapter.ts** — Gig-based, 20% fee, fast turnaround, 5 task types
- **freelancerAdapter.ts** — Bid system, 10% fee, higher-value tasks, 5 task types
- **toptalAdapter.ts** — Premium expert tasks, 0% fee, 4 task types ($280–$500)
- **PlatformRouterPanel.tsx** — 3 sub-tabs: Platform Stats, Route Log, Earnings Breakdown
- 🔀 Router tab with live routing decisions every 5s, per-platform revenue share bars

## 📁 Project Structure
```
src/
├── engine/
│   ├── agentEngine.ts        # Agent state machine + pipeline runner
│   ├── agentFactory.ts       # Multi-agent spawner
│   ├── taskQueue.ts          # Shared task queue (claim/release)
│   ├── taskPipeline.ts       # Pipeline stage definitions
│   ├── confidenceFilter.ts   # Confidence threshold filter
│   ├── similarityEngine.ts   # TF-IDF cosine + Jaccard + bigram
│   ├── templateMatcher.ts    # Ranked template matching
│   ├── templateAdapter.ts    # Slot-filling + version history
│   ├── verificationEngine.ts # 5-rule quality checker
│   ├── learningEngine.ts     # learn() + updateSkill() + storeTemplate()
│   ├── skillEngine.ts        # XP system + level progression
│   └── sharedMemory.ts       # Inter-agent coordination
├── platform/
│   ├── platformRouter.ts     # Unified multi-platform router
│   ├── platformAdapter.ts    # Original mock adapter
│   ├── breakScheduler.ts     # Human-like break timing
│   └── platforms/
│       ├── upworkAdapter.ts
│       ├── fiverrAdapter.ts
│       ├── freelancerAdapter.ts
│       └── toptalAdapter.ts
├── store/
│   ├── db.ts                 # In-memory MongoDB mock
│   └── templateStore.ts      # Template CRUD + similarity
├── components/               # 15+ React components
└── data/mockData.ts          # Mission + agent + task seed data
```

## 🧠 Core Agent Pipeline
```
while (running) {
  scan()              → fetch task from platform router
  filterConfidence()  → if < 0.85, skip
  similarityCheck()   → TF-IDF cosine + Jaccard + bigram match
  adaptTemplate()     → slot-fill if template found (+30-70% speed)
  execute()           → AI simulation
  verify()            → 5-rule quality check
  if (!pass) fix()    → auto-fix + re-verify
  learn()             → gainXP() + storeTemplate() + broadcast()
  humanDelay()        → ±30% jitter timing
}
```

## ⏭ What's Next
- Mission 4 Step 2 (Final): Platform auth manager + agent-platform assignment matrix + mark Mission 4 complete
- Mission 5: Human-like delays, break scheduler full implementation, random behavior engine
