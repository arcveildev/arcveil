/**
 * Where the funding demo talks to. Both are public: the Worker URL and the
 * widget origin. The Circle API key never reaches the browser — it lives in
 * the Worker (packages/onramp). Unset means the page says the demo is off
 * rather than failing in the widget.
 */
export const ONRAMP = {
  sessionUrl: process.env.NEXT_PUBLIC_ONRAMP_URL ?? null,
  widgetBaseUrl: process.env.NEXT_PUBLIC_ONRAMP_WIDGET_BASE_URL ?? "https://onramp-sandbox.arc.io",
} as const;

export const isSandbox = (): boolean => ONRAMP.widgetBaseUrl.includes("sandbox");
