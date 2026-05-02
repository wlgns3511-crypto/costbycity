import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: '410 Gone — costbycity',
  robots: { index: false, follow: false },
};

export default function GonePage() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center', maxWidth: '40rem', margin: '0 auto' }}>
      <h1>410 Gone</h1>
      <p>This URL is no longer available.</p>
      <p>
        <a href="/">Return to costbycity home →</a>
      </p>
    </main>
  );
}
