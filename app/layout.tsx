import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Vellor — AI Brand Visibility Monitoring",
    template: "%s | Vellor",
  },
  description:
    "Track how your brand appears in ChatGPT, Gemini, and Perplexity responses. Monitor your Generative Engine Optimization (GEO) performance in real-time.",
  keywords: ["GEO", "AI SEO", "brand monitoring", "ChatGPT", "Gemini", "Perplexity", "LLM SEO"],
  openGraph: {
    type: "website",
    title: "Vellor — AI Brand Visibility Monitoring",
    description: "Monitor your brand's presence across AI-generated responses.",
    siteName: "Vellor",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${GeistSans.className} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
