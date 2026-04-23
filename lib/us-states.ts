/** Two-letter state code to full name mapping */
export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

/** Full state name to 2-letter code */
const NAME_TO_CODE: Record<string, string> = {};
for (const [code, name] of Object.entries(STATE_NAMES)) {
  NAME_TO_CODE[name.toLowerCase()] = code;
}

/** Convert state name slug (e.g. "new-york") to state code (e.g. "NY") */
export function stateSlugToCode(slug: string): string | undefined {
  const name = slug.replace(/-/g, ' ');
  return NAME_TO_CODE[name];
}

/** Convert state code to URL slug (e.g. "NY" -> "new-york") */
export function stateCodeToSlug(code: string): string {
  const name = STATE_NAMES[code];
  if (!name) return code.toLowerCase();
  return name.toLowerCase().replace(/\s+/g, '-');
}

/** Get state full name from code */
export function stateFullName(code: string): string {
  return STATE_NAMES[code] || code;
}
