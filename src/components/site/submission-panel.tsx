"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { FileUp, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppDialog } from "@/components/ui/dialog";
import { StateCard } from "@/components/ui/state-card";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { emptySubmission, storageKeys } from "@/lib/storage";
import { Hackathon, SubmissionDraft } from "@/lib/types";
import { validateSubmission } from "@/lib/submission";
import { useHackathonProgress } from "@/hooks/use-hackathon-progress";
import { formatFileSize } from "@/lib/utils";

export function SubmissionPanel({ hackathon }: { hackathon: Hackathon }) {
  const maxUploadSize = 2 * 1024 * 1024;
  const { value: submissions, setValue: setSubmissions, ready } = useLocalStorageState<Record<string, SubmissionDraft>>(storageKeys.submissions, {});
  const { progress, updateProgress } = useHackathonProgress(hackathon.slug);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const draft = submissions[hackathon.slug] ?? emptySubmission;
  const validation = useMemo(() => validateSubmission(draft, hackathon.submissionRules), [draft, hackathon.submissionRules]);

  useEffect(() => {
    if (!ready) return;
    if (!draft.publicSummary && !draft.demoLink && !draft.repoLink && !draft.fileMeta && !draft.notes && !draft.privateMemo) return;

    updateProgress({
      viewedSections: progress?.viewedSections ?? [],
      hasTeam: progress?.hasTeam ?? false,
      hasDraft: true,
      isSubmitted: Boolean(draft.submittedAt),
      checklistState: {
        summary: Boolean(draft.publicSummary),
        demo: Boolean(draft.demoLink),
        repo: Boolean(draft.repoLink),
        privacy: !draft.privateMemo.toLowerCase().includes("password"),
      },
      updatedAt: new Date().toISOString(),
    });
  }, [draft, progress, ready, updateProgress]);

  if (!ready) {
    return <StateCard loading title="제출 초안을 불러오는 중입니다" description="제출 링크, 노트, 업로드 파일 메타데이터를 로컬 저장소에서 복원하고 있습니다." />;
  }

  const updateDraft = (next: Partial<SubmissionDraft>) => {
    setSubmissions({
      ...submissions,
      [hackathon.slug]: {
        ...draft,
        ...next,
      },
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > maxUploadSize) {
      setUploadError(`파일이 너무 큽니다. 브라우저 저장 한도를 넘지 않도록 ${formatFileSize(maxUploadSize)} 이하 파일만 업로드해 주세요.`);
      event.target.value = "";
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("file-read-failed"));
      reader.readAsDataURL(file);
    });

    updateDraft({
      uploadedFile: {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      },
      fileMeta: file.name,
    });
    setUploadError(null);
  };

  return (
    <Card className="bg-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Submit</CardTitle>
          <CardDescription className="mt-2">제출 가이드, 노트, 링크, 실제 파일 업로드, 공개/비공개 구분을 한 흐름으로 관리합니다.</CardDescription>
        </div>
        <div className="rounded-full bg-brand-soft px-4 py-2 text-sm font-medium text-brand-strong">Auto-saving in browser</div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-[24px] border border-border bg-[#f7f3eb] p-5 text-sm text-muted">
            <p className="font-semibold text-foreground">Submit Guide</p>
            <div className="mt-3 grid gap-2">
              <div>필수 항목: {hackathon.submissionRules.required.join(", ")}</div>
              <div>선택 항목: {hackathon.submissionRules.optional.join(", ")}</div>
              <div>허용 형식: {hackathon.submissionRules.acceptedFormats.join(", ")}</div>
            </div>
          </div>

          <Textarea placeholder="제출 노트 / 아이디어 정리" value={draft.notes} onChange={(event) => updateDraft({ notes: event.target.value })} />
          <Textarea placeholder="공개용 한 줄 요약 또는 서비스 설명" value={draft.publicSummary} onChange={(event) => updateDraft({ publicSummary: event.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Demo URL" value={draft.demoLink} onChange={(event) => updateDraft({ demoLink: event.target.value })} />
            <Input placeholder="Repository URL" value={draft.repoLink} onChange={(event) => updateDraft({ repoLink: event.target.value })} />
          </div>

          <label className="block rounded-[24px] border border-dashed border-border bg-[#fffaf2] p-5 text-sm">
            <div className="inline-flex items-center gap-2 font-medium text-foreground">
              <FileUp className="h-4 w-4" />
              제출 파일 업로드
            </div>
            <p className="mt-2 text-muted">PDF / ZIP / CSV / MP4 등 허용 형식의 파일을 업로드하면 메타데이터와 내용이 로컬 저장소에 저장됩니다.</p>
            <input className="mt-4 block w-full text-sm" type="file" onChange={handleFileChange} />
          </label>

          {uploadError ? <div className="rounded-[20px] border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{uploadError}</div> : null}

          {draft.uploadedFile ? (
            <div className="rounded-[24px] border border-border bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{draft.uploadedFile.name}</p>
                  <p className="mt-1 text-muted">{draft.uploadedFile.type || "unknown type"} · {formatFileSize(draft.uploadedFile.size)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => updateDraft({ uploadedFile: null, fileMeta: "" })}>
                  <Trash2 className="mr-2 h-4 w-4" />제거
                </Button>
              </div>
            </div>
          ) : null}

          <Textarea placeholder="비공개 메모: 로컬에서만 저장됩니다" value={draft.privateMemo} onChange={(event) => updateDraft({ privateMemo: event.target.value })} />
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-border bg-[#121113] p-5 text-white">
            <p className="text-sm font-semibold">상태</p>
            <p className="mt-2 text-sm text-white/68">
              {draft.submittedAt ? `최종 제출 완료: ${new Date(draft.submittedAt).toLocaleString("ko-KR")}` : "아직 최종 제출 전입니다."}
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button variant="secondary" onClick={() => updateDraft({ submittedAt: null })}>
                제출 상태 초기화
              </Button>
              <Button onClick={() => setConfirmOpen(true)}>최종 제출 확인</Button>
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-[#f7f3eb] p-5">
            <p className="text-sm font-semibold">제출 체크리스트</p>
            <div className="mt-4 grid gap-2 text-sm text-muted">
              <div>공개 정보: {draft.publicSummary ? "입력됨" : "미입력"}</div>
              <div>데모 링크: {draft.demoLink ? "입력됨" : "미입력"}</div>
              <div>레포 링크: {draft.repoLink ? "입력됨" : "미입력"}</div>
              <div>파일: {draft.uploadedFile ? draft.uploadedFile.name : "없음"}</div>
              <div>비공개 메모는 브라우저 내부에만 유지됩니다.</div>
            </div>
            {!validation.isValid ? (
              <div className="mt-4 rounded-[20px] border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
                {validation.issues.map((issue) => (
                  <p key={issue}>{issue}</p>
                ))}
              </div>
            ) : (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success">
                <ShieldCheck className="h-4 w-4" />
                제출 가드 통과
              </div>
            )}
          </div>
        </div>
      </div>

      <AppDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="최종 제출을 진행할까요?"
        description="체크리스트와 링크 형식, 업로드 파일 형식이 통과한 경우에만 최종 제출을 권장합니다."
      >
        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/72">
            공개 정보: {draft.publicSummary || "입력 없음"}
            <br />
            업로드 파일: {draft.uploadedFile?.name ?? "없음"}
            <br />
            비공개 메모는 외부에 노출되지 않습니다.
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                if (!validation.isValid) return;
                updateDraft({ submittedAt: new Date().toISOString() });
                updateProgress({
                  viewedSections: progress?.viewedSections ?? [],
                  hasTeam: progress?.hasTeam ?? false,
                  hasDraft: true,
                  isSubmitted: true,
                  checklistState: progress?.checklistState ?? {},
                  updatedAt: new Date().toISOString(),
                });
                setConfirmOpen(false);
              }}
            >
              최종 제출 완료
            </Button>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              다시 검토
            </Button>
          </div>
        </div>
      </AppDialog>
    </Card>
  );
}
