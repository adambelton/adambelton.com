import type { Metadata } from "next";
import { Container } from "apps/web/components/site/Container";
import { SiteFooter } from "apps/web/components/site/SiteFooter";
import { SiteHeader } from "apps/web/components/site/SiteHeader";
import { SkipLink } from "apps/web/components/site/SkipLink";
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
        <SkipLink />
        <Container className="min-h-screen">
          <SiteHeader />
          <main
            className="grid gap-14 pb-24 pt-14 sm:gap-20 sm:pb-32 sm:pt-20"
            id="main-content"
          >
            {children}
          </main>
          <SiteFooter />
        </Container>
      </body>
    </html>
  );
}
