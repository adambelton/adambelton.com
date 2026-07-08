import type { Metadata } from "next";
import { Container } from "../components/site/Container";
import { SiteFooter } from "../components/site/SiteFooter";
import { SiteHeader } from "../components/site/SiteHeader";
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
        <Container className="min-h-screen">
          <SiteHeader />
          {children}
          <SiteFooter />
        </Container>
      </body>
    </html>
  );
}
