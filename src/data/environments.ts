export type EnvironmentCard = {
  owner: string;
  stars: number;
  name: string;
  description: string;
  tags: string[];
  extraTags: number;
  updated: string;
  version: string;
};

export type EnvironmentGroup = {
  title: string;
  count: number;
  items: EnvironmentCard[];
};

export const ENVIRONMENT_GROUPS: readonly EnvironmentGroup[] = [
  {
    title: "Featured",
    count: 9,
    items: [
      { owner: "primeintellect", stars: 2, name: "opencode-science", description: "Solve science problems using OpenCode agent via sandboxed tool calls.", tags: ["science", "opencode"], extraTags: 1, updated: "Updated 8 days ago", version: "v0.3.8" },
      { owner: "primeintellect", stars: 6, name: "deepdive", description: "DeepDive QA RL environment with a Serper-powered search tool", tags: ["rl", "qa"], extraTags: 1, updated: "Updated 11 days ago", version: "v0.2.5" },
      { owner: "stochi0", stars: 3, name: "rubric-discovery", description: "Meta-environment for learning rubric functions from labeled trajectories.", tags: ["rlm", "training"], extraTags: 4, updated: "Updated 2 months ago", version: "v0.2.0" },
    ],
  },
  {
    title: "INTELLECT-3",
    count: 3,
    items: [
      { owner: "primeintellect", stars: 8, name: "mini-swe-agent-plus", description: "Mini SWE Agent Plus environment for solving SWE issues inside Prime sandboxes.", tags: ["swe", "sandbox"], extraTags: 1, updated: "Updated 3 days ago", version: "v0.2.23" },
      { owner: "primeintellect", stars: 6, name: "deepdive", description: "DeepDive QA RL environment with a Serper-powered search tool", tags: ["rl", "qa"], extraTags: 1, updated: "Updated 11 days ago", version: "v0.2.5" },
      { owner: "primeintellect", stars: 3, name: "science-env", description: "A collection of challenging single-turn science problems", tags: ["science", "single-turn"], extraTags: 0, updated: "Updated 11 days ago", version: "v0.1.3" },
    ],
  },
  {
    title: "Evals",
    count: 13,
    items: [
      { owner: "hud", stars: 18, name: "hud-text-2048", description: "Text-based 2048 game for training agents to reach target tiles through strategic moves", tags: ["game", "text"], extraTags: 2, updated: "Updated 7 months ago", version: "v0.1.0" },
      { owner: "will", stars: 29, name: "will/tau2-bench", description: "Verifiers implementation of tau2-bench", tags: ["tool-agent-user", "tool-use"], extraTags: 2, updated: "Updated 2 months ago", version: "v0.1.0" },
      { owner: "hud", stars: 18, name: "hud-text-2048", description: "Text-based 2048 game for training agents to reach target tiles through strategic moves", tags: ["game", "text"], extraTags: 2, updated: "Updated 7 months ago", version: "v0.1.0" },
    ],
  },
];
