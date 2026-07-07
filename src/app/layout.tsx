import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Placement Intelligence Portal",
  description: "Stateless Knowledge Base and AI Assistant for Placements",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-background text-foreground transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
