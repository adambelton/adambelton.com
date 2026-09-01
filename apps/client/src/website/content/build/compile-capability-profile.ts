import { parse } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import type {
  CapabilityClassification,
  CapabilityClassificationKey,
  CapabilityProfileSection,
  CapabilityProfileView,
  CapabilityProfileViewKey,
  CompiledCapability,
  CompiledCapabilityProfile,
  SanitizedHtml,
} from "apps/client/src/website/content/content-types";

type MarkdownNode = {
  type: string;
  depth?: number;
  lang?: string | null;
  value?: string;
  children?: MarkdownNode[];
  position?: { start: { offset?: number }; end: { offset?: number } };
};

const classificationKeys = [
  "evidence_basis",
  "development_trajectory",
  "leverage_profile",
] as const;

const viewKeys = [
  "overview",
  "evidence-basis",
  "development-trajectory",
  "leverage-profile",
] as const;

type CapabilityProfileCompilerDependencies = {
  parseContentDocument: (
    sourceText: string,
    source: string,
  ) => { metadata: Record<string, unknown>; body: string };
  renderSanitizedMarkdown: (markdown: string) => SanitizedHtml;
};

function fail(source: string, message: string): never {
  throw new Error(`${source}: ${message}`);
}

function nodeText(node: MarkdownNode): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(nodeText).join("");
}

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stringField(value: unknown, field: string, source: string) {
  if (typeof value !== "string" || !value.trim()) fail(source, `${field} must be a non-empty string.`);
  return value.trim();
}

function numberField(value: unknown, field: string, source: string) {
  if (!Number.isInteger(value) || (value as number) < 1) fail(source, `${field} must be a positive integer.`);
  return value as number;
}

function stringArray(value: unknown, field: string, source: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    fail(source, `${field} must be a list of non-empty strings.`);
  }
  return value as string[];
}

function objectField(value: unknown, field: string, source: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(source, `${field} must be a mapping.`);
  return value as Record<string, unknown>;
}

function unique(items: string[], field: string, source: string) {
  if (new Set(items).size !== items.length) fail(source, `${field} must not contain duplicates.`);
}

function markdownForNodes(
  body: string,
  nodes: MarkdownNode[],
  source: string,
  renderSanitizedMarkdown: CapabilityProfileCompilerDependencies["renderSanitizedMarkdown"],
) {
  if (nodes.length !== 1 || nodes[0]?.type !== "paragraph") {
    fail(source, "authored explanations must contain exactly one paragraph.");
  }
  const start = nodes[0].position?.start.offset;
  const end = nodes[0].position?.end.offset;
  if (start === undefined || end === undefined) fail(source, "could not locate authored Markdown.");
  return renderSanitizedMarkdown(body.slice(start, end));
}

function markdownForBlockNodes(
  body: string,
  nodes: MarkdownNode[],
  source: string,
  renderSanitizedMarkdown: CapabilityProfileCompilerDependencies["renderSanitizedMarkdown"],
) {
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const start = first?.position?.start.offset;
  const end = last?.position?.end.offset;
  if (!nodes.length || start === undefined || end === undefined) {
    fail(source, "view introduction must contain authored Markdown.");
  }
  return renderSanitizedMarkdown(body.slice(start, end));
}

function nodesAfterHeading(nodes: MarkdownNode[], headingAt: number) {
  const depth = nodes[headingAt]?.depth ?? 0;
  const nextHeading = nodes.findIndex(
    (node, index) => index > headingAt && node.type === "heading" && (node.depth ?? 7) <= depth,
  );
  return nodes.slice(headingAt + 1, nextHeading === -1 ? nodes.length : nextHeading);
}

function topLevelSectionByKey(nodes: MarkdownNode[], key: string, source: string) {
  const candidates = nodes
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => node.type === "heading" && node.depth === 1)
    .filter(({ index }) => {
      const code = nodesAfterHeading(nodes, index).find((node) => node.type === "code" && node.lang === "yaml");
      if (!code?.value) return false;
      return objectField(parse(code.value), `section ${key}`, source).key === key;
    });
  if (candidates.length !== 1) fail(source, `expected one level-1 section with key "${key}".`);
  return candidates[0]!;
}

