import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chartinator — AI-Powered MT5 Indicator Generator',
  description:
    'Describe it. Generate it. Trade it. Turn plain English into production-ready MQL5 indicators for MetaTrader 5 — no coding required.',
  keywords: ['MQL5', 'MetaTrader 5', 'indicator generator', 'AI trading tools', 'MT5 indicators'],
  openGraph: {
    title: 'Chartinator',
    description: 'AI-Powered MT5 Indicator Generator',
    type: 'website',
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
