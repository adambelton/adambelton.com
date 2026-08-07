export function replacePromptFallback(
  source: string,
  exportName: string,
  content: string,
) {
  const declaration = `export const ${exportName} = \``;
  const contentStart = source.indexOf(declaration);
  if (contentStart < 0) {
    throw new Error(`Could not find ${exportName}.`);
  }
  const promptStart = contentStart + declaration.length;
  const promptEnd = source.indexOf("`;", promptStart);
  if (promptEnd < 0) {
    throw new Error(`Could not find the end of ${exportName}.`);
  }
  return `${source.slice(0, promptStart)}${content}${source.slice(promptEnd)}`;
}
