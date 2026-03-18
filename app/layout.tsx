import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signux AI — The AI that knows global business",
  description: "Offshore structures, China imports, crypto security, geopolitics. One AI that actually understands all of it.",
  metadataBase: new URL("https://signux.ai"),
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Signux AI — The AI that knows global business",
    description: "Offshore structures, China imports, crypto security, geopolitics. One AI that actually understands all of it.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Signux AI — The AI that knows global business",
    description: "Offshore structures, China imports, crypto security, geopolitics. One AI that actually understands all of it.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
