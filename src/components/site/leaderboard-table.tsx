"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoLeaderboard } from "@/lib/data/hackathons";
import { Hackathon } from "@/lib/types";
import { StateCard } from "@/components/ui/state-card";

export function LeaderboardTable({ hackathon }: { hackathon: Hackathon }) {
  const [showNonSubmitters, setShowNonSubmitters] = useState(false);
  const rows = useMemo(() => demoLeaderboard.filter((item) => item.hackathonSlug === hackathon.slug), [hackathon.slug]);
  const submittedRows = rows.filter((row) => row.submitted);
  const nonSubmitters = rows.filter((row) => !row.submitted);

  return (
    <Card className="bg-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription className="mt-2">제출 완료 팀만 순위에 포함하고, 미제출 팀은 별도로 표시합니다.</CardDescription>
        </div>
        <button
          type="button"
          className={`rounded-full px-4 py-3 text-sm font-medium ${showNonSubmitters ? "bg-foreground text-white" : "bg-[#f7f3eb] text-muted"}`}
          onClick={() => setShowNonSubmitters((current) => !current)}
        >
          {showNonSubmitters ? "미제출 팀 숨기기" : "미제출 팀 보기"}
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {submittedRows.length === 0 ? (
          <StateCard title="아직 리더보드 데이터가 없습니다" description="제출이 완료되면 점수 분해와 배지가 표시됩니다." />
        ) : (
          submittedRows.map((row, index) => (
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

        {showNonSubmitters && nonSubmitters.length > 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-[#faf7f1] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Badge className="border-danger/20 bg-danger/5 text-danger">미제출</Badge>
              <p className="text-sm text-muted">아래 팀은 참가했지만 최종 제출이 없어 순위 계산에서 제외되었습니다.</p>
            </div>
            <div className="grid gap-3">
              {nonSubmitters.map((row) => (
                <div key={row.teamName} className="rounded-[20px] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{row.teamName}</p>
                      <p className="mt-1 text-sm text-muted">상태: 미제출</p>
                    </div>
                    <Badge className="bg-white">랭킹 제외</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
