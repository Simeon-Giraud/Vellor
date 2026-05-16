import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

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
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className={`${geist.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
