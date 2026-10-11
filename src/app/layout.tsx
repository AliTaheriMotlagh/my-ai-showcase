import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { BottomNav, MobileHeader, Sidebar } from "@/components/layout/Navigation";
import { JsonLd } from "@/components/ui/primitives";
import { Toaster } from "@/components/ui/toast";
import { siteJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const title = `${site.name} — ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: site.keywords,
  creator: site.name,
  publisher: site.name,
  category: "social",
  openGraph: { type: "website", siteName: site.name, title, description: site.description, url: "/", locale: "en_US" },
  twitter: { card: "summary_large_image", site: site.twitter, creator: site.twitter, title, description: site.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// Runs before paint so the saved theme never flashes. Dark is the default.
const themeScript = `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.remove("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${instrument.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <JsonLd data={siteJsonLd()} />
        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <MobileHeader />
            <main id="main" className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
              {children}
            </main>
          </div>
        </div>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
