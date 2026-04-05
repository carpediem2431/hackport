import Link from "next/link";
import { DemoSeedControls } from "@/components/site/demo-seed-controls";

export function SiteFooter() {
  return (
    <footer className="mt-36 border-t border-white/15 bg-[#121113]/70 py-10 text-white backdrop-blur-xl">
      <div className="container-shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl font-semibold">HackPort</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
            해커톤 탐색부터 팀 매칭, 제출 준비, 리더보드 해석까지 하나의 연결된 흐름으로 경험하세요.
          </p>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-wrap gap-6 text-sm text-white/70">
            <Link href="/hackathons">해커톤</Link>
            <Link href="/camp">캠프</Link>
            <Link href="/rankings">랭킹</Link>
          </div>
          <DemoSeedControls />
        </div>
      </div>
    </footer>
  );
}
