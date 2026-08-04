import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ACCESS_LEVELS, PRODUCT_ROUTE_STATUSES } from "packages/shared/src";
import { renderProductRoute } from "packages/products/src/thoughtform/client";
import "packages/products/src/thoughtform/testing/browser/client/styles.css";

const route = renderProductRoute({
  accessLevel: ACCESS_LEVELS.demo,
  components: {
    Link({ children, className, href }) {
      return (
        <a className={className} href={href}>
          {children}
        </a>
      );
    },
    navigate(href) {
      globalThis.location.assign(href);
    },
  },
  segments: ["editor"],
});

if (route.status !== PRODUCT_ROUTE_STATUSES.found) {
  throw new Error("ThoughtForm test editor route was not found.");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>{route.element}</StrictMode>,
);
