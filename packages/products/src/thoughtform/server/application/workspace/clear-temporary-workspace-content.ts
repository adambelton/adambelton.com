export interface TemporaryWorkspaceContent {
  clearDraftingState(conversationId: string): Promise<void>;
}

export async function clearTemporaryWorkspaceContent(input: {
  conversationId: string;
  content: TemporaryWorkspaceContent;
}) {
  await input.content.clearDraftingState(input.conversationId);
}
