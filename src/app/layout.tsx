import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";

import { SiteHeader } from "@/app/siteHeader";

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

export const metadata: Metadata = {
  title: "Roomi",
  description: "Kirayə və otaq yoldaşı elanları",
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
      </body>
    </html>
  );
}
