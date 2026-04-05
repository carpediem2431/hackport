"use client";

import Link from "next/link";
import {
  Box,
  CalendarDays,
  Camera,
  Check,
  Code2,
  CreditCard,
  Handshake,
  Mail,
  Pencil,
  RotateCcw,
  Save,
  ShieldCheck,
  X,
  UserRound,
} from "lucide-react";
import LanyardProfile from "@/components/react-bits/lanyard-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeading } from "@/components/ui/section-heading";
import { Textarea } from "@/components/ui/textarea";
import ReflectiveCard from "@/components/ReflectiveCard";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { captureCardToDataUrl } from "@/lib/capture-reflective-card";
import { loadStorage, saveStorage, storageKeys } from "@/lib/storage";
import type { AuthUser } from "@/lib/types";
import { translateCollabStyle, translateLevel, translateRole } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const roleOptions = [
  "Frontend",
  "Backend",
  "Fullstack",
  "Designer",
  "PM",
  "DevOps",
  "Data Scientist",
  "ML Engineer",
  "QA",
  "Mobile",
] as const;

const levelOptions = [
  { value: "beginner", label: "초급" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "고급" },
] as const;

const collabStyleOptions = [
  { value: "fast-feedback", label: "빠른 피드백" },
  { value: "structured", label: "체계적" },
  { value: "async-first", label: "비동기 우선" },
  { value: "pair-programming", label: "페어 프로그래밍" },
  { value: "agile-sprint", label: "애자일 스프린트" },
] as const;

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "최근 가입";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function buildDefaultIntro(user: Pick<AuthUser, "nickname" | "role" | "collaborationStyle">) {
  return `${user.nickname}님은 ${translateRole(user.role)} 역할로 해커톤 팀에 참여하며 ${translateCollabStyle(user.collaborationStyle)} 협업을 선호합니다.`;
}

