import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { SUBJECT_DOMAINS } from '../../lib/evaluationConfig';
import { fileToResizedDataUrl } from '../../lib/imageUtils';
import { supabase } from '../../lib/supabaseClient';
import { newId } from '../../lib/storage';
import { inputClass, labelClass } from '../../lib/formStyles';
import { ArrowLeftIcon, PlusIcon, SparklesIcon, TrashIcon } from '../../components/icons';
import { RatingSubjectCard } from './RatingSubjectCard';
import type { EvaluationInput, ParagraphFeedback, RatedSubject, RatingLevel, RatingResult } from '../../types/evaluation';

const RATED_SUBJECTS: RatedSubject[] = ['듣기', '읽기', '말하기', '생각하기'];

type AiProvider = 'gemini' | 'claude';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type RatingMap = Record<string, RatingLevel | null>;
type ScoreMap = Record<string, number | null>;

function emptyRatingMap(subject: RatedSubject): RatingMap {
  return Object.fromEntries(SUBJECT_DOMAINS[subject].map((d) => [d.id, null]));
}

function ratingArrayToMap(subject: RatedSubject, arr: RatingResult[]): RatingMap {
  const map = emptyRatingMap(subject);
  arr.forEach((r) => {
    map[r.domainId] = r.rating;
  });
  return map;
}

function emptyScoreMap(): ScoreMap {
  return Object.fromEntries(SUBJECT_DOMAINS.쓰기.map((d) => [d.id, null]));
}

