import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Cover Letter Generator",
  description:
    "Generate tailored cover letters instantly with AI. Built for the future of job applications.",
  keywords: [
    "cover letter",
    "AI",
    "job application",
    "resume",
    "career",
    "OpenAI",
    "GPT-4",
  ],
  authors: [{ name: "Brandon Church" }],
  openGraph: {
    title: "AI Cover Letter Generator",
    description:
      "Generate tailored, professional cover letters in seconds with AI. Powered by GPT-4o-mini.",
    type: "website",
    url: "https://ai-cover-letter-generator.vercel.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 800,
        alt: "AI Cover Letter Generator Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Cover Letter Generator",
    description:
      "Generate tailored, professional cover letters in seconds with AI",
    images: ["/og-image.png"],
    creator: "@brandonchurch",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
