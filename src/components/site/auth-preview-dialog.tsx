"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROFILE_ROLE_OPTIONS, PROFILE_TECH_STACK_OPTIONS } from "@/lib/profile-options";
import { loadStorage, saveStorage, storageKeys } from "@/lib/storage";
import { AuthUser } from "@/lib/types";

const COLLAB_STYLES = [
  { value: "fast-feedback", label: "빠른 피드백" },
  { value: "structured", label: "체계적" },
  { value: "async-first", label: "비동기 우선" },
  { value: "pair-programming", label: "페어 프로그래밍" },
  { value: "agile-sprint", label: "애자일 스프린트" },
] as const;

const LEVEL_LABELS: Record<"beginner" | "intermediate" | "advanced", string> = {
  beginner: "초보",
  intermediate: "중급",
  advanced: "고급",
};

export function AuthPreviewDialog({
  mode,
  compact = false,
  triggerClassName,
}: {
  mode: "login" | "signup";
  compact?: boolean;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("");
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [collaborationStyle, setCollaborationStyle] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const toggleTechStack = (stack: string) => {
    setTechStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack]
    );
  };

  const resetForm = () => {
    setStep(1);
    setEmail("");
    setPassword("");
    setNickname("");
    setRole("");
    setTechStacks([]);
    setCollaborationStyle("");
    setLevel("intermediate");
    setError(null);
  };

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const users = loadStorage<AuthUser[]>(storageKeys.users, []);
    const found = users.find((u) => u.email === email.trim() && u.password === password);

    if (!found) {
      setError("이메일 또는 비밀번호가 일치하지 않습니다.");
      return;
    }

    saveStorage(storageKeys.currentUser, found);
    setOpen(false);
    resetForm();
    router.push("/mypage");
  };

  const handleNextStep = () => {
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (password.length < 4) {
      setError("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    const users = loadStorage<AuthUser[]>(storageKeys.users, []);
    if (users.some((u) => u.email === email.trim())) {
      setError("이미 가입된 이메일입니다.");
      return;
    }

    setError(null);
    setStep(2);
  };

  const handleSignup = () => {
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    const users = loadStorage<AuthUser[]>(storageKeys.users, []);
    const newUser: AuthUser = {
      email: email.trim(),
      password,
      nickname: nickname.trim(),
      role: role.trim(),
      techStacks,
      collaborationStyle: collaborationStyle.trim(),
      level,
      createdAt: new Date().toISOString(),
    };

    saveStorage(storageKeys.users, [...users, newUser]);
    saveStorage(storageKeys.currentUser, newUser);
    setOpen(false);
    resetForm();
    router.push("/mypage");
  };

  const isSignup = mode === "signup";

  return (
    <AppDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
      title={mode === "login" ? "다시 오신 걸 환영합니다" : isSignup && step === 1 ? "계정 만들기" : "프로필 설정"}
      description={
        mode === "login"
          ? "이메일과 비밀번호로 로그인하세요."
          : isSignup && step === 1
            ? "이메일과 비밀번호를 입력해주세요."
            : "당신을 소개하는 프로필을 작성해주세요."
      }
      trigger={
        <Button
          size={compact ? "sm" : "default"}
          variant={mode === "login" ? "ghost" : "default"}
          className={triggerClassName}
        >
          {mode === "login" ? "로그인" : "회원가입"}
        </Button>
      }
    >
      <div className="space-y-4">
        {error ? (
          <div className="rounded-[16px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {isSignup ? (
          <div className="flex items-center gap-2">
            <div className={`h-1 flex-1 rounded-full ${step === 1 ? "bg-white" : "bg-white/60"}`} />
            <div className={`h-1 flex-1 rounded-full ${step === 2 ? "bg-white" : "bg-white/20"}`} />
          </div>
        ) : null}

        {(!isSignup || step === 1) ? (
          <>
            <div className="grid gap-3">
              <span className="text-sm text-white/72">이메일</span>
              <Input
                className="border-white/10 bg-white/6 text-white placeholder:text-white/30"
                placeholder="hello@hackport.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <span className="text-sm text-white/72">비밀번호</span>
              <Input
                className="border-white/10 bg-white/6 text-white placeholder:text-white/30"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        ) : null}

        {isSignup && step === 2 ? (
          <>
            <div className="grid gap-3">
              <span className="text-sm text-white/72">닉네임</span>
              <Input
                className="border-white/10 bg-white/6 text-white placeholder:text-white/30"
                placeholder="홍길동"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <span className="text-sm text-white/72">역할</span>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full border-white/10 bg-white/6 text-white data-[placeholder]:text-white/30">
                  <SelectValue placeholder="역할을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <span className="text-sm text-white/72">기술 스택</span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto rounded-lg border border-white/10 bg-white/6 p-2">
                {PROFILE_TECH_STACK_OPTIONS.map((stack) => (
                   <button
                     key={stack}
                     type="button"
                     onClick={() => toggleTechStack(stack)}
                     className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                       techStacks.includes(stack)
                         ? "border-transparent bg-brand text-white"
                         : "border-white/20 text-white/60 hover:bg-white/10"
                     }`}
                   >
                     {stack}
                   </button>
                ))}
                {techStacks.filter((s) => !(PROFILE_TECH_STACK_OPTIONS as readonly string[]).includes(s)).map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    onClick={() => toggleTechStack(custom)}
                    className="rounded-full border border-transparent bg-brand text-white px-2.5 py-1 text-xs transition-colors"
                  >
                    {custom}
                  </button>
                ))}
                <input
                  className="w-20 rounded-full border border-dashed border-white/20 bg-transparent px-2.5 py-1 text-xs text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                  placeholder="+ 추가"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      const input = e.target as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !techStacks.includes(value)) {
                        setTechStacks((prev) => [...prev, value]);
                        input.value = "";
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <span className="text-sm text-white/72">협업 스타일</span>
              <Select value={collaborationStyle} onValueChange={setCollaborationStyle}>
                <SelectTrigger className="w-full border-white/10 bg-white/6 text-white data-[placeholder]:text-white/30">
                  <SelectValue placeholder="협업 스타일을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {COLLAB_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <span className="text-sm text-white/72">수준</span>
              <div className="flex gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm ${
                      level === item ? "bg-brand text-white" : "border border-white/20 text-white/70 hover:bg-white/10"
                    }`}
                    onClick={() => setLevel(item)}
                  >
                    {LEVEL_LABELS[item]}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          {mode === "login" ? (
            <Button onClick={handleLogin}>로그인</Button>
          ) : step === 1 ? (
            <Button onClick={handleNextStep}>다음</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => { setStep(1); setError(null); }}>이전</Button>
              <Button onClick={handleSignup}>회원가입</Button>
            </>
          )}

        </div>
      </div>
    </AppDialog>
  );
}
