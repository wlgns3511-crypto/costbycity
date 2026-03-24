const SITE_NAME = 'CostByCity';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://costbycity.com';

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateCityFAQs(
  cityName: string,
  rpp: Record<string, number>,
  acs: { median_income: number | null; median_rent: number | null; median_home_value: number | null } | null,
): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const allRpp = rpp.all;

  if (allRpp) {
    const diff = allRpp - 100;
    const dir = diff > 0 ? 'above' : 'below';
    faqs.push({
      question: `Is ${cityName} expensive to live in?`,
      answer: `${cityName} has a cost of living index of ${allRpp.toFixed(1)}, which is ${Math.abs(diff).toFixed(1)}% ${dir} the national average.`,
    });
  }

  if (rpp.housing) {
    faqs.push({
      question: `How much does housing cost in ${cityName}?`,
      answer: `Housing costs in ${cityName} are indexed at ${rpp.housing.toFixed(1)} compared to the national average of 100.${acs?.median_rent ? ` The median monthly rent is $${acs.median_rent.toLocaleString('en-US')}.` : ''}`,
    });
  }

  if (acs?.median_income) {
    faqs.push({
      question: `What is the average income in ${cityName}?`,
      answer: `The median household income in ${cityName} is $${acs.median_income.toLocaleString('en-US')} per year.`,
    });
  }

  if (acs?.median_home_value) {
    faqs.push({
      question: `What is the average home price in ${cityName}?`,
      answer: `The median home value in ${cityName} is $${acs.median_home_value.toLocaleString('en-US')}.`,
    });
  }

  return faqs;
}

export function generateCompareFAQs(
  cityA: string,
  cityB: string,
  rppA: Record<string, number>,
  rppB: Record<string, number>,
): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];

  if (rppA.all && rppB.all) {
    const cheaper = rppA.all < rppB.all ? cityA : cityB;
    const diff = Math.abs(rppA.all - rppB.all).toFixed(1);
    faqs.push({
      question: `Is ${cityA} or ${cityB} cheaper to live in?`,
      answer: `${cheaper} is more affordable. The cost of living difference is ${diff} index points (${cityA}: ${rppA.all.toFixed(1)}, ${cityB}: ${rppB.all.toFixed(1)}).`,
    });
  }

  if (rppA.housing && rppB.housing) {
    const cheaper = rppA.housing < rppB.housing ? cityA : cityB;
    faqs.push({
      question: `Where is housing cheaper, ${cityA} or ${cityB}?`,
      answer: `Housing is more affordable in ${cheaper}. Housing index: ${cityA} (${rppA.housing.toFixed(1)}) vs ${cityB} (${rppB.housing.toFixed(1)}).`,
    });
  }

  return faqs;
}
