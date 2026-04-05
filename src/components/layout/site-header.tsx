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
  { href: "/camp", label: "캠프" },
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
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="container-shell">
        <div className="flex min-h-18 items-center gap-4 rounded-[32px] border border-white/12 bg-black/28 px-5 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl supports-[backdrop-filter]:bg-black/22 sm:px-7">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/brand/hackport.svg"
              alt="HackPort"
              width={187}
              height={29}
              className="h-auto w-[132px] sm:w-[148px]"
              priority
            />
          </Link>

          <nav className="ml-auto hidden items-center gap-1.5 md:flex">
            {navigation.map((item) => {
              const active = item.href === "/"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight text-white/84 transition duration-200",
                    active
                      ? "bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                      : "hover:bg-white/10 hover:text-white",
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
                  className="rounded-full border border-white/14 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  {currentUser.nickname}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white/78 transition hover:bg-white/10 hover:text-white"
                  type="button"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <AuthPreviewDialog
                  mode="login"
                  triggerClassName="border border-transparent bg-transparent text-white/80 hover:bg-white/10 hover:text-white"
                />
                <AuthPreviewDialog
                  mode="signup"
                  triggerClassName="border border-white/14 bg-white/10 text-white shadow-none hover:bg-white/16"
                />
              </>
            )}
          </div>

          <button
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white md:hidden"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {open ? (
          <div className="mt-3 rounded-[28px] border border-white/12 bg-black/36 p-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-2xl md:hidden">
            <div className="grid gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white/88"
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
                      className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white"
                      onClick={() => setOpen(false)}
                    >
                      {currentUser.nickname}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white/84"
                      type="button"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <AuthPreviewDialog
                      mode="login"
                      compact
                      triggerClassName="flex-1 border border-white/10 bg-white/6 text-white/84 hover:bg-white/10 hover:text-white"
                    />
                    <AuthPreviewDialog
                      mode="signup"
                      compact
                      triggerClassName="flex-1 border border-white/10 bg-white/10 text-white hover:bg-white/14"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
