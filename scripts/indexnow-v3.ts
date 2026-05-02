import { GLOSSARY } from '../lib/glossary-data';
import { EQUIVALENT_PAIRS } from '../lib/equivalent-pairs';

const HOST = 'costbycity.com';
const KEY = '3231223773974d6e83f0bb08aa378576';
const KEY_URL = `https://${HOST}/${KEY}.txt`;

const urls: string[] = [];
urls.push(`https://${HOST}/sources/`);
urls.push(`https://${HOST}/glossary/`);
urls.push(`https://${HOST}/equivalent/`);
urls.push(`https://${HOST}/tools/`);
urls.push(`https://${HOST}/tools/affordability-calculator/`);
urls.push(`https://${HOST}/tools/relocation-cost/`);
urls.push(`https://${HOST}/trend/`);
for (const m of ['rpp-all', 'rpp-housing', 'pce-deflator', 'real-vs-nominal']) {
  urls.push(`https://${HOST}/trend/${m}/`);
}
for (const e of GLOSSARY) urls.push(`https://${HOST}/glossary/${e.slug}/`);
for (const p of EQUIVALENT_PAIRS) urls.push(`https://${HOST}/equivalent/${p.pair_slug}/`);

console.error(`[indexnow] ${urls.length} URLs`);

(async () => {
  const body = { host: HOST, key: KEY, keyLocation: KEY_URL, urlList: urls };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  console.error(`[indexnow] HTTP ${res.status} ${res.statusText}`);
  const text = await res.text();
  if (text) console.error(text.slice(0, 200));
})();
