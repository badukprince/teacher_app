import type { DomainDefinition, Evaluation, RatedSubject, RatingLevel, Subject } from '../types/evaluation';
import { SUBJECTS } from '../types/evaluation';

export const SUBJECT_DOMAINS: Record<Subject, DomainDefinition[]> = {
  듣기: [
    {
      id: 'listen-attitude',
      label: '경청 태도',
      weight: 20,
      description: '수업/이야기를 듣는 자세가 안정적인가',
      criteria: ['딴짓 없이 끝까지 집중해서 듣는가', '눈맞춤, 반응(끄덕임 등)이 적절한가'],
    },
    {
      id: 'listen-comprehension',
      label: '내용 파악력',
      weight: 35,
      description: '들은 내용을 정확히 이해했는가',
      criteria: ['등장인물, 사건의 순서를 정확히 기억하는가', '중요한 정보와 지엽적인 정보를 구분하는가'],
    },
    {
      id: 'listen-memory',
      label: '핵심 기억력',
      weight: 25,
      description: '들은 내용을 오래 기억하고 재구성할 수 있는가',
      criteria: ['시간이 지난 후에도 줄거리를 요약할 수 있는가', '세부 사항(이름, 장소, 숫자 등)을 정확히 기억하는가'],
    },
    {
      id: 'listen-response',
      label: '반응/질문 능력',
      weight: 20,
      description: '들은 내용에 대해 적절히 반응하는가',
      criteria: ['궁금한 점을 질문으로 표현하는가', '들은 내용과 관련해 자기 생각을 짧게라도 말하는가'],
    },
  ],
  읽기: [
    {
      id: 'read-vocab',
      label: '어휘력',
      weight: 20,
      description: '글에 나오는 어휘를 이해하는가',
      criteria: ['모르는 단어를 문맥으로 유추할 수 있는가', '학년 수준에 맞는 어휘를 알고 있는가'],
    },
    {
      id: 'read-comprehension',
      label: '내용 이해력',
      weight: 30,
      description: '글의 사실적 정보를 정확히 파악하는가',
      criteria: ['등장인물, 배경, 사건을 정확히 이해했는가', '글의 구조(원인-결과, 시간 순서 등)를 파악하는가'],
    },
    {
      id: 'read-inference',
      label: '추론 능력',
      weight: 30,
      description: '글에 드러나지 않은 내용을 유추할 수 있는가',
      criteria: [
        '인물의 감정이나 의도를 짐작할 수 있는가',
        '글의 주제나 작가의 의도를 파악하는가',
        '다음에 일어날 일을 예측할 수 있는가',
      ],
    },
    {
      id: 'read-fluency',
      label: '읽기 태도/유창성',
      weight: 20,
      description: '스스로 읽는 습관과 속도가 적절한가',
      criteria: ['학년 대비 읽기 속도가 적절한가', '소리 내어 읽을 때 띄어 읽기, 억양이 자연스러운가'],
    },
  ],
  말하기: [
    {
      id: 'speak-pronunciation',
      label: '발음/전달력',
      weight: 20,
      description: '명확하고 알아듣기 쉽게 말하는가',
      criteria: ['발음이 정확한가', '목소리 크기와 속도가 적절한가'],
    },
    {
      id: 'speak-structure',
      label: '내용 구성력',
      weight: 30,
      description: '말하는 내용이 조리 있게 짜여 있는가',
      criteria: ['처음-중간-끝의 흐름이 있는가', '하고 싶은 말의 순서가 정리되어 있는가'],
    },
    {
      id: 'speak-logic',
      label: '논리적 표현력',
      weight: 30,
      description: '자기 생각을 근거와 함께 말하는가',
      criteria: ['주장에 대한 이유를 함께 설명하는가', '질문에 대해 핵심을 벗어나지 않고 답하는가'],
    },
    {
      id: 'speak-attitude',
      label: '태도/자신감',
      weight: 20,
      description: '발표 태도가 적극적인가',
      criteria: ['눈맞춤, 제스처 등 비언어적 표현이 자연스러운가', '친구들 앞에서 위축되지 않고 말하는가'],
    },
  ],
  쓰기: [
    {
      id: 'write-comprehension',
      label: '내용 이해력',
      weight: 20,
      description: '주제나 책 내용을 정확히 반영해 썼는가',
      criteria: ['글의 주제에서 벗어나지 않았는가', '책의 내용을 오해 없이 반영했는가'],
    },
    {
      id: 'write-structure',
      label: '구성력',
      weight: 25,
      description: '글의 짜임새가 논리적인가',
      criteria: ['서론-본론-결론 구조가 있는가', '문단 나누기와 문단 간 연결이 자연스러운가'],
    },
    {
      id: 'write-expression',
      label: '표현력',
      weight: 25,
      description: '어휘와 문장 표현이 다양하고 적절한가',
      criteria: ['같은 단어/표현의 반복이 적은가', '비유, 묘사 등을 시도했는가'],
    },
    {
      id: 'write-logic',
      label: '논리력',
      weight: 20,
      description: '주장에 근거가 뒷받침되는가',
      criteria: ['이유와 근거가 함께 제시되는가', '주장과 근거가 서로 어긋나지 않는가'],
    },
    {
      id: 'write-grammar',
      label: '맞춤법/어법',
      weight: 10,
      description: '기본 어법을 지켰는가',
      criteria: ['맞춤법, 띄어쓰기 오류 빈도', '문장 호응 오류 여부'],
    },
  ],
  생각하기: [
    {
      id: 'think-critical',
      label: '비판적 사고력',
      weight: 30,
      description: '주어진 내용을 그대로 받아들이지 않고 분석하는가',
      criteria: ['인물의 행동이나 선택에 의문을 제기할 수 있는가', '다른 관점에서 다시 바라볼 수 있는가'],
    },
    {
      id: 'think-creative',
      label: '창의적 사고력',
      weight: 25,
      description: '독창적인 아이디어나 해석을 내놓는가',
      criteria: ['상투적인 결론에 머물지 않는가', '새로운 상황을 가정하거나 대안을 제시하는가(예: "만약 흥부가 ~했다면")'],
    },
    {
      id: 'think-solving',
      label: '문제해결력',
      weight: 25,
      description: '문제 상황에 대한 대안을 스스로 도출하는가',
      criteria: ['이야기 속 갈등 상황에 대한 해결 방법을 제안하는가', '현실 문제와 연결지어 생각할 수 있는가'],
    },
    {
      id: 'think-value',
      label: '가치판단력',
      weight: 20,
      description: '옳고 그름, 가치의 우선순위를 판단할 수 있는가',
      criteria: ['인물의 행동에 대해 자신의 기준으로 평가하는가', '서로 다른 가치가 충돌할 때 자기 생각을 정리할 수 있는가'],
    },
  ],
};

