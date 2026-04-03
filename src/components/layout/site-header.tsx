"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AuthPreviewDialog } from "@/components/site/auth-preview-dialog";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { storageKeys } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/types";

const navigation = [
  { href: "/", label: "홈" },
  { href: "/hackathons", label: "해커톤" },
  { href: "/camp", label: "Camp" },
  { href: "/rankings", label: "랭킹" },
  { href: "/mypage", label: "마이페이지" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { value: currentUser, setValue: setCurrentUser } = useLocalStorageState<AuthUser | null>(
    storageKeys.currentUser,
    null,
  );

  const handleLogout = () => {
    setCurrentUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-shell flex h-14 items-center justify-between gap-4">
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
          {currentUser ? (
            <>
              <Link
                href="/mypage"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-white/80"
              >
                {currentUser.nickname}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-white/70 hover:text-foreground"
                type="button"
              >
                <LogOut className="h-3.5 w-3.5" />
                로그아웃
              </button>
            </>
          ) : (
            <>
              <AuthPreviewDialog mode="login" />
              <AuthPreviewDialog mode="signup" />
            </>
          )}
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
              {currentUser ? (
                <>
                  <Link
                    href="/mypage"
                    className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-center text-sm font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {currentUser.nickname}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium"
                    type="button"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <AuthPreviewDialog mode="login" compact />
                  <AuthPreviewDialog mode="signup" compact />
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
