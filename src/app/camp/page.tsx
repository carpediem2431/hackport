import { CampClient } from "@/components/site/camp-client";
import { SectionHeading } from "@/components/ui/section-heading";

export default function CampPage() {
  return (
    <div className="container-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="팀 매칭"
        title="캠프"
        description="해커톤과 입문자 환영 조건으로 팀을 골라보고, 직접 모집글을 올려 팀 구성을 시작하세요."
      />
      <div className="mt-10">
        <CampClient />
      </div>
    </div>
  );
}
