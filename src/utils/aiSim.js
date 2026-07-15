/**
 * ResearchPilot AI - Gemini API Integration + AI Simulator
 * --------------------------------------------------------
 * Uses Google Gemini 1.5 Flash API for live generation.
 * Falls back to a rich client-side simulator if no API key is set.
 *
 * API Key Setup:
 *   Option 1 (Recommended for dev): Create a .env file in project root:
 *     VITE_GEMINI_API_KEY=AIzaSy...
 *   Option 2 (Runtime): Enter key in Profile & Settings page.
 */

// --------------------------------------------------------------------------
// Gemini API Client
// --------------------------------------------------------------------------
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function getApiKey() {
  // 1. Check Vite env variable (build-time injection)
  const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.length > 10) return envKey;
  // 2. Check runtime key saved from Profile page
  return localStorage.getItem("researchpilot_gemini_key") || null;
}

async function callGemini(prompt, jsonMode = false) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_KEY");

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 2048,
      ...(jsonMode && { responseMimeType: "application/json" }),
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    ],
  };

  const res = await fetch(`${GEMINI_BASE_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Gemini API Error: ${msg}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (jsonMode) {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      return text; // Return raw if parse fails
    }
  }
  return text;
}

// --------------------------------------------------------------------------
// Simulator Knowledge Base (fallback)
// --------------------------------------------------------------------------
const RESEARCH_DOMAINS = {
  ai: {
    gaps: [
      {
        id: "gap1",
        title: "Energy-Efficient Transformer Architectures",
        desc: "Current LLMs require enormous compute. We lack optimization methods that reduce carbon footprint without sacrificing accuracy.",
      },
      {
        id: "gap2",
        title: "Explainable Neural-Symbolic Integration",
        desc: "Bridging perception-focused neural networks with formal logical reasoning remains an open challenge in AI safety.",
      },
      {
        id: "gap3",
        title: "Continuous Out-of-Distribution Generalization",
        desc: "Models fail on slight distribution shifts at deployment. Robust continual-learning protocols remain unsolved.",
      },
    ],
    ideas: [
      {
        title: "Neuro-Symbolic Agent for Automated Proofs",
        desc: "A hybrid framework combining LLMs for intuition with formal verification engines (Coq/Z3) for mathematical correctness.",
        novelty: 88, feasibility: 72, impact: 95,
        fields: ["Artificial Intelligence", "Formal Methods"],
        roadmap: [
          { phase: "Phase 1: Proof of Concept", duration: "1 Month", tasks: ["Design symbolic-neural bridge layer", "Select logic rule subset", "Set up validation engine"] },
          { phase: "Phase 2: Core Engine Training", duration: "2 Months", tasks: ["Train transformer on mathematical corpora", "Implement RL with verifier feedback", "Benchmark against classical solvers"] },
          { phase: "Phase 3: Integration & UI", duration: "1.5 Months", tasks: ["Deploy proof dashboard", "Enable standard format exports", "Run peer-evaluation test sets"] },
        ],
        papers: ["Attention Is All You Need (Vaswani et al.)", "Deep Learning for Symbolic Mathematics (Lample et al.)"],
      },
      {
        title: "Decentralized Federated Edge Learning in Healthcare",
        desc: "A privacy-preserving model that trains medical diagnostics at edge nodes using consensus to prevent data leaks.",
        novelty: 82, feasibility: 68, impact: 98,
        fields: ["Federated Learning", "Medical Imaging"],
        roadmap: [
          { phase: "Phase 1: Security Audit", duration: "1 Month", tasks: ["Evaluate encryption overhead", "Simulate poisoning attacks"] },
          { phase: "Phase 2: Decentralized Aggregation", duration: "2 Months", tasks: ["Develop blockchain-inspired consensus", "Benchmark communications latency"] },
        ],
        papers: ["Federated Learning: Challenges (Li et al.)", "Privacy-Preserving Deep Learning (Shokri et al.)"],
      },
    ],
  },
  biotech: {
    gaps: [
      { id: "gap1", title: "Off-Target CRISPR-Cas9 Epigenetic Modifications", desc: "Predicting long-term unintended DNA modifications on non-target sequences remains challenging." },
      { id: "gap2", title: "Synthetic Protein Folding Dynamics", desc: "De novo protein design is bottlenecked by physical modeling limitations for artificial sequences." },
      { id: "gap3", title: "Biocompatible Microfluidic Delivery Systems", desc: "Nanoscale vehicles that target specific cell clusters without triggering immune responses are lacking." },
    ],
    ideas: [
      {
        title: "De Novo Design of Thermostable Enzymes",
        desc: "Using structural diffusion models to design artificial enzymes that catalyze plastic degradation at high temperatures.",
        novelty: 92, feasibility: 65, impact: 96,
        fields: ["Biotechnology", "Protein Design", "Environmental Engineering"],
        roadmap: [
          { phase: "Phase 1: Modeling", duration: "2 Months", tasks: ["Train protein diffusion model on PETase dataset", "Select top 5 candidate designs by stability"] },
          { phase: "Phase 2: Synthetic Expression", duration: "3 Months", tasks: ["Express genes in E. coli", "Measure enzymatic activity at high temp"] },
        ],
        papers: ["De novo design of protein logic gates (Langan et al.)", "Plastic biodegradation by PETase (Yoshida et al.)"],
      },
    ],
  },
  climate: {
    gaps: [
      { id: "gap1", title: "High-Resolution Regional Carbon Accounting", desc: "Satellite data lacks precision on point-source urban emissions." },
      { id: "gap2", title: "Long-Duration Grid Energy Storage Chemistry", desc: "Lithium-ion decays quickly; solid-state alternatives lack sufficient round-trip efficiency." },
    ],
    ideas: [
      {
        title: "Deep RL for Smart Grid Dispatch",
        desc: "An intelligent power router optimizing battery storage allocation during extreme climate events.",
        novelty: 78, feasibility: 85, impact: 92,
        fields: ["Smart Grids", "Climate Change Mitigation"],
        roadmap: [
          { phase: "Phase 1: Simulation Setup", duration: "1 Month", tasks: ["Model dynamic loads using NOAA weather data", "Define grid topologies"] },
          { phase: "Phase 2: Agent Training", duration: "2 Months", tasks: ["Develop RL policy with action masking", "Test under simulated grid failures"] },
        ],
        papers: ["Machine Learning for Smart Grids (Ramchurn et al.)", "Deep RL in Power Systems (Zhang et al.)"],
      },
    ],
  },
};

function genericGaps(topic) {
  return [
    { id: "gap1", title: `Scalability & Optimization in ${topic}`, desc: `Methodologies in ${topic} hit computational bottlenecks at scale; efficient processing protocols are lacking.` },
    { id: "gap2", title: `Data Standardization for ${topic}`, desc: `Disparate reporting standards prevent reproducibility. Unified benchmarks for global validation are needed.` },
    { id: "gap3", title: `AI Integration with ${topic}`, desc: `Bridging domain knowledge of ${topic} with automated reasoning engines remains unaddressed.` },
  ];
}

function genericIdeas(topic) {
  const T = topic.charAt(0).toUpperCase() + topic.slice(1);
  return [
    {
      title: `AI-Driven Adaptive Framework for ${T}`,
      desc: `A deep learning platform that dynamically adjusts operational variables in ${topic} research, reducing manual tuning by 60%.`,
      novelty: 80, feasibility: 85, impact: 88,
      fields: [T, "Machine Learning"],
      roadmap: [
        { phase: "Phase 1: Core Design", duration: "1 Month", tasks: ["Document key state parameters", "Build baseline mathematical formulations"] },
        { phase: "Phase 2: Training", duration: "2 Months", tasks: ["Run simulations on mock data", "Optimize loss function weighting"] },
        { phase: "Phase 3: Validation", duration: "1 Month", tasks: ["Comparative trials against static models"] },
      ],
      papers: [`State of the Art in ${T} (Review Series)`, "Dynamic Parameter Optimization (J. Computational Science)"],
    },
    {
      title: `Lifecycle Cost & Carbon Analysis of ${T} Infrastructure`,
      desc: `A framework to minimize lifetime carbon output and supply chain costs for ${topic} deployments.`,
      novelty: 75, feasibility: 90, impact: 82,
      fields: [T, "Lifecycle Assessment", "Systems Engineering"],
      roadmap: [
        { phase: "Phase 1: Data Aggregation", duration: "1.5 Months", tasks: ["Source material coefficients", "Map lifecycle flowsheets"] },
        { phase: "Phase 2: Software Model", duration: "1 Month", tasks: ["Build accounting tool"] },
      ],
      papers: ["Environmental Lifecycle Assessment (Guinée et al.)", `Industrial Logistics of ${T} (Smith et al.)`],
    },
  ];
}

function simulateDelay(ms = 1500) {
  return new Promise((r) => setTimeout(r, ms));
}

// --------------------------------------------------------------------------
// Prompts for Gemini
// --------------------------------------------------------------------------
const PROMPTS = {
  explain: (topic, mentor) =>
    `You are an AI Research Mentor called "${mentor}". Explain the research topic "${topic}" in depth for an academic researcher. Use structured Markdown with headings (##), bullet points, and bold key terms. Include: Overview, Core Principles, Current Challenges, and 3 Open Research Questions. Be concise but insightful.`,

  gaps: (topic) =>
    `You are an expert academic research analyst. Identify exactly 3 critical knowledge gaps in the research landscape of "${topic}". Return a JSON array of 3 objects, each with fields: "id" (string like "gap1"), "title" (concise gap name, max 8 words), "desc" (2-3 sentence explanation of why this gap exists and why it matters). Only return valid JSON, no markdown fences.`,

  ideas: (topic, scope) =>
    `You are a research innovation engine. Generate exactly 2 novel research ideas for the topic "${topic}" with a "${scope}" scope. Return a JSON array of 2 objects, each with: "title" (string), "desc" (2-3 sentence description), "novelty" (0-100 integer), "feasibility" (0-100 integer), "impact" (0-100 integer), "fields" (array of 2-3 strings), "roadmap" (array of 2-3 phase objects, each with "phase" string, "duration" string, "tasks" array of 2-3 strings), "papers" (array of 2 suggested reference strings). Only return valid JSON.`,

  litReview: (topic) =>
    `Write a formal academic Literature Review on the topic: "${topic}". Structure it in Markdown with these sections:
## 1. Introduction
## 2. Synthesis of Current Research (with sub-themes)
## 3. Methodological Approaches
## 4. Critical Contradictions & Debates
## 5. Conclusion & Future Directions
### Suggested Citations
Use realistic simulated citations (Author et al., Year). Be thorough, analytical, and approximately 600 words.`,

  docChat: (title, content, query) =>
    `You are an AI assistant analyzing the academic paper titled "${title}". Here is the document context:
"""
${content}
"""
The researcher asks: "${query}"
Answer directly and precisely using only the document context. If the answer is not explicit, reason scientifically from what is present. Keep the answer under 150 words.`,
};

// --------------------------------------------------------------------------
// Public AI Service API
// --------------------------------------------------------------------------
export const AIService = {
  /** Explain a research topic using active mentor persona */
  async explainTopic(topic, mentor = "Dr. Sarah") {
    try {
      const result = await callGemini(PROMPTS.explain(topic, mentor));
      return result;
    } catch (e) {
      if (e.message !== "NO_KEY") console.warn("Gemini unavailable, using simulator:", e.message);
      await simulateDelay(1500);
      return `### Overview of ${topic}\n\n**${topic}** is a rapidly evolving research area. Key theoretical frameworks revolve around solving efficiency, scaling, and cross-domain integration challenges.\n\n#### Core Principles\n- **Information Capture**: Extracting high-dimensional characteristics from raw datasets.\n- **Dynamic Alignment**: Mapping variables to structural nodes dynamically.\n- **Model Convergence**: Ensuring stable mathematical outputs across varying conditions.\n\n#### Current Challenges\nThe biggest hurdle is scaling systems when dataset size exceeds critical thresholds. Standard protocols face exponential increases in latency or resource consumption.\n\n#### Open Research Questions\n1. How can localized caching reduce processing overhead in ${topic}?\n2. What are the ethical implications of automated ${topic} tools in public sectors?\n3. Can hybrid physics-neural models yield better precision than pure data-driven approaches?`;
    }
  },

  /** Generate research ideas with innovation scoring */
  async generateIdeas(topic, scope = "novel") {
    try {
      const result = await callGemini(PROMPTS.ideas(topic, scope), true);
      // Normalize Gemini output to match our schema
      if (Array.isArray(result)) return result;
      return genericIdeas(topic);
    } catch (e) {
      if (e.message !== "NO_KEY") console.warn("Gemini unavailable, using simulator:", e.message);
      await simulateDelay(2000);
      const n = topic.toLowerCase();
      if (n.includes("ai") || n.includes("learning") || n.includes("neural")) return RESEARCH_DOMAINS.ai.ideas;
      if (n.includes("biotech") || n.includes("gene") || n.includes("protein")) return RESEARCH_DOMAINS.biotech.ideas;
      if (n.includes("climate") || n.includes("carbon") || n.includes("energy")) return RESEARCH_DOMAINS.climate.ideas;
      return genericIdeas(topic);
    }
  },

  /** Find knowledge gaps in a research field */
  async findKnowledgeGaps(topic) {
    try {
      const result = await callGemini(PROMPTS.gaps(topic), true);
      if (Array.isArray(result)) return result;
      return genericGaps(topic);
    } catch (e) {
      if (e.message !== "NO_KEY") console.warn("Gemini unavailable, using simulator:", e.message);
      await simulateDelay(1800);
      const n = topic.toLowerCase();
      if (n.includes("ai") || n.includes("learning") || n.includes("neural")) return RESEARCH_DOMAINS.ai.gaps;
      if (n.includes("biotech") || n.includes("gene") || n.includes("protein")) return RESEARCH_DOMAINS.biotech.gaps;
      if (n.includes("climate") || n.includes("carbon") || n.includes("energy")) return RESEARCH_DOMAINS.climate.gaps;
      return genericGaps(topic);
    }
  },

  /** Generate a full academic literature review */
  async generateLiteratureReview(topic) {
    try {
      return await callGemini(PROMPTS.litReview(topic));
    } catch (e) {
      if (e.message !== "NO_KEY") console.warn("Gemini unavailable, using simulator:", e.message);
      await simulateDelay(2200);
      return `# Literature Review: ${topic}

## 1. Introduction
The academic discourse surrounding **${topic}** has grown exponentially over the past decade. Initial work focused on establishing theoretical boundaries, while recent studies target practical industry-scale integrations. This review synthesizes key trends, highlights methodological themes, and explores critical tensions.

## 2. Synthesis of Current Research
A core theme is the transition from **centralized paradigms** to **hybrid, distributed models**. Early studies by *Zhao & Patel (2022)* proved modular architectures yield 14% higher convergence speeds. *Williams et al. (2023)* demonstrate that decentralized frameworks provide vital resilience during edge anomalies.

## 3. Methodological Approaches
- **Quantitative Empirical Studies**: Optimization benchmarks and resource cost analysis *(Chen, 2024)*.
- **Qualitative Contextual Studies**: Usability and regulatory impact *(Bernstein & Lee, 2023)*.

## 4. Critical Contradictions & Debates
A prominent conflict exists between **efficiency** and **explainability**. *Al-Mansoor (2024)* demonstrates that maximizing performance introduces opaque computational nodes. Authors advocating "trust-by-design" accept lower throughput for fully auditable trace paths.

## 5. Conclusion & Future Directions
While the foundation of **${topic}** is robust, the tension between raw capability and system auditability remains unresolved. Future work should pursue **unified abstraction layers** balancing efficiency with clear interpretability.

### Suggested Citations
1. **Zhao, Y., & Patel, K. (2022).** *Foundations of High-Dimensional Abstractions.* Journal of Systems Science, 45(2), 112–128.
2. **Williams, R., et al. (2023).** *Distributed Edge Coordination.* IEEE Communications, 71(4), 54–61.
3. **Chen, H. (2024).** *Performance Metrics in Dynamic Scale Computations.* ACM TOSE, 30(1), 12–29.`;
    }
  },

  /** Answer questions from a specific document */
  async chatWithDoc(docTitle, docContent, query) {
    try {
      return await callGemini(PROMPTS.docChat(docTitle, docContent, query));
    } catch (e) {
      if (e.message !== "NO_KEY") console.warn("Gemini unavailable, using simulator:", e.message);
      await simulateDelay(1200);
      const q = query.toLowerCase();
      if (q.includes("method") || q.includes("how")) {
        return `Based on **"${docTitle}"**, the authors utilized a multi-stage approach separating state detection from optimization. They validated results using double-blind empirical testbeds with controlled noise injection.`;
      }
      if (q.includes("finding") || q.includes("result") || q.includes("conclusion")) {
        return `The primary findings in **"${docTitle}"** demonstrate significantly higher optimization indices vs. baselines. System stability is maintained even when noise variables are introduced at test time.`;
      }
      if (q.includes("gap") || q.includes("limitation") || q.includes("future")) {
        return `The authors note **"${docTitle}"** is limited by its assumption of static node distributions. In real-world edge settings nodes fluctuate — they suggest future work on dynamic routing protocols.`;
      }
      return `Analyzing **"${docTitle}"** for: *"${query}"*.\n\nThe document indicates the core architecture addresses latency bottlenecks. Applied to your question, optimizing initial handshake routines would directly improve system throughput based on the paper's findings.`;
    }
  },

  /** Check if a live Gemini API key is active */
  isLiveMode() {
    return !!getApiKey();
  },
};
