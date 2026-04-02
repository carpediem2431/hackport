"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, HeartHandshake, MessageSquare, Pencil, Plus, Save, Send, UsersRound } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppDialog } from "@/components/ui/dialog";
import { StateCard } from "@/components/ui/state-card";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { defaultProfile, defaultTeamInvites, storageKeys } from "@/lib/storage";
import { CampProfile, TeamInvite, TeamMessage, TeamPost } from "@/lib/types";
import { demoTeamPosts, hackathons } from "@/lib/data/hackathons";
import { getTeamFitScore } from "@/lib/camp";

const emptyTeamForm = {
  hackathonSlug: "ai-build-sprint-seoul",
  teamName: "",
  intro: "",
  lookingFor: "",
  techStacks: "",
  contactUrl: "",
  isOpen: true,
  collaborationStyle: "fast-feedback",
  beginnerFriendly: true,
};

export function CampClient() {
  const searchParams = useSearchParams();
  const initialHackathonParam = searchParams.get("hackathon");
  const initialHackathon = initialHackathonParam && hackathons.some((item) => item.slug === initialHackathonParam) ? initialHackathonParam : "all";
  const { value: profile, setValue: setProfile, ready: profileReady } = useLocalStorageState<CampProfile>(storageKeys.profile, defaultProfile);
  const { value: storedTeams, setValue: setStoredTeams, ready: teamsReady } = useLocalStorageState<TeamPost[]>(storageKeys.teamPosts, demoTeamPosts);
  const { value: invites, ready: invitesReady } = useLocalStorageState<TeamInvite[]>(storageKeys.teamInvites, defaultTeamInvites);
  const [selectedHackathon, setSelectedHackathon] = useState(initialHackathon);
  const [teamForm, setTeamForm] = useState(emptyTeamForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [messageTeamId, setMessageTeamId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [teamFormError, setTeamFormError] = useState<string | null>(null);

  const teams = storedTeams.length > 0 ? storedTeams : demoTeamPosts;
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => selectedHackathon === "all" || team.hackathonSlug === selectedHackathon);
  }, [selectedHackathon, teams]);

  const sortedTeams = useMemo(() => {
    return [...filteredTeams].sort((a, b) => getTeamFitScore(profile, b).score - getTeamFitScore(profile, a).score);
  }, [filteredTeams, profile]);

  const selectedMessageTeam = teams.find((team) => team.id === messageTeamId);

  if (!profileReady || !teamsReady || !invitesReady) {
    return <StateCard loading title="팀 매칭 데이터를 불러오는 중입니다" description="프로필, 모집글, 메시지, 초대 상태를 로컬 저장소와 동기화하고 있습니다." />;
  }

  const upsertTeam = () => {
    if (!teamForm.teamName || !teamForm.intro || !teamForm.contactUrl) {
      setTeamFormError("teamName, intro, contactUrl은 모두 입력해야 합니다.");
      return;
    }

    try {
      const url = new URL(teamForm.contactUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        setTeamFormError("contactUrl은 http 또는 https 링크여야 합니다.");
        return;
      }
    } catch {
      setTeamFormError("contactUrl 형식이 올바르지 않습니다.");
      return;
    }

    const nextTeam: TeamPost = {
      id: editingId ?? `team-${Date.now()}`,
      hackathonSlug: teamForm.hackathonSlug,
      teamName: teamForm.teamName,
      intro: teamForm.intro,
      lookingFor: teamForm.lookingFor.split(",").map((item) => item.trim()).filter(Boolean),
      techStacks: teamForm.techStacks.split(",").map((item) => item.trim()).filter(Boolean),
      contactUrl: teamForm.contactUrl,
      isOpen: teamForm.isOpen,
      collaborationStyle: teamForm.collaborationStyle,
      beginnerFriendly: teamForm.beginnerFriendly,
      ownerId: "local-user",
      messages: editingId ? teams.find((team) => team.id === editingId)?.messages ?? [] : [],
      updatedAt: new Date().toISOString(),
    };

    const nextTeams = editingId ? teams.map((team) => (team.id === editingId ? nextTeam : team)) : [nextTeam, ...teams];
    setStoredTeams(nextTeams);
    setTeamForm(emptyTeamForm);
    setEditingId(null);
    setTeamFormError(null);
  };

  const toggleTeamOpen = (teamId: string) => {
    setStoredTeams(
      teams.map((team) =>
        team.id === teamId ? { ...team, isOpen: !team.isOpen, updatedAt: new Date().toISOString() } : team,
      ),
    );
  };

  const startEdit = (team: TeamPost) => {
    setEditingId(team.id);
    setTeamForm({
      hackathonSlug: team.hackathonSlug,
      teamName: team.teamName,
      intro: team.intro,
      lookingFor: team.lookingFor.join(", "),
      techStacks: team.techStacks.join(", "),
      contactUrl: team.contactUrl,
      isOpen: team.isOpen,
      collaborationStyle: team.collaborationStyle,
      beginnerFriendly: team.beginnerFriendly,
    });
  };

  const sendMessage = () => {
    if (!selectedMessageTeam || !messageText.trim()) return;

    const nextTeams: TeamPost[] = teams.map((team) => {
      if (team.id !== selectedMessageTeam.id) return team;

      const outgoingMessage: TeamMessage = {
        id: `msg-${Date.now()}`,
        sender: "me",
        body: messageText.trim(),
        createdAt: new Date().toISOString(),
      };

      const autoReply: TeamMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "team",
        body: `${team.teamName} 팀이 메시지를 확인했습니다. 연락 링크 또는 초대 상태를 함께 확인해 주세요.`,
        createdAt: new Date().toISOString(),
      };

      return {
        ...team,
        messages: [...team.messages, outgoingMessage, autoReply],
        updatedAt: new Date().toISOString(),
      };
    });

    setStoredTeams(nextTeams);
    setMessageText("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardTitle>내 프로필</CardTitle>
        <CardDescription className="mt-2">역할과 협업 성향을 입력하면 팀별 적합도를 계산합니다.</CardDescription>
        <div className="mt-6 grid gap-4">
          <div>
            <p className="mb-2 text-sm font-medium">Nickname</p>
            <Input value={profile.nickname} onChange={(event) => setProfile({ ...profile, nickname: event.target.value })} placeholder="Local Builder" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Role</p>
            <Input value={profile.role} onChange={(event) => setProfile({ ...profile, role: event.target.value })} placeholder="frontend / designer / pm" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Tech stacks</p>
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
            <p className="mb-2 text-sm font-medium">Collaboration style</p>
            <Input
              value={profile.collaborationStyle}
              onChange={(event) => setProfile({ ...profile, collaborationStyle: event.target.value })}
              placeholder="fast-feedback / structured"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Level</p>
            <div className="flex gap-2">
              {[
                "beginner",
                "intermediate",
                "advanced",
              ].map((item) => (
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>모집 중인 팀</CardTitle>
              <CardDescription className="mt-2">해커톤 필터, 1:1 메시지, 수정/모집 종료 기능을 같은 로컬 데이터로 관리합니다.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-full px-4 py-3 text-sm font-medium ${selectedHackathon === "all" ? "bg-foreground text-white" : "bg-[#f8f3eb] text-muted"}`}
                onClick={() => setSelectedHackathon("all")}
              >
                전체 해커톤
              </button>
              {hackathons.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className={`rounded-full px-4 py-3 text-sm font-medium ${selectedHackathon === item.slug ? "bg-brand text-white" : "bg-[#f8f3eb] text-muted"}`}
                  onClick={() => setSelectedHackathon(item.slug)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {sortedTeams.map((team) => {
              const fit = getTeamFitScore(profile, team);
              const inviteCount = invites.filter((invite) => invite.teamId === team.id && invite.status === "pending").length;

              return (
                <div key={team.id} className="rounded-[28px] border border-border bg-[#fdf8f0] p-5 transition hover:-translate-y-1">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge>{hackathons.find((item) => item.slug === team.hackathonSlug)?.title ?? team.hackathonSlug}</Badge>
                        <Badge>{team.isOpen ? "Recruiting" : "Closed"}</Badge>
                        {team.beginnerFriendly ? <Badge>Beginner Friendly</Badge> : null}
                        {team.ownerId === "local-user" ? <Badge className="bg-brand-soft text-brand-strong">내 모집글</Badge> : null}
                      </div>
                      <h3 className="font-display text-xl font-semibold">{team.teamName}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{team.intro}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {team.lookingFor.map((role) => (
                          <Badge key={role}>{role}</Badge>
                        ))}
                        {team.techStacks.map((stack) => (
                          <Badge key={stack} className="bg-white">{stack}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="min-w-72 rounded-[24px] bg-white p-4">
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
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a className="inline-flex items-center gap-2 text-sm font-semibold text-foreground" href={team.contactUrl} target="_blank" rel="noreferrer">
                          연락 링크
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                        <Button size="sm" variant="outline" onClick={() => setMessageTeamId(team.id)}>
                          <MessageSquare className="mr-2 h-4 w-4" />메시지
                        </Button>
                        {team.ownerId === "local-user" ? (
                          <>
                            <Button size="sm" variant="secondary" onClick={() => startEdit(team)}>
                              <Pencil className="mr-2 h-4 w-4" />수정
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toggleTeamOpen(team.id)}>
                              <UsersRound className="mr-2 h-4 w-4" />{team.isOpen ? "모집 마감" : "다시 모집"}
                            </Button>
                            <Badge>{inviteCount} pending invite</Badge>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardTitle>{editingId ? "모집글 수정" : "새 모집글 작성"}</CardTitle>
          <CardDescription className="mt-2">teamName, intro, isOpen, lookingFor, contactUrl 기준으로 저장되며 Camp와 상세 페이지에 즉시 반영됩니다.</CardDescription>
          <div className="mt-6 grid gap-4">
            {teamFormError ? <div className="rounded-[20px] border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{teamFormError}</div> : null}
            <Input placeholder="teamName" value={teamForm.teamName} onChange={(event) => setTeamForm({ ...teamForm, teamName: event.target.value })} />
            <Input placeholder="hackathonSlug" value={teamForm.hackathonSlug} onChange={(event) => setTeamForm({ ...teamForm, hackathonSlug: event.target.value })} />
            <Textarea placeholder="intro" value={teamForm.intro} onChange={(event) => setTeamForm({ ...teamForm, intro: event.target.value })} />
            <Input placeholder="lookingFor (comma separated)" value={teamForm.lookingFor} onChange={(event) => setTeamForm({ ...teamForm, lookingFor: event.target.value })} />
            <Input placeholder="techStacks (comma separated)" value={teamForm.techStacks} onChange={(event) => setTeamForm({ ...teamForm, techStacks: event.target.value })} />
            <Input placeholder="contactUrl" value={teamForm.contactUrl} onChange={(event) => setTeamForm({ ...teamForm, contactUrl: event.target.value })} />
            <button
              type="button"
              className={`rounded-2xl border px-4 py-3 text-left text-sm ${teamForm.isOpen ? "border-brand bg-brand-soft/40" : "border-border bg-white"}`}
              onClick={() => setTeamForm({ ...teamForm, isOpen: !teamForm.isOpen })}
            >
              isOpen: {teamForm.isOpen ? "true" : "false"}
            </button>
            <Button onClick={upsertTeam}>
              {editingId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {editingId ? "모집글 저장" : "모집글 등록"}
            </Button>
          </div>
        </Card>
      </div>

      <AppDialog
        open={Boolean(selectedMessageTeam)}
        onOpenChange={(open) => {
          if (!open) {
            setMessageTeamId(null);
            setMessageText("");
          }
        }}
        title={selectedMessageTeam ? `${selectedMessageTeam.teamName} 메시지` : "메시지"}
        description="브라우저 안에서 1:1 메시지 스레드를 유지합니다. 데모용으로 자동 응답도 함께 저장됩니다."
      >
        <div className="space-y-4">
          <div className="max-h-72 space-y-3 overflow-y-auto rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            {selectedMessageTeam?.messages.map((message) => (
              <div key={message.id} className={`rounded-[18px] px-4 py-3 ${message.sender === "me" ? "bg-brand/25" : "bg-white/10"}`}>
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{message.sender === "me" ? "me" : "team"}</p>
                <p className="mt-2 leading-6">{message.body}</p>
              </div>
            ))}
          </div>
          <Textarea placeholder="메시지를 입력하세요" value={messageText} onChange={(event) => setMessageText(event.target.value)} />
          <div className="flex flex-wrap gap-3">
            <Button onClick={sendMessage}>
              <Send className="mr-2 h-4 w-4" />메시지 보내기
            </Button>
            <Button variant="secondary" onClick={() => setMessageTeamId(null)}>
              닫기
            </Button>
          </div>
        </div>
      </AppDialog>
    </div>
  );
}
