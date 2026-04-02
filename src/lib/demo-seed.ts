"use client";

import { demoTeamInvites, demoTeamPosts } from "@/lib/data/hackathons";
import { defaultProfile, defaultTeamInvites, loadStorage, saveStorage, storageKeys } from "@/lib/storage";
import { TeamInvite } from "@/lib/types";

const demoSnapshot = {
  [storageKeys.profile]: defaultProfile,
  [storageKeys.teamPosts]: demoTeamPosts,
  [storageKeys.teamInvites]: demoTeamInvites,
  [storageKeys.progress]: {},
  [storageKeys.submissions]: {},
};

export function ensureDemoSeed() {
  if (typeof window === "undefined") return;

  Object.entries(demoSnapshot).forEach(([key, value]) => {
    const current = window.localStorage.getItem(key);
    if (current === null) {
      saveStorage(key, value);
    }
  });
}

export function restoreDemoSnapshot() {
  if (typeof window === "undefined") return;

  Object.entries(demoSnapshot).forEach(([key, value]) => {
    saveStorage(key, value);
  });
}

export function resetUserProgressOnly() {
  if (typeof window === "undefined") return;

  saveStorage(storageKeys.profile, defaultProfile);
  saveStorage(storageKeys.progress, {});
  saveStorage(storageKeys.submissions, {});
  saveStorage<TeamInvite[]>(storageKeys.teamInvites, loadStorage(storageKeys.teamInvites, defaultTeamInvites).filter((invite) => invite.status === "pending"));
}
