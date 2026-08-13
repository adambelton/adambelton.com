import type { ThoughtFormOperationsOverview } from "packages/shared/src";

export interface ThoughtFormOperationsReader {
  readPage(cursor?: string): Promise<ThoughtFormOperationsReadResult>;
}

export type ThoughtFormOperationsReadResult =
  | { status: "found"; overview: ThoughtFormOperationsOverview }
  | { status: "invalid_cursor" };

export class ThoughtFormOperationsUnavailableError extends Error {}

export class ReadThoughtFormOperations {
  constructor(private readonly reader: ThoughtFormOperationsReader | null) {}

  execute(cursor?: string) {
    if (!this.reader) {
      throw new ThoughtFormOperationsUnavailableError(
        "ThoughtForm operations are not configured.",
      );
    }
    return this.reader.readPage(cursor);
  }
}
