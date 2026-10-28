import { ArrowUpRight, CirclePlay, Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { InquiryFields } from '@/components/inquiry-form';
import './contact.css';

export const metadata = {
  title: 'CONTACT · 우주기획',
  description: '브랜드의 고민부터 새로운 프로젝트까지, 우주기획에 편하게 들려주세요. 전략, 콘텐츠, 광고와 SNS 운영에 필요한 다음 단계를 함께 찾겠습니다.',
};

export default function ContactPage() {
  return <div className="contact-page">
    <div className="contact-container contact-layout">
      <section className="contact-intro" aria-labelledby="contact-heading">
        <p className="contact-eyebrow">CONTACT</p>
        <h1 id="contact-heading">브랜드의 다음 이야기,<br /><span>함께 시작해요.</span></h1>
        <p className="contact-description">작은 아이디어부터 구체적인 프로젝트까지.<br />지금의 고민을 편하게 들려주세요.<br />브랜드에 필요한 다음 단계를 함께 찾겠습니다.</p>
        <p className="contact-response"><Clock3 size={14} aria-hidden="true" /> 영업일 1~2일 이내로 연락드리겠습니다.</p>

        <address className="contact-details">
          <a href="mailto:reviewary.wz@gmail.com"><span className="contact-icon"><Mail size={18} strokeWidth={1.5} aria-hidden="true" /></span><span><small>EMAIL</small><span>reviewary.wz@gmail.com</span></span><ArrowUpRight size={16} aria-hidden="true" /></a>
          <a href="tel:+821023074775"><span className="contact-icon"><Phone size={17} strokeWidth={1.5} aria-hidden="true" /></span><span><small>PHONE</small><span>010-2307-4775</span></span><ArrowUpRight size={16} aria-hidden="true" /></a>
          <div className="contact-address"><span className="contact-icon"><MapPin size={18} strokeWidth={1.5} aria-hidden="true" /></span><span><small>OFFICE</small><span>인천광역시 중구 신포로46번길 5,<br />2층 청년내일기지 공유오피스 3<br /><span className="contact-address-note">(내동, 신포스카이타워)</span></span></span></div>
        </address>
        <a className="contact-youtube" href="https://www.youtube.com/@WOOJUWORLDWIDE" target="_blank" rel="noopener noreferrer" aria-label="우주기획 YouTube 채널 (새 탭)"><CirclePlay size={18} strokeWidth={1.5} aria-hidden="true" /> 우주기획의 이야기 <ArrowUpRight size={14} aria-hidden="true" /></a>
      </section>

      <section className="contact-form-card" id="contact" aria-labelledby="contact-form-heading">
        <div className="contact-form-heading"><h2 id="contact-form-heading">프로젝트 문의</h2><span><span aria-hidden="true">*</span> 필수 입력</span></div>
        <p className="contact-form-lead">남겨주신 내용을 꼼꼼히 살펴보겠습니다.</p>
        <InquiryFields />
      </section>
    </div>
    <footer className="contact-footer contact-container" aria-label="우주기획 회사 정보">
      <p>우주기획 <span aria-hidden="true">·</span> 대표 남상빈 <span className="contact-footer-divider" aria-hidden="true">·</span><span className="contact-registration">사업자등록번호 149-40-01125</span></p>
      <small>© WOOJU PLANNING. All rights reserved.</small>
    </footer>
  </div>;
}
