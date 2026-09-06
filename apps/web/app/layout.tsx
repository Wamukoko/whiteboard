import type { Metadata, Viewport } from "next";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-newsreader",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WhiteBoard — Ask. Learn. Become.",
    template: "%s · WhiteBoard",
  },
  description:
    "An inclusive digital learning ecosystem for Kenyan families and schools: CBC & Cambridge practice, live classes, and verified scholarship opportunities.",
  applicationName: "WhiteBoard",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "WhiteBoard" },
  icons: {
    icon: [{ url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "WhiteBoard — Ask. Learn. Become.",
    description:
      "Inclusive digital learning for Kenyan families: CBC & Cambridge practice, live classes, scholarships.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf8ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* next/font covers the UI fonts; Material Symbols are an external icon font by design */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ("serviceWorker" in navigator && location.protocol === "https:") { navigator.serviceWorker.register("/sw.js").catch(() => {}); }`,
          }}
        />
      </head>
      <body className="bg-surface text-on-surface font-sans tap-highlight-none">
        {children}
      </body>
    </html>
  );
}