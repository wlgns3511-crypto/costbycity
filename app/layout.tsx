import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5724806562146685"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}>
        <header className="border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-emerald-700">{SITE_NAME}</a>
            <nav className="flex gap-6 text-sm">
              <a href="/cities" className="hover:text-emerald-600">Cities</a>
              <a href="/compare" className="hover:text-emerald-600">Compare</a>
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
              <a href="/contact" className="hover:text-emerald-600">Contact</a>
            </p>
            <p className="mt-1">&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
