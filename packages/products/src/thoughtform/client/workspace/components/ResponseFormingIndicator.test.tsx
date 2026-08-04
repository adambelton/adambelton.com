// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ResponseFormingIndicator } from "packages/products/src/thoughtform/client/workspace/components/ResponseFormingIndicator";

describe("ResponseFormingIndicator", () => {
  afterEach(cleanup);

  it("announces formation without depending on motion", () => {
    render(<ResponseFormingIndicator />);

    expect(screen.getByRole("status").textContent).toContain(
      "ThoughtForm is considering your message.",
    );
    expect(
      screen.getByTestId("response-forming-indicator").querySelectorAll(
        ".motion-safe\\:animate-pulse",
      ),
    ).toHaveLength(3);
  });
});
