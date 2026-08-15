import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "apps/client/src/bootstrap/App";
import "apps/client/src/styles.css";

const root = document.getElementById("root") as HTMLElement;
const application = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

if (root.hasChildNodes()) hydrateRoot(root, application);
else createRoot(root).render(application);
