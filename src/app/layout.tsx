import Script from "next/script";
import { Be_Vietnam_Pro, Noto_Serif } from "next/font/google";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-T6XBRYJGWJ";

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

// Tiêu đề bài và thân bài kiểu báo (xem document/flora-design-handoff).
const serif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${body.variable} ${serif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <Script
          src="https://news.google.com/swg/js/v1/swg-basic.js"
          strategy="afterInteractive"
        />
        <Script id="swg-basic-init" strategy="afterInteractive">
          {`
            (self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {
              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAowio7IDA:openaccess",
                clientOptions: { theme: "light", lang: "vi" },
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
