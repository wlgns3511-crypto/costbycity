import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UpgradeAnalytics } from "@/components/upgrades/UpgradeAnalytics";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_NAME = "CostByCity";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://costbycity.com";

// Root alternates kept for /es/ hreflang signaling (page-level metadata
// still advertises the Spanish mirror). /es/ dropped from sitemap 2026-04-23.
const ROOT_ALTERNATE_LANGUAGES = {
  en: `${SITE_URL}/`,
  es: `${SITE_URL}/es/`,
  'x-default': `${SITE_URL}/`,
} as const;

// 2026-04-23 Step 1b-ext: removed headers()-based dynamic html lang switch.
// Reason: calling headers() in the root layout forced EVERY route in the tree
// to render dynamically (ƒ), which silently disabled `dynamicParams = false`
// validation — pruned state-variant URLs hit the route handler, called
// notFound(), and Next.js 16 returned HTTP 200 + 404 HTML body (soft-404).
// With static rendering restored, dynamicParams=false now filters unknown
// params at the routing layer and returns real HTTP 404.
// Trade-off: /es/* pages now have lang="en" on the <html> tag. Acceptable
// because /es/ is already deprioritized (dropped from sitemap) and hreflang
// alternates still signal the Spanish URL.


export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Cost of Living Comparison by US City`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Compare cost of living across 380+ US metro areas. Housing, groceries, utilities, and more. Data from the Bureau of Economic Analysis.",
  metadataBase: new URL(SITE_URL),
  alternates: { languages: ROOT_ALTERNATE_LANGUAGES },
  // robots metadata intentionally omitted at root (2026-04-23).
  // Default behavior (index, follow) is already Google's assumption — making
  // it explicit at root caused a duplicate meta tag on not-found.tsx: Next.js
  // 16 adds `<meta name="robots" content="noindex">` for notFound() responses
  // but fails to override the root's `index, follow` tag, leaving BOTH in the
  // HTML. Individual pages that need noindex (e.g., /embed/relocation) still
  // declare it explicitly in their own metadata export.
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  other: { "google-adsense-account": "ca-pub-5724806562146685" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XH5GHVTE6D" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XH5GHVTE6D');` }} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5724806562146685"
          crossOrigin="anonymous"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "name": "CostByCity",
              "url": "https://costbycity.com",
              "description": "Compare cost of living across 380+ US metro areas. Housing, groceries, utilities, and more. Data from the Bureau of Economic Analysis.",
              "inLanguage": "en-US",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://costbycity.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "Organization",
              "name": "CostByCity",
              "url": "https://costbycity.com",
              "description": "Compare cost of living across 380+ US metro areas. Housing, groceries, utilities, and more. Data from the Bureau of Economic Analysis.",
              "parentOrganization": {
                "@type": "Organization",
                "name": "DataPeek Research Network",
                "url": "https://datapeekfacts.com"
              }
            }]
        }) }} />
      </head>
      <body className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}>
        <UpgradeAnalytics />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:border focus:rounded">Skip to content</a>
        <header className="border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-emerald-700">{SITE_NAME}</a>
            <nav className="flex gap-6 text-sm">
              <a href="/cities/" className="hover:text-emerald-600">Cities</a>
              {/* 2026-04-28 — 'Compare' nav 제거 (AdSense scaled-content remediation).
                  /compare/* 트리는 4/18 doorway-thin 판단으로 noindex 처리됨.
                  Sitewide layout 링크는 모든 indexable 페이지에 박히므로 AdSense
                  리뷰어가 noindex 트리로 직행. 직접 URL 입력 시엔 페이지 그대로 작동. */}
              <a href="/guide/" className="hover:text-emerald-600">Guides</a>
              <a href="/blog/" className="hover:text-emerald-600">Articles</a>
              <a href="/es/" className="text-slate-400 hover:text-emerald-600 text-xs">ES</a>
            </nav>
          </div>
        </header>
        <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p>Powered by data from the Bureau of Economic Analysis (BEA) Regional Price Parities and U.S. Census Bureau.</p>
            <p className="mt-2">
              <a href="/about/" className="hover:text-emerald-600">About</a>
              {" | "}
              <a href="/privacy/" className="hover:text-emerald-600">Privacy</a>
              {" | "}
              <a href="/terms/" className="hover:text-emerald-600">Terms</a>
              {" | "}
              <a href="/disclaimer/" className="hover:text-emerald-600">Disclaimer</a>
              {" | "}
              <a href="/contact/" className="hover:text-emerald-600">Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">More Insights</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://salarybycity.com" className="hover:text-emerald-600" rel="nofollow noopener">Salaries</a>
                <a href="https://guidebycity.com" className="hover:text-emerald-600" rel="nofollow noopener">City Guides</a>
                <a href="https://zippeek.com" className="hover:text-emerald-600" rel="nofollow noopener">ZIP Codes</a>
                <a href="https://fairrentwize.com" className="hover:text-emerald-600" rel="nofollow noopener">Fair Rents</a>
                <a href="https://propertytaxpeek.com" className="hover:text-emerald-600" rel="nofollow noopener">Property Tax</a>
              </div>
            </div>
            <p className="mt-3 text-xs italic text-slate-400">Comparing what it really costs to live in 380+ metro areas.</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} {SITE_NAME}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
