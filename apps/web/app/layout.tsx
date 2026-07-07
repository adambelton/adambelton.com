import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adam Belton",
  description: "Writing and product demos by Adam Belton."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link className="site-name" href="/">
              Adam Belton
            </Link>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