export function EvaluationFormPage() {
  const { studentId, evaluationId } = useParams();
  const isEdit = Boolean(evaluationId);
  const { getStudent, getEvaluation, addEvaluation, updateEvaluation } = useAppData();
  const navigate = useNavigate();

  const student = studentId ? getStudent(studentId) : undefined;
  const existing = isEdit && evaluationId ? getEvaluation(evaluationId) : undefined;

  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [listening, setListening] = useState<RatingMap>(
    existing ? ratingArrayToMap('듣기', existing.listening) : emptyRatingMap('듣기'),
  );
  const [reading, setReading] = useState<RatingMap>(
    existing ? ratingArrayToMap('읽기', existing.reading) : emptyRatingMap('읽기'),
  );
  const [speaking, setSpeaking] = useState<RatingMap>(
    existing ? ratingArrayToMap('말하기', existing.speaking) : emptyRatingMap('말하기'),
  );
  const [thinking, setThinking] = useState<RatingMap>(
    existing ? ratingArrayToMap('생각하기', existing.thinking) : emptyRatingMap('생각하기'),
  );
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(existing?.writing.imageDataUrl);
  const [imageLoading, setImageLoading] = useState(false);
  const [overallComment, setOverallComment] = useState(existing?.writing.overallComment ?? '');
  const [paragraphFeedback, setParagraphFeedback] = useState<ParagraphFeedback[]>(
    existing?.writing.paragraphFeedback ?? [],
  );
  const [domainScores, setDomainScores] = useState<ScoreMap>(() => {
    const map = emptyScoreMap();
    existing?.writing.domainScores.forEach((s) => {
      map[s.domainId] = s.score;
    });
    return map;
  });
  const [domainReasons, setDomainReasons] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    existing?.writing.domainScores.forEach((s) => {
      if (s.reason) map[s.domainId] = s.reason;
    });
    return map;
  });
  const [aiAnalyzed, setAiAnalyzed] = useState(existing?.writing.aiAnalyzed ?? false);
  const [aiProvider, setAiProvider] = useState<AiProvider>('gemini');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const ratingState: Record<RatedSubject, [RatingMap, (m: RatingMap) => void]> = {
    듣기: [listening, setListening],
    읽기: [reading, setReading],
    말하기: [speaking, setSpeaking],
    생각하기: [thinking, setThinking],
  };

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">학생을 찾을 수 없어요</p>
        <Link to="/evaluations" className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          평가 대상 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">평가 기록을 찾을 수 없어요</p>
        <Link to={`/evaluations/${student.id}`} className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          평가 이력으로 돌아가기
        </Link>
      </div>
    );
  }

  const backTo = isEdit ? `/evaluations/${student.id}/${existing!.id}` : `/evaluations/${student.id}`;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setImageDataUrl(dataUrl);
    } finally {
      setImageLoading(false);
      e.target.value = '';
    }
  };

  const handleRunAi = async () => {
    if (!imageDataUrl) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-writing', {
        body: { provider: aiProvider, imageDataUrl, domains: SUBJECT_DOMAINS.쓰기 },
      });
      if (error) throw error;

      const scoreMap = emptyScoreMap();
      const reasonMap: Record<string, string> = {};
      (data.domainScores as { domainId: string; score: number; reason?: string }[]).forEach((s) => {
        scoreMap[s.domainId] = s.score;
        if (s.reason) reasonMap[s.domainId] = s.reason;
      });
      setDomainScores(scoreMap);
      setDomainReasons(reasonMap);
      setOverallComment(data.overallComment ?? '');
      setParagraphFeedback(
        (data.paragraphFeedback as { paragraphIndex: number; comment: string }[]).map((p) => ({
          id: newId(),
          paragraphIndex: p.paragraphIndex,
          comment: p.comment,
        })),
      );
      setAiAnalyzed(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI 분석 중 오류가 발생했어요.');
    } finally {
      setAiLoading(false);
    }
  };

  const addParagraphRow = () => {
    setParagraphFeedback((prev) => [...prev, { id: newId(), paragraphIndex: prev.length + 1, comment: '' }]);
  };

  const updateParagraphRow = (id: string, comment: string) => {
    setParagraphFeedback((prev) => prev.map((p) => (p.id === id ? { ...p, comment } : p)));
  };

  const removeParagraphRow = (id: string) => {
    setParagraphFeedback((prev) => prev.filter((p) => p.id !== id));
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!date) errs.push('평가 날짜를 입력해주세요.');
    for (const subject of RATED_SUBJECTS) {
      const [map] = ratingState[subject];
      if (SUBJECT_DOMAINS[subject].some((d) => !map[d.id])) {
        errs.push(`${subject} 평가 영역을 모두 입력해주세요.`);
      }
    }
    if (SUBJECT_DOMAINS.쓰기.some((d) => domainScores[d.id] == null)) {
      errs.push('쓰기 평가 영역별 점수를 모두 입력해주세요. (AI 분석 실행 또는 직접 입력)');
    }
    if (!overallComment.trim()) {
      errs.push('쓰기 총평 코멘트를 입력해주세요.');
    }
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    const buildRatingArray = (subject: RatedSubject): RatingResult[] => {
      const [map] = ratingState[subject];
      return SUBJECT_DOMAINS[subject].map((d) => ({ domainId: d.id, rating: map[d.id] as RatingLevel }));
    };

    const input: EvaluationInput = {
      date,
      listening: buildRatingArray('듣기'),
      reading: buildRatingArray('읽기'),
      speaking: buildRatingArray('말하기'),
      thinking: buildRatingArray('생각하기'),
      writing: {
        imageDataUrl,
        overallComment: overallComment.trim(),
        paragraphFeedback,
        domainScores: SUBJECT_DOMAINS.쓰기.map((d) => ({
          domainId: d.id,
          score: domainScores[d.id] ?? 0,
          reason: domainReasons[d.id],
        })),
        aiAnalyzed,
      },
    };

    if (isEdit && existing) {
      updateEvaluation(existing.id, input);
      navigate(`/evaluations/${student.id}/${existing.id}`);
    } else {
      const created = addEvaluation(student.id, input);
      navigate(`/evaluations/${student.id}/${created.id}`);
    }
  };

  return (
    <div>
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeftIcon className="h-4 w-4" />
        {isEdit ? '평가 상세로' : '평가 이력'}
      </Link>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
            {isEdit ? '평가 수정' : '새 평가 입력'} · {student.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">듣기·읽기·말하기·쓰기·생각하기 5개 영역을 평가해요.</p>
        </div>
        <div>
          <label className={labelClass}>평가 날짜</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {RATED_SUBJECTS.map((subject) => {
          const [map, setMap] = ratingState[subject];
          return (
            <RatingSubjectCard
              key={subject}
              subject={subject}
              domains={SUBJECT_DOMAINS[subject]}
              values={map}
              onChange={(domainId, rating) => setMap({ ...map, [domainId]: rating })}
            />
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">쓰기 평가</p>
        <p className="mt-0.5 text-xs text-slate-500">
          학생이 제출한 글 이미지를 업로드하고 AI 분석을 실행하면 첨삭 코멘트와 영역별 점수가 자동으로 채워져요. 결과는 저장 전에 자유롭게 수정할 수 있어요.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className={labelClass}>학생 제출 원문 (이미지)</label>
            {imageDataUrl ? (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <img src={imageDataUrl} alt="학생 제출 원문" className="max-h-96 w-full object-contain bg-slate-50" />
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
                업로드된 이미지가 없어요
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {imageLoading ? '업로드 중...' : imageDataUrl ? '이미지 다시 업로드' : '이미지 업로드'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={imageLoading} />
              </label>
              {imageDataUrl && (
                <button
                  type="button"
                  onClick={() => setImageDataUrl(undefined)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  이미지 삭제
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center gap-4">
              {(['gemini', 'claude'] as const).map((provider) => (
                <label key={provider} className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="aiProvider"
                    value={provider}
                    checked={aiProvider === provider}
                    onChange={() => setAiProvider(provider)}
                    disabled={aiLoading}
                  />
                  {provider === 'gemini' ? 'Gemini' : 'Claude'}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={handleRunAi}
              disabled={!imageDataUrl || aiLoading}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SparklesIcon className="h-4 w-4" />
              {aiLoading ? 'AI 분석 중...' : 'AI로 분석하기'}
            </button>
            {!imageDataUrl && <p className="mt-1 text-xs text-slate-400">이미지를 먼저 업로드해주세요.</p>}
            {aiError && <p className="mt-1 text-xs text-red-600">{aiError}</p>}
            <p className="mt-1 text-xs text-slate-400">* AI 분석 결과는 참고용이며 저장 전 자유롭게 수정할 수 있어요.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>평가 영역별 점수</label>
                <span className="mb-1.5 text-xs text-slate-400">총 100점</span>
              </div>
              <div className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200">
                {SUBJECT_DOMAINS.쓰기.map((domain) => (
                  <div key={domain.id} className="flex items-start justify-between gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-800">{domain.label}</span>
                        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                          {domain.weight}점
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{domain.description}</p>
                      {domain.criteria.length > 0 && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700">
                            세부 기준
                          </summary>
                          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
                            {domain.criteria.map((c) => (
                              <li key={c}>{c}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                      {domainReasons[domain.id] && (
                        <p className="mt-1 text-xs text-slate-500">AI 근거: {domainReasons[domain.id]}</p>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={domain.weight}
                      value={domainScores[domain.id] ?? ''}
                      onChange={(e) =>
                        setDomainScores({
                          ...domainScores,
                          [domain.id]: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="w-16 shrink-0 rounded-lg border border-slate-300 px-2 py-2 text-center text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>총평 코멘트</label>
              <textarea
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                rows={3}
                placeholder="전체적인 첨삭 코멘트를 입력하세요"
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>문단별 피드백</label>
                <button
                  type="button"
                  onClick={addParagraphRow}
                  className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  문단 추가
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {paragraphFeedback.length === 0 && (
                  <p className="text-sm text-slate-400">문단별 피드백이 없어요.</p>
                )}
                {paragraphFeedback.map((p) => (
                  <div key={p.id} className="flex items-start gap-2">
                    <span className="mt-2 shrink-0 text-xs font-medium text-slate-500">{p.paragraphIndex}문단</span>
                    <textarea
                      value={p.comment}
                      onChange={(e) => updateParagraphRow(p.id, e.target.value)}
                      rows={2}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => removeParagraphRow(p.id)}
                      className="mt-1 shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                      aria-label="삭제"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <ul className="list-inside list-disc text-sm text-red-700">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 py-4">
        <Link to={backTo} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          취소
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          저장
        </button>
      </div>
    </div>
  );
}
