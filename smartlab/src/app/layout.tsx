import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'smartLAB — نظام إدارة المختبرات الهندسية',
  description: 'منصة متكاملة لإدارة اختبارات الخرسانة والأسفلت والتربة مع دعم الأجهزة المؤتمتة',
  keywords: ['مختبر', 'خرسانة', 'أسفلت', 'تربة', 'ISO 17025', 'مارشال', 'كسر مكعبات'],
  authors: [{ name: 'SmartLab Team' }],
  metadataBase: new URL('http://localhost:8190'),
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: '/',
    siteName: 'smartLAB',
    title: 'smartLAB — نظام إدارة المختبرات الهندسية',
    description: 'منصة متكاملة لإدارة اختبارات الخرسانة والأسفلت والتربة',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="rtl">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}