function parseViews(
  nodes: MarkdownNode[],
  body: string,
  classifications: Record<CapabilityClassificationKey, CapabilityClassification>,
  source: string,
  renderSanitizedMarkdown: CapabilityProfileCompilerDependencies["renderSanitizedMarkdown"],
) {
  const classificationByView: Partial<Record<CapabilityProfileViewKey, CapabilityClassificationKey>> = {
    "evidence-basis": "evidence_basis",
    "development-trajectory": "development_trajectory",
    "leverage-profile": "leverage_profile",
  };
  return viewKeys.map((key): CapabilityProfileView => {
    const classificationKey = classificationByView[key];
    const classification = classificationKey ? classifications[classificationKey] : undefined;
    const { node: heading, index: headingAt } = classification
      ? topLevelSectionByKey(nodes, classification.key, source)
      : topLevelSectionByKey(nodes, key, source);
    const content = nodesAfterHeading(nodes, headingAt);
    const firstSubheading = content.findIndex((node) => node.type === "heading");
    const introduction = content
      .slice(0, firstSubheading === -1 ? content.length : firstSubheading)
      .filter((node) => node.type !== "code");
    return {
      key,
      label: nodeText(heading),
      introductionHtml: markdownForBlockNodes(
        body,
        introduction,
        source,
        renderSanitizedMarkdown,
      ),
    };
  });
}

function parseClassifications(
  nodes: MarkdownNode[],
  body: string,
  source: string,
  renderSanitizedMarkdown: CapabilityProfileCompilerDependencies["renderSanitizedMarkdown"],
) {
  const result = {} as Record<CapabilityClassificationKey, CapabilityClassification>;
  for (const key of classificationKeys) {
    const { node: heading, index: headingAt } = topLevelSectionByKey(nodes, key, source);
    const content = nodesAfterHeading(nodes, headingAt);
    const metadataCode = content.find((node) => node.type === "code" && node.lang === "yaml");
    if (!metadataCode) fail(source, `classification ${key} must contain YAML metadata.`);
    const firstValueHeading = content.findIndex((node) => node.type === "heading" && node.depth === 2);
    const introductionNodes = content
      .slice(content.indexOf(metadataCode) + 1, firstValueHeading)
      .filter((node) => node.type !== "code");
    const valueHeadings = content
      .map((node, index) => ({ node, index }))
      .filter(({ node }) => node.type === "heading" && node.depth === 2);
    const values = valueHeadings.map(({ node, index }) => {
      const valueContent = nodesAfterHeading(content, index);
      const code = valueContent.find((candidate) => candidate.type === "code" && candidate.lang === "yaml");
      if (!code?.value) fail(source, `classification value "${nodeText(node)}" must contain YAML metadata.`);
      const metadata = objectField(parse(code.value), `classification value "${nodeText(node)}"`, source);
      const explanation = valueContent.filter((candidate) => candidate !== code && candidate.type !== "heading");
      return {
        key: stringField(metadata.key, `classification value "${nodeText(node)}" key`, source),
        label: nodeText(node),
        order: numberField(metadata.order, `classification value "${nodeText(node)}" order`, source),
        explanationHtml: markdownForNodes(body, explanation, source, renderSanitizedMarkdown),
      };
    });
    unique(values.map(({ key: valueKey }) => valueKey), `${key} value keys`, source);
    unique(values.map(({ order }) => String(order)), `${key} value order`, source);
    result[key] = {
      key,
      label: nodeText(heading),
      introductionHtml: markdownForBlockNodes(body, introductionNodes, source, renderSanitizedMarkdown),
      values: values.sort((left, right) => left.order - right.order),
    };
  }
  return result;
}

function parseCapability(
  nodes: MarkdownNode[],
  body: string,
  headingAt: number,
  classifications: Record<CapabilityClassificationKey, CapabilityClassification>,
  source: string,
  renderSanitizedMarkdown: CapabilityProfileCompilerDependencies["renderSanitizedMarkdown"],
): CompiledCapability {
  const heading = nodes[headingAt];
  if (!heading) fail(source, "could not locate capability heading.");
  const name = nodeText(heading);
  const content = nodesAfterHeading(nodes, headingAt);
  const code = content.find((node) => node.type === "code" && node.lang === "yaml");
  if (!code?.value) fail(source, `capability "${name}" must contain YAML metadata.`);
  const metadata = objectField(parse(code.value), `capability "${name}" metadata`, source);
  const classificationValue = (key: CapabilityClassificationKey) => {
    const value = stringField(metadata[key], `capability "${name}" ${key}`, source);
    if (!classifications[key].values.some(({ key: candidate }) => candidate === value)) {
      fail(source, `capability "${name}" references unknown ${key} key "${value}".`);
    }
    return value;
  };
  const paragraphAfter = (headingPrefix: string) => {
    const index = content.findIndex(
      (node) => node.type === "heading" && node.depth === 3 && nodeText(node).startsWith(headingPrefix),
    );
    if (index === -1) fail(source, `capability "${name}" is missing ${headingPrefix}.`);
    return markdownForNodes(
      body,
      nodesAfterHeading(content, index).filter((node) => node.type !== "heading"),
      source,
      renderSanitizedMarkdown,
    );
  };
  const codeIndex = content.indexOf(code);
  const firstDetailHeading = content.findIndex(
    (node, index) => index > codeIndex && node.type === "heading",
  );
  const descriptionNodes = content.slice(
    codeIndex + 1,
    firstDetailHeading === -1 ? content.length : firstDetailHeading,
  );
  const allowedFields = new Set([...classificationKeys, "order"]);
  const unknownField = Object.keys(metadata).find((field) => !allowedFields.has(field as CapabilityClassificationKey));
  if (unknownField) fail(source, `capability "${name}" has unsupported metadata field "${unknownField}".`);
  return {
    key: slugify(name),
    name,
    evidenceBasis: classificationValue("evidence_basis"),
    developmentTrajectory: classificationValue("development_trajectory"),
    leverageProfile: classificationValue("leverage_profile"),
    order: numberField(metadata.order, `capability "${name}" order`, source),
    descriptionHtml: markdownForNodes(body, descriptionNodes, source, renderSanitizedMarkdown),
    experienceEvidenceHtml: paragraphAfter(`${classifications.evidence_basis.label}:`),
    currentFocusHtml: paragraphAfter(`${classifications.development_trajectory.label}:`),
    leverageProfileHtml: paragraphAfter(`${classifications.leverage_profile.label}:`),
  };
}

