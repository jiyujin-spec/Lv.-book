import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Lv. Book — 魔法の成長日誌',
  description: '日々の努力をRPGとして楽しむ自己成長アプリ。冒険の書に刻まれる、あなたの歩み。',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lv. Book',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0d0b08',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ background: '#0d0b08', overflow: 'hidden' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
