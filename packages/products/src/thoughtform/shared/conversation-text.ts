export function decodeConversationText(value: string) {
  return value.replace(/\\u([0-9a-f]{4})/gi, (_escape, code: string) =>
    String.fromCharCode(Number.parseInt(code, 16)));
}
