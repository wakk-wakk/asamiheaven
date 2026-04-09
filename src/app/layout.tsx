import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://asamiheaven.vercel.app"),
  title: {
    default: "Asami Heaven - Premium Spa & Massage",
    template: "%s | Asami Heaven",
  },
  description: "Experience tranquility and rejuvenation at Asami Heaven. Premium massage and spa services for your ultimate relaxation in Metro Manila.",
  keywords: ["spa", "massage", "wellness", "relaxation", "massage therapy", "spa services", "Metro Manila spa", "Japanese massage", "premium spa"],
  authors: [{ name: "Asami Heaven" }],
  creator: "Asami Heaven",
  publisher: "Asami Heaven",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://asamiheaven.vercel.app",
    siteName: "Asami Heaven",
    title: "Asami Heaven - Premium Spa & Massage",
    description: "Experience tranquility and rejuvenation at Asami Heaven. Premium massage and spa services for your ultimate relaxation.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Asami Heaven - Premium Spa & Massage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asami Heaven - Premium Spa & Massage",
    description: "Experience tranquility and rejuvenation at Asami Heaven. Premium massage and spa services.",
    images: ["/og-image.jpg"],
    creator: "@asamiheaven",
  },
  verification: {
    google: "google2c781e3ff6fd1b88",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 pt-16 md:pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
