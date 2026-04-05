import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

const pretendard = localFont({
  src: [
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
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
      className={cn("h-full", "scroll-smooth", "antialiased", pretendard.variable, "font-sans")}
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
