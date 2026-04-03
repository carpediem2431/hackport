import { HackathonListClient } from "@/components/site/hackathon-list-client";
import { SectionHeading } from "@/components/ui/section-heading";

export default function HackathonsPage() {
  return (
    <div className="container-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="디렉토리"
        title="해커톤 탐색기"
        description="상태와 태그로 빠르게 필터링하고, 원하는 해커톤의 전체 흐름으로 곧바로 들어가세요."
        descriptionClassName="text-foreground/70"
      />
      <div className="mt-10">
        <HackathonListClient />
      </div>
    </div>
  );
}
