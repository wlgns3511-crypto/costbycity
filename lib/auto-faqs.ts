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

/**
 * Intentionally returns []. DO NOT populate.
 *
 * 2026-04-18~19 HCU defense (58 sites): this stub replaces prior auto-FAQ
 * generators that produced cross-page identical-template Q&A using only
 * page metadata (city name, price, index). That pattern is the textbook
 * HCU "scaled content abuse" signal.
 *
 * 2026-04-23 Phase 2 P1 (e4df313) briefly re-populated this with an
 * 8-question generator, reasoning that the stub was a bug. It was not a
 * bug — it was the defense. Reverted same day. See
 * memory/lessons-hard-won.md §"HCU auto-FAQ 대량 제거" for full rationale.
 *
 * If FAQs are needed again, they must be (a) hand-authored per page, or
 * (b) conditional on data that is genuinely unique per metro (not just
 * slot-filled with the metro's own numbers). Do not revive the template.
 */
export function generateAutoFaqs(
  _cityName: string,
  _rpp: RPP,
  _acs: ACS | null,
  _year: string | number,
): FaqItem[] {
  return [];
}
