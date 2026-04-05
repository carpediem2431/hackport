import { HackathonListClient } from "@/components/site/hackathon-list-client";
import { SectionHeading } from "@/components/ui/section-heading";

export default function HackathonsPage() {
  return (
    <div className="container-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="해커톤"
        title="해커톤 탐색"
        description="상태와 태그로 필터링 하고, 원하는 해커톤에 바로 참여해보세요."
        descriptionClassName="text-foreground/70"
      />
      <div className="mt-10">
        <HackathonListClient />
      </div>
    </div>
  );
}
