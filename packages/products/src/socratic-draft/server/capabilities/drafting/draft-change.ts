import {
  DRAFT_CHANGE_KINDS,
  DRAFT_CHANGE_SCOPES,
  type DraftChange,
  type DraftChangeKind,
  type DraftRevision,
} from "packages/products/src/socratic-draft/shared";
import {
  canonicalDraftMarkdown,
  parseSemanticMarkdown,
  semanticMarkdownText,
  type SemanticMarkdownNode,
} from "packages/products/src/socratic-draft/server/capabilities/drafting/semantic-markdown";

export const MAX_DRAFT_CHANGE_CONTEXT_CHARACTERS = 16_000;
const MAX_DRAFT_CHANGE_PASSAGE_CHARACTERS = 8_000;

export function deriveDraftChange(
  previous: DraftRevision,
  committed: DraftRevision,
): DraftChange | null {
  const previousBody = canonicalDraftMarkdown(previous.body, previous.contentFormat);
  const committedBody = canonicalDraftMarkdown(committed.body, committed.contentFormat);
  if (
    committed.revision !== previous.revision + 1 ||
    committedBody === previousBody
  ) return null;

  let start = 0;
  while (
    start < previousBody.length &&
    start < committedBody.length &&
    previousBody[start] === committedBody[start]
  ) start += 1;

  let previousEnd = previousBody.length;
  let committedEnd = committedBody.length;
  while (
    previousEnd > start &&
    committedEnd > start &&
    previousBody[previousEnd - 1] === committedBody[committedEnd - 1]
  ) {
    previousEnd -= 1;
    committedEnd -= 1;
  }

  while (
    start > 0 &&
    !/\s/.test(previousBody[start - 1] ?? "") &&
    !/\s/.test(committedBody[start - 1] ?? "")
  ) start -= 1;
  while (
    previousEnd < previousBody.length &&
    !/\s/.test(previousBody[previousEnd] ?? "")
  ) previousEnd += 1;
  while (
    committedEnd < committedBody.length &&
    !/\s/.test(committedBody[committedEnd] ?? "")
  ) committedEnd += 1;

  const removedText = previousBody.slice(start, previousEnd);
  const addedText = committedBody.slice(start, committedEnd);
  const kinds = deriveChangeKinds(previousBody, committedBody);
  if (removedText.length + addedText.length <= MAX_DRAFT_CHANGE_PASSAGE_CHARACTERS) {
    return {
      fromRevision: previous.revision,
      toRevision: committed.revision,
      scope: DRAFT_CHANGE_SCOPES.passage,
      start,
      end: previousEnd,
      removedText,
      addedText,
      kinds,
    };
  }

  if (
    previousBody.length + committedBody.length >
    MAX_DRAFT_CHANGE_CONTEXT_CHARACTERS
  ) return null;

  return {
    fromRevision: previous.revision,
    toRevision: committed.revision,
    scope: DRAFT_CHANGE_SCOPES.wholeDraft,
    start: 0,
    end: previousBody.length,
    removedText: previousBody,
    addedText: committedBody,
    kinds,
  };
}

function deriveChangeKinds(previous: string, committed: string): DraftChangeKind[] {
  const before = parseSemanticMarkdown(previous);
  const after = parseSemanticMarkdown(committed);
  const kinds = new Set<DraftChangeKind>();
  if (semanticMarkdownText(previous) !== semanticMarkdownText(committed)) {
    kinds.add(DRAFT_CHANGE_KINDS.text);
  }
  const beforeTypes = nodeSignatures(before);
  const afterTypes = nodeSignatures(after);
  if (beforeTypes.marks !== afterTypes.marks) kinds.add(DRAFT_CHANGE_KINDS.mark);
  if (beforeTypes.links !== afterTypes.links) kinds.add(DRAFT_CHANGE_KINDS.link);
  if (beforeTypes.blocks !== afterTypes.blocks) kinds.add(DRAFT_CHANGE_KINDS.blockStructure);
  if (beforeTypes.code !== afterTypes.code) kinds.add(DRAFT_CHANGE_KINDS.code);
  if (beforeTypes.placeholders !== afterTypes.placeholders) {
    kinds.add(DRAFT_CHANGE_KINDS.imagePlaceholder);
  }
  return [...kinds];
}

function nodeSignatures(root: SemanticMarkdownNode) {
  const signatures = { marks: [] as string[], links: [] as string[], blocks: [] as string[], code: [] as string[], placeholders: [] as string[] };
  const visit = (node: SemanticMarkdownNode) => {
    const text = JSON.stringify(node.children ?? node.value ?? "");
    if (node.type === "strong" || node.type === "emphasis") signatures.marks.push(`${node.type}:${text}`);
    if (node.type === "link") signatures.links.push(`${node.url}:${text}`);
    if (["heading", "list", "listItem", "blockquote", "thematicBreak"].includes(node.type)) signatures.blocks.push(`${node.type}:${node.depth ?? ""}:${text}`);
    if (node.type === "code" || node.type === "inlineCode") signatures.code.push(`${node.type}:${node.value ?? ""}`);
    if (node.type === "containerDirective") signatures.placeholders.push(JSON.stringify(node.attributes ?? {}));
    for (const child of node.children ?? []) visit(child);
  };
  visit(root);
  return Object.fromEntries(Object.entries(signatures).map(([key, values]) => [key, values.join("|")])) as Record<keyof typeof signatures, string>;
}
