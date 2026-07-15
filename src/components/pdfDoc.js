import { getIcon } from "../utils/icons.js";
import { PDFService } from "../utils/pdfSim.js";
import { AIService } from "../utils/aiSim.js";

export function renderPDFDoc(container) {
  let papers = PDFService.getPapers();
  
  // Set default paper ID from local storage or default to first paper
  let activePaperId = localStorage.getItem("researchpilot_active_paper_id") || papers[0]?.id || "";
  let activeTab = "abstract"; // abstract, methodology, gaps, citation

  let chatHistory = {};
  papers.forEach(p => {
    chatHistory[p.id] = [
      { sender: "assistant", text: `I have parsed the paper **"${p.title}"**. Ask me anything about its findings, limitations, or data sets.` }
    ];
  });

  function updatePapersList() {
    const listEl = document.getElementById("pdf-papers-list");
    if (!listEl) return;

    papers = PDFService.getPapers();
    listEl.innerHTML = papers.map(p => `
      <div class="doc-item ${p.id === activePaperId ? 'active' : ''}" data-paper-id="${p.id}">
        <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
          ${getIcon("file-text", "text-cyan", 16)}
          <div style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 0.85rem; font-weight: 500;">${p.title}</div>
        </div>
        <span style="font-size: 0.7rem; color: var(--text-muted); white-space: nowrap;">${p.authors.split(" ")[0]}</span>
      </div>
    `).join("");

    // Attach click events
    document.querySelectorAll("[data-paper-id]").forEach(item => {
      item.addEventListener("click", () => {
        activePaperId = item.getAttribute("data-paper-id");
        localStorage.setItem("researchpilot_active_paper_id", activePaperId);
        updatePapersList();
        updatePaperDetails();
        updateChatHistory();
      });
    });
  }

  function updatePaperDetails() {
    const p = PDFService.getPaperById(activePaperId);
    if (!p) return;

    // Update Header
    document.getElementById("paper-detail-title").innerText = p.title;
    document.getElementById("paper-detail-authors").innerText = `${p.authors} • ${p.journal}`;

    // Update Tab Content
    const contentBox = document.getElementById("paper-tab-content-box");
    if (activeTab === "abstract") {
      contentBox.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--accent-cyan);">Abstract / Summary</h4>
        <p style="font-size: 0.875rem; line-height: 1.6; color: var(--text-secondary);">${p.abstract}</p>
        <div style="margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${p.keywords.map(kw => `<span class="glass-btn" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; pointer-events: none;">${kw}</span>`).join("")}
        </div>
      `;
    } else if (activeTab === "methodology") {
      contentBox.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--accent-purple);">Experimental Methodology</h4>
        <p style="font-size: 0.875rem; line-height: 1.6; color: var(--text-secondary);">${p.methodology}</p>
      `;
    } else if (activeTab === "gaps") {
      contentBox.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--accent-red);">Identified Gaps & Critiques</h4>
        <p style="font-size: 0.875rem; line-height: 1.6; color: var(--text-secondary);">${p.gaps}</p>
      `;
    } else if (activeTab === "citation") {
      contentBox.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--accent-green);">Standard Bibliography Citation</h4>
        <div style="background: rgba(0,0,0,0.15); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.8rem; line-height: 1.5; border: 1px solid var(--glass-border);">
          ${p.citation}
        </div>
        <button id="copy-citation-btn" class="glass-btn" style="margin-top: 1rem; font-size: 0.8rem; padding: 0.35rem 0.75rem;">
          ${getIcon("check", "", 12)} Copy Citation
        </button>
      `;

      document.getElementById("copy-citation-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(p.citation);
        const btn = document.getElementById("copy-citation-btn");
        btn.innerHTML = `${getIcon("check", "", 12)} Copied!`;
        setTimeout(() => {
          btn.innerHTML = `${getIcon("check", "", 12)} Copy Citation`;
        }, 2000);
      });
    }

    // Update Active Tab Styles
    document.querySelectorAll("[data-paper-tab]").forEach(tabBtn => {
      if (tabBtn.getAttribute("data-paper-tab") === activeTab) {
        tabBtn.classList.add("active");
        tabBtn.style.borderColor = "var(--accent-cyan)";
      } else {
        tabBtn.classList.remove("active");
        tabBtn.style.borderColor = "transparent";
      }
    });
  }

  function updateChatHistory() {
    const chatBox = document.getElementById("pdf-chat-history");
    if (!chatBox) return;

    if (!chatHistory[activePaperId]) {
      const p = PDFService.getPaperById(activePaperId);
      chatHistory[activePaperId] = [
        { sender: "assistant", text: `I have parsed the paper **"${p?.title || "Document"}"**. Ask me anything about its findings, limitations, or data sets.` }
      ];
    }

    chatBox.innerHTML = chatHistory[activePaperId].map(msg => `
      <div class="chat-bubble ${msg.sender}">
        ${msg.text.replace(/\n/g, "<br>")}
      </div>
    `).join("");

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendChatMessage(text) {
    if (!text) return;
    
    // Add user question
    chatHistory[activePaperId].push({ sender: "user", text: text });
    updateChatHistory();

    const input = document.getElementById("pdf-chat-input");
    if (input) input.value = "";

    // Show loading
    chatHistory[activePaperId].push({ sender: "assistant", text: "..." });
    updateChatHistory();

    const p = PDFService.getPaperById(activePaperId);

    try {
      const response = await AIService.chatWithDoc(p.title, p.abstract + " " + p.methodology, text);
      // Remove loading
      chatHistory[activePaperId].pop();
      // Add response
      chatHistory[activePaperId].push({ sender: "assistant", text: response });
    } catch (e) {
      chatHistory[activePaperId].pop();
      chatHistory[activePaperId].push({ sender: "assistant", text: `Error: ${e.message}` });
    }
    updateChatHistory();
  }

  container.innerHTML = `
    <div class="doc-split-layout">
      <!-- Left Panel: Uploader & Meta details -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem; overflow-y: auto; padding-right: 0.5rem;">
        <!-- Upload Box -->
        <div class="glass-card" style="padding: 1.5rem;">
          <div class="dropzone-container" id="pdf-dropzone">
            ${getIcon("upload", "dropzone-icon", 36)}
            <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem;">Upload Document (PDF)</h4>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">Drag and drop or click to browse files</p>
            <input type="file" id="pdf-file-picker" style="display: none;" accept=".pdf,.txt,.docx">
          </div>

          <div class="doc-list" id="pdf-papers-list"></div>
        </div>

        <!-- Meta Details Box -->
        <div class="glass-card" style="flex: 1; display: flex; flex-direction: column; gap: 1rem; min-height: 250px;">
          <div>
            <span style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: 600; text-transform: uppercase;">Selected Reading</span>
            <h3 id="paper-detail-title" style="font-size: 1.1rem; margin-top: 0.25rem;">Attention Is All You Need</h3>
            <p id="paper-detail-authors" style="font-size: 0.75rem; color: var(--text-secondary);">Vaswani et al. (2017) • NeurIPS</p>
          </div>

          <!-- Metadata Tabs -->
          <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">
            <button class="mentor-btn active" data-paper-tab="abstract" style="border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.75rem;">Abstract</button>
            <button class="mentor-btn" data-paper-tab="methodology" style="border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.75rem;">Methods</button>
            <button class="mentor-btn" data-paper-tab="gaps" style="border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.75rem;">Gaps</button>
            <button class="mentor-btn" data-paper-tab="citation" style="border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.75rem;">Citation</button>
          </div>

          <!-- Tab Content -->
          <div id="paper-tab-content-box" style="flex: 1; overflow-y: auto;"></div>
        </div>
      </div>

      <!-- Right Panel: Contextual Chat -->
      <div class="chat-container glass-panel" style="height: 100%;">
        <div class="chat-header">
          <div>
            <h3 style="font-size: 1rem; font-weight: 700;">Document Assistant Chat</h3>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">Contextual Q&A parsed directly from selected document</p>
          </div>
        </div>

        <div class="chat-history" id="pdf-chat-history"></div>

        <div class="chat-input-area">
          <input type="text" id="pdf-chat-input" class="glass-input chat-input" placeholder="Ask questions about this paper's details...">
          <button id="pdf-chat-send" class="glass-btn glass-btn-primary" style="padding: 0.75rem 1.25rem;">
            ${getIcon("send", "", 18)}
          </button>
        </div>
      </div>
    </div>
  `;

  // Init UI renders
  updatePapersList();
  updatePaperDetails();
  updateChatHistory();

  // Tab change events
  document.querySelectorAll("[data-paper-tab]").forEach(tabBtn => {
    tabBtn.addEventListener("click", () => {
      activeTab = tabBtn.getAttribute("data-paper-tab");
      updatePaperDetails();
    });
  });

  // Chat send events
  document.getElementById("pdf-chat-send").addEventListener("click", () => {
    const input = document.getElementById("pdf-chat-input");
    sendChatMessage(input.value.trim());
  });

  document.getElementById("pdf-chat-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatMessage(e.target.value.trim());
    }
  });

  // Dropzone upload mock actions
  const dropzone = document.getElementById("pdf-dropzone");
  const filePicker = document.getElementById("pdf-file-picker");

  dropzone.addEventListener("click", () => filePicker.click());
  
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  filePicker.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  async function handleFileUpload(file) {
    dropzone.innerHTML = `
      <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%; margin: 0 auto 0.5rem auto;"></div>
      <p style="font-size: 0.8rem; color: var(--accent-cyan);">Parsing structure: ${file.name}...</p>
    `;

    try {
      const parsed = await PDFService.processUpload(file);
      activePaperId = parsed.id;
      localStorage.setItem("researchpilot_active_paper_id", activePaperId);
      
      // Reset dropzone
      dropzone.innerHTML = `
        ${getIcon("upload", "dropzone-icon", 36)}
        <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem;">Upload Document (PDF)</h4>
        <p style="font-size: 0.75rem; color: var(--text-secondary);">Drag and drop or click to browse files</p>
      `;

      updatePapersList();
      updatePaperDetails();
      updateChatHistory();
    } catch (e) {
      alert("Failed to upload: " + e.message);
    }
  }
}
