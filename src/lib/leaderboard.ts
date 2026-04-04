import type { Hackathon, LeaderboardEntry } from "@/lib/types";

/**
 * Generate zero-score breakdown from hackathon judging criteria.
 */
export function buildZeroBreakdown(judging: Hackathon["judging"]) {
  return judging.map((c) => ({ label: c.label, score: 0 }));
}

/**
 * Calculate total score from weighted breakdown.
 * For now uses a simple seeded random for demo purposes.
 * In production, this would receive judge scores.
 */
export function calculateScore(
  judging: Hackathon["judging"],
  submissionQuality: number = 0,
): { breakdown: { label: string; score: number }[]; total: number } {
  const seed = submissionQuality || 70;
  const breakdown = judging.map((c) => {
    const raw = Math.min(c.weight, Math.round((seed / 100) * c.weight + (Math.random() * 5 - 2)));
    return { label: c.label, score: Math.max(0, raw) };
  });
  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  return { breakdown, total };
}

/**
 * Upsert a leaderboard entry for a team after submission.
 */
export function upsertLeaderboardEntry(
  entries: LeaderboardEntry[],
  hackathonSlug: string,
  teamName: string,
  judging: Hackathon["judging"],
  submitted: boolean,
): LeaderboardEntry[] {
  const { breakdown, total } = submitted ? calculateScore(judging, 80) : { breakdown: buildZeroBreakdown(judging), total: 0 };

  const existing = entries.findIndex(
    (e) => e.hackathonSlug === hackathonSlug && e.teamName === teamName,
  );

  const entry: LeaderboardEntry = {
    hackathonSlug,
    teamName,
    totalScore: total,
    breakdown,
    badges: submitted ? ["제출 완료"] : ["미제출"],
    delta: existing >= 0 ? entries[existing].delta : "flat",
    submitted,
  };

  if (existing >= 0) {
    return entries.map((e, i) => (i === existing ? entry : e));
  }

  return [...entries, entry];
}
