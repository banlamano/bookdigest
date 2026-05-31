import { ImageResponse } from 'next/og';

// Apple home-screen icon. Next.js auto-wires this as
// <link rel="apple-touch-icon"> when someone "Add to Home Screen"s.
// Higher-res variant of icon.tsx — 180×180 with a larger glyph.

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          color: 'white',
          fontSize: 120,
          fontWeight: 900,
          fontFamily: 'system-ui, Arial, sans-serif',
        }}
      >
        B
      </div>
    ),
    size,
  );
}
