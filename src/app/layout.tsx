import {
  Be_Vietnam_Pro,
  Literata,
  Noto_Sans_SC,
  Noto_Sans_KR,
  Noto_Sans_Devanagari,
  Noto_Sans_Sinhala,
} from "next/font/google";
import "./globals.css";

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const display = Literata({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
});

const notoSc = Noto_Sans_SC({
  variable: "--font-zh",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoKr = Noto_Sans_KR({
  variable: "--font-ko",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoHi = Noto_Sans_Devanagari({
  variable: "--font-hi",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "700"],
});

const notoSi = Noto_Sans_Sinhala({
  variable: "--font-si",
  subsets: ["sinhala", "latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${body.variable} ${display.variable} ${notoSc.variable} ${notoKr.variable} ${notoHi.variable} ${notoSi.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
