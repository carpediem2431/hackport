"use client";

import Link from "next/link";
import LanyardProfile from "@/components/react-bits/lanyard-profile";
import ReflectiveCard from "@/components/ReflectiveCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { storageKeys } from "@/lib/storage";
import type { AuthUser } from "@/lib/types";
import { translateLevel } from "@/lib/utils";

export default function MyPage() {
  const { value: currentUser } = useLocalStorageState<AuthUser | null>(
    storageKeys.currentUser,
    null,
  );

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

  return (
    <div className="container-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="내 프로필"
        title="마이페이지"
        description={`${currentUser.nickname}님의 프로필 정보와 인터랙티브 카드를 함께 보여주는 페이지입니다.`}
      />

      <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="space-y-6">
          <Card className="surface-tint">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>{translateLevel(currentUser.level)}</Badge>
              <Badge>{currentUser.email}</Badge>
            </div>
            <CardTitle className="text-3xl">{currentUser.nickname}</CardTitle>
            <CardDescription className="mt-3 text-base">
              {currentUser.role}
            </CardDescription>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/70 p-5">
                <p className="text-sm text-muted">역할</p>
                <p className="mt-2 font-medium">{currentUser.role}</p>
              </div>
              <div className="rounded-[24px] bg-white/70 p-5">
                <p className="text-sm text-muted">협업 스타일</p>
                <p className="mt-2 font-medium">{currentUser.collaborationStyle}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {currentUser.techStacks.map((stack) => (
                <Badge key={stack}>{stack}</Badge>
              ))}
            </div>
          </Card>

          <div style={{ height: "600px", position: "relative" }}>
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
              className="h-full w-full"
              user={{
                nickname: currentUser.nickname,
                role: currentUser.role,
                level: translateLevel(currentUser.level),
                email: currentUser.email,
              }}
            />
          </div>
        </div>

        <Card className="surface-tint overflow-hidden p-0">
          <div className="border-b border-border/70 px-6 py-5">
            <CardTitle>인터랙티브 ID 카드</CardTitle>
            <CardDescription className="mt-2">
              마이페이지 진입 후 위쪽에서 떨어져 안정화되는 인터랙티브 ID 카드입니다.
            </CardDescription>
          </div>
          <LanyardProfile />
        </Card>
      </div>
    </div>
  );
}
