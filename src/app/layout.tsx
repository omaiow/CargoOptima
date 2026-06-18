import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CargoOptima — Knapsack Cargo Optimization System",
  description: "TOPSIS + 0/1 Knapsack logistics optimization for Philippine freight.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700;900&family=Inter:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-p3r-deeper text-p3r-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
