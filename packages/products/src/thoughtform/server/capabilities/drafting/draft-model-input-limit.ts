export const MAX_DRAFT_OPERATION_INPUT_BYTES = 16 * 1_024;
export const MAX_DRAFT_OPERATION_OUTPUT_TOKENS = 512;

export class DraftOperationInputTooLargeError extends Error {
  constructor() {
    super("This draft operation is too large to process.");
    this.name = "DraftOperationInputTooLargeError";
  }
}

export function requireDraftOperationInputWithinLimit(input: unknown) {
  if (draftOperationInputBytes(input) > MAX_DRAFT_OPERATION_INPUT_BYTES) {
    throw new DraftOperationInputTooLargeError();
  }
}

export function draftOperationInputBytes(input: unknown) {
  return new TextEncoder().encode(JSON.stringify(input)).byteLength;
}
