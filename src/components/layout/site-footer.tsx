import Link from "next/link";
import { DemoSeedControls } from "@/components/site/demo-seed-controls";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/15 bg-[#121113]/70 py-10 text-white backdrop-blur-xl">
      <div className="container-shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl font-semibold">HackPort</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
            Explore hackathons, match with the right team, submit with confidence, and understand the leaderboard in one connected flow.
          </p>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-wrap gap-6 text-sm text-white/70">
            <Link href="/hackathons">Hackathons</Link>
            <Link href="/camp">Camp</Link>
            <Link href="/rankings">Rankings</Link>
          </div>
          <DemoSeedControls />
        </div>
      </div>
    </footer>
  );
}
