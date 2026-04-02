"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Info, X } from "lucide-react";
import { AppDialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useHackathonProgress } from "@/hooks/use-hackathon-progress";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { defaultTeamInvites, storageKeys } from "@/lib/storage";
import { Hackathon, TeamInvite, TeamPost } from "@/lib/types";
import { StateCard } from "@/components/ui/state-card";

export function HackathonTeamsPanel({ hackathon }: { hackathon: Hackathon }) {
  const { value: teamPosts, ready: teamsReady } = useLocalStorageState<TeamPost[]>(storageKeys.teamPosts, []);
  const { value: invites, setValue: setInvites, ready: invitesReady } = useLocalStorageState<TeamInvite[]>(storageKeys.teamInvites, defaultTeamInvites);
  const { progress, updateProgress } = useHackathonProgress(hackathon.slug);
  const [guideOpen, setGuideOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestNote, setRequestNote] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const teams = useMemo(() => teamPosts.filter((team) => team.hackathonSlug === hackathon.slug), [hackathon.slug, teamPosts]);
  const ownedTeams = teams.filter((team) => team.ownerId === "local-user");
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  if (!teamsReady || !invitesReady) {
    return <StateCard loading title="팀 데이터를 불러오는 중입니다" description="초대, 수락, 모집 상태를 로컬 저장소와 동기화하고 있습니다." />;
  }

  const handleInviteStatus = (inviteId: string, status: TeamInvite["status"]) => {
    setInvites(invites.map((invite) => (invite.id === inviteId ? { ...invite, status } : invite)));
    if (status === "accepted") {
      updateProgress({
        viewedSections: progress?.viewedSections ?? [],
        hasTeam: true,
        hasDraft: progress?.hasDraft ?? false,
        isSubmitted: progress?.isSubmitted ?? false,
        checklistState: progress?.checklistState ?? {},
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleSendRequest = () => {
    if (!selectedTeam || !requestNote.trim()) return;

    const nextInvite: TeamInvite = {
      id: `invite-${Date.now()}`,
      teamId: selectedTeam.id,
      hackathonSlug: hackathon.slug,
      senderName: "Local Builder",
      note: requestNote.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setInvites([nextInvite, ...invites]);
    setRequestNote("");
    setRequestOpen(false);
  };

  return (
    <Card className="bg-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Teams</CardTitle>
          <CardDescription className="mt-2">해당 해커톤 팀을 확인하고, 참여 요청을 보내거나 내가 관리하는 팀의 초대를 수락/거절하세요.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setGuideOpen(true)}>
            <Info className="mr-2 h-4 w-4" />
            팀 가이드
          </Button>
          <Link href={`/camp?hackathon=${hackathon.slug}`}>
            <Button size="sm">
              Camp에서 보기
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {teams.length === 0 ? (
          <StateCard title="등록된 팀이 아직 없습니다" description="Camp에서 첫 모집글을 만들고 이 해커톤의 팀 흐름을 시작해 보세요." />
        ) : (
          teams.map((team) => {
            const teamInvites = invites.filter((invite) => invite.teamId === team.id);

            return (
              <div key={team.id} className="rounded-[28px] border border-border bg-[#fdf8f0] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge>{team.isOpen ? "모집중" : "마감"}</Badge>
                      {team.ownerId === "local-user" ? <Badge className="bg-brand-soft text-brand-strong">내가 관리 중</Badge> : null}
                      {team.beginnerFriendly ? <Badge>Beginner Friendly</Badge> : null}
                    </div>
                    <h3 className="font-display text-xl font-semibold">{team.teamName}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{team.intro}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {team.lookingFor.map((item) => (
                        <Badge key={item}>{item}</Badge>
                      ))}
                      {team.techStacks.map((stack) => (
                        <Badge key={stack} className="bg-white">
                          {stack}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="min-w-72 space-y-3">
                    <a href={team.contactUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      연락 링크 열기
                      <ArrowUpRight className="h-4 w-4" />
                    </a>

                    {team.ownerId !== "local-user" && team.isOpen ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTeamId(team.id);
                          setRequestOpen(true);
                        }}
                      >
                        참여 요청 보내기
                      </Button>
                    ) : null}

                    {team.ownerId === "local-user" ? (
                      <div className="rounded-[20px] border border-border bg-white p-4">
                        <p className="text-sm font-medium">도착한 요청</p>
                        <div className="mt-3 grid gap-3 text-sm">
                          {teamInvites.length === 0 ? (
                            <p className="text-muted">아직 도착한 요청이 없습니다.</p>
                          ) : (
                            teamInvites.map((invite) => (
                              <div key={invite.id} className="rounded-[18px] bg-[#f8f3eb] p-3">
                                <p className="font-medium">{invite.senderName}</p>
                                <p className="mt-1 text-muted">{invite.note}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Badge>{invite.status}</Badge>
                                  {invite.status === "pending" ? (
                                    <>
                                      <Button size="sm" variant="secondary" onClick={() => handleInviteStatus(invite.id, "accepted")}>
                                        <Check className="mr-2 h-4 w-4" />수락
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => handleInviteStatus(invite.id, "rejected")}>
                                        <X className="mr-2 h-4 w-4" />거절
                                      </Button>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {ownedTeams.length > 0 ? (
          <div className="rounded-[24px] border border-border bg-[#f8f3eb] p-5 text-sm text-muted">
            내 팀이 수락한 요청은 로컬 진행 상태에도 즉시 반영되어 Copilot의 팀 구성 단계가 완료 처리됩니다.
          </div>
        ) : null}
      </div>

      <AppDialog
        open={guideOpen}
        onOpenChange={setGuideOpen}
        title="팀 가이드"
        description="Camp와 상세 페이지를 오가며 팀 모집과 초대 상태를 같은 로컬 데이터로 관리합니다."
      >
        <div className="space-y-4 text-sm leading-6 text-white/75">
          <p>1. 상세 페이지에서 모집중 팀과 초대 상태를 빠르게 확인합니다.</p>
          <p>2. Camp에서 해커톤별 필터로 팀을 관리하고 모집글을 수정하거나 닫습니다.</p>
          <p>3. 초대 요청을 수락하면 Copilot 준비도에 팀 구성 완료가 바로 반영됩니다.</p>
        </div>
      </AppDialog>

      <AppDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        title="팀 참여 요청 보내기"
        description="메모를 남기면 로컬 저장소에 요청이 기록되고 해당 팀 카드에서 상태를 확인할 수 있습니다."
      >
        <div className="space-y-4">
          <Textarea placeholder="어떤 역할로 기여할 수 있는지 간단히 적어 주세요." value={requestNote} onChange={(event) => setRequestNote(event.target.value)} />
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSendRequest}>요청 보내기</Button>
            <Button variant="secondary" onClick={() => setRequestOpen(false)}>
              닫기
            </Button>
          </div>
        </div>
      </AppDialog>
    </Card>
  );
}
