/** Site-wide navigation and external links. Swap for CMS/backend later. */
export const SITE = {
  name: "Prime Intellect",
  title: "Prime Intellect - The Open Superintelligence Stack",
  description:
    "Train, deploy, and continuously improve your own models on an integrated compute, training, inference, and sandbox stack.",
  appUrl: "https://app.primeintellect.ai",
  docsUrl: "https://docs.primeintellect.ai/introduction",
  careersUrl: "https://jobs.ashbyhq.com/PrimeIntellect",
  openRoles: 24,
  installCommand: "curl -fsSL https://app.primeintellect.ai/prime-agent/install.sh | sh",
  pipCommand: "pip install prime",
} as const;

export const PRODUCT_NAV = [
  { label: "Training", index: "01", href: "/#lab" },
  { label: "Inference", index: "02", href: "/#inference" },
  { label: "Compute", index: "03", href: "/#compute" },
  { label: "Research", index: "04", href: "/#research" },
] as const;

export const UTILITY_NAV = [
  { label: "Docs", href: SITE.docsUrl },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: SITE.careersUrl, badge: String(SITE.openRoles) },
  { label: "Book a call", href: "/contact" },
] as const;

export const CTA = {
  startTraining: { label: "Start training", href: `${SITE.appUrl}/dashboard/home/quickstart` },
  login: { label: "Login", href: SITE.appUrl },
  bookCall: { label: "Book a call", href: "/contact" },
  bookDemo: { label: "Book a demo", href: "/contact" },
  environments: { label: "Create Environments", href: `${SITE.appUrl}/dashboard/environments` },
  evaluations: { label: "Run your first eval", href: `${SITE.appUrl}/dashboard/evaluations` },
  findCompute: { label: "Find compute", href: `${SITE.appUrl}/dashboard/on-demand-gpus` },
  getQuote: { label: "Get a quote", href: `${SITE.appUrl}/dashboard/quotes` },
} as const;

export const BACKERS = [
  "Founders Fund",
  "Radical",
  "NVIDIA",
  "Intel",
  "Andrej Karpathy",
  "John Schulman",
  "Dylan Patel",
  "Clem Delangue",
] as const;

export const PARTNERS = [
  { name: "Ramp", href: "/case-study/ramp", tag: "Case study" },
  { name: "NVIDIA", href: "/blog/nvidia-collaboration", tag: "Read more" },
  { name: "Zapier", href: "/case-study/zapier", tag: "Case study" },
  { name: "Browserbase", href: "/blog/browserbase", tag: "Read more" },
  { name: "Standard Intelligence", href: null, tag: null },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Lab", href: "/#lab" },
      { label: "Compute", href: "/#compute" },
      { label: "Research", href: "/#research" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Careers", href: SITE.careersUrl, badge: String(SITE.openRoles) },
      { label: "Merch", href: "https://primeintellect.supply" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "X", href: "https://x.com/PrimeIntellect" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/primeintellect-ai" },
      { label: "Discord", href: "https://discord.gg/primeintellect" },
      { label: "Luma", href: "https://luma.com/primeintellect" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: SITE.docsUrl },
      { label: "Writings", href: "/blog" },
      { label: "Events", href: "https://luma.com/primeintellect" },
      { label: "Merch", href: "https://primeintellect.supply" },
      { label: "Platform Status", href: "https://status.primeintellect.ai" },
    ],
  },
  {
    title: "Terms",
    links: [
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Security Policy", href: "/security" },
    ],
  },
] as const;
