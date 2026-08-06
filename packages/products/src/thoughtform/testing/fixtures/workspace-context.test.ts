import { describe, expect, it } from "vitest";
import {
  hasAttachedDraftMaterial,
  readIdeaMapFromWorkspaceContext,
} from "packages/products/src/thoughtform/testing/fixtures/workspace-context";

describe("browser workspace context", () => {
  it("recognises exact attached draft material", () => {
    expect(hasAttachedDraftMaterial(`<workspace_context>
<draft_state>
<attached_material>exact_selected_passage_for_discussion</attached_material>
</draft_state>
</workspace_context>`)).toBe(true);
    expect(hasAttachedDraftMaterial(`<workspace_context>
<draft_state><attached_material>none</attached_material></draft_state>
</workspace_context>`)).toBe(false);
  });

  it("reads the XML-escaped Idea Map JSON", () => {
    expect(readIdeaMapFromWorkspaceContext(`<workspace_context>
<idea_map_json>{"revision":1,"ideas":[{"id":"idea-1","title":"Power &amp; accountability"}]}</idea_map_json>
</workspace_context>`)).toEqual({
      revision: 1,
      ideas: [{ id: "idea-1", title: "Power & accountability" }],
    });
  });
});
