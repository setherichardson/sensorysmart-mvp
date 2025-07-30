import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import PWAServiceWorker from "./components/PWAServiceWorker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add Mona Sans font
const monaSans = {
  variable: "--font-mona-sans",
  style: "normal",
  weight: "400",
  src: "url('https://fonts.cdnfonts.com/css/mona-sans')",
};

export const metadata: Metadata = {
  title: "SensorySmart - Sensory Support for Children",
  description: "Discover your child's unique sensory needs and get personalized activities to help them thrive. Science-based assessments and expert guidance.",
  keywords: ["sensory processing", "child development", "parenting", "occupational therapy", "sensory activities"],
  authors: [{ name: "SensorySmart Team" }],
  creator: "SensorySmart",
  publisher: "SensorySmart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SensorySmart - Sensory Support for Children",
    description: "Discover your child's unique sensory needs and get personalized activities to help them thrive.",
    url: '/',
    siteName: 'SensorySmart',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SensorySmart - Sensory Support for Children',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SensorySmart - Sensory Support for Children",
    description: "Discover your child's unique sensory needs and get personalized activities to help them thrive.",
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SensorySmart',
  },
  applicationName: 'SensorySmart',
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'SensorySmart',
    'application-name': 'SensorySmart',
    'msapplication-TileColor': '#367A87',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#367A87',
    'apple-mobile-web-app-orientations': 'portrait',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F6F6' },
    { media: '(prefers-color-scheme: dark)', color: '#F6F6F6' },
  ],
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#367A87" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SensorySmart" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#367A87" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* iOS Splash Screen Images */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="/splash-screens/apple-touch-startup-image-640x1136.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/splash-screens/apple-touch-startup-image-750x1334.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="/splash-screens/apple-touch-startup-image-1125x2436.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/splash-screens/apple-touch-startup-image-1170x2532.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" href="/splash-screens/apple-touch-startup-image-1284x2778.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* <PWAServiceWorker /> */}
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F1R40ZZC8P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F1R40ZZC8P');
            
            // Make gtag available globally for custom events
            window.gtag = gtag;
          `}
        </Script>
      </body>
    </html>
  );
}
