import './site-footer.css';

const services = [
  ['전략기획', '#service-strategy'],
  ['영상·사진 & 콘텐츠 제작', '#service-creative'],
  ['디지털 퍼포먼스', '#service-performance'],
  ['SNS·바이럴 마케팅', '#service-social'],
];

export function SiteFooter() {
  return (
    <footer className="uju-footer" id="footer" aria-label="우주기획 회사 정보">
      <div className="uju-footer-content">
        <div className="uju-footer-top">
          <div className="uju-footer-brand">
            <a className="uju-footer-name" href="#page-top">우주기획</a>
            <p>브랜드의 가능성을 발견하고,<br />성장의 다음 항로를 만듭니다.</p>
          </div>

          <div className="uju-footer-directory">
            <nav aria-labelledby="footer-services-heading">
              <h2 id="footer-services-heading">하는 일</h2>
              <ul>
                {services.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}
              </ul>
            </nav>
            <nav aria-labelledby="footer-about-heading">
              <h2 id="footer-about-heading">우주기획</h2>
              <ul>
                <li><a href="#page-top">브랜드 이야기</a></li>
                <li><a href="#services">서비스 소개</a></li>
                <li><a href="#telescope-study">우주를 보는 시선</a></li>
              </ul>
            </nav>
            <div className="uju-footer-contact">
              <h2>함께하기 <span className="uju-footer-placeholder">임시 정보</span></h2>
              <ul>
                <li>010-0000-0000</li>
                <li className="uju-footer-email">hello@ujuplanning.example</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="uju-footer-details">
          <p className="uju-footer-company">우주기획 <span aria-hidden="true">|</span> 대표: 남상빈</p>
          <p>사업자등록번호: 000-00-00000</p>
          <p>서울특별시 ○○구 ○○로 00, 0층</p>
          <p className="uju-footer-disclaimer">연락처·이메일·주소·사업자등록번호는 임시 표기입니다.</p>
        </div>
      </div>

      <p className="uju-footer-wordmark">UJU PLANNING</p>
      <div className="uju-footer-bottom">
        <small>© UJU PLANNING. All rights reserved.</small>
        <a href="#page-top">맨 위로 <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
