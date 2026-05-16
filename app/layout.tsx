import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#4f46e5",
              colorBackground: "#0a0a0f",
              colorInputBackground: "rgba(255, 255, 255, 0.05)",
              colorText: "#ffffff",
              colorTextSecondary: "#94a3b8",
            },
            elements: {
              card: "border border-white/10 shadow-2xl",
              navbar: "hidden",
              userButtonPopoverCard: "bg-[#0a0a0f] border border-white/10",
              userPreviewMainIdentifier: "text-white font-semibold",
              userPreviewSecondaryIdentifier: "text-slate-400",
              userButtonPopoverActionButton: "hover:bg-white/5 !text-white",
              userButtonPopoverActionButtonText: "!text-white",
              userButtonPopoverActionButtonIconBox: "!text-slate-400",
              userButtonPopoverActionButtonIcon: "!text-slate-400",
              headerTitle: "!text-white",
              headerSubtitle: "!text-slate-400",
              profileSectionTitle: "!text-white",
              profileSectionTitleText: "!text-white",
              profileSectionContent: "!text-slate-300",
              accordionTriggerButton: "!text-white",
              socialButtonsBlockButton: "!bg-white/5 !border-white/10 hover:!bg-white/10",
              socialButtonsBlockButtonText: "!text-white font-medium",
              dividerText: "!text-slate-400",
              dividerLine: "!bg-white/10",
              formFieldLabel: "!text-slate-300",
              formFieldInput: "!bg-white/5 !border-white/10 !text-white",
              footerActionText: "!text-slate-400",
              footerActionLink: "!text-indigo-400 hover:!text-indigo-300",
            }
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
