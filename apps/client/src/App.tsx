import { Route, Routes } from "react-router";
import { ProtectedRoute } from "apps/client/src/auth";
import {
  Container,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from "apps/client/src/layout";
import {
  AboutPage,
  HomePage,
  LoginPage,
  LoginVerifyPage,
  LogoutPage,
  NotFoundPage,
  ProductsPage,
} from "apps/client/src/pages";

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
            <Route
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
              path="/products"
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
