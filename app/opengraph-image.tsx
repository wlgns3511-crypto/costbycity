import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CostByCity - Cost of Living Comparison by City';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#059669', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 72, fontWeight: 800, marginBottom: 16 }}>CostByCity</div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>Cost of Living Comparison by City</div>
      </div>
    ),
    { ...size }
  );
}
