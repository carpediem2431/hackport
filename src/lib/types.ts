export type HackathonStatus = "upcoming" | "live" | "closed";

export type PrizeTier = {
  title: string;
  reward: string;
  description: string;
};

export type Hackathon = {
  slug: string;
  title: string;
  subtitle: string;
  status: HackathonStatus;
  host: string;
  description: string;
  tags: string[];
  participantCount: number;
  dates: {
    registrationOpen: string;
    registrationClose: string;
    kickoff: string;
    submissionDeadline: string;
    results: string;
  };
  judging: {
    label: string;
    weight: number;
    description: string;
  }[];
  schedule: {
    title: string;
    date: string;
    detail: string;
  }[];
  prizes: PrizeTier[];
  submissionRules: {
    required: string[];
    optional: string[];
    acceptedFormats: string[];
  };
};

export type UserProgress = {
  viewedSections: string[];
  hasTeam: boolean;
  hasDraft: boolean;
  isSubmitted: boolean;
  checklistState: Record<string, boolean>;
  updatedAt: string;
};

export type CampProfile = {
  nickname: string;
  role: string;
  techStacks: string[];
  collaborationStyle: string;
  level: "beginner" | "intermediate" | "advanced";
  beginnerFriendly: boolean;
};

export type TeamMessage = {
  id: string;
  sender: "me" | "team";
  body: string;
  createdAt: string;
};

export type TeamInvite = {
  id: string;
  teamId: string;
  hackathonSlug: string;
  senderName: string;
  note: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

export type TeamPost = {
  id: string;
  hackathonSlug: string;
  teamName: string;
  intro: string;
  lookingFor: string[];
  techStacks: string[];
  contactUrl: string;
  isOpen: boolean;
  collaborationStyle: string;
  beginnerFriendly: boolean;
  ownerId: "demo" | "local-user";
  messages: TeamMessage[];
  updatedAt: string;
};

export type SubmissionFile = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
};

export type SubmissionDraft = {
  notes: string;
  demoLink: string;
  repoLink: string;
  fileMeta: string;
  uploadedFile: SubmissionFile | null;
  privateMemo: string;
  publicSummary: string;
  submittedAt: string | null;
};

export type LeaderboardEntry = {
  hackathonSlug: string;
  teamName: string;
  totalScore: number;
  breakdown: {
    label: string;
    score: number;
  }[];
  badges: string[];
  delta: "up" | "down" | "flat";
  submitted: boolean;
};

export type GlobalRankingEntry = {
  nickname: string;
  points: number;
  badges: string[];
  trend: "hot" | "steady" | "rising";
  period: "7d" | "30d" | "all";
};

export type CopilotState = {
  readiness: number;
  remainingDays: number;
  completed: string[];
  pending: string[];
  nextAction: string;
  highlight: string;
};

export type SubmissionValidation = {
  isValid: boolean;
  issues: string[];
};

export type AuthUser = {
  email: string;
  password: string;
  nickname: string;
  role: string;
  techStacks: string[];
  collaborationStyle: string;
  level: "beginner" | "intermediate" | "advanced";
  createdAt: string;
};
