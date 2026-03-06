import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Chartinator — AI-Powered MT5 Indicator Generator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1830 50%, #0a1628 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: '100px',
            padding: '6px 16px',
            marginBottom: '32px',
          }}
        >
          <span style={{ color: '#00D4FF', fontSize: '14px', fontWeight: 600 }}>
            ⚡ AI-Powered
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00D4FF 0%, #0088ff 50%, #7c3aed 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            lineHeight: 1.1,
            marginBottom: '24px',
          }}
        >
          Chartinator
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            marginBottom: '48px',
            maxWidth: '700px',
            lineHeight: 1.4,
          }}
        >
          Turn plain English into production-ready MQL5 indicators for MetaTrader 5
        </div>

        {/* Code snippet preview */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          {['RSI Color Zones', 'MACD Histogram', 'EMA Crossover', 'Bollinger Bands'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(30,58,95,0.5)',
                border: '1px solid rgba(30,58,95,0.8)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#64748b',
                fontSize: '16px',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '80px',
            color: '#334155',
            fontSize: '18px',
          }}
        >
          chartinator.netlify.app
        </div>
      </div>
    ),
    { ...size }
  );
}
