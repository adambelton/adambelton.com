import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router";
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
import { ThoughtFormOperationsPage } from "apps/client/src/platform/admin/ThoughtFormOperationsPage";

const ProductRoutePage = lazy(() =>
  import("apps/client/src/products/ProductRoutePage").then((module) => ({
    default: module.ProductRoutePage,
  })),
);

export function App() {
  const { pathname } = useLocation();
  const isWorkspaceRoute = isThoughtFormWorkspacePath(pathname);

  return (
    <>
      <SkipLink />
      <Container className="min-h-screen">
        <SiteHeader />
        <main
          className={`grid gap-14 pb-24 sm:gap-20 sm:pb-32 ${
            isWorkspaceRoute ? "pt-6 sm:pt-8" : "pt-14 sm:pt-20"
          }`}
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
            <Route element={<ThoughtFormOperationsPage />} path="/products/thoughtform/operations" />
            <Route element={<NotFoundPage />} path="*" />
          </Routes>
        </main>
        <SiteFooter />
      </Container>
    </>
  );
}

function isThoughtFormWorkspacePath(pathname: string) {
  return pathname === "/products/thoughtform/editor" ||
    /^\/products\/thoughtform\/conversations\/[^/]+\/editor$/.test(pathname);
}
