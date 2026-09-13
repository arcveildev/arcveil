export type PostCategory = "Research" | "Announcements" | "Partnerships" | "Case Study";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: PostCategory;
  date: string; // ISO
  cover?: string;
  featured?: boolean;
};

export const POST_CATEGORIES: readonly PostCategory[] = ["Research", "Announcements", "Partnerships", "Case Study"];

export const POSTS: readonly Post[] = [
  { slug: "prime-agent", title: "Prime Agent: A self-improving RLM agent", excerpt: "A self-improving agent harness built around RLMs and the Continual Harness.", category: "Research", date: "2026-08-05", featured: true },
  { slug: "nixl-modelexpress-weight-transfer", title: "GLM-5.2 RL weight transfer in 4 seconds using NIXL and ModelExpress", excerpt: "How we moved trillion-parameter checkpoints between trainer and inference in seconds.", category: "Research", date: "2026-08-28", cover: "/backgrounds/fig-7-bg.png" },
  { slug: "universal-offline-sandbox-escape", title: "Uncovering a universal offline sandbox escape", excerpt: "A security deep dive into sandbox isolation for RL rollouts.", category: "Research", date: "2026-08-25", cover: "/backgrounds/compute-bg.png" },
  { slug: "measuring-autonomous-research", title: "Measuring Autonomous AI Research", excerpt: "Benchmarks and instrumentation for agents doing research.", category: "Research", date: "2026-08-14", cover: "/backgrounds/lab.png" },
  { slug: "prime-flash-moe", title: "Prime Flash MoE - Faster MoE Kernels optimized for Blackwell", excerpt: "Kernel-level speedups for mixture-of-experts on B200/B300.", category: "Research", date: "2026-08-13" },
  { slug: "mixedbread-deep-search", title: "How Mixedbread Used Prime-RL to Beat Frontier Models in Deep Search", excerpt: "A customer story on RL for retrieval agents.", category: "Case Study", date: "2026-08-13" },
  { slug: "multi-agent-prime-rl", title: "Multi-Agent Systems in PRIME-RL", excerpt: "Training cooperating and competing agents in one loop.", category: "Research", date: "2026-08-07" },
  { slug: "scaling-agentic-rl", title: "Scaling Agentic RL: 365,000+ Environments for SWE, Terminal, and Search", excerpt: "The largest open environment corpus for agentic RL.", category: "Research", date: "2026-07-22" },
  { slug: "verifiers-v1", title: "verifiers v1: Decomposing Tasksets and Harnesses for Agentic RL & Evaluations", excerpt: "The 1.0 release of the Verifiers library.", category: "Research", date: "2026-07-10" },
  { slug: "series-a", title: "$130M Series A to Build the Open Superintelligence Stack", excerpt: "Our Series A and what we are building next.", category: "Announcements", date: "2026-07-08" },
  { slug: "prime-rl-algorithms", title: "prime-rl gets an Algorithms layer", excerpt: "Pluggable RL algorithms in prime-rl.", category: "Research", date: "2026-07-05" },
  { slug: "rl-at-1t-scale", title: "RL at 1T Scale: prime-rl Performance Deep Dive", excerpt: "Throughput, memory and scheduling at trillion-parameter scale.", category: "Research", date: "2026-06-21" },
  { slug: "true-agents-model-the-world", title: "True Agents Model the World", excerpt: "Why world models matter for agents.", category: "Research", date: "2026-06-05" },
  { slug: "nemotron-3-on-lab", title: "Post-Training Nemotron 3 on Lab", excerpt: "A partnership walkthrough.", category: "Partnerships", date: "2026-06-04" },
  { slug: "nvidia-collaboration", title: "Prime Intellect Joins the NVIDIA Nemotron Coalition to Advance Open Frontier Models", excerpt: "Collaborating with NVIDIA on open models.", category: "Partnerships", date: "2026-06-04" },
  { slug: "hosted-evaluations", title: "Releasing Hosted Evaluations: Making benchmarking effortless", excerpt: "Zero-setup evals for 100+ open models.", category: "Announcements", date: "2026-05-28" },
  { slug: "reward-hacking-prime-sprints", title: "Systematic Reward Hacking and Prime Sprints", excerpt: "Findings from our internal RL sprints.", category: "Research", date: "2026-05-20" },
  { slug: "general-agent", title: "General Agent: A Self-Evolving, Synthetic Agent Environment", excerpt: "A synthetic environment that grows with the agent.", category: "Research", date: "2026-05-18" },
  { slug: "releasing-lab", title: "Releasing Lab: the training platform for self-improving agents", excerpt: "Lab is generally available.", category: "Announcements", date: "2026-05-07" },
  { slug: "browserbase", title: "Partnering with Browserbase to Train Browser and Computer Use Agents", excerpt: "Browser agents trained on Lab.", category: "Partnerships", date: "2026-03-30" },
  { slug: "rlm", title: "Recursive Language Models: the paradigm of 2026", excerpt: "How we plan to manage extremely long contexts.", category: "Research", date: "2026-01-01" },
  { slug: "intellect-3", title: "INTELLECT-3: A 100B+ MoE trained with large-scale RL", excerpt: "A 100B+ parameter Mixture-of-Experts model trained on our RL stack.", category: "Announcements", date: "2025-11-26" },
  { slug: "synthetic-2-release", title: "SYNTHETIC-2 Release", excerpt: "Four million collaboratively generated reasoning traces.", category: "Announcements", date: "2025-07-10" },
  { slug: "intellect-2-release", title: "INTELLECT-2 Release: The First 32B Parameter Model Trained Through Globally Distributed Reinforcement Learning", excerpt: "Decentralized RL at 32B scale.", category: "Announcements", date: "2025-05-11" },
  { slug: "seed-round", title: "$15M to Build The Open Superintelligence Stack", excerpt: "Our seed round.", category: "Announcements", date: "2025-02-28" },
];

export const sortedPosts = (): Post[] =>
  [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

export const findPost = (slug: string): Post | undefined => POSTS.find((p) => p.slug === slug);

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const ordinal = (day: number): string => {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}TH`;
  switch (day % 10) {
    case 1: return `${day}ST`;
    case 2: return `${day}ND`;
    case 3: return `${day}RD`;
    default: return `${day}TH`;
  }
};

/** "AUG 28TH, 2026" like the original site. */
export const formatPostDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${MONTHS[month - 1]} ${ordinal(day).padStart(4, "0")}, ${year}`;
};
