"use client";

import { useMemo, useState } from "react";
import { Flame, Medal, TrendingUp } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { globalRankings } from "@/lib/data/hackathons";

export function RankingsClient() {
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");
  const rows = useMemo(() => globalRankings.filter((item) => item.period === period), [period]);

  return (
    <div className="space-y-6">
      <Card className="glass-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Global Rankings</CardTitle>
          <CardDescription className="mt-2">7일, 30일, 전체 기간 기준으로 Rank / Nickname / Points를 비교합니다.</CardDescription>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "all"] as const).map((item) => (
            <button
              key={item}
              className={`rounded-full px-4 py-3 text-sm font-medium ${period === item ? "bg-foreground text-white" : "bg-white text-muted"}`}
              onClick={() => setPeriod(item)}
              type="button"
            >
              {item === "7d" ? "최근 7일" : item === "30d" ? "최근 30일" : "전체"}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden bg-white p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f7f3eb] text-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Rank</th>
                <th className="px-6 py-4 font-medium">Nickname</th>
                <th className="px-6 py-4 font-medium">Points</th>
                <th className="px-6 py-4 font-medium">Badges</th>
                <th className="px-6 py-4 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.nickname}-${row.period}`} className="border-t border-border align-top">
                  <td className="px-6 py-5">
                    <Badge>#{index + 1}</Badge>
                  </td>
                  <td className="px-6 py-5">
                    <CardTitle className="text-lg">{row.nickname}</CardTitle>
                  </td>
                  <td className="px-6 py-5 font-semibold">{row.points}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {row.badges.map((badge) => (
                        <Badge key={badge} className="bg-brand-soft text-brand-strong">
                          <Medal className="mr-1 h-3 w-3" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#edf6f3] px-4 py-2 text-teal">
                      {row.trend === "hot" ? <Flame className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                      {row.trend}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
