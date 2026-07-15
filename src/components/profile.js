import { getIcon } from "../utils/icons.js";
import { AIService } from "../utils/aiSim.js";

export function renderProfile(container, state, onUpdateState) {
  const user = state.user || {
    name: "Dr. Preetish Gharami",
    role: "Lead Researcher",
    affiliation: "Institute of Artificial Intelligence",
    field: "Computer Science & Bioinformatics",
    stage: "phd",
  };

  const savedKey = localStorage.getItem("researchpilot_gemini_key") || "";
  const isLive = AIService.isLiveMode();

  container.innerHTML = `
    <div style="max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">

      <!-- Page Header -->
      <div>
        <h2 style="font-size: 1.75rem;">Researcher Profile & Settings</h2>
        <p style="color: var(--text-secondary); margin-top: 0.25rem;">Manage your research domain, credentials, and Gemini AI connection.</p>
      </div>

      <!-- AI Mode Status Banner -->
      <div class="glass-card" style="
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border-color: ${isLive ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.3)"};
        background: ${isLive ? "rgba(16, 185, 129, 0.06)" : "rgba(245, 158, 11, 0.05)"};
        flex-wrap: wrap;
      ">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="
            width: 10px; height: 10px; border-radius: 50%;
            background: ${isLive ? "var(--accent-green)" : "var(--accent-orange)"};
            box-shadow: 0 0 8px ${isLive ? "var(--accent-green)" : "var(--accent-orange)"};
            animation: pulse-glow 2s infinite;
          "></div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: ${isLive ? "var(--accent-green)" : "var(--accent-orange)"};">
              ${isLive ? "🟢 Live Mode — Gemini API Active" : "🟡 Demo Mode — AI Simulator Active"}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.1rem;">
              ${isLive
                ? "All AI features are powered by Google Gemini 1.5 Flash in real-time."
                : "Enter your Gemini API key below to unlock live AI generation."}
            </div>
          </div>
        </div>
        ${isLive ? `<span class="innovation-badge" style="background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); color: var(--accent-green);">Connected</span>` : ""}
      </div>

      <!-- Account Info Card -->
      <div class="glass-card" style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap;">
        <div class="user-avatar" style="width: 72px; height: 72px; font-size: 1.75rem; flex-shrink: 0;">
          ${user.name.split(" ").pop().charAt(0)}
        </div>
        <div style="flex: 1; min-width: 0;">
          <h3 style="font-size: 1.25rem;">${user.name}</h3>
          <p style="color: var(--accent-cyan); font-size: 0.9rem; font-weight: 500; margin-top: 0.15rem;">${user.role} · ${user.affiliation}</p>
          <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.1rem;">Domain: ${user.field}</p>
        </div>
      </div>

      <!-- Workspace Config -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <h3 style="font-size: 1.05rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.75rem;">Workspace Configuration</h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
          <div class="form-group">
            <label class="form-label" for="profile-name">Full Name</label>
            <input type="text" id="profile-name" class="glass-input" value="${user.name}">
          </div>
          <div class="form-group">
            <label class="form-label" for="profile-affiliation">Institutional Affiliation</label>
            <input type="text" id="profile-affiliation" class="glass-input" value="${user.affiliation}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
          <div class="form-group">
            <label class="form-label" for="profile-field">Primary Research Domain</label>
            <input type="text" id="profile-field" class="glass-input" value="${user.field}">
          </div>
          <div class="form-group">
            <label class="form-label" for="profile-stage">Career Stage</label>
            <select id="profile-stage" class="glass-input" style="background: rgba(0,0,0,0.25);">
              <option value="student" ${user.stage === "student" ? "selected" : ""}>Undergrad / Graduate Student</option>
              <option value="phd" ${user.stage === "phd" ? "selected" : ""}>PhD Candidate / PostDoc</option>
              <option value="professor" ${user.stage === "professor" ? "selected" : ""}>Professor / PI</option>
              <option value="industry" ${user.stage === "industry" ? "selected" : ""}>Industry Scientist</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
          <button id="profile-save-btn" class="glass-btn glass-btn-primary" style="padding: 0.65rem 1.5rem;">
            ${getIcon("check", "", 16)} Save Profile
          </button>
        </div>
      </div>

      <!-- Gemini API Key Card -->
      <div class="glass-card" style="display: flex; flex-direction: column; gap: 1.25rem; border-color: ${isLive ? "rgba(16,185,129,0.25)" : "rgba(0,242,254,0.15)"};">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.75rem;">
          <h3 style="font-size: 1.05rem;">Gemini API Integration</h3>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" class="glass-btn" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; color: var(--accent-cyan); border-color: rgba(0,242,254,0.2);">
            Get Free API Key ↗
          </a>
        </div>

        <div class="form-group">
          <label class="form-label" for="profile-apikey" style="display: flex; justify-content: space-between; align-items: center;">
            <span>Gemini API Key</span>
            <span id="api-key-status" style="font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 99px; ${isLive ? "background: rgba(16,185,129,0.15); color: var(--accent-green);" : "background: rgba(245,158,11,0.1); color: var(--accent-orange);"}">
              ${isLive ? "✓ Active" : "Not set"}
            </span>
          </label>
          <div style="display: flex; gap: 0.75rem;">
            <input type="password" id="profile-apikey" class="glass-input" value="${savedKey}" placeholder="AIzaSy..." style="flex: 1;">
            <button id="profile-key-save-btn" class="glass-btn glass-btn-accent" style="white-space: nowrap; padding: 0 1.25rem; height: 44px; font-size: 0.85rem;">
              Save Key
            </button>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; margin-top: 0.4rem;">
            Your key is stored locally on your device and is never sent to any server other than Google's Gemini API. Leave blank to use the built-in AI simulator.
          </p>
        </div>

        <!-- Test Connection Button -->
        <div style="border-top: 1px dashed var(--glass-border); padding-top: 1rem; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <button id="test-api-btn" class="glass-btn" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
            ${getIcon("activity", "", 14)} Test Connection
          </button>
          <span id="test-result" style="font-size: 0.8rem; color: var(--text-secondary);"></span>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="glass-card" style="border-color: rgba(244,63,94,0.2); background: rgba(244,63,94,0.02);">
        <h3 style="font-size: 1.05rem; color: var(--accent-red); margin-bottom: 0.4rem;">Danger Zone</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">Clears all local data: notes, planner, documents, and API key.</p>
        <button id="profile-clear-cache" class="glass-btn" style="color: var(--accent-red); border-color: var(--accent-red); padding: 0.5rem 1.25rem;">
          ${getIcon("trash", "", 15)} Clear All Local Data
        </button>
      </div>
    </div>
  `;

  // --- Event Handlers ---

  // Save profile
  document.getElementById("profile-save-btn").addEventListener("click", () => {
    const stageVal = document.getElementById("profile-stage").value;
    const roleMap = { student: "Research Fellow", phd: "PhD Candidate", professor: "Principal Investigator", industry: "Lead Scientist" };
    const updatedUser = {
      name: document.getElementById("profile-name").value.trim() || user.name,
      role: roleMap[stageVal] || "Researcher",
      affiliation: document.getElementById("profile-affiliation").value.trim() || user.affiliation,
      field: document.getElementById("profile-field").value.trim() || user.field,
      stage: stageVal,
    };
    state.user = updatedUser;
    onUpdateState(state);

    const btn = document.getElementById("profile-save-btn");
    btn.innerHTML = `${getIcon("check", "", 16)} Saved!`;
    btn.style.background = "var(--accent-green)";
    setTimeout(() => {
      btn.innerHTML = `${getIcon("check", "", 16)} Save Profile`;
      btn.style.background = "";
    }, 2000);
  });

  // Save API key separately
  document.getElementById("profile-key-save-btn").addEventListener("click", () => {
    const keyVal = document.getElementById("profile-apikey").value.trim();
    if (keyVal) {
      localStorage.setItem("researchpilot_gemini_key", keyVal);
    } else {
      localStorage.removeItem("researchpilot_gemini_key");
    }
    // Reload profile to update mode status
    renderProfile(container, state, onUpdateState);
  });

  // Test connection
  document.getElementById("test-api-btn").addEventListener("click", async () => {
    const resultEl = document.getElementById("test-result");
    const keyVal = document.getElementById("profile-apikey").value.trim();
    if (!keyVal) {
      resultEl.innerText = "⚠ No API key entered.";
      resultEl.style.color = "var(--accent-orange)";
      return;
    }
    resultEl.innerText = "Testing connection...";
    resultEl.style.color = "var(--text-secondary)";
    try {
      // Save temporarily to let AIService pick it up
      localStorage.setItem("researchpilot_gemini_key", keyVal);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyVal}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Reply with only the word: SUCCESS" }] }] }),
        }
      );
      if (res.ok) {
        resultEl.innerText = "✓ Connected to Gemini API successfully!";
        resultEl.style.color = "var(--accent-green)";
      } else {
        const err = await res.json();
        resultEl.innerText = `✗ Error: ${err.error?.message || "Unknown error"}`;
        resultEl.style.color = "var(--accent-red)";
        localStorage.removeItem("researchpilot_gemini_key");
      }
    } catch (e) {
      resultEl.innerText = `✗ Network error: ${e.message}`;
      resultEl.style.color = "var(--accent-red)";
    }
  });

  // Clear all data
  document.getElementById("profile-clear-cache").addEventListener("click", () => {
    if (confirm("Reset all data? Notes, roadmaps, API key, and documents will be permanently removed.")) {
      localStorage.clear();
      window.location.reload();
    }
  });
}
