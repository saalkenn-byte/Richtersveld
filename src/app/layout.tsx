import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Richtersveld Gemeenskap & Besighede | Plaaslike Entrepreneurs",
  description: "Eenvoudige, vinnige PWA vir die Richtersveld wat selfs op stadige data werk en plaaslike entrepreneurs direk aan kliënte verbind.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  applicationName: "Richtersveld App",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Richtersveld",
  },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="af" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-amber-50/50 text-stone-900 antialiased font-sans min-h-screen selection:bg-orange-200">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration error:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
