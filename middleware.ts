import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * costbycity middleware — HCU 5-chunk Phase A (2026-05-02 V3).
 *
 * Veto #7: CLEAR. All base data primary-source (BEA RPP/PCE, ACS, NREL TMY3, EIA Form 826).
 * Composite metrics (affordability, real-RPP, HVAC, real-wage equivalent) are derivations
 * from primary data per BEA/DOE-defined formulas — NOT synthesized.
 *
 * 3-AXIS quarantine:
 *   AXIS A (indexable):   /, /cities/*, /state/*, /blog/*, /guide/*, /insights/*,
 *                         /rankings/*, /compare/*, /methodology, /sources, /about,
 *                         /tools/*, /trend/*, /equivalent/*, /glossary/*
 *   AXIS B (noindex):     /search/*, /embed/*  (functional surfaces, not unique content)
 *   HARD 410:             /es/*, /states/*, /https?:/*  (legacy/synthetic crawler probes)
 *
 * Trap #16 safe: 410s return inline HTML directly (no rewrite to /410).
 *                app/410/page.tsx exists as belt-and-suspenders.
 */

const ES_KILL_RE = /^\/es(\/.*)?$/;
const STATES_KILL_RE = /^\/states(\/.*)?$/;
const HTTPS_KILL_RE = /^\/https?:/;

const AXIS_B_RE = /^\/(search|embed)(\/.*)?$/;

const EDGE_VERSION = '2026-05-02-tier-s-v3';

const GONE_HTML =
  '<!DOCTYPE html><html><head><title>410 Gone</title>' +
  '<meta name="robots" content="noindex"></head>' +
  '<body><h1>410 Gone</h1><p>This URL is no longer available.</p>' +
  '<p><a href="/">Return to costbycity home →</a></p></body></html>';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (HTTPS_KILL_RE.test(pathname) || ES_KILL_RE.test(pathname) || STATES_KILL_RE.test(pathname)) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=86400',
        'X-Edge-Version': EDGE_VERSION,
      },
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('X-Edge-Version', EDGE_VERSION);

  if (AXIS_B_RE.test(pathname)) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|icon.svg|robots.txt|sitemap.xml|feed.xml|api).*)'],
};
