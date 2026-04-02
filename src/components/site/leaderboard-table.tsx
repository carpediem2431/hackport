import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoLeaderboard } from "@/lib/data/hackathons";
import { Hackathon } from "@/lib/types";

export function LeaderboardTable({ hackathon }: { hackathon: Hackathon }) {
  const rows = demoLeaderboard.filter((item) => item.hackathonSlug === hackathon.slug);

  return (
    <Card className="bg-white">
      <CardTitle>Explainable Leaderboard</CardTitle>
      <CardDescription className="mt-2">단순 순위가 아니라 점수 분해, 배지, 최근 변화까지 함께 보여줍니다.</CardDescription>
      <div className="mt-6 grid gap-4">
        {rows.length === 0 ? (
          <div className="rounded-[24px] border border-border bg-[#f8f3eb] p-5 text-sm text-muted">아직 리더보드 데이터가 없습니다.</div>
        ) : (
          rows.map((row, index) => (
            <div key={row.teamName} className="rounded-[28px] border border-border bg-[#fdfbf7] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge>#{index + 1}</Badge>
                    {row.badges.map((badge) => (
                      <Badge key={badge}>{badge}</Badge>
                    ))}
                  </div>
                  <h3 className="font-display text-xl font-semibold">{row.teamName}</h3>
                  <p className="mt-2 text-sm text-muted">총점 {row.totalScore}점</p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-medium">
                  {row.delta === "up" ? <ArrowUp className="h-4 w-4 text-success" /> : null}
                  {row.delta === "down" ? <ArrowDown className="h-4 w-4 text-danger" /> : null}
                  {row.delta === "flat" ? <Minus className="h-4 w-4 text-muted" /> : null}
                  {row.delta === "up" ? "상승" : row.delta === "down" ? "하락" : "유지"}
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {row.breakdown.map((item) => (
                  <div key={item.label} className="rounded-[20px] bg-white p-4 text-sm">
                    <p className="text-muted">{item.label}</p>
                    <p className="mt-2 font-display text-2xl font-semibold">{item.score}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
