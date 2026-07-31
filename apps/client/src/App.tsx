import {
  Link,
  NavLink,
  Route,
  Routes,
} from "react-router";

const navItems = [
  { href: "/", label: "Home", end: true },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
];

function Layout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <nav aria-label="Main navigation" className="site-nav">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? "site-link site-link-active" : "site-link"
              }
              end={item.end}
              key={item.href}
              to={item.href}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink className="site-link" to="/login">
            Log in
          </NavLink>
        </nav>
      </header>
      <main className="site-main" id="main-content">
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<AboutPage />} path="/about" />
          <Route element={<ProductsPage />} path="/products" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<LogoutPage />} path="/logout" />
          <Route element={<NotFoundPage />} path="*" />
        </Routes>
      </main>
      <footer className="site-footer">
        <a className="site-link" href="mailto:hello@adambelton.com">
          Email
        </a>
      </footer>
    </>
  );
}

function HomePage() {
  return (
    <section aria-labelledby="home-title">
      <p className="eyebrow">Writing</p>
      <h1 id="home-title">Notes, essays, and work in progress.</h1>
      <p className="lede">
        The writing collection will live here as the site moves over to the new
        client host.
      </p>
    </section>
  );
}

function AboutPage() {
  return (
    <section aria-labelledby="about-title">
      <p className="eyebrow">About</p>
      <h1 id="about-title">Adam Belton.</h1>
      <p className="lede">
        A minimal placeholder route for the future client-hosted about page.
      </p>
    </section>
  );
}

function ProductsPage() {
  return (
    <section aria-labelledby="products-title">
      <p className="eyebrow">Products</p>
      <h1 id="products-title">Things being built.</h1>
      <p className="lede">
        Product routes will be mounted here after the client scaffold is in
        place.
      </p>
      <p>
        <Link className="site-link" to="/products/socratic-draft">
          The Socratic Draft
        </Link>
      </p>
    </section>
  );
}

function LoginPage() {
  return (
    <section aria-labelledby="login-title">
      <p className="eyebrow">Log in</p>
      <h1 id="login-title">Check your email.</h1>
      <p className="lede">
        The magic-link auth flow will be ported in a later task.
      </p>
    </section>
  );
}

function LogoutPage() {
  return (
    <section aria-labelledby="logout-title">
      <p className="eyebrow">Log out</p>
      <h1 id="logout-title">Signed-out flow placeholder.</h1>
      <p className="lede">
        The logout route will call the auth client in a later task.
      </p>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title">
      <p className="eyebrow">Not found</p>
      <h1 id="not-found-title">That page does not exist.</h1>
      <p className="lede">
        <Link className="site-link" to="/">
          Return home
        </Link>
      </p>
    </section>
  );
}

export function App() {
  return <Layout />;
}
