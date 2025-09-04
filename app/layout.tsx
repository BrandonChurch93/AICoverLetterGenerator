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
  keywords: ["cover letter", "AI", "job application", "resume", "career"],
  authors: [{ name: "Brandon Church" }],
  openGraph: {
    title: "AI Cover Letter Generator",
    description: "Generate tailored cover letters instantly with AI",
    type: "website",
  },
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
