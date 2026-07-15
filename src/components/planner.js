import { getIcon } from "../utils/icons.js";

const DEFAULT_PLAN = [
  { id: "task_0_0", phase: "Phase 1: Proof of Concept (Month 1)", text: "Design symbolic-neural bridge layer connecting core transformers to formal checkers", completed: true },
  { id: "task_0_1", phase: "Phase 1: Proof of Concept (Month 1)", text: "Select a subset of standard propositional logic rules for basic correctness checks", completed: true },
  { id: "task_0_2", phase: "Phase 1: Proof of Concept (Month 1)", text: "Establish baseline validation metrics comparing manual solutions to engine outputs", completed: false },
  
  { id: "task_1_0", phase: "Phase 2: Core Engine Training (Month 2-3)", text: "Train transformer models on mathematical corpora and logic rule files", completed: false },
  { id: "task_1_1", phase: "Phase 2: Core Engine Training (Month 2-3)", text: "Implement reinforcement learning models backed by validation errors", completed: false },
  { id: "task_1_2", phase: "Phase 2: Core Engine Training (Month 2-3)", text: "Benchmark solver latency speeds against classical solvers (like Z3)", completed: false },
  
  { id: "task_2_0", phase: "Phase 3: Integration & UI (Month 4)", text: "Deploy proof verification results into responsive client-side UI graphs", completed: false },
  { id: "task_2_1", phase: "Phase 3: Integration & UI (Month 4)", text: "Enable export to standard LaTeX and Markdown academic formats", completed: false }
];

