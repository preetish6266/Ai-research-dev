import { getIcon } from "../utils/icons.js";

export function renderAuth(container, onLoginSuccess, onBackToHome) {
  let mode = "login"; // login or signup

  function renderForm() {
    const cardEl = document.getElementById("auth-card-box");
    if (!cardEl) return;

    if (mode === "login") {
      cardEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem;">Sign In</h2>
          <button id="auth-back-btn" class="glass-btn" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;">
            ${getIcon("x", "", 12)} Cancel
          </button>
        </div>

        <form id="auth-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="form-group">
            <label class="form-label" for="auth-email">Academic Email</label>
            <input type="email" id="auth-email" class="glass-input" placeholder="name@university.edu" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="auth-password">Password</label>
            <input type="password" id="auth-password" class="glass-input" placeholder="••••••••" required>
          </div>
          
          <button type="submit" class="glass-btn glass-btn-primary" style="height: 44px; margin-top: 0.5rem;">
            Sign In ${getIcon("arrow-right", "", 16)}
          </button>
        </form>

        <div style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-secondary);">
          Don't have an academic account? 
          <span id="switch-mode-btn" style="color: var(--accent-cyan); cursor: pointer; font-weight: 600;">Sign Up</span>
        </div>
      `;
    } else {
      cardEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h2 style="font-size: 1.75rem;">Create Account</h2>
          <button id="auth-back-btn" class="glass-btn" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;">
            ${getIcon("x", "", 12)} Cancel
          </button>
        </div>

        <form id="auth-form" style="display: flex; flex-direction: column; gap: 1.1rem;">
          <div class="form-group">
            <label class="form-label" for="auth-name">Full Name</label>
            <input type="text" id="auth-name" class="glass-input" placeholder="Dr. Sarah Jenkins" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="auth-email">Academic Email</label>
            <input type="email" id="auth-email" class="glass-input" placeholder="s.jenkins@university.edu" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="auth-affiliation">Institutional Affiliation</label>
            <input type="text" id="auth-affiliation" class="glass-input" placeholder="Stanford University" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="auth-field">Primary Research Domain</label>
            <input type="text" id="auth-field" class="glass-input" placeholder="Bioinformatics & Genomics" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="auth-password">Password</label>
            <input type="password" id="auth-password" class="glass-input" placeholder="••••••••" required>
          </div>
          
          <button type="submit" class="glass-btn glass-btn-primary" style="height: 44px; margin-top: 0.5rem;">
            Create Account ${getIcon("check", "", 16)}
          </button>
        </form>

        <div style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-secondary);">
          Already have an account? 
          <span id="switch-mode-btn" style="color: var(--accent-cyan); cursor: pointer; font-weight: 600;">Sign In</span>
        </div>
      `;
    }

    // Attach listeners inside the dynamic render
    document.getElementById("auth-back-btn").addEventListener("click", onBackToHome);
    
    document.getElementById("switch-mode-btn").addEventListener("click", () => {
      mode = mode === "login" ? "signup" : "login";
      renderForm();
    });

    document.getElementById("auth-form").addEventListener("submit", (e) => {
      e.preventDefault();
      
      const emailVal = document.getElementById("auth-email").value.trim();
      
      let userDetails = {
        name: "Dr. Guest Researcher",
        role: "Researcher",
        affiliation: "Guest Institution",
        field: "General Science",
        stage: "phd"
      };

      if (mode === "signup") {
        userDetails = {
          name: document.getElementById("auth-name").value.trim(),
          role: "Academic Researcher",
          affiliation: document.getElementById("auth-affiliation").value.trim(),
          field: document.getElementById("auth-field").value.trim(),
          stage: "phd"
        };
      } else {
        // Mock lookup: if email matches standard user
        if (emailVal.toLowerCase().includes("preetish") || emailVal.toLowerCase().includes("admin")) {
          userDetails = {
            name: "Dr. Preetish Gharami",
            role: "Lead Researcher",
            affiliation: "Institute of Artificial Intelligence",
            field: "Computer Science & Bioinformatics",
            stage: "phd"
          };
        } else {
          // General Guest login
          const namePart = emailVal.split("@")[0].split(/[._+-]+/);
          const nameFormatted = namePart.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");
          userDetails = {
            name: nameFormatted || "Dr. Guest Researcher",
            role: "Academic Researcher",
            affiliation: "Collaborating Lab",
            field: "General Science",
            stage: "phd"
          };
        }
      }

      onLoginSuccess(userDetails);
    });
  }

  container.innerHTML = `
    <div class="auth-container">
      <div class="glass-card auth-card" id="auth-card-box"></div>
      
      <!-- Background glows -->
      <div class="glow-backdrop dark-mode-glow-1"></div>
      <div class="glow-backdrop dark-mode-glow-2"></div>
    </div>
  `;

  renderForm();
}
