import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HackPort",
  description:
    "HackPort is a hackathon copilot workspace for exploring hackathons, matching with teams, submitting safely, and understanding leaderboards without login.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={cn("h-full", "scroll-smooth", "antialiased", display.variable, body.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
