import { getIcon } from "../utils/icons.js";
import { AIService } from "../utils/aiSim.js";
import { ExportService } from "../utils/exporter.js";

const MENTORS = {
  sarah: {
    name: "Dr. Sarah",
    role: "Research Methodologist",
    avatar: "S",
    description: "Expert in experimental design, sample sizing, quantitative statistics, and scientific methods.",
    suggestions: [
      "Explain double-blind trial parameters.",
      "How do I structure a quantitative study?",
      "Design a control protocol for biotech tests."
    ]
  },
  alan: {
    name: "Prof. Alan",
    role: "Critical Reviewer",
    avatar: "A",
    description: "Focuses on identifying limitations, challenging hypotheses, and finding logical gaps in papers.",
    suggestions: [
      "Critique neural symbolic integration models.",
      "What are common biases in edge learning surveys?",
      "Analyze assumptions in grid routing designs."
    ]
  },
  siddharth: {
    name: "Siddharth",
    role: "Technical Lead",
    avatar: "SL",
    description: "Specializes in code architectures, machine learning frameworks, mathematical modeling, and cloud deployments.",
    suggestions: [
      "How do I optimize CUDA memory for Transformers?",
      "Provide a code structure for federated averaging.",
      "Help build a verification script in Python."
    ]
  }
};

export function renderAssistant(container) {
  let activeMentor = "sarah";
  let chatLogs = {
    sarah: [
      { sender: "assistant", text: "Hello! I am Dr. Sarah. I can help you model your experimental designs, establish statistical rigor, or select methodology frameworks. What are we building today?" }
    ],
    alan: [
      { sender: "assistant", text: "Welcome. I am Prof. Alan. Let's look critically at your ideas. Bring me your claims or hypotheses, and let's find the weak spots before reviewers do." }
    ],
    siddharth: [
      { sender: "assistant", text: "Hey! Siddharth here. Ready to implement? Tell me about your machine learning layers, data workflows, or optimization hurdles, and let's write some code." }
    ]
  };

  function updateChatHistory() {
    const historyContainer = document.getElementById("chat-history-box");
    if (!historyContainer) return;

    historyContainer.innerHTML = chatLogs[activeMentor].map(msg => `
      <div class="chat-bubble ${msg.sender}">
        ${msg.text.replace(/\n/g, "<br>")}
      </div>
    `).join("");

    // Scroll to bottom
    historyContainer.scrollTop = historyContainer.scrollHeight;
  }

  function renderMentorSelection() {
    const list = Object.keys(MENTORS).map(key => `
      <button class="mentor-btn ${key === activeMentor ? 'active' : ''}" data-mentor="${key}">
        ${MENTORS[key].name} (${MENTORS[key].role.split(" ").pop()})
      </button>
    `).join("");

    document.getElementById("mentor-selector-box").innerHTML = list;
    
    // Update header details
    const m = MENTORS[activeMentor];
    document.getElementById("mentor-header-title").innerText = m.name;
    document.getElementById("mentor-header-desc").innerText = `${m.role} • ${m.description}`;

    // Update suggestions list
    document.getElementById("chat-suggestions-box").innerHTML = m.suggestions.map(s => `
      <button class="glass-btn chat-suggestion-tag" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
        ${s}
      </button>
    `).join("");

    // Attach click events to suggestions
    document.querySelectorAll(".chat-suggestion-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        sendMessage(tag.innerText.trim());
      });
    });

    // Attach click events to buttons
    document.querySelectorAll("[data-mentor]").forEach(btn => {
      btn.addEventListener("click", () => {
        activeMentor = btn.getAttribute("data-mentor");
        renderMentorSelection();
        updateChatHistory();
      });
    });
  }

  async function sendMessage(text) {
    if (!text) return;
    
    // Add user message
    chatLogs[activeMentor].push({ sender: "user", text: text });
    updateChatHistory();
    
    const input = document.getElementById("chat-message-input");
    if (input) input.value = "";

    // Show loading indicator
    chatLogs[activeMentor].push({ sender: "assistant", text: "..." });
    updateChatHistory();

    try {
      const response = await AIService.explainTopic(text, activeMentor);
      // Remove loading indicator
      chatLogs[activeMentor].pop();
      // Add response
      chatLogs[activeMentor].push({ sender: "assistant", text: response });
    } catch (e) {
      chatLogs[activeMentor].pop();
      chatLogs[activeMentor].push({ sender: "assistant", text: `Error: ${e.message}` });
    }
    updateChatHistory();
  }

  container.innerHTML = `
    <div class="chat-container glass-panel">
      <!-- Header -->
      <div class="chat-header">
        <div>
          <h2 id="mentor-header-title" style="font-size: 1.25rem; font-weight: 700;">Dr. Sarah</h2>
          <p id="mentor-header-desc" style="font-size: 0.8rem; color: var(--text-secondary);">Research Methodologist</p>
        </div>
        <div class="mentor-selector" id="mentor-selector-box"></div>
      </div>

      <!-- History -->
      <div class="chat-history" id="chat-history-box"></div>

      <!-- Suggestions Box -->
      <div style="padding: 0.75rem 1.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; border-top: 1px solid var(--glass-border);" id="chat-suggestions-box"></div>

      <!-- Input Area -->
      <div class="chat-input-area">
        <input type="text" id="chat-message-input" class="glass-input chat-input" placeholder="Ask your AI Mentor a research question...">
        <div class="chat-actions">
          <button id="chat-send-btn" class="glass-btn glass-btn-primary" style="padding: 0.75rem 1.25rem;">
            ${getIcon("send", "", 18)}
          </button>
          <button id="chat-export-btn" class="glass-btn" title="Export Chat Log">
            ${getIcon("download", "", 18)}
          </button>
        </div>
      </div>
    </div>
  `;

  // Init selections and events
  renderMentorSelection();
  updateChatHistory();

  document.getElementById("chat-send-btn").addEventListener("click", () => {
    const input = document.getElementById("chat-message-input");
    sendMessage(input.value.trim());
  });

  document.getElementById("chat-message-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage(e.target.value.trim());
    }
  });

  document.getElementById("chat-export-btn").addEventListener("click", () => {
    const m = MENTORS[activeMentor];
    const logText = chatLogs[activeMentor].map(msg => `[${msg.sender.toUpperCase()}]: ${msg.text}`).join("\n\n");
    ExportService.exportToMarkdown(`chat_${activeMentor}_log`, `Chat Log with ${m.name}`, logText);
  });
}
