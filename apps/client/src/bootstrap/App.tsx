import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import {
  Container,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from "apps/client/src/ui/layout";
import {
  AboutPage,
  HomePage,
  NotFoundPage,
  PrivacyPage,
  WritingPostPage,
} from "apps/client/src/website/pages";
import {
  LoginPage,
  LoginVerifyPage,
  LogoutPage,
} from "apps/client/src/auth/pages";
import { ProductsPage } from "apps/client/src/products/ProductsPage";
import { ProductRouteLoading } from "apps/client/src/products/ProductRouteLoading";
import { productRoutePath } from "apps/client/src/products/productRoutePath";

const ProductRoutePage = lazy(() =>
  import("apps/client/src/products/ProductRoutePage").then((module) => ({
    default: module.ProductRoutePage,
  })),
);

export function App() {
  return (
    <>
      <SkipLink />
      <Container className="min-h-screen">
        <SiteHeader />
        <main
          className="grid gap-14 pb-24 pt-14 sm:gap-20 sm:pb-32 sm:pt-20"
          id="main-content"
        >
          <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<AboutPage />} path="/about" />
            <Route element={<WritingPostPage />} path="/writing/:slug" />
            <Route element={<PrivacyPage />} path="/privacy" />
            <Route element={<ProductsPage />} path="/products" />
            <Route
              element={
                <Suspense fallback={<ProductRouteLoading />}>
                  <ProductRoutePage />
                </Suspense>
              }
              path={productRoutePath}
            />
            <Route element={<LoginPage />} path="/login" />
            <Route element={<LoginVerifyPage />} path="/login/verify" />
            <Route element={<LogoutPage />} path="/logout" />
            <Route element={<NotFoundPage />} path="*" />
          </Routes>
        </main>
        <SiteFooter />
      </Container>
    </>
  );
}