export const RATING_RATIO: Record<RatingLevel, number> = { 상: 1, 중: 0.7, 하: 0.4 };

export function domainScoreForRating(rating: RatingLevel, weight: number): number {
  return Math.round(weight * RATING_RATIO[rating]);
}

const RATED_SUBJECT_KEY: Record<RatedSubject, keyof Pick<Evaluation, 'listening' | 'reading' | 'speaking' | 'thinking'>> = {
  듣기: 'listening',
  읽기: 'reading',
  말하기: 'speaking',
  생각하기: 'thinking',
};

export function subjectScore(evaluation: Evaluation, subject: Subject): number | null {
  if (subject === '쓰기') {
    const scores = evaluation.writing.domainScores;
    if (scores.length === 0) return null;
    return scores.reduce((sum, s) => sum + s.score, 0);
  }
  const results = evaluation[RATED_SUBJECT_KEY[subject as RatedSubject]];
  const domains = SUBJECT_DOMAINS[subject];
  if (results.length === 0) return null;
  return results.reduce((sum, r) => {
    const domain = domains.find((d) => d.id === r.domainId);
    return sum + domainScoreForRating(r.rating, domain?.weight ?? 0);
  }, 0);
}

export function evaluationScores(evaluation: Evaluation): Record<Subject, number | null> {
  const result = {} as Record<Subject, number | null>;
  for (const subject of SUBJECTS) {
    result[subject] = subjectScore(evaluation, subject);
  }
  return result;
}

export function overallScore(evaluation: Evaluation): number | null {
  const scores = SUBJECTS.map((s) => subjectScore(evaluation, s)).filter((v): v is number => v !== null);
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function isEvaluationComplete(evaluation: Evaluation): boolean {
  return SUBJECTS.every((s) => subjectScore(evaluation, s) !== null);
}

interface GrowthComment {
  headline: string;
  detail: string;
}

export function buildGrowthComment(current: Evaluation, previous: Evaluation | null): GrowthComment {
  if (!previous) {
    return {
      headline: '첫 평가 기록이에요.',
      detail: '다음 평가부터 지난 결과와 비교한 성장 추이를 확인할 수 있어요.',
    };
  }

  const deltas = SUBJECTS.map((subject) => {
    const curr = subjectScore(current, subject);
    const prev = subjectScore(previous, subject);
    if (curr === null || prev === null) return null;
    return { subject, delta: curr - prev };
  }).filter((v): v is { subject: Subject; delta: number } => v !== null);

  const currTotal = overallScore(current);
  const prevTotal = overallScore(previous);
  const totalDelta = currTotal !== null && prevTotal !== null ? currTotal - prevTotal : null;

  const sorted = [...deltas].sort((a, b) => b.delta - a.delta);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const headline =
    totalDelta === null
      ? '지난 평가와 비교할 데이터가 부족해요.'
      : totalDelta > 0
        ? `지난 평가 대비 종합 점수가 ${totalDelta}점 올랐어요.`
        : totalDelta < 0
          ? `지난 평가 대비 종합 점수가 ${Math.abs(totalDelta)}점 내려갔어요.`
          : '지난 평가와 종합 점수가 같아요.';

  const detailParts: string[] = [];
  if (best && best.delta > 0) {
    detailParts.push(`${best.subject} 영역이 ${best.delta}점 올라 가장 크게 성장했어요.`);
  }
  if (worst && worst.delta < 0 && worst.subject !== best?.subject) {
    detailParts.push(`${worst.subject} 영역은 ${Math.abs(worst.delta)}점 낮아져 보완이 필요해요.`);
  }
  if (detailParts.length === 0) {
    detailParts.push('전체적으로 지난 평가와 비슷한 수준을 유지하고 있어요.');
  }

  return { headline, detail: detailParts.join(' ') };
}