export default function MyPage() {
  const { value: currentUser, setValue: setCurrentUser, ready: currentUserReady } = useLocalStorageState<AuthUser | null>(
    storageKeys.currentUser,
    null,
  );
  const {
    value: savedCardImage,
    setValue: setSavedCardImage,
    ready: savedCardImageReady,
  } = useLocalStorageState<string | null>(
    storageKeys.profileImage,
    null,
  );
  const translatedRole = currentUser ? translateRole(currentUser.role) : "";
  const translatedLevel = currentUser ? translateLevel(currentUser.level) : "";
  const storageReady = currentUserReady && savedCardImageReady;
  const lanyardUser = useMemo(() => ({
    nickname: currentUser?.nickname ?? "",
    role: translatedRole,
    level: translatedLevel,
    email: currentUser?.email ?? "",
  }), [currentUser?.email, currentUser?.nickname, translatedLevel, translatedRole]);

  const [viewMode, setViewMode] = useState<"3d" | "2d">("2d");
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reflectiveCardRef = useRef<HTMLDivElement>(null);
  const persistedCardImage = savedCardImageReady ? savedCardImage : null;
  const [capturedFaceImage, setCapturedFaceImage] = useState<string | null>(null);
  // Captured ReflectiveCard texture (data URL) for 3D lanyard
  const [reflectiveCardTexture, setReflectiveCardTexture] = useState<string | null>(null);

  useEffect(() => {
    if (!capturedFaceImage) {
      return;
    }

    // 캡처된 이미지를 그대로 저장 (ReflectiveCard는 라이브로 렌더링, 3D 텍스처는 card-texture.ts가 처리)
    setSavedCardImage(capturedFaceImage);
  }, [capturedFaceImage, setSavedCardImage]);

  // Capture offscreen ReflectiveCard → data URL for 3D texture
  const captureReflectiveTexture = useCallback(async () => {
    if (!reflectiveCardRef.current || !persistedCardImage) return;

    // Small delay to let SVG filters render
    await new Promise((r) => setTimeout(r, 200));

    const dataUrl = await captureCardToDataUrl({
      element: reflectiveCardRef.current,
    });

    if (dataUrl) {
      setReflectiveCardTexture(dataUrl);
    }
  }, [persistedCardImage]);

  useEffect(() => {
    if (persistedCardImage) {
      void captureReflectiveTexture();
    }
  }, [persistedCardImage, captureReflectiveTexture]);

  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<AuthUser | null>(null);

  const startEditing = () => {
    if (!currentUser) return;
    setEditDraft({ ...currentUser, intro: currentUser.intro ?? "" });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditDraft(null);
  };

  const saveProfile = () => {
    if (!editDraft) return;
    const nextUser = { ...editDraft, intro: editDraft.intro.trim() };
    const users = loadStorage<AuthUser[]>(storageKeys.users, []);
    const hasStoredUser = users.some((user) => user.email === currentUser?.email);
    const nextUsers = hasStoredUser
      ? users.map((user) => (user.email === currentUser?.email ? nextUser : user))
      : [...users, nextUser];

    saveStorage(storageKeys.users, nextUsers);
    setCurrentUser(nextUser);
    setIsEditing(false);
    setEditDraft(null);
  };

  const updateDraft = <K extends keyof AuthUser>(key: K, value: AuthUser[K]) => {
    if (!editDraft) return;
    setEditDraft({ ...editDraft, [key]: value });
  };

  if (!storageReady) {
    return (
      <div className="container-shell py-16 sm:py-20">
        <SectionHeading
          eyebrow="내 프로필"
          title="마이페이지"
          description="저장된 프로필과 랜야드 정보를 복원하는 중입니다."
        />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container-shell py-16 sm:py-20">
        <SectionHeading
          eyebrow="내 프로필"
          title="마이페이지"
          description="로그인이 필요한 페이지입니다."
        />
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-black">로그인 후 이용해주세요.</p>
          <Link
            href="/"
            className="rounded-full bg-black px-6 py-2.5 text-sm font-medium !text-white transition hover:opacity-90"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const translatedCollabStyle = translateCollabStyle(currentUser.collaborationStyle);
  const intro = currentUser.intro?.trim() || buildDefaultIntro(currentUser);
  const memberSince = formatCreatedAt(currentUser.createdAt);
  const highlights = [
    { icon: UserRound, label: "역할", value: translatedRole },
    { icon: Handshake, label: "협업 스타일", value: translatedCollabStyle },
    { icon: ShieldCheck, label: "성장 레벨", value: translatedLevel },
    { icon: CalendarDays, label: "활동 시작", value: memberSince },
  ];

  const handleConfirm = () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    setSavedCardImage(null);
    setCapturedFaceImage(dataUrl);
  };

  const handleRetry = () => {
    setCapturedFaceImage(null);
    setSavedCardImage(null);
  };

  const isCameraPhase = !persistedCardImage && !capturedFaceImage;

  return (
    <div className="container-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="내 프로필"
        title="마이페이지"
        description={`${currentUser.nickname}님의 프로필 카드와 핵심 정보를 확인하고, 수정할 수 있습니다.`}
        className="max-w-3xl"
        descriptionClassName="max-w-xl text-sm text-muted sm:text-base"
      />

      {isCameraPhase ? (
        <section className="surface-tint relative mt-10 flex flex-col items-center gap-8 overflow-visible rounded-[40px] border border-white/60 px-6 py-8 shadow-[0_24px_70px_rgba(82,39,255,0.1)] sm:px-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(177,158,239,0.18),transparent_26%)]" />

          <div className="relative text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Camera className="h-5 w-5 text-brand-strong" />
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-strong">Profile Capture</p>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">프로필 이미지를 캡처해주세요</h3>
            <p className="mt-3 text-sm leading-6 text-muted">카메라에 얼굴을 맞추고 아래 확인 버튼을 누르면 프로필 카드가 완성됩니다.</p>
          </div>

          <div className="flex w-full justify-center">
            <div className="relative flex justify-center">
              <div className="pointer-events-none absolute inset-x-10 top-16 bottom-10 rounded-[36px] bg-[radial-gradient(circle_at_top,rgba(177,158,239,0.28),transparent_55%)] blur-3xl" />
              <ReflectiveCard
                overlayColor="rgba(0, 0, 0, 0.2)"
                blurStrength={12}
                glassDistortion={30}
                metalness={1}
                roughness={0.75}
                displacementStrength={20}
                noiseScale={1}
                specularConstant={5}
                grayscale={0.15}
                color="#ffffff"
                user={lanyardUser}
                videoRef={videoRef}
              />
            </div>
          </div>

          <canvas ref={captureCanvasRef} className="hidden" />

          <Button
            onClick={handleConfirm}
            size="lg"
            className="rounded-full bg-brand-strong px-10 py-3 text-base font-semibold !text-white shadow-lg transition hover:opacity-90"
          >
            <Check className="mr-2 h-5 w-5" />
            확인
          </Button>
        </section>
      ) : (
        <section className="mt-10 overflow-visible">
          <div className="grid gap-10 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)] lg:items-center xl:gap-14">
            <div className="order-2 lg:order-1">
              <div className="mx-auto max-w-[560px] lg:mx-0">
                <div className="mb-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <Badge className="bg-brand-soft/25 text-brand-strong">HackPort ID</Badge>
                  <Badge>{translatedLevel}</Badge>
                  <Badge>{currentUser.techStacks.length}개 스택</Badge>
                </div>

                  <div className="mb-4 flex max-w-[560px] flex-wrap items-center justify-between gap-3 lg:mb-5">
                    <p className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-left">
                      프로필 카드
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode("3d")}
                        className={`relative inline-flex items-center justify-center gap-1.5 rounded-[14px] border px-3.5 py-2 text-[11px] font-semibold leading-none shadow-[0_3px_8px_rgba(15,23,42,0.035)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong/30 ${
                          viewMode === "3d"
                            ? "border-brand-strong/20 bg-brand-strong text-white"
                            : "border-white/85 bg-white/96 text-brand-strong/70 hover:bg-white hover:text-brand-strong"
                        }`}
                      >
                        <Box className="h-3.5 w-3.5 shrink-0" />
                        <span>3D</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("2d")}
                        className={`relative inline-flex items-center justify-center gap-1.5 rounded-[14px] border px-3.5 py-2 text-[11px] font-semibold leading-none shadow-[0_3px_8px_rgba(15,23,42,0.035)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong/30 ${
                          viewMode === "2d"
                            ? "border-brand-strong/20 bg-brand-strong text-white"
                            : "border-white/85 bg-white/96 text-brand-strong/70 hover:bg-white hover:text-brand-strong"
                        }`}
                      >
                        <CreditCard className="h-3.5 w-3.5 shrink-0" />
                        <span>2D</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative mx-auto w-full max-w-[560px] overflow-visible lg:mx-0">
                    <div className="relative">
                      {viewMode === "3d" ? (
                        <div className="relative overflow-visible">
                          <div className="relative">
                            {persistedCardImage ? (
                              <LanyardProfile
                                cardImage={persistedCardImage}
                                reflectiveCardTexture={reflectiveCardTexture}
                                user={lanyardUser}
                                gravity={[0, -40, 0]}
                                position={[0, 0, 20]}
                                fov={18}
                              />
                            ) : (
                              <div className="flex h-[500px] items-center justify-center rounded-[32px] border border-white/70 bg-white/80 px-6 text-center text-sm text-muted shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:h-[620px]">
                                ReflectiveCard 효과를 3D 카드에 적용하는 중입니다.
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                          <div className="relative overflow-visible">
                          <div className="relative flex h-[500px] items-center justify-center sm:h-[620px]">
                            {persistedCardImage ? (
                              <ReflectiveCard
                                overlayColor="rgba(0, 0, 0, 0.2)"
                                blurStrength={12}
                                glassDistortion={30}
                                metalness={1}
                                roughness={0.75}
                                displacementStrength={20}
                                noiseScale={1}
                                specularConstant={5}
                                grayscale={0.15}
                                color="#ffffff"
                                className="max-w-full"
                                style={{ maxWidth: "min(100%, 384px)" }}
                                user={lanyardUser}
                                capturedImageSrc={persistedCardImage}
                              />
                            ) : capturedFaceImage ? (
                              <ReflectiveCard
                                overlayColor="rgba(0, 0, 0, 0.2)"
                                blurStrength={12}
                                glassDistortion={30}
                                metalness={1}
                                roughness={0.75}
                                displacementStrength={20}
                                noiseScale={1}
                                specularConstant={5}
                                grayscale={0.15}
                                color="#ffffff"
                                className="max-w-full"
                                style={{ maxWidth: "min(100%, 384px)" }}
                                user={lanyardUser}
                                capturedImageSrc={capturedFaceImage}
                              />
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center lg:justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRetry}
                      className="rounded-full border-brand-strong/25 bg-white/85 px-6 py-2.5 text-sm font-semibold text-brand-strong shadow-sm backdrop-blur-sm hover:bg-white"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      다시 하기
                    </Button>
                  </div>
                </div>
            </div>

            <div className="order-1 lg:order-2">
              <Card className="rounded-[28px] border-white/70 bg-white/88 p-0 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <div className="flex items-start justify-between border-b border-border/80 px-6 py-5">
                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-foreground">상세 프로필</p>
                    <p className="mt-1 text-sm text-muted">{(isEditing && editDraft ? editDraft : currentUser).nickname}님의 기본 정보를 정리했어요.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          className="rounded-full border-border/60 bg-white/90 px-4 py-1.5 text-xs font-semibold text-muted hover:bg-white"
                        >
                          취소
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={saveProfile}
                          className="rounded-full bg-brand-strong px-4 py-1.5 text-xs font-semibold !text-white hover:opacity-90"
                        >
                          <Save className="mr-1.5 h-3.5 w-3.5" />
                          저장
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={startEditing}
                        className="rounded-full border-border/60 bg-white/90 px-4 py-1.5 text-xs font-semibold text-brand-strong hover:bg-white"
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        수정
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-6 px-6 py-6">
                  {isEditing && editDraft ? (
                    <>
                      <section>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[22px] bg-[#f8f6ff] p-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-strong shadow-sm">
                                <UserRound className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted">닉네임</p>
                                <Input
                                  value={editDraft.nickname}
                                  onChange={(e) => updateDraft("nickname", e.target.value)}
                                  className="mt-1 h-8 rounded-xl border-border/50 bg-white text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-[22px] bg-[#f8f6ff] p-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-strong shadow-sm">
                                <UserRound className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted">역할</p>
                                <Select value={editDraft.role} onValueChange={(v) => updateDraft("role", v)}>
                                  <SelectTrigger className="mt-1 h-8 w-full rounded-xl border-border/50 bg-white text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roleOptions.map((role) => (
                                      <SelectItem key={role} value={role}>
                                        {translateRole(role)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-[22px] bg-[#f8f6ff] p-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-strong shadow-sm">
                                <Handshake className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted">협업 스타일</p>
                                <Select value={editDraft.collaborationStyle} onValueChange={(v) => updateDraft("collaborationStyle", v)}>
                                  <SelectTrigger className="mt-1 h-8 w-full rounded-xl border-border/50 bg-white text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {collabStyleOptions.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-[22px] bg-[#f8f6ff] p-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-strong shadow-sm">
                                <ShieldCheck className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted">성장 레벨</p>
                                <Select value={editDraft.level} onValueChange={(v) => updateDraft("level", v as AuthUser["level"])}>
                                  <SelectTrigger className="mt-1 h-8 w-full rounded-xl border-border/50 bg-white text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {levelOptions.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <p className="text-sm font-semibold text-foreground">연락 및 정체성</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[22px] bg-[#f8f6ff] p-4 sm:col-span-2">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-strong shadow-sm">
                                <Mail className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted">이메일</p>
                                <p className="mt-1 text-sm font-medium text-foreground">{currentUser.email}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-brand-strong" />
                          <p className="text-sm font-semibold text-foreground">기술 스택</p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {editDraft.techStacks.map((stack) => (
                            <Badge
                              key={stack}
                              className="group cursor-pointer bg-brand-soft/25 pr-1.5 text-brand-strong hover:bg-red-50 hover:text-red-500"
                              onClick={() => updateDraft("techStacks", editDraft.techStacks.filter((s) => s !== stack))}
                            >
                              {stack}
                              <X className="ml-1 h-3 w-3 opacity-50 group-hover:opacity-100" />
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Input
                            placeholder="기술 스택 추가 (예: React)"
                            className="h-8 flex-1 rounded-xl border-border/50 bg-white text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val && !editDraft.techStacks.includes(val)) {
                                  updateDraft("techStacks", [...editDraft.techStacks, val]);
                                }
                                (e.target as HTMLInputElement).value = "";
                              }
                            }}
                          />
                        </div>
                      </section>

                      <section>
                        <p className="text-sm font-semibold text-foreground">소개</p>
                        <Textarea
                          aria-label="자기소개 수정"
                          value={editDraft.intro}
                          onChange={(e) => updateDraft("intro", e.target.value)}
                          placeholder={buildDefaultIntro(editDraft)}
                          className="mt-3 min-h-28 resize-none rounded-[20px] bg-[#fbfbfd] text-sm leading-6 text-muted"
                        />
                      </section>
                    </>
                  ) : (
                    <>
                      <section>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {highlights.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="rounded-[22px] bg-[#f8f6ff] p-4">
                              <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-strong shadow-sm">
                                  <Icon className="h-4 w-4" />
                                </span>
                                <div>
                                  <p className="text-xs text-muted">{label}</p>
                                  <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section>
                        <p className="text-sm font-semibold text-foreground">연락 및 정체성</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[22px] bg-[#f8f6ff] p-4 sm:col-span-2">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-strong shadow-sm">
                                <Mail className="h-4 w-4" />
                              </span>
                              <div>
                                <p className="text-xs text-muted">연락처</p>
                                <p className="mt-1 text-sm font-medium text-foreground">{currentUser.email}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-brand-strong" />
                          <p className="text-sm font-semibold text-foreground">기술 스택</p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge className="bg-brand-soft/25 text-brand-strong">{translatedLevel}</Badge>
                          {currentUser.techStacks.map((stack) => (
                            <Badge key={stack}>{stack}</Badge>
                          ))}
                        </div>
                      </section>

                      <section>
                        <p className="text-sm font-semibold text-foreground">소개</p>
                        <Textarea
                          readOnly
                          aria-label="자기소개"
                          value={intro}
                          className="mt-3 min-h-28 resize-none rounded-[20px] bg-[#fbfbfd] text-sm leading-6 text-muted"
                        />
                      </section>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Offscreen ReflectiveCard for texture capture — same props as 2D mode */}
      {persistedCardImage && (
        <div
          style={{
            position: "fixed",
            left: "-9999px",
            top: "-9999px",
            visibility: "hidden",
            pointerEvents: "none",
          }}
        >
          <ReflectiveCard
            ref={reflectiveCardRef}
            overlayColor="rgba(0, 0, 0, 0.2)"
            blurStrength={12}
            glassDistortion={30}
            metalness={1}
            roughness={0.75}
            displacementStrength={20}
            noiseScale={1}
            specularConstant={5}
            grayscale={0.15}
            color="#ffffff"
            user={lanyardUser}
            capturedImageSrc={persistedCardImage}
          />
        </div>
      )}
    </div>
  );
}
