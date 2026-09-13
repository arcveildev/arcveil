import { ArrowUpRight } from "lucide-react";
import { CodeBlock, type CodeLine } from "@/components/ui/CodeBlock";
import { SITE } from "@/data/site";
import { cn } from "@/lib/cn";

const VERIFIERS_CODE: readonly CodeLine[] = [
  { text: "import verifiers as vf", tone: "accent" },
  { text: "" },
  { text: "vf_env = vf.ToolEnv(", tone: "fg" },
  { text: "    dataset=dataset," },
  { text: "    parser=parser," },
  { text: "    rubric=rubric," },
  { text: "    tools=tool_list," },
  { text: "    max_turns=10," },
  { text: ")", tone: "fg" },
];

const PRIME_RL_CODE: readonly CodeLine[] = [
  { text: "uv run rl \\", tone: "accent" },
  { text: "  --trainer @ examples/reverse_text/rl/train.toml \\" },
  { text: "  --orchestrator @ examples/reverse_text/rl/orch.toml \\" },
  { text: "  --inference @ examples/reverse_text/rl/infer.toml" },
];

const SANDBOXES = [
  { name: "deepswe-sandbox-1", image: "python:3.11-slim" },
  { name: "deepcoder-sandbox-1", image: "python:3.11-slim" },
  { name: "i3-math-sandbox-1", image: "python:3.11-slim" },
] as const;

type Tool = {
  name: string;
  href: string;
  caption: string;
  block: "verifiers" | "prime-rl" | "sandboxes";
};

const TOOLS: readonly Tool[] = [
  {
    name: "Verifiers",
    href: "https://github.com/PrimeIntellect-ai/verifiers",
    caption: "A library of modular components for creating RL environments and training LLM agents.",
    block: "verifiers",
  },
  {
    name: "Prime-RL",
    href: "https://github.com/PrimeIntellect-ai/prime-rl",
    caption: "A framework for asynchronous reinforcement learning (RL) at scale.",
    block: "prime-rl",
  },
  {
    name: "Sandboxes",
    href: `${SITE.appUrl}/dashboard/instances?tab=sandboxes`,
    caption: "For secure code execution optimized for large-scale reinforcement learning.",
    block: "sandboxes",
  },
];

function SandboxList() {
  return (
    <div className="hairline flex flex-col bg-surface-card p-4 font-mono text-xs leading-normal" role="list" aria-label="Running sandboxes">
      {SANDBOXES.map((box, i) => (
        <div
          key={box.name}
          role="listitem"
          className={cn("flex items-center gap-2 py-2 border-border", i < SANDBOXES.length - 1 && "border-b")}
        >
          <span aria-hidden="true" className="size-1.5 shrink-0 bg-available" />
          <span className="truncate text-fg/70">{box.name}</span>
          <span className="ml-auto shrink-0 text-fg/30">{box.image}</span>
        </div>
      ))}
    </div>
  );
}

function ToolBlock({ block }: { block: Tool["block"] }) {
  if (block === "verifiers") return <CodeBlock lines={VERIFIERS_CODE} lineNumbers label="Verifiers example" />;
  if (block === "prime-rl") return <CodeBlock lines={PRIME_RL_CODE} label="Prime-RL command" />;
  return <SandboxList />;
}

/** The open-source training stack: Verifiers, Prime-RL and Sandboxes in three hairline columns. */
export function Toolkit() {
  return (
    <div className="mt-5 grid grid-cols-1 border border-border md:grid-cols-3 lg:mt-10">
      {TOOLS.map((tool, i) => (
        <div
          key={tool.name}
          className={cn("group flex flex-col gap-5 p-5 border-border", i < TOOLS.length - 1 && "border-b md:border-r md:border-b-0")}
        >
          <a
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-2 font-sans text-sm leading-normal text-fg"
          >
            {tool.name}
            <ArrowUpRight
              aria-hidden="true"
              className="size-3 text-fg/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            />
          </a>
          <ToolBlock block={tool.block} />
          <p className="font-sans text-sm leading-normal text-fg-muted">{tool.caption}</p>
        </div>
      ))}
    </div>
  );
}
