import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";

import { SiteHeader } from "@/app/siteHeader";
import { Toaster } from "@/components/ui/sonner";
import { getGoogleSiteVerification } from "@/lib/googleSiteVerification";
import { getSiteUrl } from "@/lib/siteUrl";

import "./globals.css";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "WONK"],
});

const googleSiteVerification = getGoogleSiteVerification();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  title: {
    default: "Azərbaycanda kirayə ev və otaq platforması",
    template: "%s | kirayesin.az",
  },
  description:
    "Bakı və Azərbaycanın bütün şəhərlərində kirayə ev, otaq və otaq yoldaşı elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.",
  openGraph: {
    type: "website",
    locale: "az_AZ",
    siteName: "kirayesin.az",
    title: "Azərbaycanda kirayə ev və otaq platforması | kirayesin.az",
    description:
      "Bakı və Azərbaycanın bütün şəhərlərində kirayə ev, otaq və otaq yoldaşı elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Azərbaycanda kirayə ev və otaq platforması | kirayesin.az",
    description:
      "Bakı və Azərbaycanın bütün şəhərlərində kirayə ev, otaq və otaq yoldaşı elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="az"
      className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 md:px-10 md:py-12">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
