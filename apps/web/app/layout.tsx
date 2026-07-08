import type { Metadata } from "next";
import { Container } from "apps/web/components/site/Container";
import { SiteFooter } from "apps/web/components/site/SiteFooter";
import { SiteHeader } from "apps/web/components/site/SiteHeader";
import "apps/web/app/globals.css";

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
