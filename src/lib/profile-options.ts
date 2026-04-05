export const PROFILE_ROLE_OPTIONS = [
  { value: "Frontend", label: "Frontend Developer" },
  { value: "Backend", label: "Backend Developer" },
  { value: "Fullstack", label: "Fullstack Developer" },
  { value: "Designer", label: "Designer" },
  { value: "PM", label: "PM" },
  { value: "DevOps", label: "Developer DevOps" },
  { value: "Data Scientist", label: "Data Scientist" },
  { value: "ML Engineer", label: "ML Engineer" },
  { value: "QA", label: "QA" },
  { value: "Mobile", label: "Mobile Developer" },
] as const;

export const PROFILE_TECH_STACK_OPTIONS = [
  "React", "Next.js", "Vue", "Angular", "TypeScript", "JavaScript",
  "Python", "Java", "Go", "Rust", "Node.js", "Docker", "Kubernetes",
  "AWS", "GCP", "Azure", "OpenAI", "Firebase", "Supabase",
  "PostgreSQL", "MongoDB", "Redis", "GraphQL", "Figma", "Flutter", "Swift", "Kotlin",
] as const;
