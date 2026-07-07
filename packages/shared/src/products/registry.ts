import type { ProductDefinition } from "./types";

export const products = [
  {
    id: "socratic-draft",
    name: "The Socratic Draft",
    slug: "socratic-draft",
    summary:
      "A Socratic writing tool for working out what you think before writing it.",
    description:
      "Start with a rough thought. The assistant asks questions, challenges assumptions, tracks threads, and helps turn the conversation into a private entry.",
    status: "prototype",
    publicPath: "/products/socratic-draft",
    demoPath: "/products/socratic-draft/editor",
    requiresAuth: true
  }
] satisfies ProductDefinition[];
