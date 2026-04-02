import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-strong">404</p>
      <h1 className="mt-4 font-display text-5xl font-semibold">찾을 수 없는 페이지입니다</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        요청한 데이터가 없거나 잘못된 경로로 접근했습니다. 해커톤 목록으로 돌아가 흐름을 다시 이어가세요.
      </p>
      <Link href="/hackathons" className="mt-8">
        <Button>목록으로 돌아가기</Button>
      </Link>
    </div>
  );
}
