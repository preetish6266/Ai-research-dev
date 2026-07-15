/**
 * ResearchPilot AI - PDF & Document Manager Simulator
 * Provides preloaded seminal research papers for immediate testing
 * and handles mock PDF file upload, metadata extraction, and storage.
 */

const PRELOADED_PAPERS = [
  {
    id: "paper1",
    title: "Attention Is All You Need",
    authors: "Vaswani et al. (2017)",
    journal: "Advances in Neural Information Processing Systems (NeurIPS)",
    abstract: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.",
    methodology: "Replaces traditional recurrent neural networks (RNNs) and convolutional networks with Multi-Head Self-Attention. Utilizes positional encodings to capture token order, feed-forward layers, and residual connections.",
    gaps: "The paper does not address quadratic computational complexity with respect to sequence length, making long-document processing expensive. It also lacks mechanisms for structural logical reasoning.",
    citation: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., ... & Polosukhin, I. (2017). Attention is all you need. Advances in neural information processing systems, 30.",
    keywords: ["Transformers", "Self-Attention", "Deep Learning", "NLP"]
  },
  {
    id: "paper2",
    title: "A Programmable Dual-RNA Guided DNA Endonuclease in Adaptive Bacterial Immunity",
    authors: "Jinek et al. (2012)",
    journal: "Science",
    abstract: "Clustered regularly interspaced short palindromic repeats (CRISPR)/CRISPR-associated (Cas) systems provide bacteria and archaea with adaptive immunity against viruses and plasmids. Here, we show that the Cas9 endonuclease can be programmed with dual-RNAs or single chimeric RNAs to target and cleave specific double-stranded DNA sequences, establishing a versatile genome editing platform.",
    methodology: "Purified Cas9 protein and programmed it with designed guide RNAs. Evaluated DNA cleavage activity in vitro using plasmids containing targeted sequences, verifying target site selectivity.",
    gaps: "Off-target cleavage rates at non-matching genomic sequences were not fully quantified in vivo. The paper also did not resolve efficiency barriers in eukaryotic cells.",
    citation: "Jinek, M., Chylinski, K., Fonfara, I., Hauer, M., Doudna, J. A., & Charpentier, E. (2012). A programmable dual-RNA-guided DNA endonuclease in adaptive bacterial immunity. Science, 337(6096), 816-821.",
    keywords: ["CRISPR-Cas9", "Gene Editing", "Epigenetics", "Immunity"]
  },
  {
    id: "paper3",
    title: "Bitcoin: A Peer-to-Peer Electronic Cash System",
    authors: "Satoshi Nakamoto (2008)",
    journal: "Self-Published",
    abstract: "A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. The network timestamps transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without redoing the proof-of-work.",
    methodology: "Combines peer-to-peer networking, cryptographic hashing (SHA-256), public-key cryptography, and consensus proof-of-work mining to solve the double-spending problem without trusted intermediaries.",
    gaps: "High electricity costs and throughput scaling bottlenecks (limited transactions per second) are not resolved. Privacy relies on pseudonymity rather than zero-knowledge proofs.",
    citation: "Nakamoto, S. (2008). Bitcoin: A peer-to-peer electronic cash system. Decentralized Business Review.",
    keywords: ["Blockchain", "Cryptography", "Consensus", "P2P Systems"]
  }
];

export const PDFService = {
  /**
   * Get all active papers (preloaded + uploaded)
   */
  getPapers() {
    const uploadedStr = localStorage.getItem("researchpilot_uploaded_docs");
    const uploaded = uploadedStr ? JSON.parse(uploadedStr) : [];
    return [...PRELOADED_PAPERS, ...uploaded];
  },

  /**
   * Get a specific paper by ID
   */
  getPaperById(id) {
    return this.getPapers().find(p => p.id === id) || null;
  },

  /**
   * Handle mock file upload
   */
  async processUpload(file) {
    // Simulate network delay for uploading
    await new Promise(r => setTimeout(r, 1500));
    
    // Extract metadata from name
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    const words = cleanName.split(/[-_ ]+/);
    const title = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    
    const newDoc = {
      id: "uploaded_" + Date.now(),
      title: title,
      authors: "User Uploaded (2026)",
      journal: "Uploaded Document",
      abstract: `This is a parsed summary of your uploaded document "${file.name}". The document contains text detailing advanced methodologies, observations, and experimental data. Size: ${(file.size / 1024).toFixed(1)} KB.`,
      methodology: "Mock parser detected a standard experimental layout. Includes an introduction, experimental configuration, raw dataset evaluation, and a summary section.",
      gaps: "Requires further comparative studies and cross-validation with larger external datasets to generalize findings.",
      citation: `Researcher, A. (2026). Analysis of ${title}. ResearchPilot Hub.`,
      keywords: ["Uploaded File", "Research Notes", "Data Source"]
    };

    const uploadedStr = localStorage.getItem("researchpilot_uploaded_docs");
    const uploaded = uploadedStr ? JSON.parse(uploadedStr) : [];
    uploaded.push(newDoc);
    localStorage.setItem("researchpilot_uploaded_docs", JSON.stringify(uploaded));

    return newDoc;
  },

  /**
   * Clear all uploaded documents
   */
  clearUploaded() {
    localStorage.removeItem("researchpilot_uploaded_docs");
  }
};
