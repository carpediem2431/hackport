import { SubmissionDraft, SubmissionValidation } from "@/lib/types";

export function validateSubmission(
  draft: SubmissionDraft,
  rules: { required: string[]; acceptedFormats: string[] },
): SubmissionValidation {
  const issues: string[] = [];

  if (!draft.publicSummary.trim()) issues.push("공개용 요약을 입력해 주세요.");

  if (!draft.demoLink.trim()) issues.push("데모 링크를 입력해 주세요.");
  else if (!isLikelyUrl(draft.demoLink)) issues.push("데모 링크 형식이 올바르지 않습니다.");

  if (!draft.repoLink.trim()) issues.push("레포지토리 링크를 입력해 주세요.");
  else if (!isLikelyUrl(draft.repoLink)) issues.push("레포지토리 링크 형식이 올바르지 않습니다.");

  if (draft.uploadedFile) {
    const extension = draft.uploadedFile.name.split(".").pop()?.toUpperCase() ?? "";
    const acceptedExtensions = rules.acceptedFormats.filter((format) => format !== "URL");

    if (acceptedExtensions.length > 0 && !acceptedExtensions.includes(extension)) {
      issues.push(`업로드 파일은 허용 형식(${acceptedExtensions.join(", ")}) 중 하나여야 합니다.`);
    }
  }

  if (draft.fileMeta && !draft.uploadedFile && !rules.acceptedFormats.some((format) => draft.fileMeta.toUpperCase().includes(format))) {
    issues.push(`파일 정보에는 허용 형식(${rules.acceptedFormats.join(", ")}) 중 하나를 포함해 주세요.`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

function isLikelyUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}
