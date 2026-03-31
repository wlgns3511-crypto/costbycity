import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_NAME = "CostByCity";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://costbycity.com";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Cost of Living Comparison by US City`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Compare cost of living across 380+ US metro areas. Housing, groceries, utilities, and more. Data from the Bureau of Economic Analysis.",
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
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
              "sameAs": ["https://vocabwize.com", "https://vocablibre.com", "https://wortwize.com", "https://kalimawize.com", "https://dicionariowize.com", "https://kotobapeek.com", "https://salarybycity.com", "https://netpaypeek.com", "https://wagepeek.com", "https://fairrentwize.com", "https://propertytaxpeek.com", "https://degreewize.com", "https://nameblooms.com", "https://myschoolpeek.com", "https://medcheckwize.com", "https://medcostpeek.com", "https://eldercarepeek.com", "https://ingredipeek.com", "https://caloriewize.com", "https://powerbillpeek.com", "https://sunpowerpeek.com", "https://shipcalcwize.com", "https://tariffpeek.com", "https://visapeek.com", "https://zippeek.com", "https://calcpeek.com", "https://datapeekfacts.com", "https://guidebycity.com", "https://homepricepeek.com", "https://safecitypeek.com"]
            }
          ]
        }) }} />
      </head>
      <body className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}>
        <header className="border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-emerald-700">{SITE_NAME}</a>
            <nav className="flex gap-6 text-sm">
              <a href="/cities" className="hover:text-emerald-600">Cities</a>
              <a href="/compare" className="hover:text-emerald-600">Compare</a>
              <a href="/blog/" className="hover:text-emerald-600">Guides</a>
              <a href="/es/" className="text-slate-400 hover:text-emerald-600 text-xs">ES</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p>Data from the Bureau of Economic Analysis (BEA) Regional Price Parities and U.S. Census Bureau.</p>
            <p className="mt-2">
              <a href="/about" className="hover:text-emerald-600">About</a>
              {" | "}
              <a href="/privacy" className="hover:text-emerald-600">Privacy</a>
              {" | "}
              <a href="/terms" className="hover:text-emerald-600">Terms</a>
              {" | "}
              <a href="/disclaimer" className="hover:text-emerald-600">Disclaimer</a>
              {" | "}
              <a href="/contact" className="hover:text-emerald-600">Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Related Resources</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://salarybycity.com" className="hover:text-emerald-600">Salaries</a>
                <a href="https://guidebycity.com" className="hover:text-emerald-600">City Guides</a>
                <a href="https://zippeek.com" className="hover:text-emerald-600">ZIP Codes</a>
                <a href="https://fairrentwize.com" className="hover:text-emerald-600">Fair Rents</a>
                <a href="https://propertytaxpeek.com" className="hover:text-emerald-600">Property Tax</a>
              </div>
            </div>
            <p className="mt-1">&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