function parseSections(
  nodes: MarkdownNode[],
  body: string,
  sectionKeys: string[],
  classifications: Record<CapabilityClassificationKey, CapabilityClassification>,
  source: string,
  renderSanitizedMarkdown: CapabilityProfileCompilerDependencies["renderSanitizedMarkdown"],
) {
  const reservedHeadingIndexes = new Set([
    topLevelSectionByKey(nodes, "overview", source).index,
    ...classificationKeys.map((key) => topLevelSectionByKey(nodes, key, source).index),
  ]);
  const sectionHeadings = nodes
    .map((node, index) => ({ node, index }))
    .filter(({ node, index }) => node.type === "heading" && node.depth === 1 && !reservedHeadingIndexes.has(index));
  const sections = sectionHeadings.map(({ node, index }): CapabilityProfileSection => {
    const label = nodeText(node);
    const key = slugify(label);
    const content = nodesAfterHeading(nodes, index);
    const capabilities = content
      .map((candidate, candidateIndex) => ({ candidate, candidateIndex }))
      .filter(({ candidate }) => candidate.type === "heading" && candidate.depth === 2)
      .map(({ candidateIndex }) =>
        parseCapability(
          content,
          body,
          candidateIndex,
          classifications,
          source,
          renderSanitizedMarkdown,
        ),
      )
      .sort((left, right) => left.order - right.order);
    unique(capabilities.map(({ key: capabilityKey }) => capabilityKey), `${label} capability keys`, source);
    unique(capabilities.map(({ order }) => String(order)), `${label} capability order`, source);
    if (capabilities.length < 1) fail(source, `section "${label}" must contain capabilities.`);
    return { key, label, capabilities };
  });
  if (sections.map(({ key }) => key).join(",") !== sectionKeys.join(",")) {
    fail(source, "section headings and frontmatter sections must match in order.");
  }
  return sections;
}

export function compileCapabilityProfile(
  sourceText: string,
  source: string,
  dependencies: CapabilityProfileCompilerDependencies,
): CompiledCapabilityProfile {
  const { parseContentDocument, renderSanitizedMarkdown } = dependencies;
  const { body, metadata } = parseContentDocument(sourceText, source);
  if (metadata.type !== "capability-profile") fail(source, 'frontmatter type must be "capability-profile".');
  const title = stringField(metadata.title, "title", source);
  const eyebrow = stringField(metadata.eyebrow, "eyebrow", source);
  const classificationGuideMetadata = objectField(metadata.classificationGuide, "classificationGuide", source);
  const classificationGuide = {
    eyebrow: stringField(classificationGuideMetadata.eyebrow, "classificationGuide eyebrow", source),
    title: stringField(classificationGuideMetadata.title, "classificationGuide title", source),
  };
  const sections = stringArray(metadata.sections, "sections", source);
  const views = stringArray(metadata.views, "views", source);
  unique(sections, "sections", source);
  unique(views, "views", source);
  if (views.join(",") !== viewKeys.join(",")) fail(source, "views must contain the supported stable keys in order.");
  const tree = unified().use(remarkParse).parse(body) as MarkdownNode;
  const nodes = tree.children ?? [];
  const classifications = parseClassifications(
    nodes,
    body,
    source,
    renderSanitizedMarkdown,
  );
  return {
    source,
    eyebrow,
    title,
    classificationGuide,
    views: parseViews(nodes, body, classifications, source, renderSanitizedMarkdown),
    classifications,
    sections: parseSections(
      nodes,
      body,
      sections,
      classifications,
      source,
      renderSanitizedMarkdown,
    ),
  };
}
