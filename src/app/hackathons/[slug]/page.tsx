import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { CopilotPanel } from "@/components/site/copilot-panel";
import { HackathonTeamsPanel } from "@/components/site/hackathon-teams-panel";
import { LeaderboardTable } from "@/components/site/leaderboard-table";
import { SubmissionPanel } from "@/components/site/submission-panel";
import { getHackathonBySlug } from "@/lib/hackathons";
import { formatDate } from "@/lib/utils";

export default async function HackathonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hackathon = getHackathonBySlug(slug);

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="container-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Hackathon Detail"
        title={hackathon.title}
        description={hackathon.description}
        action={
          <div className="flex flex-wrap gap-2">
            <Badge>{hackathon.status}</Badge>
            {hackathon.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        }
      />

      <div className="section-grid mt-10">
        <div className="space-y-6">
          <Card className="bg-white">
            <CardTitle>개요</CardTitle>
            <p className="mt-3 text-lg text-muted">{hackathon.subtitle}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-[#f8f3eb] p-5">
                <p className="text-sm text-muted">Host</p>
                <p className="mt-2 font-medium">{hackathon.host}</p>
              </div>
              <div className="rounded-[24px] bg-[#f8f3eb] p-5">
                <p className="text-sm text-muted">Deadline</p>
                <p className="mt-2 font-medium">{formatDate(hackathon.dates.submissionDeadline)}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <CardTitle>평가 기준</CardTitle>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {hackathon.judging.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-border bg-[#fffaf2] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">{item.label}</h3>
                    <Badge>{item.weight}%</Badge>
                  </div>
                  <CardDescription className="mt-3">{item.description}</CardDescription>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white">
            <CardTitle>일정</CardTitle>
            <div className="mt-6 grid gap-4">
              {hackathon.schedule.map((item) => (
                <div key={item.title} className="flex flex-col gap-1 rounded-[24px] border border-border bg-[#fffaf4] p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.detail}</p>
                  </div>
                  <Badge>{formatDate(item.date)}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white">
            <CardTitle>Prize</CardTitle>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {hackathon.prizes.map((item) => (
                <div key={item.title} className="rounded-[24px] border border-border bg-[#fffaf2] p-5">
                  <p className="text-sm text-muted">{item.title}</p>
                  <p className="mt-2 font-display text-2xl font-semibold">{item.reward}</p>
                  <CardDescription className="mt-3">{item.description}</CardDescription>
                </div>
              ))}
            </div>
          </Card>

          <HackathonTeamsPanel hackathon={hackathon} />

          <SubmissionPanel hackathon={hackathon} />
          <LeaderboardTable hackathon={hackathon} />
        </div>

        <CopilotPanel hackathon={hackathon} />
      </div>
    </div>
  );
}
