import './site-footer.css';
import { InquiryForm } from './inquiry-form';

const services = [
  ['전략기획', '/services#strategy'],
  ['영상·사진 & 콘텐츠 제작', '/services#creative'],
  ['디지털 퍼포먼스', '/services#performance'],
  ['SNS·바이럴 마케팅', '/services#social'],
];

export function SiteFooter({ showInquiry = true }: { showInquiry?: boolean }) {
  return (
    <footer className="uju-footer" id="footer" aria-label="우주기획 회사 정보">
      {showInquiry && <InquiryForm />}
      <div className="uju-footer-content">
        <div className="uju-footer-top">
          <div className="uju-footer-brand">
            <a className="uju-footer-name" href="/">우주기획</a>
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
                <li><a href="/about">브랜드 이야기</a></li>
                <li><a href="/services">서비스 소개</a></li>
                <li><a href="/#brand-process">우주를 보는 시선</a></li>
              </ul>
            </nav>
            <div className="uju-footer-contact">
              <h2>함께하기</h2>
              <ul>
                <li><a href="tel:+821023074775">010-2307-4775</a></li>
                <li className="uju-footer-email"><a href="mailto:reviewary.wz@gmail.com">reviewary.wz@gmail.com</a></li>
                <li><a href="https://www.youtube.com/@WOOJUWORLDWIDE" target="_blank" rel="noopener noreferrer" aria-label="우주기획 YouTube 채널 (새 탭)">YouTube <span aria-hidden="true">↗</span></a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="uju-footer-details">
          <p className="uju-footer-company">우주기획 <span aria-hidden="true">|</span> 대표: 남상빈</p>
          <p>사업자등록번호: 149-40-01125</p>
          <address>인천광역시 중구 신포로46번길 5,<br />2층 청년내일기지 공유오피스 3 (내동, 신포스카이타워)</address>
        </div>
      </div>

      <p className="uju-footer-wordmark">UJU PLANNING</p>
      <div className="uju-footer-bottom">
        <small>© UJU PLANNING. All rights reserved.</small>
        <a href="#site-top">맨 위로 <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}
