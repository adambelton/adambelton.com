export function hasAttachedDraftMaterial(context: string | undefined) {
  return context?.includes("<attached_material>exact_") ?? false;
}

export function readIdeaMapFromWorkspaceContext<
  T extends { ideas: Array<{ id: string; title: string }> },
>(context: string | undefined): T {
  if (!context) {
    throw new Error("The browser test model requires workspace context.");
  }

  const match = context.match(/<idea_map_json>([\s\S]*?)<\/idea_map_json>/u);
  if (!match?.[1]) {
    throw new Error("The browser test model requires an Idea Map context.");
  }

  return JSON.parse(unescapeXmlText(match[1])) as T;
}

function unescapeXmlText(value: string) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}
