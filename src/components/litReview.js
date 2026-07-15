import { getIcon } from "../utils/icons.js";
import { AIService } from "../utils/aiSim.js";
import { ExportService } from "../utils/exporter.js";

export function renderLitReview(container) {
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <div class="section-header" style="text-align: left; margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem;">Literature Review Generator</h2>
        <p style="color: var(--text-secondary);">Compile cohesive critical synthesis reports detailing key theoretical views and academic bibliography.</p>
      </div>

      <!-- Settings panel -->
      <div class="glass-card" style="margin-bottom: 2rem;">
        <div class="input-panel">
          <div class="form-group">
            <label class="form-label" for="lit-topic-input">Research Question or Subject Area</label>
            <div style="display: flex; gap: 1rem;">
              <input type="text" id="lit-topic-input" class="glass-input" placeholder="e.g. How does federated machine learning affect patient privacy in diagnostics?" style="flex: 1;">
              <button id="generate-lit-btn" class="glass-btn glass-btn-primary" style="height: 44px; padding: 0 2rem;">
                ${getIcon("file-text", "", 18)} Compile Review
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Panel -->
      <div id="lit-loading" style="display: none; text-align: center; padding: 3rem;">
        <div class="skeleton" style="width: 100%; height: 250px; margin-bottom: 1rem;"></div>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Synthesizing theoretical arguments and compiling reference formats...</p>
      </div>

      <!-- Result Box -->
      <div id="lit-results-box" class="results-panel">
        <div class="glass-card" style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
          ${getIcon("file-text", "text-muted", 48)}
          <h3 style="margin: 1rem 0; color: var(--text-primary);">Generate Literature Synthesis</h3>
          <p style="max-width: 500px; margin: 0 auto; font-size: 0.9rem;">
            State your target question to generate structured sections containing synthesis grids, research contradictions, and structured references.
          </p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("generate-lit-btn").addEventListener("click", async () => {
    const topic = document.getElementById("lit-topic-input").value.trim();
    if (!topic) {
      alert("Please enter a research topic or question first.");
      return;
    }

    const loading = document.getElementById("lit-loading");
    const results = document.getElementById("lit-results-box");

    loading.style.display = "block";
    results.innerHTML = "";

    try {
      const reviewText = await AIService.generateLiteratureReview(topic);
      loading.style.display = "none";

      results.innerHTML = `
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.2rem;">Generated Literature Review</h3>
            <div style="display: flex; gap: 0.5rem;">
              <button id="lit-copy-btn" class="glass-btn" style="padding: 0.5rem 0.75rem; font-size: 0.8rem;">
                ${getIcon("check", "", 14)} Copy Raw
              </button>
              <button id="lit-notes-btn" class="glass-btn" style="padding: 0.5rem 0.75rem; font-size: 0.8rem;">
                ${getIcon("plus", "", 14)} Add to Notes
              </button>
              <button id="lit-md-btn" class="glass-btn" style="padding: 0.5rem 0.75rem; font-size: 0.8rem;">
                Markdown
              </button>
              <button id="lit-pdf-btn" class="glass-btn glass-btn-primary" style="padding: 0.5rem 0.75rem; font-size: 0.8rem;">
                Print PDF
              </button>
            </div>
          </div>

          <div id="lit-content-markdown" class="markdown-preview" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary); max-height: 500px; overflow-y: auto; padding-right: 0.5rem;">
            ${reviewText.replace(/\n/g, "<br>")}
          </div>
        </div>
      `;

      // Copy Action
      document.getElementById("lit-copy-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(reviewText);
        const btn = document.getElementById("lit-copy-btn");
        btn.innerHTML = `${getIcon("check", "", 14)} Copied!`;
        setTimeout(() => {
          btn.innerHTML = `${getIcon("check", "", 14)} Copy Raw`;
        }, 2000);
      });

      // Add to Notes Action
      document.getElementById("lit-notes-btn").addEventListener("click", () => {
        const notesStr = localStorage.getItem("researchpilot_notes");
        const notes = notesStr ? JSON.parse(notesStr) : [];
        notes.push({
          id: "note_" + Date.now(),
          title: `Lit Review: ${topic.slice(0, 30)}...`,
          content: reviewText
        });
        localStorage.setItem("researchpilot_notes", JSON.stringify(notes));
        const btn = document.getElementById("lit-notes-btn");
        btn.innerText = "Saved to Notes!";
        btn.disabled = true;
      });

      // Download Markdown
      document.getElementById("lit-md-btn").addEventListener("click", () => {
        ExportService.exportToMarkdown(`literature_review_${topic.slice(0, 15)}`, `Literature Review on ${topic}`, reviewText);
      });

      // Export/Print PDF
      document.getElementById("lit-pdf-btn").addEventListener("click", () => {
        // Parse the markdown string into clean HTML tags for the print window
        let htmlBody = reviewText
          .replace(/# (.*)/g, "<h1>$1</h1>")
          .replace(/## (.*)/g, "<h2>$1</h2>")
          .replace(/### (.*)/g, "<h3>$1</h3>")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/\n/g, "<br>");
        ExportService.exportToPDF(`Literature Review: ${topic}`, htmlBody);
      });

    } catch (e) {
      loading.style.display = "none";
      results.innerHTML = `<div class="glass-card" style="text-align: center; color: var(--accent-red);">${e.message}</div>`;
    }
  });
}
