import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

export function formatDateWithYear(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

export function daysUntil(value: string) {
  const target = new Date(value)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const levelMap: Record<string, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
}

export function translateLevel(level: string) {
  return levelMap[level] ?? level
}

const roleMap: Record<string, string> = {
  Frontend: "프론트엔드",
  Backend: "백엔드",
  Fullstack: "풀스택",
  Designer: "디자이너",
  PM: "PM",
  DevOps: "DevOps",
  "Data Scientist": "데이터 사이언티스트",
  "ML Engineer": "ML 엔지니어",
  QA: "QA",
  Mobile: "모바일",
}

export function translateRole(role: string) {
  return roleMap[role] ?? role
}

const collabStyleMap: Record<string, string> = {
  "fast-feedback": "빠른 피드백",
  structured: "체계적",
  "async-first": "비동기 우선",
  "pair-programming": "페어 프로그래밍",
  "agile-sprint": "애자일 스프린트",
}

export function translateCollabStyle(style: string) {
  return collabStyleMap[style] ?? style
}

export function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
