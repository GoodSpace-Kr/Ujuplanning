'use client';

import { useRef, useState, type FormEvent } from 'react';
import './inquiry-form.css';

export function InquiryForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'pending' | 'error'>('idle');
  const [error, setError] = useState('');
  const sending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    sending.current = true;
    setState('sending');
    setError('');
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fields)),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json() as { success?: boolean; pendingActivation?: boolean; message?: string };
      if (!response.ok || result.success !== true) throw new Error(result.message || '문의 전송이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.');
      setState(result.pendingActivation ? 'pending' : 'success');
      form.reset();
    } catch (cause) {
      setState('error');
      setError(cause instanceof Error && cause.name !== 'TimeoutError' && cause.name !== 'TypeError' ? cause.message : '전송 결과를 확인하지 못했습니다. 급한 문의는 reviewary.wz@gmail.com으로 보내주세요.');
    } finally {
      sending.current = false;
    }
  }

  return (
    <section className="uju-inquiry" id="contact" aria-labelledby="inquiry-heading">
      <div className="inquiry-story">
        <div className="inquiry-image">
          <img src="/assets/telescope-sequence/desktop/0000.webp" alt="창 너머를 망원경으로 바라보며 새로운 가능성을 찾는 모습" loading="lazy" />
          <span className="inquiry-image-brand">UJU PLANNING</span>
        </div>
        <div className="inquiry-guide">
          <p className="inquiry-guide-title">당신의 이야기를 기다립니다.</p>
          <p>브랜드의 고민부터 아직 구체화되지 않은 아이디어까지, 편하게 들려주세요. 남겨주신 내용을 꼼꼼히 살펴보고 담당자가 영업일 1~2일 이내로 연락드리겠습니다.</p>
          <p>함께할 가능성을 열어주셔서 감사합니다.<br />브랜드에 꼭 맞는 다음 항로를 함께 고민하겠습니다.</p>
          <span className="inquiry-response-time"><span aria-hidden="true" />영업일 1~2일 이내 답변</span>
        </div>
      </div>

      <div className="inquiry-form-panel">
        <h2 id="inquiry-heading">어떤 우주를<br />함께 발견할까요?</h2>
        <p className="inquiry-lead">브랜드의 다음 이야기를 우주기획과 시작해 보세요.</p>

        {state === 'success' || state === 'pending' ? (
          <div className="inquiry-success" role="status" aria-live="polite">
            <span className="inquiry-success-icon" aria-hidden="true">✓</span>
            <h3>{state === 'pending' ? '문의가 전달 대기 중입니다.' : '문의가 접수되었습니다.'}</h3>
            <p>{state === 'pending' ? '담당자의 이메일 수신 확인 후 전달됩니다. 급한 문의는 아래 이메일로 직접 보내주세요.' : '소중한 이야기를 남겨주셔서 감사합니다. 담당자가 내용을 확인한 후 영업일 1~2일 이내로 연락드리겠습니다.'}</p>
            {state === 'pending' && <a href="mailto:reviewary.wz@gmail.com">reviewary.wz@gmail.com</a>}
            <button type="button" onClick={() => setState('idle')}>새 문의 작성하기 <span aria-hidden="true">↗</span></button>
          </div>
        ) : (
          <form className="inquiry-fields" onSubmit={submit} aria-busy={state === 'sending'}>
            <fieldset disabled={state === 'sending'}>
              <legend className="sr-only">프로젝트 문의 정보</legend>
              <label className="inquiry-field">회사명 <span className="inquiry-optional">선택</span>
                <input name="company" autoComplete="organization" maxLength={100} placeholder="회사 또는 브랜드명을 입력해 주세요" />
              </label>
              <div className="inquiry-field-row">
                <label className="inquiry-field">담당자명 <span className="inquiry-required" aria-hidden="true">*</span>
                  <input name="name" autoComplete="name" required maxLength={80} placeholder="성함" />
                </label>
                <label className="inquiry-field">연락처 <span className="inquiry-required" aria-hidden="true">*</span>
                  <input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} placeholder="010-0000-0000" />
                </label>
              </div>
              <label className="inquiry-field">이메일 <span className="inquiry-required" aria-hidden="true">*</span>
                <input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="hello@company.com" />
              </label>
              <label className="inquiry-field">문의 내용 <span className="inquiry-optional">선택</span>
                <textarea name="message" rows={3} maxLength={4000} placeholder="고민 중인 프로젝트, 일정, 예산 등을 자유롭게 남겨주세요." />
              </label>
              <div className="inquiry-honey" aria-hidden="true">
                <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>
              <p className="inquiry-privacy">남겨주신 정보는 문의 확인과 답변을 위해 담당자에게 전달됩니다.</p>
              {state === 'error' && <p className="inquiry-error" role="alert">{error}</p>}
              <button className="inquiry-submit" type="submit">{state === 'sending' ? '문의 보내는 중…' : '문의 보내기'}<span aria-hidden="true">↗</span></button>
            </fieldset>
          </form>
        )}
      </div>
    </section>
  );
}
