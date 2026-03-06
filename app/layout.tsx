import type { Metadata } from 'next';
import './globals.css';

const APP_URL = 'https://chartinator.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Chartinator — AI-Powered MT5 Indicator Generator',
    template: '%s | Chartinator',
  },
  description:
    'Describe it. Generate it. Trade it. Turn plain English into production-ready MQL5 indicators for MetaTrader 5 — no coding required.',
  keywords: [
    'MQL5', 'MetaTrader 5', 'MT5 indicator generator', 'AI trading tools',
    'MQL5 code generator', 'algorithmic trading', 'custom indicators',
    'MetaTrader indicator builder', 'no-code trading',
  ],
  authors: [{ name: 'Chartinator' }],
  creator: 'Chartinator',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'Chartinator',
    title: 'Chartinator — AI-Powered MT5 Indicator Generator',
    description:
      'Turn plain English into production-ready MQL5 indicators for MetaTrader 5. No coding required.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Chartinator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chartinator — AI-Powered MT5 Indicator Generator',
    description:
      'Turn plain English into production-ready MQL5 indicators for MetaTrader 5. No coding required.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0e1a] text-[#e2e8f0] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
