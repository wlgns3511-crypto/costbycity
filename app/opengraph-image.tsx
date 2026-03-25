import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CostByCity - Cost of Living Comparison';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
          CostByCity
        </div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>
          Cost of Living Comparison
        </div>
      </div>
    ),
    { ...size }
  );
}
