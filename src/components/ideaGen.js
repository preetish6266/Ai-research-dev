import { getIcon } from "../utils/icons.js";
import { AIService } from "../utils/aiSim.js";

export function renderIdeaGenerator(container, navigateTo) {
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <div class="section-header" style="text-align: left; margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem;">Research Idea Generator</h2>
        <p style="color: var(--text-secondary);">Input your field of interest and generate novel research ideas with innovation grades.</p>
      </div>

      <!-- Generator Settings -->
      <div class="glass-card" style="margin-bottom: 2rem;">
        <div class="input-panel">
          <div class="form-group">
            <label class="form-label" for="idea-topic-input">Research Field or Keyword</label>
            <input type="text" id="idea-topic-input" class="glass-input" placeholder="e.g. federated machine learning in health, solid state batteries, CRISPR modifications">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="form-group">
              <label class="form-label" for="idea-scope-select">Ideation Scope</label>
              <select id="idea-scope-select" class="glass-input" style="background: rgba(0,0,0,0.25);">
                <option value="novel">Highly Novel & Experimental</option>
                <option value="feasible">Highly Feasible & Practical</option>
                <option value="interdisciplinary">Cross-disciplinary Integration</option>
              </select>
            </div>
            <div class="form-group" style="justify-content: flex-end;">
              <button id="generate-ideas-btn" class="glass-btn glass-btn-primary" style="height: 44px; width: 100%;">
                ${getIcon("lightbulb", "", 18)} Generate Innovation Ideas
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div id="ideas-loading" style="display: none; text-align: center; padding: 3rem;">
        <div class="skeleton" style="width: 100%; height: 100px; margin-bottom: 1rem;"></div>
        <div class="skeleton" style="width: 80%; height: 100px; margin-bottom: 1rem;"></div>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">AI is analyzing research spaces and scoring pathways...</p>
      </div>

      <div id="ideas-results-container" class="results-panel">
        <!-- Default State Info -->
        <div class="glass-card" style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
          ${getIcon("compass", "text-muted", 48)}
          <h3 style="margin: 1rem 0; color: var(--text-primary);">Discover Uncharted Paths</h3>
          <p style="max-width: 500px; margin: 0 auto; font-size: 0.9rem;">
            Enter a research keyword above and select your scope. The generator will compute theoretical proposals, project timelines, and impact distributions.
          </p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("generate-ideas-btn").addEventListener("click", async () => {
    const topic = document.getElementById("idea-topic-input").value.trim();
    if (!topic) {
      alert("Please enter a research field or keyword first.");
      return;
    }

    const scope = document.getElementById("idea-scope-select").value;
    const loading = document.getElementById("ideas-loading");
    const results = document.getElementById("ideas-results-container");

    loading.style.display = "block";
    results.innerHTML = "";

    try {
      const ideas = await AIService.generateIdeas(topic, scope);
      loading.style.display = "none";
      
      if (!ideas || ideas.length === 0) {
        results.innerHTML = `<div class="glass-card" style="text-align: center;">No ideas generated. Try another topic.</div>`;
        return;
      }

      results.innerHTML = ideas.map((idea, idx) => {
        // Calculate overall score
        const overall = Math.round((idea.novelty + idea.feasibility + idea.impact) / 3);
        return `
          <div class="glass-card idea-card" id="idea-card-${idx}">
            <div class="idea-header">
              <div>
                <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600;">IDEA PROPOSAL #${idx+1}</span>
                <h3 class="idea-title" style="margin-top: 0.25rem;">${idea.title}</h3>
              </div>
              <div class="innovation-badge ${overall < 80 ? 'medium' : ''}">
                ${getIcon("trending-up", "", 14)} Innovation Index: ${overall}
              </div>
            </div>

            <p class="idea-description">${idea.desc}</p>

            <div class="idea-meta">
              <span>Fields: ${idea.fields.join(", ")}</span>
              <span>References: ${idea.papers.length} citations</span>
            </div>

            <!-- Expandable Panel -->
            <div id="idea-expand-${idx}" style="display: none; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border);">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                <div>
                  <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem; color: var(--accent-purple);">Suggested Roadmap</h4>
                  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${idea.roadmap.map(step => `
                      <div style="font-size: 0.85rem;">
                        <strong>${step.phase} (${step.duration}):</strong>
                        <ul style="margin-top: 0.25rem; padding-left: 1.25rem; color: var(--text-secondary);">
                          ${step.tasks.map(t => `<li>${t}</li>`).join("")}
                        </ul>
                      </div>
                    `).join("")}
                  </div>

                  <h4 style="margin: 1.25rem 0 0.5rem 0; font-size: 0.95rem; color: var(--accent-cyan);">Seminal Readings</h4>
                  <ul style="padding-left: 1.25rem; font-size: 0.85rem; color: var(--text-secondary);">
                    ${idea.papers.map(p => `<li>${p}</li>`).join("")}
                  </ul>
                </div>

                <!-- Circular Gauges -->
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; border-left: 1px solid var(--glass-border); padding-left: 1rem;">
                  <div class="idea-breakdown-grid" style="border:none; grid-template-columns: 1fr; width:100%; gap:0.75rem; margin:0;">
                    <div class="score-metric">
                      <div class="score-metric-val">${idea.novelty}%</div>
                      <div class="score-metric-label">Novelty Score</div>
                    </div>
                    <div class="score-metric">
                      <div class="score-metric-val">${idea.feasibility}%</div>
                      <div class="score-metric-label">Feasibility Score</div>
                    </div>
                    <div class="score-metric">
                      <div class="score-metric-val">${idea.impact}%</div>
                      <div class="score-metric-label">Impact Score</div>
                    </div>
                  </div>

                  <button class="glass-btn glass-btn-primary send-to-notes-btn" data-title="${idea.title}" data-desc="${idea.desc}" style="width: 100%; font-size: 0.8rem; margin-top: 1.5rem; height: 36px; padding:0;">
                    ${getIcon("plus", "", 14)} Send to Notes
                  </button>
                  <button class="glass-btn start-roadmap-btn" data-title="${idea.title}" data-tasks='${JSON.stringify(idea.roadmap)}' style="width: 100%; font-size: 0.8rem; margin-top: 0.5rem; height: 36px; padding:0;">
                    ${getIcon("calendar", "", 14)} Create Planner
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("");

      // Add click behaviors for expansion
      ideas.forEach((_, idx) => {
        const card = document.getElementById(`idea-card-${idx}`);
        const panel = document.getElementById(`idea-expand-${idx}`);
        
        card.addEventListener("click", (e) => {
          // If user clicked note/roadmap actions, don't toggle collapse
          if (e.target.closest("button")) return;
          panel.style.display = panel.style.display === "none" ? "block" : "none";
        });
      });

      // Send to Notes event
      document.querySelectorAll(".send-to-notes-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const title = btn.getAttribute("data-title");
          const desc = btn.getAttribute("data-desc");

          const notesStr = localStorage.getItem("researchpilot_notes");
          const notes = notesStr ? JSON.parse(notesStr) : [];
          
          notes.push({
            id: "note_" + Date.now(),
            title: `Ref: ${title}`,
            content: `**Research Proposal Description**:\n${desc}\n\n*Idea compiled from ResearchPilot AI Generator.*`
          });
          
          localStorage.setItem("researchpilot_notes", JSON.stringify(notes));
          btn.innerText = "Saved to Notes!";
          btn.disabled = true;
          btn.style.background = "var(--accent-green)";
          btn.style.color = "white";
        });
      });

      // Create Roadmap event
      document.querySelectorAll(".start-roadmap-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const title = btn.getAttribute("data-title");
          const tasksData = JSON.parse(btn.getAttribute("data-tasks"));
          
          // Pre-populate planner storage
          localStorage.setItem("researchpilot_active_project_name", title);
          
          // Convert tasks list to planner state
          const flatTasks = [];
          tasksData.forEach((phase, phaseIdx) => {
            phase.tasks.forEach((t, tIdx) => {
              flatTasks.push({
                id: `task_${phaseIdx}_${tIdx}`,
                phase: phase.phase,
                text: t,
                completed: false
              });
            });
          });
          
          localStorage.setItem("researchpilot_planner_tasks", JSON.stringify(flatTasks));
          navigateTo("planner");
        });
      });

    } catch (error) {
      loading.style.display = "none";
      results.innerHTML = `<div class="glass-card" style="text-align: center; color: var(--accent-red);">${error.message}</div>`;
    }
  });
}
