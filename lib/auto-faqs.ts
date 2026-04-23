import { formatDollar, formatPctDiff, formatIndex } from './format';

export interface FaqItem {
  question: string;
  answer: string;
}

interface RPP {
  all: number | null;
  goods: number | null;
  services_housing: number | null;
  services_other: number | null;
  housing: number | null;
}

interface ACS {
  median_income: number | null;
  median_home_value: number | null;
  median_rent: number | null;
  per_capita_income: number | null;
  population?: number | null;
}

export function generateAutoFaqs(
  cityName: string,
  rpp: RPP,
  acs: ACS | null,
  year: string | number,
): FaqItem[] {
  return [];
}
