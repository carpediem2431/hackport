"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarRange, ChevronRight, Sparkles, Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/react-bits/fade-in";
import { StateCard } from "@/components/ui/state-card";
import { getHackathons, getHackathonTags } from "@/lib/hackathons";
import { formatDate, formatDateWithYear } from "@/lib/utils";

const statusLabelMap = {
  all: "전체",
  upcoming: "예정",
  live: "진행 중",
  closed: "마감",
} as const;

const statusOptions = ["all", "upcoming", "live", "closed"] as const;

export function HackathonListClient() {
  const [status, setStatus] = useState<"all" | "upcoming" | "live" | "closed">("all");
  const [tag, setTag] = useState("all");
  const [query, setQuery] = useState("");

  const tags = useMemo(() => ["all", ...getHackathonTags()], []);
  const items = useMemo(() => {
    return getHackathons({ status, tag }).filter((item) => {
      const value = `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
      return value.includes(query.toLowerCase());
    });
  }, [query, status, tag]);

  return (
    <div className="space-y-8">
      <Card className="glass-panel p-4">
        <div className="grid gap-4 grid-cols-1">
          <Input placeholder="해커톤 제목, 태그, 키워드 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option}
                className={`rounded-full px-4 py-3 text-sm font-medium ${status === option ? "bg-foreground text-white" : "bg-white text-foreground"}`}
                onClick={() => setStatus(option as typeof status)}
                type="button"
              >
                {statusLabelMap[option] ?? option}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((option) => (
              <button
                key={option}
                className={`rounded-full px-4 py-3 text-sm font-medium ${tag === option ? "bg-brand text-white" : "bg-white text-foreground"}`}
                onClick={() => setTag(option)}
                type="button"
              >
                {option === "all" ? "전체" : option}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-5">
        {items.length === 0 ? (
          <StateCard
            title="표시할 해커톤이 없습니다"
            description="필터를 조정하거나 검색어를 변경해 보세요."
            descriptionClassName="text-foreground"
          />
        ) : (
          items.map((item, index) => (
            <FadeIn key={item.slug} delay={index * 0.05}>
              <Card className="group overflow-hidden bg-white p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge>{statusLabelMap[item.status]}</Badge>
                      {item.tags.map((tagItem) => (
                        <Badge key={tagItem}>{tagItem}</Badge>
                      ))}
                    </div>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <p className="mt-2 text-base text-foreground">{item.subtitle}</p>
                    <CardDescription className="mt-4 text-base text-foreground">{item.description}</CardDescription>
                    <div className="mt-6 grid gap-3 text-sm text-foreground md:grid-cols-2 xl:grid-cols-3">
                      <span className="inline-flex items-center gap-2">
                        <CalendarRange className="h-4 w-4" />
                        시작 {formatDateWithYear(item.dates.kickoff)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarRange className="h-4 w-4" />
                        마감 {formatDateWithYear(item.dates.submissionDeadline)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        {item.host}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Users2 className="h-4 w-4" />
                        참가자 {item.participantCount}명
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-4 lg:min-w-56 lg:items-end">
                    <div className="rounded-[24px] bg-[#f8f3eb] p-4 text-sm text-foreground">
                      <p className="font-medium text-foreground">핵심 포인트</p>
                      <p className="mt-2">{item.submissionRules.required.length}개 필수 제출 항목</p>
                      <p className="mt-2">접수 기간 {formatDate(item.dates.registrationOpen)} - {formatDate(item.dates.registrationClose)}</p>
                    </div>
                    <Link href={`/hackathons/${item.slug}`}>
                      <Button className="group-hover:translate-x-1">
                        상세 보기
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </FadeIn>
          ))
        )}
      </div>
    </div>
  );
}
