import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GLOSSARY, getEntry, GLOSSARY_CATEGORIES } from '@/lib/glossary-data';
import { GlossaryEntryBody } from '@/components/GlossaryEntryBody';
import { GlossaryBacklinks } from '@/components/GlossaryBacklinks';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return GLOSSARY.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};
  const cat = GLOSSARY_CATEGORIES[entry.category].label;
  const title = `${entry.term} — ${cat} glossary`;
  return {
    title,
    description: entry.shortDef,
    alternates: { canonical: `/glossary/${slug}/` },
    openGraph: { title, description: entry.shortDef, url: `/glossary/${slug}/` },
  };
}

export default async function GlossaryEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Glossary', href: '/glossary/' },
          { label: entry.term, href: `/glossary/${slug}/` },
        ]}
      />
      <GlossaryEntryBody entry={entry} />
      <GlossaryBacklinks slug={entry.slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DefinedTerm',
            name: entry.term,
            description: entry.shortDef,
            inDefinedTermSet: {
              '@type': 'DefinedTermSet',
              name: 'Cost-of-Living Glossary',
              url: 'https://costbycity.com/glossary/',
            },
            url: `https://costbycity.com/glossary/${slug}/`,
            dateModified: entry.lastUpdated,
            citation: entry.citations.map((c) => ({
              '@type': 'CreativeWork',
              name: c.label,
              url: c.url,
            })),
          }),
        }}
      />
    </main>
  );
}
