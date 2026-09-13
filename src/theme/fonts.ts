import {
  DM_Mono,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  JetBrains_Mono,
  Share_Tech_Mono,
} from "next/font/google";

/**
 * All font faces available to the font presets in presets.css.
 * Each exposes a CSS variable on <html>; presets pick which one
 * fills the sans / mono / label / display slots.
 */
export const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/** Open substitute for "ABC Favorit Mono" (labels, nav, buttons). */
export const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

/** Open substitute for "OCR X" (display / decorative). */
export const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech-mono",
  display: "swap",
});

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariables = [
  geistSans.variable,
  geistMono.variable,
  dmMono.variable,
  shareTechMono.variable,
  plexSans.variable,
  plexMono.variable,
  jetbrainsMono.variable,
].join(" ");
