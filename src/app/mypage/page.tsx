"use client";

import Link from "next/link";
import { toPng } from "html-to-image";
import {
  CalendarDays,
  Camera,
  Check,
  Code2,
  Handshake,
  Mail,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import LanyardProfile from "@/components/react-bits/lanyard-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Textarea } from "@/components/ui/textarea";
import ReflectiveCard from "@/components/ReflectiveCard";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { storageKeys } from "@/lib/storage";
import type { AuthUser } from "@/lib/types";
import { translateCollabStyle, translateLevel, translateRole } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

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

export default function MyPage() {
  const { value: currentUser } = useLocalStorageState<AuthUser | null>(
    storageKeys.currentUser,
    null,
  );
  const { value: savedImage, setValue: setSavedImage } = useLocalStorageState<string | null>(
    storageKeys.profileImage,
    null,
  );
  const translatedRole = currentUser ? translateRole(currentUser.role) : "";
  const translatedLevel = currentUser ? translateLevel(currentUser.level) : "";

  const [confirmedImage, setConfirmedImage] = useState<string | null>(savedImage);
  const [lanyardCardImage, setLanyardCardImage] = useState<string | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lanyardCardCaptureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConfirmedImage(savedImage);
  }, [savedImage]);

  useEffect(() => {
    if (!confirmedImage) {
      setLanyardCardImage(null);
      return;
    }

    let cancelled = false;

    const captureLanyardCard = async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

      const captureNode = lanyardCardCaptureRef.current;
      if (!captureNode || cancelled) {
        return;
      }

      try {
        const dataUrl = await toPng(captureNode, {
          cacheBust: true,
          backgroundColor: "transparent",
          pixelRatio: 2,
        });

        if (!cancelled) {
          setLanyardCardImage(dataUrl);
        }
      } catch (error) {
        if (!cancelled) {
          setLanyardCardImage(null);
        }
        console.warn("Failed to capture ReflectiveCard for lanyard texture.", error);
      }
    };

    void captureLanyardCard();

    return () => {
      cancelled = true;
    };
  }, [confirmedImage]);

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
  const intro = `${currentUser.nickname}님은 ${translatedRole} 역할로 해커톤 팀에 참여하며 ${translatedCollabStyle} 협업을 선호합니다.`;
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
    setConfirmedImage(dataUrl);
    setSavedImage(dataUrl);
  };

  const handleRetry = () => {
    setConfirmedImage(null);
    setSavedImage(null);
  };

  const isCameraPhase = !confirmedImage;

  return (
    <div className="container-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="내 프로필"
        title="마이페이지"
        description={`${currentUser.nickname}님의 프로필 카드와 핵심 정보를 한 화면에서 확인할 수 있도록 구성했어요.`}
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

          <div className="relative">
            <div className="pointer-events-none absolute inset-x-10 top-16 bottom-10 rounded-[36px] bg-[radial-gradient(circle_at_top,rgba(177,158,239,0.28),transparent_55%)] blur-3xl" />
              <ReflectiveCard
                grayscale={0}
                user={{
                  nickname: currentUser.nickname,
                  role: translatedRole,
                  level: translatedLevel,
                  email: currentUser.email,
                }}
                videoRef={videoRef}
              />
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
        <section className="surface-tint relative mt-10 overflow-visible rounded-[40px] border border-white/60 px-6 py-8 shadow-[0_24px_70px_rgba(82,39,255,0.1)] sm:px-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(177,158,239,0.18),transparent_26%)]" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)] lg:items-center xl:gap-14">
            <div className="order-2 lg:order-1">
              <div className="mx-auto max-w-[560px] lg:mx-0">
                <div className="mb-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <Badge className="bg-brand-soft/25 text-brand-strong">HackPort ID</Badge>
                  <Badge>{translatedLevel}</Badge>
                  <Badge>{currentUser.techStacks.length}개 스택</Badge>
                </div>

                  <div className="relative overflow-visible">
                    <div className="pointer-events-none absolute inset-x-10 top-16 bottom-10 rounded-[36px] bg-[radial-gradient(circle_at_top,rgba(177,158,239,0.28),transparent_55%)] blur-3xl" />
                    <div className="relative">
                      <LanyardProfile
                        cardImage={lanyardCardImage}
                        profileImage={confirmedImage}
                        user={{
                          nickname: currentUser.nickname,
                          role: translatedRole,
                          level: translatedLevel,
                          email: currentUser.email,
                        }}
                        gravity={[0, -40, 0]}
                        position={[0, 0, 30]}
                        fov={20}
                      />
                    </div>
                  </div>

                  <div className="mt-6 max-w-lg text-center lg:text-left">
                    <p className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">3D 랜야드 디지털 ID</p>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      저장된 프로필 이미지를 기반으로 앞면과 뒷면 모두 ReflectiveCard 스타일의 랜야드 ID로 합성해, 실제 해커톤 출입증처럼 보이도록 구성했습니다.
                    </p>
                    <div className="mt-5 flex justify-center lg:justify-start">
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
            </div>

            <div className="order-1 lg:order-2">
              <div className="mb-6 max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-strong">Visual hero</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {currentUser.nickname}님의 개발자 아이덴티티를 한 장의 랜야드로 보여줍니다.
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
                  좌측에는 랜야드 전용 캔버스를 넉넉하게 두고, 우측에는 프로필 데이터를 글래스 카드처럼 정리해 움직임과 정보가 서로 부딪히지 않도록 설계했습니다.
                </p>
              </div>

              <Card className="rounded-[28px] border-white/70 bg-white/88 p-0 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <div className="flex items-start justify-between border-b border-border/80 px-6 py-5">
                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-foreground">상세 프로필</p>
                    <p className="mt-1 text-sm text-muted">{currentUser.nickname}님의 기본 정보를 정리했어요.</p>
                  </div>

                  <div className="flex items-center gap-2 text-muted">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted">
                      <Settings2 className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                <div className="space-y-6 px-6 py-6">
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


                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {confirmedImage ? (
        <div className="pointer-events-none fixed -left-[200vw] top-0" aria-hidden="true">
          <div ref={lanyardCardCaptureRef}>
            <ReflectiveCard
              grayscale={0}
              capturedImageSrc={confirmedImage}
              style={{ borderRadius: 0, boxShadow: "none" }}
              user={{
                nickname: currentUser.nickname,
                role: translatedRole,
                level: translatedLevel,
                email: currentUser.email,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
