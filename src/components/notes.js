import { getIcon } from "../utils/icons.js";
import { ExportService } from "../utils/exporter.js";
import { AIService } from "../utils/aiSim.js";

const DEFAULT_NOTES = [
  {
    id: "note_1",
    title: "Neural-Symbolic Architecture Plan",
    content: "We need to build a system that combines standard neural attention layers with formal logic checkers. The transformer suggests candidate theorems, while the logic engine (Coq/Z3) validates them.\n\nKey parameters:\n- Model: Gemini 1.5 Flash API\n- Language target: Coq proof outputs\n- Latency: Keep validation loop under 300ms per step."
  },
  {
    id: "note_2",
    title: "Gaps in Plastic Degradation Enzymes",
    content: "Existing PETase enzymes show high activity at 30C, but decay rapidly at industrial operating temperatures (50C-70C). Designing thermostable variations requires modeling structural flexibility and salt bridges.\n\nRead papers:\n- Yoshida et al. on PETase\n- Langan et al. on de novo designs"
  }
];

export function renderNotes(container) {
  let notes = JSON.parse(localStorage.getItem("researchpilot_notes"));
  if (!notes || notes.length === 0) {
    notes = DEFAULT_NOTES;
    localStorage.setItem("researchpilot_notes", JSON.stringify(notes));
  }

  let activeNoteId = notes[0]?.id || "";
  let searchQuery = "";

  function getActiveNote() {
    return notes.find(n => n.id === activeNoteId) || null;
  }

  function getFilteredNotes() {
    if (!searchQuery) return notes;
    return notes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  function updateNotesList() {
    const listEl = document.getElementById("notes-sidebar-list");
    if (!listEl) return;

    const filtered = getFilteredNotes();
    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="text-align: center; padding: 2rem 0; color: var(--text-muted); font-size: 0.8rem;">No notes found</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(n => `
      <div class="notes-item ${n.id === activeNoteId ? 'active' : ''}" data-note-id="${n.id}">
        <div class="note-item-title">${n.title || "Untitled Note"}</div>
        <div class="note-item-preview">${(n.content || "").replace(/<[^>]*>/g, "").slice(0, 40)}...</div>
      </div>
    `).join("");

    // Attach click events
    document.querySelectorAll("[data-note-id]").forEach(item => {
      item.addEventListener("click", () => {
        activeNoteId = item.getAttribute("data-note-id");
        updateNotesList();
        updateEditor();
      });
    });
  }

  function updateEditor() {
    const note = getActiveNote();
    const editor = document.getElementById("notes-editor-box");
    
    if (!note) {
      editor.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted);">
          ${getIcon("file-text", "", 48)}
          <p style="margin-top: 1rem;">Select or create a note to start editing</p>
        </div>
      `;
      return;
    }

    editor.innerHTML = `
      <div class="note-editor-panel" style="height: 100%; display: flex; flex-direction: column;">
        <div class="note-editor-header" style="border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; margin-bottom: 1rem;">
          <input type="text" id="note-title-field" class="note-editor-title-input" value="${note.title}" placeholder="Note Title" style="background: none; border: none; outline: none; font-size: 1.5rem; font-weight: 600; width: 100%;">
          
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; align-items: center;">
            <button id="note-ai-btn" class="glass-btn" style="font-size: 0.75rem; padding: 0.35rem 0.75rem; border-color: var(--accent-purple);">
              ${getIcon("brain", "text-purple", 14)} AI Refine
            </button>
            <button id="note-export-btn" class="glass-btn" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">
              ${getIcon("download", "", 14)} Export MD
            </button>
            <button id="note-delete-btn" class="glass-btn" style="font-size: 0.75rem; padding: 0.35rem 0.75rem; color: var(--accent-red); border-color: rgba(244, 63, 94, 0.2);">
              ${getIcon("trash", "", 14)} Delete
            </button>
          </div>
        </div>

        <textarea id="note-content-field" class="note-textarea" placeholder="Start writing down observations, methodology notes, or citations..." style="flex: 1; width: 100%; resize: none; background: none; border: none; outline: none; font-size: 0.95rem; line-height: 1.6; color: var(--text-primary);">${note.content}</textarea>
        
        <!-- Quick AI Panel Status -->
        <div id="note-ai-status" style="display: none; font-size: 0.8rem; background: rgba(161, 84, 255, 0.1); border: 1px solid rgba(161, 84, 255, 0.2); padding: 0.5rem 1rem; border-radius: 6px; margin-top: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--accent-purple); font-weight: 600;">AI Assistant is refining note...</span>
          </div>
        </div>
      </div>
    `;

    // Auto-save logic
    const titleInput = document.getElementById("note-title-field");
    const contentInput = document.getElementById("note-content-field");

    titleInput.addEventListener("input", (e) => {
      note.title = e.target.value;
      localStorage.setItem("researchpilot_notes", JSON.stringify(notes));
      updateNotesList();
    });

    contentInput.addEventListener("input", (e) => {
      note.content = e.target.value;
      localStorage.setItem("researchpilot_notes", JSON.stringify(notes));
      updateNotesList();
    });

    // Delete note
    document.getElementById("note-delete-btn").addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this note?")) {
        notes = notes.filter(n => n.id !== activeNoteId);
        localStorage.setItem("researchpilot_notes", JSON.stringify(notes));
        activeNoteId = notes[0]?.id || "";
        updateNotesList();
        updateEditor();
      }
    });

    // Export note
    document.getElementById("note-export-btn").addEventListener("click", () => {
      ExportService.exportToMarkdown(note.title, note.title, note.content);
    });

    // AI Refine note
    document.getElementById("note-ai-btn").addEventListener("click", async () => {
      const statusBox = document.getElementById("note-ai-status");
      statusBox.style.display = "block";
      
      try {
        const response = await AIService.explainTopic(note.content, "siddharth");
        statusBox.style.display = "none";
        
        // Append response to the bottom
        note.content += `\n\n---\n### AI Structural Feedback:\n${response}`;
        contentInput.value = note.content;
        localStorage.setItem("researchpilot_notes", JSON.stringify(notes));
        updateNotesList();
      } catch (e) {
        statusBox.innerHTML = `<span style="color: var(--accent-red);">Error: ${e.message}</span>`;
      }
    });
  }

  container.innerHTML = `
    <div class="notes-layout">
      <!-- Notes Sidebar -->
      <div class="notes-sidebar">
        <button id="notes-new-btn" class="glass-btn glass-btn-primary" style="width: 100%; height: 40px;">
          ${getIcon("plus", "", 18)} New Note
        </button>
        
        <input type="text" id="notes-search-field" class="glass-input" placeholder="Search notes..." style="font-size: 0.85rem; padding: 0.5rem 0.75rem;">
        
        <div class="notes-list" id="notes-sidebar-list"></div>
      </div>

      <!-- Editor Panel -->
      <div class="glass-card" id="notes-editor-box" style="padding: 1.5rem; height: 100%; display: flex; flex-direction: column;"></div>
    </div>
  `;

  // Init list & editor
  updateNotesList();
  updateEditor();

  // Search input change
  document.getElementById("notes-search-field").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    updateNotesList();
  });

  // Create new note
  document.getElementById("notes-new-btn").addEventListener("click", () => {
    const newNote = {
      id: "note_" + Date.now(),
      title: "Untitled Note",
      content: ""
    };
    notes.unshift(newNote);
    localStorage.setItem("researchpilot_notes", JSON.stringify(notes));
    activeNoteId = newNote.id;
    
    updateNotesList();
    updateEditor();
    
    // Auto-focus title input
    const titleInput = document.getElementById("note-title-field");
    if (titleInput) titleInput.focus();
  });
}
