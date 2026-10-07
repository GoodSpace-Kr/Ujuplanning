import test from 'node:test';
import assert from 'node:assert/strict';
import { handleInquiry } from '../lib/inquiry-handler.ts';

const url = 'https://ujuplanning-hero.goodspace82.chatgpt.site/api/inquiry';
const valid = { name: '문의폼 테스트', email: 'test@example.com', phone: '010-0000-0000' };
const request = (body, origin = new URL(url).origin) => new Request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
const neverSend = async () => { throw new Error('unexpected outbound request'); };

test('valid inquiry forwards all fields to the fixed recipient with reply-to', async () => {
  let sent;
  const result = await handleInquiry(request({ ...valid, company: '우주', message: '<문의>\n두 번째 줄', _cc: 'wrong@example.com' }), async (destination, options) => {
    sent = JSON.parse(options.body);
    assert.equal(destination, 'https://formsubmit.co/ajax/reviewary.wz@gmail.com');
    return Response.json({ success: 'true', message: 'The form was submitted successfully.' });
  });
  assert.equal(result.status, 200);
  assert.equal(sent['회사명'], '우주');
  assert.equal(sent['문의 내용'], '<문의>\n두 번째 줄');
  assert.equal(sent._replyto, valid.email);
  assert.equal(sent._cc, undefined);
  assert.deepEqual(await result.json(), { success: true, pendingActivation: false });
});

test('rejects cross-origin, missing fields, invalid phone and spam before delivery', async () => {
  assert.equal((await handleInquiry(request(valid, 'https://elsewhere.example'), neverSend)).status, 403);
  for (const body of [{}, { ...valid, email: 'bad' }, { ...valid, phone: 'abc1234' }, { ...valid, website: 'spam' }, { ...valid, name: 'a\nb' }, { ...valid, message: 'x'.repeat(4001) }]) {
    assert.equal((await handleInquiry(request(body), neverSend)).status, 400);
  }
  assert.equal((await handleInquiry(request({ ...valid, message: 'x'.repeat(25000) }), neverSend)).status, 413);
});

test('provider rejection, invalid responses and timeout are never reported as success', async () => {
  for (const send of [async () => Response.json({ success: 'false' }), async () => new Response('upstream error', { status: 503 }), async () => { throw new Error('timeout'); }]) {
    const result = await handleInquiry(request(valid), send);
    assert.equal(result.status, 502);
    assert.equal((await result.json()).success, false);
  }
});

test('activation requirement is exposed rather than claiming email delivery', async () => {
  const result = await handleInquiry(request(valid), async () => Response.json({ success: 'true', message: 'Please activate your form through the email we sent you.' }));
  assert.deepEqual(await result.json(), { success: true, pendingActivation: true });
});
