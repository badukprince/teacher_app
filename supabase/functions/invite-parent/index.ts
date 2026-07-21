// 강사가 학생의 학부모 연락처를 학부모 로그인 계정으로 초대하는 Edge Function.
//
// 프론트엔드는 anon key만 가지고 있어서 계정을 직접 만들 수 없다(관리자 API는
// service_role 키가 필요하고, 그 키는 절대 브라우저에 노출되면 안 됨). 그래서
// 이 서버 함수가 대신 처리한다:
//   1. 호출자(강사)의 JWT로 만든 클라이언트로 parent_contacts를 조회 — RLS의
//      "teacher owns row" 정책 덕분에 본인 소유가 아니면 조회 자체가 실패한다.
//      (별도 권한 체크 코드 없이 RLS가 그대로 인가 역할을 함)
//   2. 소유가 확인되면 service_role 키로 만든 별도 관리자 클라이언트로
//      - 초대 메일 발송 + 계정 생성
//      - app_metadata에 role/student_id 설정 (클라이언트가 수정 불가능한 값)
//      - parent_contacts.user_id를 새 계정 id로 연결
//
// 배포: npx supabase login && npx supabase link --project-ref <ref> &&
//       npx supabase functions deploy invite-parent

import { createClient } from 'jsr:@supabase/supabase-js@2';

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: '인증 정보가 없어요.' }, 401);
    }

    const { parentContactId, email, redirectTo } = await req.json();
    if (!parentContactId || !email) {
      return json({ error: 'parentContactId와 email이 필요해요.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // 호출자(강사) 권한으로 조회 — RLS가 소유권 검증을 대신 해줌
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: contact, error: contactError } = await callerClient
      .from('parent_contacts')
      .select('id, student_id')
      .eq('id', parentContactId)
      .maybeSingle();

    if (contactError || !contact) {
      return json({ error: '해당 학부모 연락처를 찾을 수 없거나 권한이 없어요.' }, 403);
    }

    // 여기서부터는 service_role — 관리자 전용 작업이라 RLS를 우회함
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    });

    if (inviteError || !inviteData.user) {
      return json({ error: inviteError?.message ?? '초대 발송에 실패했어요.' }, 400);
    }

    const { error: metaError } = await adminClient.auth.admin.updateUserById(inviteData.user.id, {
      app_metadata: { role: 'parent', student_id: contact.student_id },
    });
    if (metaError) {
      return json({ error: metaError.message }, 400);
    }

    const { error: linkError } = await adminClient
      .from('parent_contacts')
      .update({ user_id: inviteData.user.id })
      .eq('id', parentContactId);
    if (linkError) {
      return json({ error: linkError.message }, 400);
    }

    return json({ success: true }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요.' }, 500);
  }
});
