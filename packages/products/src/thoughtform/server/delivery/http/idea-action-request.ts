import {
  isIdeaActionType,
  type IdeaActionRequest,
} from "packages/products/src/thoughtform/shared";

export async function parseIdeaActionRequest(
  request: Request,
): Promise<IdeaActionRequest | null> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const expectedRevision = body.expectedRevision;
    const userInterpretation = body.userInterpretation;
    if (
      !isIdeaActionType(body.action) ||
      !isInteger(expectedRevision) ||
      (userInterpretation !== undefined &&
        typeof userInterpretation !== "string")
    ) {
      return null;
    }
    return {
      action: body.action,
      expectedRevision,
      ...(userInterpretation === undefined
        ? {}
        : { userInterpretation }),
    };
  } catch {
    return null;
  }
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}
