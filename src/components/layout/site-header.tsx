"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthPreviewDialog } from "@/components/site/auth-preview-dialog";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/camp", label: "Camp" },
  { href: "/rankings", label: "Rankings" },
  { href: "/mypage", label: "My Page" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/hackport.svg"
            alt="HackPort"
            width={187}
            height={29}
            className="h-auto w-[132px] sm:w-[148px]"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active ? "bg-white shadow-sm" : "text-muted hover:bg-white/70 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <AuthPreviewDialog mode="login" />
          <AuthPreviewDialog mode="signup" />
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white md:hidden"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div className="container-shell border-t border-border/60 py-4 md:hidden">
          <div className="grid gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <AuthPreviewDialog mode="login" compact />
              <AuthPreviewDialog mode="signup" compact />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
