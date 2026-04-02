"use client";

import { useMemo, useState } from "react";
import { Flame, Medal, TrendingUp } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { globalRankings } from "@/lib/data/hackathons";

export function RankingsClient() {
  const [period, setPeriod] = useState<"weekly" | "all">("weekly");
  const rows = useMemo(() => globalRankings.filter((item) => item.period === period), [period]);

  return (
    <div className="space-y-6">
      <Card className="glass-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Global Rankings</CardTitle>
          <CardDescription className="mt-2">기간별 성과, 배지, 상승 추세를 함께 확인합니다.</CardDescription>
        </div>
        <div className="flex gap-2">
          {(["weekly", "all"] as const).map((item) => (
            <button
              key={item}
              className={`rounded-full px-4 py-3 text-sm font-medium ${period === item ? "bg-foreground text-white" : "bg-white text-muted"}`}
              onClick={() => setPeriod(item)}
              type="button"
            >
              {item === "weekly" ? "최근 기록" : "전체 기록"}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4">
        {rows.map((row, index) => (
          <Card key={`${row.nickname}-${row.period}`} className="bg-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge>#{index + 1}</Badge>
                  {row.badges.map((badge) => (
                    <Badge key={badge}>{badge}</Badge>
                  ))}
                </div>
                <CardTitle>{row.nickname}</CardTitle>
                <CardDescription className="mt-2">{row.points} pts</CardDescription>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-brand-strong">
                  <Medal className="h-4 w-4" />
                  배지 {row.badges.length}개
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#edf6f3] px-4 py-2 text-teal">
                  {row.trend === "hot" ? <Flame className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  {row.trend}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
