import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PlaceIt - 공간 예약 시스템',
    template: '%s | PlaceIt',
  },
  description:
    '쉽고 빠른 공간 예약 관리 시스템으로 회의실과 공용 공간을 효율적으로 관리하세요.',
  keywords: [
    '공간예약',
    '회의실예약',
    '예약시스템',
    'PlaceIt',
    '공간관리',
    '회의실관리',
    '오피스 관리',
    '워크스페이스',
  ],
  authors: [{ name: 'PlaceIt Team' }],
  creator: 'PlaceIt',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://placeit-front.vercel.app',
    title: 'PlaceIt - 공간 예약 시스템',
    description: '쉽고 빠른 공간 예약 관리 시스템',
    siteName: 'PlaceIt',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlaceIt - 공간 예약 시스템',
    description: '쉽고 빠른 공간 예약 관리 시스템',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <div id="portal-root" />
        <div id="root" className="min-h-screen bg-gray-50">
          {children}
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-black text-white text-xs px-2 py-1 rounded opacity-50">
              dev
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
