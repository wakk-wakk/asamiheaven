import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import PhoneCaptureDialog from "@/components/PhoneCaptureDialog";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
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
     locale: "en_US",
     alternateLocale: ["en_PH"],
     url: "https://asamiheaven.vercel.app",
     siteName: "Asami Heaven",
     title: "Asami Heaven - Premium Spa & Massage",
     description: "Experience tranquility and rejuvenation at Asami Heaven. Premium massage and spa services for your ultimate relaxation.",
     images: [
       {
         url: "https://asamiheaven.vercel.app/og-image-v5.jpg",
         secureUrl: "https://asamiheaven.vercel.app/og-image-v5.jpg",
         width: 1200,
         height: 630,
         alt: "Asami Heaven - Premium Spa & Massage",
         type: "image/jpeg",
       },
     ],
   },
   twitter: {
     card: "summary_large_image",
     title: "Asami Heaven - Premium Spa & Massage",
     description: "Experience tranquility and rejuvenation at Asami Heaven. Premium massage and spa services.",
     images: ["https://asamiheaven.vercel.app/og-image-v5.jpg"],
     creator: "@asamiheaven",
   },
  alternates: {
    canonical: "https://asamiheaven.vercel.app",
  },
  verification: {
    google: "RtB5bbJkcGVUCqmWdTGb0olrosAQkPBZLo5t3xxKfWE",
  },
  other: {
    "robots": "index, follow",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
}

// Organization Schema JSON-LD
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Asami Heaven",
  "url": "https://asamiheaven.vercel.app",
  "logo": "https://asamiheaven.vercel.app/icon.png",
  "description": "Premium spa and massage services in Metro Manila, Philippines. Specializing in Nuru massage and wellness treatments.",
  "areaServed": {
    "@type": "City",
    "name": "Metro Manila",
    "containedInPlace": {
      "@type": "Country",
      "name": "Philippines"
    }
  },
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "areaServed": "PH"
  }
}

const paths = {
  '/services': {
    title: 'Our Services',
    description: 'Discover our range of premium massage and spa services in Metro Manila. Each designed to rejuvenate your body and calm your mind.',
  },
  '/therapists': {
    title: 'Our Models',
    description: 'Meet our team of skilled professionals at Asami Heaven. Metro Manilas most captivating top-tier models.',
  },
  '/contact': {
    title: 'Contact Us',
    description: 'Get in touch with Asami Heaven. Contact us for inquiries or any questions about our spa services.',
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 pt-16 md:pt-20">
          {children}
        </main>
        <Footer />
        <PhoneCaptureDialog />
      </body>
    </html>
  );
}
