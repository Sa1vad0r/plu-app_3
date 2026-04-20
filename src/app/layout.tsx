import type { Metadata, Viewport } from 'next';
import SWRegister from '@/components/SWRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'PLU Quick Search',
  description: 'Quick PLU lookup tool for meat production',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PLU Search',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <SWRegister />
        {children}
      </body>
    </html>
  );
}
