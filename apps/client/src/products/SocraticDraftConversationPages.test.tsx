import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ConversationListState } from "packages/products/src/socratic-draft/client/app/conversations/ConversationListState";
import { ConversationPageState } from "packages/products/src/socratic-draft/client/app/conversations/ConversationPageState";
import type { ProductNavigationLink } from "packages/products/src/socratic-draft/client/app/product-app-components";

const TestLink: ProductNavigationLink = ({ children, href }) => (
  <a href={href}>{children}</a>
);

describe("Socratic Draft conversation list states", () => {
  it("announces the loading state", () => {
    const markup = renderToStaticMarkup(
      <ConversationListState
        Link={TestLink}
        conversations={null}
        error={null}
      />,
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("Loading saved conversations.");
  });

  it("presents an API failure as an alert", () => {
    const markup = renderToStaticMarkup(
      <ConversationListState
        Link={TestLink}
        conversations={null}
        error="Saved conversations could not be loaded."
      />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Saved conversations could not be loaded.");
  });

  it("presents an empty collection", () => {
    const markup = renderToStaticMarkup(
      <ConversationListState
        Link={TestLink}
        conversations={[]}
        error={null}
      />,
    );

    expect(markup).toContain("No saved conversations yet.");
  });

  it("renders saved conversations as navigable list items", () => {
    const markup = renderToStaticMarkup(
      <ConversationListState
        Link={TestLink}
        conversations={[
          {
            id: "conversation-1",
            label: "A saved thought",
            createdAt: "2026-07-31T17:00:00.000Z",
            updatedAt: "2026-07-31T17:05:00.000Z",
          },
        ]}
        error={null}
      />,
    );

    expect(markup).toContain("<ol");
    expect(markup).toContain(
      'href="/products/socratic-draft/conversations/conversation-1"',
    );
    expect(markup).toContain("A saved thought");
    expect(markup).toContain("Updated 31 Jul 2026, 18:05");
  });
});

describe("Socratic Draft conversation detail states", () => {
  it("announces the loading state", () => {
    const markup = renderToStaticMarkup(
      <ConversationPageState conversation={null} error={null} />,
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("Loading saved conversation.");
  });

  it("presents a load failure as an alert", () => {
    const markup = renderToStaticMarkup(
      <ConversationPageState
        conversation={null}
        error="The requested conversation was not found."
      />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("The requested conversation was not found.");
  });

  it("restores saved messages into the editor", () => {
    const markup = renderToStaticMarkup(
      <ConversationPageState
        conversation={{
          id: "conversation-1",
          label: "A saved thought",
          createdAt: "2026-07-31T17:00:00.000Z",
          updatedAt: "2026-07-31T17:05:00.000Z",
          messages: [
            { role: "user", content: "A saved thought" },
            { role: "assistant", content: "What matters about that thought?" },
          ],
        }}
        error={null}
      />,
    );

    expect(markup).toContain("A saved thought");
    expect(markup).toContain("What matters about that thought?");
  });
});
