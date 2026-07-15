import "./style.css";
import { getIcon } from "./utils/icons.js";
import { renderLanding } from "./components/landing.js";
import { renderDashboard } from "./components/dashboard.js";
import { renderAssistant } from "./components/assistant.js";
import { renderIdeaGenerator } from "./components/ideaGen.js";
import { renderGapFinder } from "./components/gapFinder.js";
import { renderLitReview } from "./components/litReview.js";
import { renderPDFDoc } from "./components/pdfDoc.js";
import { renderPlanner } from "./components/planner.js";
import { renderNotes } from "./components/notes.js";
import { renderProfile } from "./components/profile.js";
import { renderAuth } from "./components/auth.js";


// 1. Initial State Definition
const state = {
  isLoggedIn: localStorage.getItem("researchpilot_loggedin") === "true",
  activeRoute: "dashboard", // Default starting panel inside app
  theme: localStorage.getItem("researchpilot_theme") || "dark",
  user: JSON.parse(localStorage.getItem("researchpilot_user")) || {
    name: "Dr. Preetish Gharami",
    role: "Lead Researcher",
    affiliation: "Institute of Artificial Intelligence",
    field: "Computer Science & Bioinformatics",
    stage: "phd"
  }
};

// 2. Sidebar Navigation Items configuration
const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "activity" },
  { key: "assistant", label: "AI Assistant Chat", icon: "brain" },
  { key: "ideas", label: "Idea Generator", icon: "lightbulb" },
  { key: "gaps", label: "Knowledge Gap Finder", icon: "compass" },
  { key: "litreview", label: "Literature Reviewer", icon: "file-text" },
  { key: "pdf", label: "PDF & Document Chat", icon: "book-open" },
  { key: "planner", label: "AI Research Planner", icon: "calendar" },
  { key: "notes", label: "Smart Notes", icon: "file-text" },
  { key: "profile", label: "Profile & Settings", icon: "settings" }
];

// 3. Page Router
function navigateTo(routeKey) {
  state.activeRoute = routeKey;
  
  // Toggle UI visibility depending on auth state
  if (!state.isLoggedIn) {
    document.getElementById("landing-view").style.display = "block";
    document.getElementById("app-view").style.display = "none";
    
    if (routeKey === "auth") {
      renderAuth(document.getElementById("landing-view"), loginUser, () => navigateTo("landing"));
    } else {
      renderLanding(document.getElementById("landing-view"), () => navigateTo("auth"));
    }
    return;
  }

  document.getElementById("landing-view").style.display = "none";
  document.getElementById("app-view").style.display = "flex";

  // Update Page Title
  const activeItem = SIDEBAR_ITEMS.find(item => item.key === routeKey);
  const pageTitle = activeItem ? activeItem.label : "ResearchPilot AI";
  document.getElementById("current-page-title").innerText = pageTitle;

  // Render correct component
  const viewContainer = document.getElementById("main-route-container");
  viewContainer.setAttribute("data-active-route", routeKey);

  switch (routeKey) {
    case "dashboard":
      renderDashboard(viewContainer, state, navigateTo);
      break;
    case "assistant":
      renderAssistant(viewContainer);
      break;
    case "ideas":
      renderIdeaGenerator(viewContainer, navigateTo);
      break;
    case "gaps":
      renderGapFinder(viewContainer, navigateTo);
      break;
    case "litreview":
      renderLitReview(viewContainer);
      break;
    case "pdf":
      renderPDFDoc(viewContainer);
      break;
    case "planner":
      renderPlanner(viewContainer);
      break;
    case "notes":
      renderNotes(viewContainer);
      break;
    case "profile":
      renderProfile(viewContainer, state, (updatedState) => {
        state.user = updatedState.user;
        localStorage.setItem("researchpilot_user", JSON.stringify(state.user));
        updateSidebarProfileWidget();
      });
      break;
    default:
      renderDashboard(viewContainer, state, navigateTo);
  }

  // Highlight active sidebar item
  renderSidebarMenu();

  // On Mobile, close sidebar drawer after navigation
  document.getElementById("sidebar-drawer").classList.remove("open");
}

