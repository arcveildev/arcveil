import type { Post } from "@/data/posts";

const SAMPLE_SNIPPET = `from prime_rl import Trainer, Environment

env = Environment.load("primeintellect/agentic-swe")
trainer = Trainer(model="INTELLECT-3", env=env)
trainer.fit(steps=1_000, algorithm="grpo")`;

/** Placeholder article body until real post content is wired in. */
export function ArticleBody({ post }: { post: Post }) {
  const topic = post.title;
  return (
    <div className="flex flex-col gap-6 text-base leading-140 text-fg/80">
      <p>
        This post walks through the motivation behind {topic.toLowerCase()} and the practical choices that shaped our
        approach. We start from the constraints of real training runs and work outward to the abstractions that make
        them reproducible.
      </p>
      <p>
        The core idea is to treat each experiment as a first-class artefact: the environment, the reward, the rollout
        budget and the evaluation harness are pinned together so that any result can be re-run by anyone with access
        to the same open stack.
      </p>
      <h2 className="mt-2 text-h3-title text-fg">Setup</h2>
      <p>
        A minimal run needs three things — an environment, a base model and a trainer configuration. The snippet below
        shows the shape of that configuration; everything else is optional tuning.
      </p>
      <pre className="overflow-x-auto bg-surface-card p-4 font-mono text-xs leading-relaxed text-fg/85 hairline">
        <code>{SAMPLE_SNIPPET}</code>
      </pre>
      <p>
        From here the loop is straightforward: collect rollouts, score them, update the policy and evaluate on a held-out
        set. We publish the full recipe alongside checkpoints so the numbers in this post can be reproduced end to end.
      </p>
      <p className="text-sm text-fg-muted">
        Full write-up coming soon. This is placeholder copy standing in for the original article.
      </p>
    </div>
  );
}
