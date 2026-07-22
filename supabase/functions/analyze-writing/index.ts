// 쓰기 평가 이미지를 Gemini 또는 Claude Vision API로 분석해서 영역별 점수/근거,
// 총평, 문단별 피드백을 돌려주는 Edge Function.
//
// API 키가 브라우저에 노출되면 안 되므로 서버(이 함수)에서만 호출한다. 강사가
// "AI로 분석하기"를 누를 때 라디오 버튼으로 고른 provider('gemini' | 'claude')가
// 그대로 전달되고, 두 제공자 모두 같은 입력(이미지 + 평가 기준)으로 같은 형태의
// JSON을 반환하도록 프롬프트와 구조화 출력 스키마를 맞춰서 프론트엔드는 provider
// 차이를 몰라도 되게 만든다.
//
// 필요한 시크릿: ANTHROPIC_API_KEY, GEMINI_API_KEY, (선택) GEMINI_MODEL
// 배포: npx supabase functions deploy analyze-writing

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface DomainInput {
  id: string;
  label: string;
  weight: number;
  description: string;
  criteria: string[];
}

interface DomainScoreResult {
  domainId: string;
  score: number;
  reason: string;
}

interface AnalyzeResult {
  domainScores: DomainScoreResult[];
  overallComment: string;
  paragraphFeedback: { paragraphIndex: number; comment: string }[];
}

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error('이미지 형식을 읽을 수 없어요.');
  }
  return { mediaType: match[1], base64: match[2] };
}

function buildPrompt(domains: DomainInput[]): string {
  const domainLines = domains
    .map((d) => {
      const criteria = d.criteria.length > 0 ? `\n  세부 기준: ${d.criteria.join(' / ')}` : '';
      return `- ${d.label} (domainId: ${d.id}, 배점 ${d.weight}점): ${d.description}${criteria}`;
    })
    .join('\n');

  return `당신은 초등·중등 독서논술 강사를 돕는 글쓰기 평가 보조 도구입니다. 첨부된 이미지는 학생이 제출한 글(손글씨 또는 인쇄물)입니다. 아래 평가 영역 기준에 따라 분석하세요.

평가 영역:
${domainLines}

요구사항:
1. 각 영역마다 0점 이상 배점 이하의 정수 점수(score)와, 이미지에서 실제로 확인한 내용을 근거로 한 구체적인 판단 이유(reason)를 한국어로 작성하세요. "잘 썼다" 같은 막연한 말이 아니라 실제 문장/표현을 인용하거나 구체적으로 지적하세요.
2. 전체 총평(overallComment)을 2~4문장으로 작성하세요.
3. 글이 여러 문단으로 나뉘어 있다면 문단별로 짧은 피드백(paragraphFeedback)을 작성하세요. 문단 구분이 뚜렷하지 않으면 빈 배열로 두세요.
4. domainId는 반드시 위에 제시된 값을 그대로 사용하세요.
5. 다른 설명 없이 지정된 JSON 형식으로만 응답하세요.`;
}

const CLAUDE_MODEL = 'claude-opus-4-8';

function claudeJsonSchema() {
  return {
    type: 'object',
    properties: {
      domainScores: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            domainId: { type: 'string' },
            score: { type: 'integer' },
            reason: { type: 'string' },
          },
          required: ['domainId', 'score', 'reason'],
          additionalProperties: false,
        },
      },
      overallComment: { type: 'string' },
      paragraphFeedback: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            paragraphIndex: { type: 'integer' },
            comment: { type: 'string' },
          },
          required: ['paragraphIndex', 'comment'],
          additionalProperties: false,
        },
      },
    },
    required: ['domainScores', 'overallComment', 'paragraphFeedback'],
    additionalProperties: false,
  };
}