// 4. Sidebar Renderer
function renderSidebarMenu() {
  const menuBox = document.getElementById("sidebar-menu-list");
  if (!menuBox) return;

  menuBox.innerHTML = SIDEBAR_ITEMS.map(item => `
    <div class="menu-item ${item.key === state.activeRoute ? 'active' : ''}" data-route="${item.key}">
      ${getIcon(item.icon, "", 18)}
      <span>${item.label}</span>
    </div>
  `).join("");

  // Attach click listener
  document.querySelectorAll("[data-route]").forEach(btn => {
    btn.addEventListener("click", () => {
      const route = btn.getAttribute("data-route");
      navigateTo(route);
    });
  });
}

// 5. Sidebar Profile Widget Updater
function updateSidebarProfileWidget() {
  const avatarBox = document.getElementById("sidebar-avatar-box");
  const nameBox = document.getElementById("sidebar-user-name");
  const roleBox = document.getElementById("sidebar-user-role");

  if (avatarBox) avatarBox.innerText = state.user.name.split(" ").pop().charAt(0);
  if (nameBox) nameBox.innerText = state.user.name;
  if (roleBox) roleBox.innerText = `${state.user.role} • ${state.user.affiliation.split(" ").slice(0, 2).join(" ")}`;
}

// 6. Authentication Mock Controls
function loginUser(user) {
  if (user) {
    state.user = user;
  }
  state.isLoggedIn = true;
  localStorage.setItem("researchpilot_loggedin", "true");
  localStorage.setItem("researchpilot_user", JSON.stringify(state.user));
  updateSidebarProfileWidget();
  navigateTo("dashboard");
}

function logoutUser() {
  state.isLoggedIn = false;
  localStorage.removeItem("researchpilot_loggedin");
  navigateTo("landing");
}

// 7. Theme Controls
function applyTheme() {
  const isLight = state.theme === "light";
  
  if (isLight) {
    document.documentElement.classList.remove("dark-theme");
    document.documentElement.classList.add("light-mode");
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-mode");
  } else {
    document.documentElement.classList.add("dark-theme");
    document.documentElement.classList.remove("light-mode");
    document.body.classList.add("dark-theme");
    document.body.classList.remove("light-mode");
  }

  // Update theme button icon
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.innerHTML = isLight ? getIcon("moon", "", 18) : getIcon("sun", "", 18);
  }
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("researchpilot_theme", state.theme);
  applyTheme();
}

// 8. Core Initialization
function initApp() {
  // Inject standard SVG icons for shells
  const sidebarLogo = document.getElementById("sidebar-logo-icon");
  if (sidebarLogo) sidebarLogo.innerHTML = getIcon("brain", "text-white", 18);

  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  if (mobileMenuBtn) {
    mobileMenuBtn.innerHTML = getIcon("menu", "text-primary", 20);
    mobileMenuBtn.style.display = "block";
  }

  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  if (sidebarCloseBtn) {
    sidebarCloseBtn.innerHTML = getIcon("x", "text-primary", 18);
  }

  // Attach Event Handlers
  document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme);
  document.getElementById("logout-btn").addEventListener("click", logoutUser);

  // Mobile Drawer Toggle
  document.getElementById("mobile-menu-btn").addEventListener("click", () => {
    document.getElementById("sidebar-drawer").classList.add("open");
  });
  document.getElementById("sidebar-close-btn").addEventListener("click", () => {
    document.getElementById("sidebar-drawer").classList.remove("open");
  });

  // Profile click goes to settings
  document.getElementById("sidebar-profile-widget").addEventListener("click", () => {
    navigateTo("profile");
  });

  // Set initial theme
  applyTheme();

  // Run Router
  if (state.isLoggedIn) {
    updateSidebarProfileWidget();
    navigateTo("dashboard");
  } else {
    navigateTo("landing");
  }
}

// Fire Bootstrapping
window.addEventListener("DOMContentLoaded", initApp);
