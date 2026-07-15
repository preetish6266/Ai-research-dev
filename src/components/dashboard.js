import { getIcon } from "../utils/icons.js";
import { PDFService } from "../utils/pdfSim.js";

export function renderDashboard(container, state, navigateTo) {
  // Retrieve counts
  const papers = PDFService.getPapers();
  const notesStr = localStorage.getItem("researchpilot_notes");
  const notesCount = notesStr ? JSON.parse(notesStr).length : 2;
  const plannerTasks = JSON.parse(localStorage.getItem("researchpilot_planner_tasks") || "[]");
  
  // Calculate roadmap progress
  const completedTasks = plannerTasks.filter(t => t.completed).length;
  const totalTasks = plannerTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 45;

  container.innerHTML = `
    <div class="dashboard-grid">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <h1>Welcome back, ${state.user?.name || "Researcher"}</h1>
          <p>Your research workspace is optimized. AI recommendations are ready.</p>
        </div>
        <button id="dash-new-project" class="glass-btn glass-btn-primary">
          ${getIcon("plus", "", 18)} New Roadmap
        </button>
      </div>

      <!-- Stats Row -->
      <div class="dashboard-stats">
        <div class="glass-card stat-card cyan">
          <div class="stat-icon">${getIcon("activity", "", 22)}</div>
          <div>
            <div class="stat-value">3</div>
            <div class="stat-label">Active Research Areas</div>
          </div>
        </div>
        <div class="glass-card stat-card purple">
          <div class="stat-icon">${getIcon("lightbulb", "", 22)}</div>
          <div>
            <div class="stat-value">12</div>
            <div class="stat-label">Ideas Generated</div>
          </div>
        </div>
        <div class="glass-card stat-card green">
          <div class="stat-icon">${getIcon("book-open", "", 22)}</div>
          <div>
            <div class="stat-value">${papers.length}</div>
            <div class="stat-label">Documents & PDFs</div>
          </div>
        </div>
        <div class="glass-card stat-card orange">
          <div class="stat-icon">${getIcon("file-text", "", 22)}</div>
          <div>
            <div class="stat-value">${notesCount}</div>
            <div class="stat-label">Smart Notes</div>
          </div>
        </div>
      </div>

      <!-- Left Column: Progress & Recommendations -->
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <!-- Research Progress Tracker -->
        <div class="glass-card">
          <h3 class="tracker-title">${getIcon("trending-up", "text-cyan", 18)} Research Progress Tracker</h3>
          <div class="progress-track-wrapper">
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
              <span>Active Project: <strong>${localStorage.getItem("researchpilot_active_project_name") || "Neural-Symbolic Proofs"}</strong></span>
              <span>${progressPercent}% Complete</span>
            </div>
            <div class="progress-track-bar">
              <div class="progress-track-fill" style="width: ${progressPercent}%;"></div>
            </div>
          </div>

          <div class="tracker-activities">
            <div class="tracker-item">
              ${getIcon("check", "text-green", 16)}
              <span>Literature review framework drafted</span>
            </div>
            <div class="tracker-item">
              ${getIcon("check", "text-green", 16)}
              <span>Key knowledge gaps verified</span>
            </div>
            <div class="tracker-item">
              ${totalTasks > 0 && completedTasks === totalTasks 
                ? getIcon("check", "text-green", 16) 
                : `<div class="skeleton" style="width: 14px; height: 14px; border-radius: 50%;"></div>`}
              <span>${totalTasks > 0 && completedTasks === totalTasks ? 'All tasks complete!' : 'Refining target methodology and code validation'}</span>
            </div>
          </div>
        </div>

        <!-- Smart Recommendations -->
        <div class="glass-card">
          <h3 style="margin-bottom: 1.25rem;">Smart Recommendations</h3>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="glass-card" style="padding: 1rem; background: rgba(255,255,255,0.01); cursor: pointer;" id="rec-read-paper">
              <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600; text-transform: uppercase;">Suggested Reading</span>
              <h4 style="margin: 0.25rem 0; font-size: 0.95rem;">Attention Is All You Need</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary);">Refresh your understanding of multi-head self-attention mechanisms for proof scaling.</p>
            </div>
            <div class="glass-card" style="padding: 1rem; background: rgba(255,255,255,0.01); cursor: pointer;" id="rec-gap-finder">
              <span style="font-size: 0.75rem; color: var(--accent-purple); font-weight: 600; text-transform: uppercase;">Methodology Alert</span>
              <h4 style="margin: 0.25rem 0; font-size: 0.95rem;">Analyze Epigenetic CRISPR Gaps</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary);">Your profile includes interest in Biotech. Explore gaps in cas9 off-targets.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Innovation & Stats -->
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <!-- Innovation Index Gauge -->
        <div class="glass-card" style="display: flex; flex-direction: column; align-items: center;">
          <h3 style="align-self: flex-start; margin-bottom: 1rem;">Average Innovation Index</h3>
          <div class="dial-container">
            <svg class="gauge-svg">
              <defs>
                <linearGradient id="cyan-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="var(--accent-cyan)" />
                  <stop offset="100%" stop-color="var(--accent-purple)" />
                </linearGradient>
              </defs>
              <circle class="gauge-track" cx="70" cy="70" r="60" />
              <!-- stroke-dashoffset: 377 * (1 - score/100) -->
              <circle class="gauge-fill" id="dash-gauge-circle" cx="70" cy="70" r="60" style="stroke-dashoffset: 68;" />
              <text class="gauge-text" x="70" y="70" text-anchor="middle" dominant-baseline="middle">82</text>
              <text class="gauge-label" x="70" y="98" text-anchor="middle" dominant-baseline="middle">VERY HIGH</text>
            </svg>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); text-align: center; line-height: 1.5; margin-top: 0.5rem;">
            Your research proposals rank in the top 94th percentile for novelty and local feasibility.
          </p>
        </div>

        <!-- Recent Documents Panel -->
        <div class="glass-card">
          <h3 style="margin-bottom: 1rem;">Recent Documents</h3>
          <div class="doc-list" style="margin-top: 0;">
            ${papers.slice(0, 3).map(p => `
              <div class="doc-item dash-doc-item" data-id="${p.id}" style="padding: 0.6rem 0.75rem;">
                <div>
                  <div style="font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${p.title}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">${p.authors}</div>
                </div>
                ${getIcon("chevron-right", "text-muted", 16)}
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  document.getElementById("dash-new-project").addEventListener("click", () => navigateTo("planner"));
  document.getElementById("rec-read-paper").addEventListener("click", () => navigateTo("pdf"));
  document.getElementById("rec-gap-finder").addEventListener("click", () => navigateTo("gaps"));
  
  document.querySelectorAll(".dash-doc-item").forEach(item => {
    item.addEventListener("click", (e) => {
      const paperId = item.getAttribute("data-id");
      localStorage.setItem("researchpilot_active_paper_id", paperId);
      navigateTo("pdf");
    });
  });

  // Small timeout to animate the SVG circle stroke
  setTimeout(() => {
    const circle = document.getElementById("dash-gauge-circle");
    if (circle) {
      // 377 is the circumference. Offset = 377 * (1 - 0.82) = 67.86
      circle.style.strokeDashoffset = "68";
    }
  }, 100);
}
