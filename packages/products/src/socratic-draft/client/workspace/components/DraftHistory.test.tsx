// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DraftHistory } from "packages/products/src/socratic-draft/client/workspace/components/DraftHistory";
import {
  DRAFT_REVISION_SOURCES,
  type Draft,
  type DraftRevision,
} from "packages/products/src/socratic-draft/shared";

const draft: Draft = {
  id: "draft-1",
  conversationId: "conversation-1",
  body: "Current body.",
  currentRevision: 3,
  createdAt: "2026-08-02T10:00:00.000Z",
  updatedAt: "2026-08-02T12:00:00.000Z",
};

const revisions: DraftRevision[] = [
  {
    revision: 1,
    body: "First body.",
    source: DRAFT_REVISION_SOURCES.initialComposition,
    createdAt: "2026-08-02T10:00:00.000Z",
    proposalId: null,
    restoredFromRevision: null,
  },
  {
    revision: 2,
    body: "Proposed body.",
    source: DRAFT_REVISION_SOURCES.acceptedProposal,
    createdAt: "2026-08-02T11:00:00.000Z",
    proposalId: "proposal-1",
    restoredFromRevision: null,
  },
  {
    revision: 3,
    body: "Current body.",
    source: DRAFT_REVISION_SOURCES.restoration,
    createdAt: "2026-08-02T12:00:00.000Z",
    proposalId: null,
    restoredFromRevision: 1,
  },
];

describe("DraftHistory", () => {
  afterEach(cleanup);

  it("navigates retained previews and displays provenance", () => {
    render(<DraftHistory draft={draft} revisions={revisions} onClose={() => undefined} onRestore={async () => undefined} />);

    expect(screen.getByLabelText("Preview revision 3").textContent).toContain("Current body.");
    fireEvent.click(screen.getByRole("button", { name: "Previous revision" }));
    expect(screen.getByLabelText("Preview revision 2").textContent).toContain("Proposed body.");
    expect(screen.getByText("Accepted proposal proposal-1")).toBeTruthy();
    expect(screen.getByText("Restored from revision 1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next revision" }));
    expect(screen.getByLabelText("Preview revision 3")).toBeTruthy();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<DraftHistory draft={draft} revisions={revisions} onClose={onClose} onRestore={async () => undefined} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
