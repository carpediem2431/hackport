import { StateCard } from "@/components/ui/state-card";

export default function Loading() {
  return (
    <div className="container-shell py-16 sm:py-20">
      <StateCard
        loading
        title="HackPort 화면을 준비하고 있습니다"
        description="해커톤 데이터와 로컬 진행 상태를 연결하는 중입니다. 잠시만 기다려 주세요."
      />
    </div>
  );
}
