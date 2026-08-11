import { parseProposedIdeaStructure } from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  IDEA_STRUCTURE_COMMAND_TYPES,
  type IdeaStructureCommandRequest,
} from "packages/products/src/thoughtform/shared";

export async function parseIdeaStructureCommandRequest(
  request: Request,
): Promise<IdeaStructureCommandRequest | null> {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (!Number.isInteger(body.expectedRevision) || (body.expectedRevision as number) < 0) {
      return null;
    }
    if (body.type === IDEA_STRUCTURE_COMMAND_TYPES.undo) {
      return {
        type: IDEA_STRUCTURE_COMMAND_TYPES.undo,
        expectedRevision: body.expectedRevision as number,
      };
    }
    const proposed = parseProposedIdeaStructure(body);
    if (!proposed) return null;
    return proposed.type === IDEA_STRUCTURE_COMMAND_TYPES.merge
      ? { ...proposed, expectedRevision: body.expectedRevision as number }
      : { ...proposed, expectedRevision: body.expectedRevision as number };
  } catch {
    return null;
  }
}
