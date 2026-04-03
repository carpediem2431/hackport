"use client";

import { Compass, Flag, FolderCheck, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHackathonProgress } from "@/hooks/use-hackathon-progress";
import { getCopilotState } from "@/lib/copilot";
import { emptySubmission, storageKeys } from "@/lib/storage";
import { TeamPost, Hackathon, SubmissionDraft } from "@/lib/types";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

export function CopilotPanel({ hackathon }: { hackathon: Hackathon }) {
  const { progress, updateProgress, ready } = useHackathonProgress(hackathon.slug);
  const { value: teamPosts } = useLocalStorageState<TeamPost[]>(storageKeys.teamPosts, []);
  const { value: submissions } = useLocalStorageState<Record<string, SubmissionDraft>>(storageKeys.submissions, {});

  const state = getCopilotState(
    hackathon.slug,
    progress,
    submissions[hackathon.slug] ?? emptySubmission,
    teamPosts,
    hackathon.dates.submissionDeadline,
  );

  if (!ready) {
    return <Card className="sticky top-24">코파일럿 상태를 계산하는 중입니다...</Card>;
  }

  return (
    <Card className="sticky top-24 overflow-hidden bg-[#111418] text-white">
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(255,122,26,0.4),_transparent_65%)]" />
      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">해커톤 코파일럿</p>
            <CardTitle className="mt-3 text-white">준비도 {state.readiness}%</CardTitle>
            <CardDescription className="mt-2 text-white/68">{state.highlight}</CardDescription>
          </div>
          <Badge className="border-white/10 bg-white/10 text-white">D-{Math.max(state.remainingDays, 0)}</Badge>
        </div>

        <Progress value={state.readiness} className="bg-white/10" />

        <div className="mt-6 grid gap-3">
          <button
            className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
            onClick={() =>
              updateProgress({
                viewedSections: Array.from(new Set([...(progress?.viewedSections ?? []), "overview"])),
                hasTeam: progress?.hasTeam ?? false,
                hasDraft: progress?.hasDraft ?? false,
                isSubmitted: progress?.isSubmitted ?? false,
                checklistState: progress?.checklistState ?? {},
                updatedAt: new Date().toISOString(),
              })
            }
            type="button"
          >
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium">
              <Compass className="h-4 w-4 text-brand" />
              정보 확인 완료로 표시
            </div>
            <p className="text-sm text-white/65">핵심 섹션을 읽었다면 바로 반영해 다음 액션을 업데이트하세요.</p>
          </button>
          <button
            className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
            onClick={() =>
              updateProgress({
                viewedSections: progress?.viewedSections ?? [],
                hasTeam: true,
                hasDraft: progress?.hasDraft ?? false,
                isSubmitted: progress?.isSubmitted ?? false,
                checklistState: progress?.checklistState ?? {},
                updatedAt: new Date().toISOString(),
              })
            }
            type="button"
          >
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-brand" />
              팀 구성 완료
            </div>
            <p className="text-sm text-white/65">팀이 정해졌다면 코파일럿 흐름에서 다음 단계를 제출 준비로 넘깁니다.</p>
          </button>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white">다음 추천 행동</p>
          <p className="mt-3 text-sm leading-6 text-white/68">{state.nextAction}</p>
          <div className="mt-5 grid gap-2 text-sm text-white/70">
            {state.completed.map((item) => (
              <div key={item} className="inline-flex items-center gap-2">
                <FolderCheck className="h-4 w-4 text-brand" />
                완료: {item}
              </div>
            ))}
            {state.pending.map((item) => (
              <div key={item} className="inline-flex items-center gap-2">
                <Flag className="h-4 w-4 text-white/55" />
                남은 항목: {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
