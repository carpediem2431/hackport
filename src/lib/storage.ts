"use client";

import { CampProfile, SubmissionDraft, TeamInvite } from "@/lib/types";

export const storageKeys = {
  progress: "hackport.progress",
  profile: "hackport.profile",
  teamPosts: "hackport.team-posts",
  submissions: "hackport.submissions",
  teamInvites: "hackport.team-invites",
} as const;

export const defaultProfile: CampProfile = {
  nickname: "Local Builder",
  role: "frontend",
  techStacks: ["Next.js", "TypeScript"],
  collaborationStyle: "fast-feedback",
  level: "intermediate",
  beginnerFriendly: true,
};

export const emptySubmission: SubmissionDraft = {
  notes: "",
  demoLink: "",
  repoLink: "",
  fileMeta: "",
  uploadedFile: null,
  privateMemo: "",
  publicSummary: "",
  submittedAt: null,
};

export const defaultTeamInvites: TeamInvite[] = [];

export function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("storage-sync"));
}
