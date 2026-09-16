import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { fontVariables } from "@/theme/fonts";
import { DEFAULT_FONT, DEFAULT_THEME, FONT_PRESETS, THEME_PRESETS } from "@/theme/presets";
import { SITE } from "@/data/site";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE.domain}`),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    siteName: SITE.name,
    url: "/",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      data-font={DEFAULT_FONT}
      data-themes={THEME_PRESETS.map((p) => p.id).join(",")}
      data-fonts={FONT_PRESETS.map((p) => p.id).join(",")}
      suppressHydrationWarning
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Hoisted into <head> by Next and run before hydration, so the stored
            preset is applied without a flash and without a React-rendered
            <script> in <body> that browser extensions could collide with. */}
        <Script src="/preset-boot.js" strategy="beforeInteractive" />
        <ThemeProvider>
          <Header />
          <div className="mx-auto w-full max-w-360 px-4 md:px-5">
            <main className="min-h-screen">{children}</main>
          </div>
          <Footer />
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
