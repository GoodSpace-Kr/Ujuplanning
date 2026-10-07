const RECIPIENT = 'reviewary.wz@gmail.com';
const FORM_URL = 'https://ujuplanning-hero.goodspace82.chatgpt.site/#contact';
const MAX_BYTES = 20000;

function respond(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function handleInquiry(request: Request, send: typeof fetch = fetch) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return respond(403, { success: false, message: '사이트의 문의폼에서 다시 보내주세요.' });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return respond(415, { success: false, message: '올바른 형식으로 입력해 주세요.' });
  if (Number(request.headers.get('content-length')) > MAX_BYTES) return respond(413, { success: false, message: '문의 내용이 너무 깁니다.' });

  let values: Record<string, unknown>;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error('empty');
    const decoder = new TextDecoder();
    let raw = '', bytes = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) { await reader.cancel(); return respond(413, { success: false, message: '문의 내용이 너무 깁니다.' }); }
      raw += decoder.decode(value, { stream: true });
    }
    const parsed = JSON.parse(raw + decoder.decode());
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error('invalid');
    values = parsed;
  } catch { return respond(400, { success: false, message: '입력 내용을 확인해 주세요.' }); }

  const limits = { company: 100, name: 80, phone: 30, email: 254, message: 4000, website: 200 };
  const fields = {} as Record<keyof typeof limits, string>;
  for (const [key, limit] of Object.entries(limits)) {
    const value = values[key] ?? '';
    if (typeof value !== 'string' || value.length > limit) return respond(400, { success: false, message: '입력 내용의 길이와 형식을 확인해 주세요.' });
    fields[key as keyof typeof limits] = value.trim();
  }
  if (fields.website) return respond(400, { success: false, message: '문의폼을 다시 열어 작성해 주세요.' });
  if (!fields.name || /[\r\n]/.test(fields.name) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return respond(400, { success: false, message: '담당자명과 올바른 이메일을 입력해 주세요.' });
  }
  const digits = fields.phone.replace(/\D/g, '');
  if (!/^[+\d() .-]+$/.test(fields.phone) || digits.length < 7 || digits.length > 15) {
    return respond(400, { success: false, message: '연락 가능한 전화번호를 입력해 주세요.' });
  }

  // The destination and email options are server-owned; visitor fields cannot override them.
  try {
    const response = await send(`https://formsubmit.co/ajax/${RECIPIENT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: fields.name,
        email: fields.email,
        '회사명': fields.company || '미입력',
        '담당자명': fields.name,
        '연락처': fields.phone,
        '문의 내용': fields.message || '미입력',
        _replyto: fields.email,
        _subject: '[우주기획] 새로운 프로젝트 문의',
        _template: 'table',
        _url: FORM_URL,
      }),
      signal: AbortSignal.timeout(18000),
    });
    const result = await response.json() as { success?: boolean | string; message?: string };
    if (!response.ok || (result.success !== true && result.success !== 'true')) {
      return respond(502, { success: false, message: '문의 전송이 완료되지 않았습니다. 잠시 후 다시 시도하거나 reviewary.wz@gmail.com으로 연락해 주세요.' });
    }
    const pendingActivation = /activat|confirm.{0,30}email|email.{0,30}confirm/i.test(result.message || '');
    return respond(200, { success: true, pendingActivation });
  } catch {
    // No automatic retry: a timeout can occur after the provider accepted an email.
    return respond(502, { success: false, message: '전송 결과를 확인하지 못했습니다. 급한 문의는 reviewary.wz@gmail.com으로 보내주세요.' });
  }
}