export function renderPlanner(container) {
  // Load tasks from localStorage or default
  let tasks = JSON.parse(localStorage.getItem("researchpilot_planner_tasks"));
  if (!tasks || tasks.length === 0) {
    tasks = DEFAULT_PLAN;
    localStorage.setItem("researchpilot_planner_tasks", JSON.stringify(tasks));
  }

  let projectName = localStorage.getItem("researchpilot_active_project_name") || "Neural-Symbolic Proofs";

  function saveState() {
    localStorage.setItem("researchpilot_planner_tasks", JSON.stringify(tasks));
    localStorage.setItem("researchpilot_active_project_name", projectName);
    updateProgressHeader();
  }

  function updateProgressHeader() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const progressText = document.getElementById("planner-percent-text");
    const progressFill = document.getElementById("planner-progress-fill");
    
    if (progressText) progressText.innerText = `${percent}% Completed (${completed}/${total} Tasks)`;
    if (progressFill) progressFill.style.width = `${percent}%`;
  }

  function renderTimeline() {
    const listEl = document.getElementById("planner-timeline-list");
    if (!listEl) return;

    // Group tasks by phase
    const phases = {};
    tasks.forEach(t => {
      if (!phases[t.phase]) phases[t.phase] = [];
      phases[t.phase].push(t);
    });

    listEl.innerHTML = Object.keys(phases).map((phaseName, phaseIdx) => {
      const phaseTasks = phases[phaseName];
      const isPhaseDone = phaseTasks.every(t => t.completed);
      const isPhaseActive = !isPhaseDone && (phaseIdx === 0 || Object.keys(phases).slice(0, phaseIdx).every(k => phases[k].every(t => t.completed)));
      
      const nodeClass = isPhaseDone ? "completed" : (isPhaseActive ? "active" : "");

      return `
        <div class="milestone-node ${nodeClass}">
          <div class="milestone-dot"></div>
          <div class="glass-card milestone-card">
            <div class="milestone-header">
              <h4 class="milestone-title" style="color: ${isPhaseDone ? 'var(--accent-green)' : (isPhaseActive ? 'var(--accent-cyan)' : 'var(--text-secondary)')};">
                ${phaseName}
              </h4>
              <span class="milestone-duration">${phaseTasks.length} Tasks</span>
            </div>
            
            <div class="milestone-tasks">
              ${phaseTasks.map(t => `
                <label class="task-checkbox-label">
                  <input type="checkbox" class="task-checkbox-input" data-task-id="${t.id}" ${t.completed ? 'checked' : ''}>
                  <span>${t.text}</span>
                </label>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Attach checkbox handlers
    document.querySelectorAll(".task-checkbox-input").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const tId = cb.getAttribute("data-task-id");
        const checked = e.target.checked;
        
        // Find and update task
        const task = tasks.find(t => t.id === tId);
        if (task) {
          task.completed = checked;
          saveState();
          
          // Re-render timeline to update node classes
          renderTimeline();
        }
      });
    });
  }

  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <!-- Title Block -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600; text-transform: uppercase;">Roadmap & Timeline</span>
          <h2 id="planner-project-title" style="font-size: 1.75rem; margin-top: 0.25rem;">${projectName}</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Step-by-step implementation milestones parsed by AI Planner.</p>
        </div>
        <button id="planner-reset-btn" class="glass-btn" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
          Reset to Defaults
        </button>
      </div>

      <!-- Settings Card -->
      <div class="glass-card" style="margin-bottom: 2rem;">
        <h3 style="font-size: 1rem; margin-bottom: 1rem;">Generate New Research Plan</h3>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
          <div class="form-group">
            <label class="form-label" for="planner-topic">Project Topic</label>
            <input type="text" id="planner-topic" class="glass-input" placeholder="e.g. CRISPRcas9 targeted gene diagnostics">
          </div>
          <div class="form-group">
            <label class="form-label" for="planner-duration">Project Duration</label>
            <select id="planner-duration" class="glass-input" style="background: rgba(0,0,0,0.25);">
              <option value="1">1 Month Plan</option>
              <option value="3" selected>3 Month Plan</option>
              <option value="6">6 Month Plan</option>
            </select>
          </div>
          <button id="planner-generate-btn" class="glass-btn glass-btn-primary" style="height: 44px;">
            ${getIcon("calendar", "", 18)} Generate Plan
          </button>
        </div>
      </div>

      <!-- Progress Card -->
      <div class="glass-card" style="margin-bottom: 2rem; padding: 1.25rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem;">
          <span style="font-weight: 600;">Overall Implementation Progress</span>
          <span id="planner-percent-text" style="color: var(--accent-cyan);">0% Completed</span>
        </div>
        <div class="progress-track-bar">
          <div class="progress-track-fill" id="planner-progress-fill" style="width: 0%;"></div>
        </div>
      </div>

      <!-- Timeline Container -->
      <div class="timeline-stepper" id="planner-timeline-list"></div>
    </div>
  `;

  // Init renders
  renderTimeline();
  updateProgressHeader();

  // Reset button action
  document.getElementById("planner-reset-btn").addEventListener("click", () => {
    if (confirm("Reset current project plan to default 'Neural-Symbolic Proofs'?")) {
      projectName = "Neural-Symbolic Proofs";
      tasks = DEFAULT_PLAN.map(t => ({ ...t })); // Clone
      saveState();
      document.getElementById("planner-project-title").innerText = projectName;
      renderTimeline();
      updateProgressHeader();
    }
  });

  // Generate Plan action
  document.getElementById("planner-generate-btn").addEventListener("click", () => {
    const topic = document.getElementById("planner-topic").value.trim();
    if (!topic) {
      alert("Please enter a project topic first.");
      return;
    }

    const duration = parseInt(document.getElementById("planner-duration").value);
    
    // Generate simulated milestone phases based on topic and duration
    projectName = topic;
    const normTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    
    let genTasks = [];
    if (duration === 1) {
      genTasks = [
        { id: "task_0_0", phase: "Week 1: Foundations & Lit Review", text: `Review existing methodologies and gaps for ${normTopic}`, completed: false },
        { id: "task_0_1", phase: "Week 1: Foundations & Lit Review", text: `Construct primary equations and draft baseline metrics`, completed: false },
        { id: "task_1_0", phase: "Week 2-3: Core Execution & Testing", text: `Write structural interfaces and run primary validation trials`, completed: false },
        { id: "task_1_1", phase: "Week 2-3: Core Execution & Testing", text: `Refine parameters based on diagnostic outputs`, completed: false },
        { id: "task_2_0", phase: "Week 4: Documentation & Summary", text: `Compile final results report and export bibliography list`, completed: false }
      ];
    } else if (duration === 3) {
      genTasks = [
        { id: "task_0_0", phase: "Month 1: Literature Mapping & Design", text: `Isolate active gaps in ${normTopic} landscape`, completed: false },
        { id: "task_0_1", phase: "Month 1: Literature Mapping & Design", text: `Define experimental parameters and mathematical controls`, completed: false },
        { id: "task_1_0", phase: "Month 2: Core Engineering Trials", text: `Set up local environments and compile initial validation datasets`, completed: false },
        { id: "task_1_1", phase: "Month 2: Core Engineering Trials", text: `Train modeling layers and run benchmark checks`, completed: false },
        { id: "task_2_0", phase: "Month 3: Synthesis & Verification", text: `Compare metrics against baseline benchmarks and write report`, completed: false },
        { id: "task_2_1", phase: "Month 3: Synthesis & Verification", text: `Export literature citations and finalize project notes`, completed: false }
      ];
    } else {
      // 6 month
      genTasks = [
        { id: "task_0_0", phase: "Month 1-2: Advanced Exploration", text: `Complete broad survey of ${normTopic} and summarize gaps`, completed: false },
        { id: "task_0_1", phase: "Month 1-2: Advanced Exploration", text: `Establish formal theoretical guidelines and controls`, completed: false },
        { id: "task_1_0", phase: "Month 3-4: Construction & Training", text: `Develop high-dimensional algorithms and optimize computations`, completed: false },
        { id: "task_1_1", phase: "Month 3-4: Construction & Training", text: `Run localized scaling tests on cluster configurations`, completed: false },
        { id: "task_2_0", phase: "Month 5-6: Peer Review & Deployment", text: `Draft formal journal article detailing discoveries`, completed: false },
        { id: "task_2_1", phase: "Month 5-6: Peer Review & Deployment", text: `Deploy code libraries and host open-source repository`, completed: false }
      ];
    }

    tasks = genTasks;
    saveState();
    
    document.getElementById("planner-project-title").innerText = projectName;
    document.getElementById("planner-topic").value = "";
    
    renderTimeline();
    updateProgressHeader();
  });
}
