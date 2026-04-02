import { CampClient } from "@/components/site/camp-client";
import { SectionHeading } from "@/components/ui/section-heading";

export default function CampPage() {
  return (
    <div className="container-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Team Matching"
        title="Camp"
        description="내 프로필을 입력하고 팀과의 적합도를 확인하거나 직접 모집글을 올려 팀 구성을 시작하세요."
      />
      <div className="mt-10">
        <CampClient />
      </div>
    </div>
  );
}
