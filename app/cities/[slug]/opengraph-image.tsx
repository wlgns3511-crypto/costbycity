import { ImageResponse } from 'next/og';
import { getCityData, getAllMetros } from '@/lib/db';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllMetros().map((m) => ({ slug: m.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getCityData(slug);

  if (!data) {
    return new ImageResponse(
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#059669', color: 'white', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 48 }}>CostByCity</div>
      </div>,
      { ...size }
    );
  }

  const { metro, rpp } = data;
  const categories = [
    { label: 'Overall', value: rpp.all || 100, color: '#059669' },
    { label: 'Housing', value: rpp.housing || 100, color: '#0891b2' },
    { label: 'Goods', value: rpp.goods || 100, color: '#7c3aed' },
    { label: 'Utilities', value: rpp.utilities || 100, color: '#ea580c' },
    { label: 'Services', value: rpp.other_services || 100, color: '#dc2626' },
  ];

  const maxVal = Math.max(...categories.map(c => c.value), 130);
  const barMaxWidth = 500;

  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', padding: '48px 56px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 20, color: '#059669', fontWeight: 700, letterSpacing: 1 }}>COSTBYCITY</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {metro.short_name}
          </div>
          <div style={{ fontSize: 22, color: '#64748b', marginTop: 4 }}>
            Cost of Living Index (100 = US Average)
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: rpp.all && rpp.all > 100 ? '#fef2f2' : '#f0fdf4', borderRadius: 16, padding: '16px 28px' }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: rpp.all && rpp.all > 100 ? '#dc2626' : '#16a34a' }}>
            {(rpp.all || 100).toFixed(1)}
          </div>
          <div style={{ fontSize: 16, color: '#64748b' }}>
            {rpp.all && rpp.all > 100 ? 'Above Average' : 'Below Average'}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
        {categories.map((cat) => (
          <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 100, fontSize: 18, color: '#475569', textAlign: 'right', fontWeight: 600 }}>
              {cat.label}
            </div>
            <div style={{ display: 'flex', position: 'relative', width: barMaxWidth, height: 36, backgroundColor: '#e2e8f0', borderRadius: 8 }}>
              <div style={{
                width: Math.round((cat.value / maxVal) * barMaxWidth),
                height: 36,
                backgroundColor: cat.color,
                borderRadius: 8,
              }} />
              {/* 100 line marker */}
              <div style={{
                position: 'absolute',
                left: Math.round((100 / maxVal) * barMaxWidth),
                top: 0,
                width: 2,
                height: 36,
                backgroundColor: '#1e293b',
              }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', width: 60 }}>
              {cat.value.toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', fontSize: 14, color: '#94a3b8' }}>
        <div>costbycity.com</div>
        <div>Black line = US Average (100)</div>
      </div>
    </div>,
    { ...size }
  );
}
