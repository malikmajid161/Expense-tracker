import type { Metadata } from "next";
import { Figtree, Space_Grotesk } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Majid Ali — Developer & Designer",
  description:
    "Web & App Developer, ML/DL Engineer and UI Designer based in Pakistan. Building premium, 3D, cinematic digital experiences.",
  keywords: [
    "Majid Ali",
    "portfolio",
    "developer",
    "Next.js",
    "Three.js",
    "Machine Learning",
    "Deep Learning",
    "MATLAB",
    "UI Designer",
    "Pakistan",
  ],
  openGraph: {
    title: "Majid Ali — Developer & Designer",
    description:
      "Web & App Developer, ML/DL Engineer and UI Designer based in Pakistan.",
    type: "website",
    url: "https://majidali.dev",
    images: ["/profile.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Majid Ali — Developer & Designer",
    description: "Premium 3D animated portfolio.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${space.variable}`}>
      <body className="font-sans bg-bg text-white">{children}</body>
    </html>
  );
}
