import { CopilotState, SubmissionDraft, TeamPost, UserProgress } from "@/lib/types";
import { daysUntil } from "@/lib/utils";

export function getCopilotState(
  slug: string,
  progress: UserProgress | undefined,
  submission: SubmissionDraft | undefined,
  teamPosts: TeamPost[],
  deadline: string,
): CopilotState {
  const completed: string[] = [];
  const pending: string[] = [];

  const viewedOverview = progress?.viewedSections.includes("overview");
  const hasTeam = progress?.hasTeam || teamPosts.some((team) => team.hackathonSlug === slug && !team.isOpen);
  const hasDraft = progress?.hasDraft || Boolean(submission?.publicSummary || submission?.demoLink);
  const isSubmitted = progress?.isSubmitted || Boolean(submission?.submittedAt);

  if (viewedOverview) completed.push("핵심 섹션 확인");
  else pending.push("핵심 섹션 확인");
  if (hasTeam) completed.push("팀 구성");
  else pending.push("팀 구성");
  if (hasDraft) completed.push("제출 초안 작성");
  else pending.push("제출 초안 작성");
  if (isSubmitted) completed.push("최종 제출");
  else pending.push("최종 제출");

  const nextAction =
    pending[0] === "핵심 섹션 확인"
      ? "개요와 평가 기준부터 읽고 준비 흐름을 잠그세요."
      : pending[0] === "팀 구성"
        ? "지금 팀 매칭을 확인하고 연락 링크로 빠르게 연결하세요."
        : pending[0] === "제출 초안 작성"
          ? "제출 가드에 초안을 먼저 저장해 마감 전 리스크를 줄이세요."
          : pending[0] === "최종 제출"
            ? "체크리스트를 모두 통과한 뒤 최종 제출을 완료하세요."
            : "리더보드를 보며 결과를 해석하고 다음 해커톤 전략을 정리하세요.";

  return {
    readiness: Math.round((completed.length / 4) * 100),
    remainingDays: daysUntil(deadline),
    completed,
    pending,
    nextAction,
    highlight:
      pending.length > 0
        ? `지금 가장 중요한 단계는 "${pending[0]}" 입니다.`
        : "핵심 흐름을 모두 완료했습니다. 결과 해석과 회고를 확인하세요.",
  };
}
