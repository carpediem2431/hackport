"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthPreviewDialog({
  mode,
  compact = false,
}: {
  mode: "login" | "signup";
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={mode === "login" ? "Welcome back to HackPort" : "Create your HackPort preview"}
      description="This is a visual auth preview inspired by product-style onboarding. The core HackPort flow still works without login."
      trigger={
        <Button size={compact ? "sm" : "default"} variant={mode === "login" ? "ghost" : "default"}>
          {mode === "login" ? "Login" : "Sign Up"}
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3">
          <label className="text-sm text-white/72">Email</label>
          <Input className="border-white/10 bg-white/6 text-white placeholder:text-white/30" placeholder="hello@hackport.dev" />
        </div>
        <div className="grid gap-3">
          <label className="text-sm text-white/72">Password</label>
          <Input className="border-white/10 bg-white/6 text-white placeholder:text-white/30" placeholder="••••••••" type="password" />
        </div>
        {mode === "signup" ? (
          <div className="grid gap-3">
            <label className="text-sm text-white/72">Role</label>
            <Input className="border-white/10 bg-white/6 text-white placeholder:text-white/30" placeholder="Frontend / Designer / PM" />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={() => {
              setOpen(false);
              router.push("/mypage");
            }}
          >
            {mode === "login" ? "Preview login" : "Preview signup"}
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            둘러보기 계속
          </Button>
        </div>
      </div>
    </AppDialog>
  );
}
