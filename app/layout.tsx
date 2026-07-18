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
  title: "Blanket Fort / 毛布の秘密基地 — your group chat builds apps",
  description:
    "Blanket Fort（毛布の秘密基地）は、グループのアイデアや内輪ネタを小さな共有アプリに変えます。Powered by Hermes Agent.",
  icons: {
    icon: "/og.png",
    shortcut: "/og.png",
  },
  openGraph: {
    title: "Blanket Fort / 毛布の秘密基地",
    description: "The group riffs. Hermes builds. みんなのアイデアが共有アプリになる。",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Blanket Fort / 毛布の秘密基地" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blanket Fort / 毛布の秘密基地",
    description: "The group riffs. Hermes builds. みんなのアイデアが共有アプリになる。",
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
