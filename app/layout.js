import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  metadataBase: new URL("https://autograde.toshankanwar.in"), // <-- change to your real domain
  title: {
    default: "AutoGrade",
    template: "%s | AutoGrade",
  },
  description:
    "AutoGrade is an automated answer evaluation system for fast, consistent, and intelligent assessment workflows.",
  keywords: [
    "AutoGrade",
    "Automated answer evaluation",
    "AI grading",
    "OCR accuracy",
    "Assessment platform",
    "Education technology",
    "Exam evaluation",
  ],
  applicationName: "AutoGrade",
  authors: [{ name: "AutoGrade Team" }],
  creator: "AutoGrade",
  publisher: "AutoGrade",
  category: "education",

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "AutoGrade",
    description:
      "Automated answer evaluation system with OCR support and smart grading workflows.",
    url: "https://autograde.toshankanwar.in", // <-- change
    siteName: "AutoGrade",
    images: [
      {
        url: "/og-image.png", // place this file in /public
        width: 1200,
        height: 630,
        alt: "AutoGrade - Automated Evaluation Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "AutoGrade",
    description:
      "Automated answer evaluation system with OCR support and smart grading workflows.",
    images: ["/og-image.png"], // place in /public
    creator: "@toshan-kanwar", // optional: change/remove
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // optional
  },

  // Canonical
  alternates: {
    canonical: "/",
  },

  // Extra
  other: {
    "theme-color": "#10b981",
    "color-scheme": "light",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-slate-50 text-slate-900`}>
        <div id="Genz-Toshan">
        <Toaster position="top-right" />
        {children}
        <Footer />
        </div>
      </body>
    </html>
  );
}