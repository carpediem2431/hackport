import { RankingsClient } from "@/components/site/rankings-client";
import { SectionHeading } from "@/components/ui/section-heading";

export default function RankingsPage() {
  return (
    <div className="container-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Leaderboard"
        title="전체 랭킹"
        description="최근 기록과 전체 기록을 오가며 활동 성과와 배지를 한눈에 확인할 수 있습니다."
      />
      <div className="mt-10">
        <RankingsClient />
      </div>
    </div>
  );
}
