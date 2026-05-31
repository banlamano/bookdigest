import { ImageResponse } from 'next/og';

// Next.js convention — this file auto-routes to /icon and produces the
// favicon link tag in <head>. Replaces the broken public/icon-192.png
// (truncated to 1.6KB, browsers refused to render it).
//
// Generates a 32×32 PNG matching the navbar brand: blue gradient square
// with a white "B" mark. Cached aggressively by Vercel's edge.

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          fontSize: 22,
          fontWeight: 900,
          fontFamily: 'system-ui, Arial, sans-serif',
          borderRadius: 6,
        }}
      >
        B
      </div>
    ),
    size,
  );
}
