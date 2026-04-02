export type HackathonStatus = "upcoming" | "live" | "closed";

export type Hackathon = {
  slug: string;
  title: string;
  subtitle: string;
  status: HackathonStatus;
  host: string;
  description: string;
  tags: string[];
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
  role: string;
  techStacks: string[];
  collaborationStyle: string;
  level: "beginner" | "intermediate" | "advanced";
  beginnerFriendly: boolean;
};

export type TeamPost = {
  id: string;
  hackathonSlug: string;
  teamName: string;
  intro: string;
  neededRoles: string[];
  techStacks: string[];
  contactLink: string;
  recruiting: boolean;
  collaborationStyle: string;
  beginnerFriendly: boolean;
};

export type SubmissionDraft = {
  ideaDoc: string;
  demoLink: string;
  repoLink: string;
  fileMeta: string;
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
  period: "weekly" | "all";
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
