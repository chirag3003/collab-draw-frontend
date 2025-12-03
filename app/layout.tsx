import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@excalidraw/excalidraw/index.css";
import ApolloProvider from "@/components/providers/ApolloProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Collab Draw - Real-time Collaborative Drawing & Diagramming",
    template: "%s | Collab Draw",
  },
  description: "Create beautiful diagrams, wireframes, and illustrations with your team in real-time. Powered by Excalidraw with smart conflict resolution and workspace management.",
  keywords: [
    "collaborative drawing",
    "real-time collaboration",
    "diagramming tool",
    "wireframes",
    "excalidraw",
    "team collaboration",
    "visual collaboration",
    "flowcharts",
    "whiteboard",
    "online drawing",
  ],
  authors: [{ name: "Chirag Bhalotia", url: "https://chirag.codes" }],
  creator: "Chirag Bhalotia",
  publisher: "Chirag Bhalotia",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Collab Draw",
    title: "Collab Draw - Real-time Collaborative Drawing",
    description: "Create beautiful diagrams, wireframes, and illustrations with your team in real-time.",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 630,
        alt: "Collab Draw",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Collab Draw - Real-time Collaborative Drawing",
    description: "Create beautiful diagrams, wireframes, and illustrations with your team in real-time.",
    images: ["/favicon.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ApolloProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased  bg-background`}
          >
            {children}
          </body>
        </html>
      </ApolloProvider>
    </ClerkProvider>
  );
}
