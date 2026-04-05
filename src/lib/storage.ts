"use client";

import { CampProfile, SubmissionDraft, TeamInvite } from "@/lib/types";

export const storageKeys = {
  progress: "hackport.progress",
  profile: "hackport.profile",
  teamPosts: "hackport.team-posts",
  submissions: "hackport.submissions",
  teamInvites: "hackport.team-invites",
  leaderboard: "hackport.leaderboard",
  users: "hackport.users",
  currentUser: "hackport.current-user",
  profileImage: "hackport.profile-image",
} as const;

export const defaultProfile: CampProfile = {
  nickname: "로컬 빌더",
  role: "Frontend Developer",
  techStacks: ["Next.js", "TypeScript"],
  collaborationStyle: "빠른 피드백",
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
  const serialized = JSON.stringify(value);

  if (window.localStorage.getItem(key) === serialized) {
    return;
  }

  window.localStorage.setItem(key, serialized);
  window.dispatchEvent(new Event("storage-sync"));
}
