import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SmoothScroll } from '@/components/smooth-scroll';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '우주기획',
  description: '우주기획 웹사이트',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SmoothScroll />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
