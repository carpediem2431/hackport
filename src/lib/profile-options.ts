export const PROFILE_ROLE_OPTIONS = [
  { value: "Frontend", label: "프론트엔드" },
  { value: "Backend", label: "백엔드" },
  { value: "Fullstack", label: "풀스택" },
  { value: "Designer", label: "디자이너" },
  { value: "PM", label: "PM" },
  { value: "DevOps", label: "DevOps" },
  { value: "Data Scientist", label: "데이터 사이언티스트" },
  { value: "ML Engineer", label: "ML 엔지니어" },
  { value: "QA", label: "QA" },
  { value: "Mobile", label: "모바일" },
] as const;

export const PROFILE_TECH_STACK_OPTIONS = [
  "React", "Next.js", "Vue", "Angular", "TypeScript", "JavaScript",
  "Python", "Java", "Go", "Rust", "Node.js", "Docker", "Kubernetes",
  "AWS", "GCP", "Azure", "OpenAI", "Firebase", "Supabase",
  "PostgreSQL", "MongoDB", "Redis", "GraphQL", "Figma", "Flutter", "Swift", "Kotlin",
] as const;