async function callClaude(mediaType: string, base64: string, prompt: string): Promise<unknown> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY가 설정되어 있지 않아요.');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      output_config: { format: { type: 'json_schema', schema: claudeJsonSchema() } },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: prompt },
          ],
        },
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Claude API 오류 (${res.status})`);
  }

  const textBlock = (data.content as Array<{ type: string; text?: string }> | undefined)?.find(
    (b) => b.type === 'text',
  );
  if (!textBlock?.text) {
    throw new Error('Claude 응답에서 결과를 찾을 수 없어요.');
  }
  return JSON.parse(textBlock.text);
}

// 프로토타입 기본 모델. Gemini는 모델명이 자주 바뀌므로 재배포 없이 시크릿만
// 바꿔서 교체할 수 있게 GEMINI_MODEL 환경변수로 오버라이드 가능하게 함.
// responseSchema 형식은 Google AI 문서 기준(OpenAPI 3.0 서브셋)으로 작성했는데,
// 실제 배포 전 최신 문서로 한 번 확인해보는 걸 권장함.
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

function geminiResponseSchema() {
  return {
    type: 'object',
    properties: {
      domainScores: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            domainId: { type: 'string' },
            score: { type: 'integer' },
            reason: { type: 'string' },
          },
          required: ['domainId', 'score', 'reason'],
        },
      },
      overallComment: { type: 'string' },
      paragraphFeedback: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            paragraphIndex: { type: 'integer' },
            comment: { type: 'string' },
          },
          required: ['paragraphIndex', 'comment'],
        },
      },
    },
    required: ['domainScores', 'overallComment', 'paragraphFeedback'],
  };
}

async function callGemini(mediaType: string, base64: string, prompt: string): Promise<unknown> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되어 있지 않아요.');
  const model = Deno.env.get('GEMINI_MODEL') ?? DEFAULT_GEMINI_MODEL;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ inline_data: { mime_type: mediaType, data: base64 } }, { text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: geminiResponseSchema(),
        },
      }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Gemini API 오류 (${res.status})`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini 응답에서 결과를 찾을 수 없어요.');
  }
  return JSON.parse(text);
}

function normalize(raw: unknown, domains: DomainInput[]): AnalyzeResult {
  const r = raw as Partial<AnalyzeResult> | null;
  if (!r || typeof r !== 'object') {
    throw new Error('AI 응답 형식이 올바르지 않아요.');
  }

  const rawScores = Array.isArray(r.domainScores) ? r.domainScores : [];
  const domainScores: DomainScoreResult[] = domains.map((d) => {
    const found = rawScores.find((s) => s && s.domainId === d.id);
    const score = typeof found?.score === 'number' ? found.score : 0;
    return {
      domainId: d.id,
      score: Math.max(0, Math.min(d.weight, Math.round(score))),
      reason: typeof found?.reason === 'string' ? found.reason : '',
    };
  });

  const rawParagraphs = Array.isArray(r.paragraphFeedback) ? r.paragraphFeedback : [];
  const paragraphFeedback = rawParagraphs
    .filter((p) => p && typeof p.comment === 'string')
    .map((p) => ({
      paragraphIndex: typeof p.paragraphIndex === 'number' ? p.paragraphIndex : 0,
      comment: p.comment,
    }));

  return {
    domainScores,
    overallComment: typeof r.overallComment === 'string' ? r.overallComment : '',
    paragraphFeedback,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: '인증 정보가 없어요.' }, 401);
  }

  let payload: { provider?: string; imageDataUrl?: string; domains?: DomainInput[] };
  try {
    payload = await req.json();
  } catch {
    return json({ error: '요청 본문을 읽을 수 없어요.' }, 400);
  }

  const { provider, imageDataUrl, domains } = payload;
  if (provider !== 'gemini' && provider !== 'claude') {
    return json({ error: 'provider는 gemini 또는 claude여야 해요.' }, 400);
  }
  if (typeof imageDataUrl !== 'string' || !imageDataUrl) {
    return json({ error: '분석할 이미지가 없어요.' }, 400);
  }
  if (!Array.isArray(domains) || domains.length === 0) {
    return json({ error: '평가 기준(domains)이 없어요.' }, 400);
  }

  try {
    const { mediaType, base64 } = parseDataUrl(imageDataUrl);
    const prompt = buildPrompt(domains);

    const raw =
      provider === 'claude'
        ? await callClaude(mediaType, base64, prompt)
        : await callGemini(mediaType, base64, prompt);

    const result = normalize(raw, domains);
    return json(result, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'AI 분석 중 알 수 없는 오류가 발생했어요.' }, 502);
  }
});
