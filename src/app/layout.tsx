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
  title: "Asami Heaven - Premium Spa & Massage",
  description: "Experience tranquility and rejuvenation at Asami Heaven. Premium massage and spa services for your ultimate relaxation.",
  keywords: ["spa", "massage", "wellness", "relaxation", "massage therapy", "spa services"],
  authors: [{ name: "Asami Heaven" }],
  openGraph: {
    title: "Asami Heaven - Premium Spa & Massage",
    description: "Experience tranquility and rejuvenation at Asami Heaven.",
    type: "website",
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