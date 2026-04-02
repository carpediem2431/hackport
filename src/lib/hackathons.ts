import { hackathons } from "@/lib/data/hackathons";
import { Hackathon, HackathonStatus } from "@/lib/types";

export function getHackathons(filters?: {
  status?: HackathonStatus | "all";
  tag?: string | "all";
}) {
  return hackathons.filter((item) => {
    const statusMatch = !filters?.status || filters.status === "all" || item.status === filters.status;
    const tagMatch = !filters?.tag || filters.tag === "all" || item.tags.includes(filters.tag);
    return statusMatch && tagMatch;
  });
}

export function getHackathonBySlug(slug: string): Hackathon | undefined {
  return hackathons.find((item) => item.slug === slug);
}

export function getHackathonTags() {
  return Array.from(new Set(hackathons.flatMap((item) => item.tags)));
}
