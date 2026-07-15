import { getIcon } from "../utils/icons.js";
import { AIService } from "../utils/aiSim.js";

export function renderGapFinder(container, navigateTo) {
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <div class="section-header" style="text-align: left; margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem;">Knowledge Gap Finder</h2>
        <p style="color: var(--text-secondary);">Identify critical vulnerabilities, conflicts, and unmapped questions in current scientific literature.</p>
      </div>

      <!-- Settings panel -->
      <div class="glass-card" style="margin-bottom: 2rem;">
        <div class="input-panel">
          <div class="form-group">
            <label class="form-label" for="gap-topic-input">Research Field or Subject</label>
            <div style="display: flex; gap: 1rem;">
              <input type="text" id="gap-topic-input" class="glass-input" placeholder="e.g. quantum cryptography algorithms, solid state batteries, CRISPR modifications" style="flex: 1;">
              <button id="find-gaps-btn" class="glass-btn glass-btn-primary" style="height: 44px; padding: 0 2rem;">
                ${getIcon("activity", "", 18)} Analyze Gaps
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Box -->
      <div id="gaps-loading" style="display: none; text-align: center; padding: 3rem;">
        <div class="skeleton" style="width: 100%; height: 200px; margin-bottom: 1rem;"></div>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Aggregating literature databases and calculating density distributions...</p>
      </div>

      <!-- Graph View Wrapper -->
      <div id="gaps-network-container" style="margin-bottom: 2rem;"></div>

      <!-- Detailed Breakdown Cards -->
      <div id="gaps-breakdown-container" class="results-panel">
        <div class="glass-card" style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
          ${getIcon("activity", "text-muted", 48)}
          <h3 style="margin: 1rem 0; color: var(--text-primary);">Construct Literature Maps</h3>
          <p style="max-width: 500px; margin: 0 auto; font-size: 0.9rem;">
            Provide a subject scope to construct a dynamic relationship diagram. Established literature nodes will connect to highlighted unmapped gaps.
          </p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("find-gaps-btn").addEventListener("click", async () => {
    const topic = document.getElementById("gap-topic-input").value.trim();
    if (!topic) {
      alert("Please enter a research topic first.");
      return;
    }

    const loading = document.getElementById("gaps-loading");
    const networkBox = document.getElementById("gaps-network-container");
    const breakdown = document.getElementById("gaps-breakdown-container");

    loading.style.display = "block";
    networkBox.innerHTML = "";
    breakdown.innerHTML = "";

    try {
      const gaps = await AIService.findKnowledgeGaps(topic);
      loading.style.display = "none";

      if (!gaps || gaps.length === 0) {
        breakdown.innerHTML = `<div class="glass-card" style="text-align: center;">No knowledge gaps found. Try another topic.</div>`;
        return;
      }

      // 1. Build the Interactive SVG/CSS Network Graph
      networkBox.innerHTML = `
        <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">Visual Literature Gap Mapping</h3>
        <div class="gap-network" id="gap-network-board">
          <svg class="network-svg-bg" id="gap-network-svg">
            <!-- Dynamically injected lines go here -->
          </svg>
          
          <div class="node-group">
            <!-- Center Node -->
            <div class="glass-card" style="padding: 0.75rem 1.25rem; border-color: var(--accent-cyan); box-shadow: 0 0 15px var(--glow-cyan); z-index: 10;" id="center-node">
              <strong style="font-size: 0.85rem;">${topic}</strong>
            </div>
            
            <!-- Surrounding Gap Nodes -->
            ${gaps.map((g, idx) => `
              <div class="node-card" id="gap-node-${idx}" style="border-color: var(--accent-red); box-shadow: 0 0 15px rgba(244, 63, 94, 0.15);">
                <div class="node-title" style="color: var(--accent-red); display: flex; align-items: center; gap: 0.25rem;">
                  ${getIcon("alert-circle", "", 12)} GAP #${idx+1}
                </div>
                <div style="font-size: 0.8rem; font-weight: 600;">${g.title}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `;

      // Draw SVG Connection Lines from Center Node to Gap Nodes
      setTimeout(() => {
        const board = document.getElementById("gap-network-board");
        const svg = document.getElementById("gap-network-svg");
        const center = document.getElementById("center-node");
        
        if (!board || !svg || !center) return;

        const boardRect = board.getBoundingClientRect();
        const centerRect = center.getBoundingClientRect();
        const centerX = (centerRect.left - boardRect.left) + centerRect.width / 2;
        const centerY = (centerRect.top - boardRect.top) + centerRect.height / 2;

        let linesHtml = "";
        gaps.forEach((_, idx) => {
          const node = document.getElementById(`gap-node-${idx}`);
          if (!node) return;
          const nodeRect = node.getBoundingClientRect();
          const nodeX = (nodeRect.left - boardRect.left) + nodeRect.width / 2;
          const nodeY = (nodeRect.top - boardRect.top) + nodeRect.height / 2;

          linesHtml += `
            <line x1="${centerX}" y1="${centerY}" x2="${nodeX}" y2="${nodeY}" 
              stroke="rgba(255, 255, 255, 0.12)" stroke-width="2" stroke-dasharray="4,4" />
          `;
        });
        svg.innerHTML = linesHtml;
      }, 150);

      // 2. Render Detailed Breakdown Cards
      breakdown.innerHTML = `
        <h3 style="font-size: 1.1rem; margin-top: 1rem;">Gap Analysis Details</h3>
        ${gaps.map((g, idx) => `
          <div class="glass-card" style="border-left: 4px solid var(--accent-red);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span style="font-size: 0.75rem; color: var(--accent-red); font-weight: 600;">KNOWLEDGE GAP #${idx+1}</span>
              <button class="glass-btn gap-save-notes-btn" data-title="${g.title}" data-desc="${g.desc}" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; height: 28px;">
                ${getIcon("plus", "", 12)} Save to Notes
              </button>
            </div>
            <h3 style="font-size: 1.1rem; margin: 0.5rem 0 0.75rem 0;">${g.title}</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem;">${g.desc}</p>
            
            <div style="background: rgba(0,0,0,0.15); padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
              <strong style="color: var(--accent-cyan);">Suggested Search Terms:</strong>
              <code style="background: rgba(255,255,255,0.05); padding: 0.1rem 0.4rem; border-radius: 4px; color: var(--text-primary); font-family: monospace;">
                "${topic} ${g.title.split(" ").slice(0, 3).join(" ")}"
              </code>
            </div>
          </div>
        `).join("")}
      `;

      // Save Gap to Notes Action
      document.querySelectorAll(".gap-save-notes-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const title = btn.getAttribute("data-title");
          const desc = btn.getAttribute("data-desc");

          const notesStr = localStorage.getItem("researchpilot_notes");
          const notes = notesStr ? JSON.parse(notesStr) : [];
          
          notes.push({
            id: "note_" + Date.now(),
            title: `Gap: ${title}`,
            content: `**Knowledge Gap Identified**:\n${desc}\n\n*Topic Scope*: ${topic}\n\n*Analyzed with ResearchPilot AI.*`
          });

          localStorage.setItem("researchpilot_notes", JSON.stringify(notes));
          btn.innerText = "Saved!";
          btn.disabled = true;
          btn.style.background = "var(--accent-green)";
          btn.style.color = "white";
        });
      });

    } catch (e) {
      loading.style.display = "none";
      breakdown.innerHTML = `<div class="glass-card" style="text-align: center; color: var(--accent-red);">${e.message}</div>`;
    }
  });
}
