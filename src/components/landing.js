import { getIcon } from "../utils/icons.js";

export function renderLanding(container, onGetStarted) {
  container.innerHTML = `
    <div class="landing-container">
      <nav class="landing-nav">
        <div class="brand">
          <div class="brand-icon">
            ${getIcon("brain", "text-white", 20)}
          </div>
          <span>ResearchPilot AI</span>
        </div>
        <div class="landing-nav-actions">
          <button id="nav-login-btn" class="glass-btn">Sign In</button>
          <button id="nav-start-btn" class="glass-btn glass-btn-accent" style="margin-left: 0.75rem;">Get Started</button>
        </div>
      </nav>

      <header class="landing-hero">
        <div class="hero-tag">
          🚀 Hackathon Edition: Next-Gen AI
        </div>
        <h1 class="hero-title">
          Accelerate Academic Research<br><span>with ResearchPilot AI</span>
        </h1>
        <p class="hero-subtitle">
          Find critical knowledge gaps, generate novel ideas, compile lit reviews, and orchestrate interactive research plans. Built for students, researchers, and scientific innovators.
        </p>
        <div class="hero-cta">
          <button id="hero-start-btn" class="glass-btn glass-btn-primary" style="padding: 1rem 2.5rem; font-size: 1.1rem;">
            Launch Dashboard ${getIcon("arrow-right", "", 18)}
          </button>
          <a href="#features-section" class="glass-btn" style="padding: 1rem 2rem; font-size: 1.1rem; display: inline-flex; align-items: center;">
            Explore Features
          </a>
        </div>

        <!-- Animated Background Mesh Elements -->
        <div class="glow-backdrop dark-mode-glow-1"></div>
        <div class="glow-backdrop dark-mode-glow-2"></div>
      </header>

      <section id="features-section" class="landing-features">
        <div class="section-header">
          <h2 class="section-title">AI-Powered Research Modules</h2>
          <p class="section-subtitle">A comprehensive stack of specialized tools designed to streamline the scientific methodology.</p>
        </div>

        <div class="features-grid">
          <div class="glass-card feature-card">
            <div class="feature-icon-wrapper">
              ${getIcon("activity", "", 24)}
            </div>
            <h3>Knowledge Gap Finder</h3>
            <p>Analyze thousands of publications in seconds to isolate untapped areas and identify critical unresolved tensions in the literature.</p>
          </div>

          <div class="glass-card feature-card">
            <div class="feature-icon-wrapper">
              ${getIcon("lightbulb", "", 24)}
            </div>
            <h3>Idea Generator</h3>
            <p>Generate novel research titles and hypotheses dynamically graded on custom Novelty, Feasibility, and Impact scales.</p>
          </div>

          <div class="glass-card feature-card">
            <div class="feature-icon-wrapper">
              ${getIcon("file-text", "", 24)}
            </div>
            <h3>Lit Review Generator</h3>
            <p>Synthesize major methodologies and conflicting views into cohesive, print-ready reviews complete with suggested citations.</p>
          </div>

          <div class="glass-card feature-card">
            <div class="feature-icon-wrapper">
              ${getIcon("book-open", "", 24)}
            </div>
            <h3>PDF Chat & Analysis</h3>
            <p>Upload PDFs or inspect classic seminal papers. Ask questions, extract methodologies, and evaluate limitations dynamically.</p>
          </div>

          <div class="glass-card feature-card">
            <div class="feature-icon-wrapper">
              ${getIcon("calendar", "", 24)}
            </div>
            <h3>AI Research Planner</h3>
            <p>Convert research concepts into interactive step-by-step roadmaps with toggleable task lists and active progress tracking.</p>
          </div>

          <div class="glass-card feature-card">
            <div class="feature-icon-wrapper">
              ${getIcon("brain", "", 24)}
            </div>
            <h3>AI Mentor Network</h3>
            <p>Chat with specialized research advisor personas tailored to structural critiques, technical coding, or quantitative methods.</p>
          </div>
        </div>
      </section>
    </div>
  `;

  // Attach event handlers
  document.getElementById("nav-login-btn").addEventListener("click", onGetStarted);
  document.getElementById("nav-start-btn").addEventListener("click", onGetStarted);
  document.getElementById("hero-start-btn").addEventListener("click", onGetStarted);
}
