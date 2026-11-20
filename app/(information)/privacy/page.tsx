import { SiteFooter } from '@/components/site-footer';
import './privacy.css';

export const metadata = {
  title: '개인정보처리방침 · 우주기획',
  description: '우주기획 홈페이지의 개인정보 수집 항목, 이용 목적, 보유 기간과 권리 행사 방법을 안내합니다.',
};

const contents = [
  ['purpose', '개인정보 처리 목적'],
  ['information', '처리하는 개인정보 항목'],
  ['retention', '보유 기간과 파기'],
  ['providers', '외부 서비스와 개인정보 처리'],
  ['rights', '이용자의 권리와 행사 방법'],
  ['security', '개인정보 보호와 외부 콘텐츠'],
  ['contact', '개인정보 보호책임자'],
  ['changes', '방침의 시행 및 변경'],
] as const;

export default function PrivacyPage() {
  return <>
    <article className="privacy-page" aria-labelledby="privacy-heading">
      <header className="privacy-header">
        <p className="privacy-eyebrow">WOOJU COMMUNICATIONS</p>
        <h1 id="privacy-heading">개인정보처리방침</h1>
        <p className="privacy-intro">우주기획은 개인정보를 소중히 다루며, 홈페이지 이용과 프로젝트 문의 과정에서 개인정보를 어떻게 처리하는지 안내합니다.</p>
        <p className="privacy-date">시행일 <time dateTime="2026-11-20">2026년 11월 20일</time></p>
      </header>

      <nav className="privacy-contents" aria-label="개인정보처리방침 목차">
        <ol>{contents.map(([id, title]) => <li key={id}><a href={`#privacy-${id}`}>{title}</a></li>)}</ol>
      </nav>

      <section id="privacy-purpose" aria-labelledby="privacy-purpose-heading">
        <h2 id="privacy-purpose-heading">1. 개인정보 처리 목적</h2>
        <p>우주기획은 프로젝트 문의 접수, 문의자 확인, 답변 및 상담, 견적 안내와 상담 이력 관리를 위해 개인정보를 처리합니다. 문의 내용과 연락처를 별도의 광고성 메시지 발송이나 뉴스레터 구독에 이용하지 않습니다.</p>
      </section>

      <section id="privacy-information" aria-labelledby="privacy-information-heading">
        <h2 id="privacy-information-heading">2. 처리하는 개인정보 항목</h2>
        <dl className="privacy-facts">
          <div><dt>필수 입력</dt><dd>담당자명, 연락처, 이메일</dd></div>
          <div><dt>선택 입력</dt><dd>회사명, 문의 내용 및 문의자가 본문에 직접 입력한 정보</dd></div>
          <div><dt>수집 방법</dt><dd>홈페이지의 프로젝트 문의 폼, 문의자가 직접 보내는 이메일 또는 전화 상담</dd></div>
        </dl>
        <p>회사명과 문의 내용은 입력하지 않아도 문의할 수 있습니다. 문의 본문에는 주민등록번호, 건강정보 등 상담에 필요하지 않은 민감한 정보를 입력하지 말아 주세요.</p>
      </section>

      <section id="privacy-retention" aria-labelledby="privacy-retention-heading">
        <h2 id="privacy-retention-heading">3. 보유 기간과 파기</h2>
        <p>문의 정보는 <strong>접수일로부터 1년간</strong> 보관한 후 지체 없이 파기합니다. 법령에 따라 보존해야 하는 정보가 발생하는 경우에는 해당 법령에서 정한 항목과 기간에 한해 분리하여 보관합니다.</p>
        <p>파기 대상에는 담당자가 보관한 문의 이메일과 업무용 사본이 포함됩니다. 전자파일은 복구하거나 재생할 수 없도록 삭제하고, 출력물이 있는 경우에는 분쇄 등의 방법으로 파기합니다. 외부 서비스의 보관 사항은 아래 안내를 함께 확인해 주세요.</p>
      </section>

      <section id="privacy-providers" aria-labelledby="privacy-providers-heading">
        <h2 id="privacy-providers-heading">4. 외부 서비스와 개인정보 처리</h2>
        <p>홈페이지 문의는 FormSubmit을 통해 우주기획의 Gmail 메일함으로 전달됩니다. 홈페이지 운영에는 Cloudflare를 이용합니다. 문의 데이터를 별도의 홈페이지 데이터베이스에 저장하지 않습니다.</p>
        <div className="privacy-table-wrap" role="region" aria-label="개인정보 처리에 사용하는 외부 서비스" tabIndex={0}>
          <table>
            <caption className="sr-only">서비스별 처리 업무, 개인정보와 공식 안내</caption>
            <thead><tr><th scope="col">서비스 제공자</th><th scope="col">처리 업무 및 정보</th><th scope="col">공식 안내</th></tr></thead>
            <tbody>
              <tr><th scope="row">Devro LABS<br />(FormSubmit)</th><td>문의 폼 입력 정보의 전송 및 이메일 전달. 제공자의 공식 안내상 제출 정보는 30일 보관됩니다.</td><td><a href="https://formsubmit.co/privacy.pdf">개인정보 안내</a><br /><a href="https://formsubmit.co/help">보관 기간 안내</a></td></tr>
              <tr><th scope="row">Google<br />(Gmail)</th><td>문의 이메일 수신·보관 및 답변 발송. 우주기획의 문의 이메일 보관 기준은 접수일로부터 1년입니다.</td><td><a href="https://policies.google.com/privacy?hl=ko">개인정보처리방침</a></td></tr>
              <tr><th scope="row">Cloudflare</th><td>홈페이지 호스팅, 문의 요청 처리와 보안. 서비스 제공 과정에서 IP 주소, 요청 일시·주소 등 접속 정보가 처리될 수 있습니다.</td><td><a href="https://www.cloudflare.com/ko-kr/privacypolicy/">개인정보처리방침</a></td></tr>
            </tbody>
          </table>
        </div>
        <h3>국외 처리에 관한 안내</h3>
        <p>위 서비스의 운영 과정에서 개인정보가 국외에서 처리·보관될 수 있습니다. Google과 Cloudflare는 글로벌 인프라를 운영합니다. FormSubmit의 공개 문서에는 구체적인 처리 국가와 보관 위치가 명시되어 있지 않습니다. 이 부분은 추가 확인이 필요하며, 확인된 국외 이전 국가·시기·방법·보유 기간과 이전 근거 등 세부 사항은 본 방침에 반영합니다.</p>
        <p>국외 처리나 외부 서비스 이용에 관한 문의는 아래 개인정보 보호책임자에게 연락해 주세요. 우주기획은 위 업무 처리를 위한 서비스 이용과 법령상 의무 이행 등을 제외하고 문의자의 정보를 다른 사업자의 독자적인 광고·영업 목적으로 제공하지 않습니다.</p>
      </section>

      <section id="privacy-rights" aria-labelledby="privacy-rights-heading">
        <h2 id="privacy-rights-heading">5. 이용자의 권리와 행사 방법</h2>
        <p>이용자는 자신의 개인정보에 대한 열람, 정정·삭제, 처리 정지 및 동의한 사항에 대한 동의 철회를 요청할 수 있습니다. 아래 이메일 또는 전화로 요청하면 본인 또는 정당한 대리인인지 확인한 뒤 관련 법령에 따라 처리하고 결과를 안내합니다. 법령에 따른 보관 의무 등으로 요청을 이행할 수 없는 경우에는 그 이유를 알려드립니다.</p>
        <p>필수 연락 정보를 제공하지 않으면 홈페이지 문의 접수나 답변이 제한될 수 있습니다. 선택 항목을 입력하지 않아도 문의할 수 있습니다.</p>
        <p>개인정보 침해에 관한 상담·신고는 <a href="https://privacy.kisa.or.kr">개인정보침해 신고센터</a>(국번 없이 118), 분쟁 조정은 <a href="https://www.kopico.go.kr">개인정보분쟁조정위원회</a>를 통해 신청할 수 있습니다.</p>
      </section>

      <section id="privacy-security" aria-labelledby="privacy-security-heading">
        <h2 id="privacy-security-heading">6. 개인정보 보호와 외부 콘텐츠</h2>
        <p>홈페이지 문의는 HTTPS 통신을 통해 전송됩니다. 우주기획은 업무에 필요한 담당자만 문의 정보에 접근하도록 관리하고, 보유 기간이 지난 정보를 삭제하는 방식으로 개인정보를 보호합니다.</p>
        <p>홈페이지에는 별도의 광고 추적·방문 분석 도구를 설치하지 않습니다. 다만 호스팅 서비스는 보안과 서비스 제공을 위해 접속 정보를 처리할 수 있으며, 소개 영상의 YouTube 플레이어를 재생하거나 외부 사이트로 이동하면 해당 서비스가 접속 정보 등을 처리할 수 있습니다. 쿠키는 브라우저 설정에서 허용하거나 차단할 수 있으며, 차단 시 일부 외부 콘텐츠 이용이 제한될 수 있습니다.</p>
      </section>

      <section id="privacy-contact" aria-labelledby="privacy-contact-heading">
        <h2 id="privacy-contact-heading">7. 개인정보 보호책임자</h2>
        <dl className="privacy-facts">
          <div><dt>사업자</dt><dd>우주기획</dd></div>
          <div><dt>보호책임자</dt><dd>남상빈 대표</dd></div>
          <div><dt>이메일</dt><dd><a href="mailto:reviewary.wz@gmail.com">reviewary.wz@gmail.com</a></dd></div>
          <div><dt>전화</dt><dd><a href="tel:+821023074775">010-2307-4775</a></dd></div>
        </dl>
      </section>

      <section id="privacy-changes" aria-labelledby="privacy-changes-heading">
        <h2 id="privacy-changes-heading">8. 방침의 시행 및 변경</h2>
        <p>이 방침은 2026년 11월 20일부터 시행합니다. 처리 목적, 수집 항목, 보유 기간이나 외부 서비스 등 개인정보 처리 사항이 변경되면 이 페이지를 통해 변경 내용과 시행일을 안내하며, 별도 고지 또는 동의가 필요한 경우 해당 절차를 진행합니다.</p>
      </section>
    </article>
    <SiteFooter showInquiry={false} />
  </>;
}
