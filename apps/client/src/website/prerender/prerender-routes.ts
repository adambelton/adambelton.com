import { productOverviewCatalogue } from "apps/client/src/products/catalogue/product-overview-catalogue";
import { writingPosts } from "apps/client/src/website/content/content";

export const prerenderRoutes = [
  "/",
  "/about",
  "/products",
  ...productOverviewCatalogue.map(({ publicPath }) => publicPath),
  ...writingPosts.map(({ slug }) => `/writing/${slug}`),
];
