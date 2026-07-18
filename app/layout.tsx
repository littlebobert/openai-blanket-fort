import type { Metadata } from "next";
import { Nunito_Sans, Baloo_2 } from "next/font/google";
import "./globals.css";

const sans = Nunito_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blanket Fort — your group chat builds apps",
  description:
    "Add an AI to the group chat. Blanket Fort turns the group's ideas and inside jokes into tiny shared apps, powered by Hermes Agent.",
  icons: {
    icon: "/og.png",
    shortcut: "/og.png",
  },
  openGraph: {
    title: "Blanket Fort — your group chat builds apps",
    description: "The group riffs. Hermes builds. A shared app link drops into the thread.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Blanket Fort" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blanket Fort — your group chat builds apps",
    description: "The group riffs. Hermes builds. A shared app link drops into the thread.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
