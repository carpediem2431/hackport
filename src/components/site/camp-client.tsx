"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, HeartHandshake, Plus } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { defaultProfile, storageKeys } from "@/lib/storage";
import { CampProfile, TeamPost } from "@/lib/types";
import { demoTeamPosts, hackathons } from "@/lib/data/hackathons";
import { getTeamFitScore } from "@/lib/camp";

const emptyTeamForm = {
  hackathonSlug: "ai-build-sprint-seoul",
  teamName: "",
  intro: "",
  neededRoles: "",
  techStacks: "",
  contactLink: "",
  collaborationStyle: "fast-feedback",
  beginnerFriendly: true,
};

export function CampClient() {
  const { value: profile, setValue: setProfile, ready: profileReady } = useLocalStorageState<CampProfile>(storageKeys.profile, defaultProfile);
  const { value: storedTeams, setValue: setStoredTeams, ready: teamsReady } = useLocalStorageState<TeamPost[]>(storageKeys.teamPosts, demoTeamPosts);
  const [teamForm, setTeamForm] = useState(emptyTeamForm);

  const teams = storedTeams.length > 0 ? storedTeams : demoTeamPosts;
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => getTeamFitScore(profile, b).score - getTeamFitScore(profile, a).score);
  }, [profile, teams]);

  if (!profileReady || !teamsReady) {
    return <p className="text-sm text-muted">팀 매칭 데이터를 불러오는 중입니다...</p>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardTitle>내 프로필</CardTitle>
        <CardDescription className="mt-2">역할과 협업 성향을 입력하면 팀별 적합도를 계산합니다.</CardDescription>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>
            <Input value={profile.role} onChange={(event) => setProfile({ ...profile, role: event.target.value })} placeholder="frontend / designer / pm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Tech stacks</label>
            <Input
              value={profile.techStacks.join(", ")}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  techStacks: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                })
              }
              placeholder="Next.js, TypeScript, OpenAI"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Collaboration style</label>
            <Input
              value={profile.collaborationStyle}
              onChange={(event) => setProfile({ ...profile, collaborationStyle: event.target.value })}
              placeholder="fast-feedback / structured"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Level</label>
            <div className="flex gap-2">
              {["beginner", "intermediate", "advanced"].map((item) => (
                <button
                  key={item}
                  className={`rounded-full px-4 py-2 text-sm ${profile.level === item ? "bg-foreground text-white" : "bg-white"}`}
                  onClick={() => setProfile({ ...profile, level: item as CampProfile["level"] })}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            className={`rounded-2xl border px-4 py-3 text-left text-sm ${profile.beginnerFriendly ? "border-brand bg-brand-soft/40" : "border-border bg-white"}`}
            onClick={() => setProfile({ ...profile, beginnerFriendly: !profile.beginnerFriendly })}
            type="button"
          >
            Beginner-friendly preferred: {profile.beginnerFriendly ? "Yes" : "No"}
          </button>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="bg-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>모집 중인 팀</CardTitle>
              <CardDescription className="mt-2">적합도가 높은 순서대로 정렬됩니다.</CardDescription>
            </div>
            <div className="rounded-full bg-brand-soft px-4 py-2 text-sm font-medium text-brand-strong">
              {sortedTeams.length} teams
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            {sortedTeams.map((team) => {
              const fit = getTeamFitScore(profile, team);
              return (
                <div key={team.id} className="rounded-[28px] border border-border bg-[#fdf8f0] p-5 transition hover:-translate-y-1">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge>{hackathons.find((item) => item.slug === team.hackathonSlug)?.title ?? team.hackathonSlug}</Badge>
                        <Badge>{team.recruiting ? "Recruiting" : "Closed"}</Badge>
                        {team.beginnerFriendly ? <Badge>Beginner Friendly</Badge> : null}
                      </div>
                      <h3 className="font-display text-xl font-semibold">{team.teamName}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{team.intro}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {team.techStacks.map((stack) => (
                          <Badge key={stack}>{stack}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="min-w-60 rounded-[24px] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">핏 매칭</span>
                        <span className="text-lg font-semibold text-brand-strong">{fit.score}%</span>
                      </div>
                      <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
                        {fit.reasons.map((reason) => (
                          <div key={reason} className="inline-flex items-center gap-2">
                            <HeartHandshake className="h-4 w-4 text-brand-strong" />
                            {reason}
                          </div>
                        ))}
                      </div>
                      <a
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground"
                        href={team.contactLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        연락 링크 열기
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardTitle>새 모집글 작성</CardTitle>
          <CardDescription className="mt-2">작성한 글은 브라우저에 저장되고 목록에 즉시 반영됩니다.</CardDescription>
          <div className="mt-6 grid gap-4">
            <Input placeholder="Team name" value={teamForm.teamName} onChange={(event) => setTeamForm({ ...teamForm, teamName: event.target.value })} />
            <Input
              placeholder="Hackathon slug"
              value={teamForm.hackathonSlug}
              onChange={(event) => setTeamForm({ ...teamForm, hackathonSlug: event.target.value })}
            />
            <Textarea placeholder="팀 소개" value={teamForm.intro} onChange={(event) => setTeamForm({ ...teamForm, intro: event.target.value })} />
            <Input
              placeholder="Needed roles (comma separated)"
              value={teamForm.neededRoles}
              onChange={(event) => setTeamForm({ ...teamForm, neededRoles: event.target.value })}
            />
            <Input
              placeholder="Tech stacks (comma separated)"
              value={teamForm.techStacks}
              onChange={(event) => setTeamForm({ ...teamForm, techStacks: event.target.value })}
            />
            <Input
              placeholder="Contact link"
              value={teamForm.contactLink}
              onChange={(event) => setTeamForm({ ...teamForm, contactLink: event.target.value })}
            />
            <Button
              onClick={() => {
                if (!teamForm.teamName || !teamForm.intro || !teamForm.contactLink) return;
                const nextTeam: TeamPost = {
                  id: `team-${Date.now()}`,
                  hackathonSlug: teamForm.hackathonSlug,
                  teamName: teamForm.teamName,
                  intro: teamForm.intro,
                  neededRoles: teamForm.neededRoles.split(",").map((item) => item.trim()).filter(Boolean),
                  techStacks: teamForm.techStacks.split(",").map((item) => item.trim()).filter(Boolean),
                  contactLink: teamForm.contactLink,
                  recruiting: true,
                  collaborationStyle: teamForm.collaborationStyle,
                  beginnerFriendly: teamForm.beginnerFriendly,
                };
                setStoredTeams([nextTeam, ...teams]);
                setTeamForm(emptyTeamForm);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              모집글 등록
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
