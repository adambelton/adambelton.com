import { Route, Routes } from "react-router";
import { ProtectedRoute } from "apps/client/src/auth";
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
} from "apps/client/src/website/pages";
import {
  LoginPage,
  LoginVerifyPage,
  LogoutPage,
} from "apps/client/src/auth/pages";
import {
  ProductRoutePage,
  ProductsPage,
  productRoutePath,
} from "apps/client/src/products";

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
            <Route element={<PrivacyPage />} path="/privacy" />
            <Route
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
              path="/products"
            />
            <Route
              element={<ProductRoutePage />}
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
