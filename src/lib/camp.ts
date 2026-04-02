import { CampProfile, TeamPost } from "@/lib/types";

export function getTeamFitScore(profile: CampProfile, team: TeamPost) {
  let score = 20;
  const reasons: string[] = [];
  const profileRole = profile.role.trim().toLowerCase();
  const teamRoles = team.lookingFor.map((role) => role.trim().toLowerCase());

  if (profileRole && teamRoles.some((role) => role.includes(profileRole) || profileRole.includes(role))) {
    score += 30;
    reasons.push("역할이 정확히 맞습니다");
  }

  const overlap = profile.techStacks.filter((stack) => team.techStacks.includes(stack)).length;
  if (overlap > 0) {
    score += Math.min(25, overlap * 10);
    reasons.push(`기술 스택 ${overlap}개가 겹칩니다`);
  }

  if (profile.collaborationStyle && profile.collaborationStyle === team.collaborationStyle) {
    score += 15;
    reasons.push("협업 스타일이 잘 맞습니다");
  }

  if (profile.beginnerFriendly && team.beginnerFriendly) {
    score += 10;
    reasons.push("초보자 친화 팀입니다");
  }

  if (profile.level === "advanced" && !team.beginnerFriendly) {
    score += 8;
    reasons.push("빠른 실행형 팀 분위기와 맞습니다");
  }

  return {
    score: Math.min(100, score),
    reasons: reasons.length > 0 ? reasons : ["프로필을 더 입력하면 매칭 이유가 더 정확해집니다"],
  };
}
