import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  CONVERSATION_MESSAGE_ROLES,
  decodeConversationText,
  type ConversationMessage,
} from "packages/products/src/thoughtform/shared";

type ConversationMessageListProps = {
  messages: ConversationMessage[];
  shouldAnimateLatestAssistant?: boolean;
  followLatestRequest?: number;
};

export function ConversationMessageList({
  messages,
  shouldAnimateLatestAssistant = false,
  followLatestRequest = 0,
}: ConversationMessageListProps) {
  const historyRef = useRef<HTMLDivElement>(null);
  const isFollowingLatestRef = useRef(true);

  useLayoutEffect(() => {
    const history = historyRef.current;
    if (history && isFollowingLatestRef.current) {
      history.scrollTop = history.scrollHeight;
    }
  }, [messages.length, messages.at(-1)?.content]);

  useLayoutEffect(() => {
    const history = historyRef.current;
    if (!history) return;
    isFollowingLatestRef.current = true;
    history.scrollTop = history.scrollHeight;
  }, [followLatestRequest]);

  useEffect(() => {
    const history = historyRef.current;
    const content = history?.querySelector("ol");
    if (!history || !content || !globalThis.ResizeObserver) return;
    const observer = new ResizeObserver(() => {
      if (isFollowingLatestRef.current) history.scrollTop = history.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-0 overflow-y-auto"
      data-testid="conversation-history"
      onScroll={(event) => {
        const history = event.currentTarget;
        isFollowingLatestRef.current =
          history.scrollHeight - history.scrollTop - history.clientHeight <= 24;
      }}
      ref={historyRef}
    >
    <ol className="m-0 flex min-h-full list-none flex-col justify-end gap-5 p-0" aria-label="Conversation">
      {messages.length === 0 ? (
        <li className="border-t border-[var(--line)] pt-5 text-base leading-7 text-[var(--muted)]">
          No messages yet.
        </li>
      ) : (
        messages.map((message, index) => (
          <ConversationMessageItem
            shouldAnimate={
              message.role === CONVERSATION_MESSAGE_ROLES.assistant &&
              index === messages.length - 1 &&
              shouldAnimateLatestAssistant
            }
            key={`${message.role}-${index}`}
            message={message}
          />
        ))
      )}
    </ol>
    </div>
  );
}

type ConversationMessageItemProps = {
  shouldAnimate: boolean;
  message: ConversationMessage;
};

function ConversationMessageItem({ shouldAnimate, message }: ConversationMessageItemProps) {
  const displayContent = message.role === CONVERSATION_MESSAGE_ROLES.assistant
    ? decodeConversationText(message.content)
    : message.content;
  const { shouldReduceMotion, visibleContent } = useBufferedText(displayContent, shouldAnimate);
  const isRevealing = shouldAnimate && Array.from(visibleContent).length <
    Array.from(displayContent).length;
  const latestCharacter = visibleContent.at(-1) ?? "";
  const settledContent = latestCharacter
    ? visibleContent.slice(0, -latestCharacter.length)
    : visibleContent;
  const isAssistant = message.role === CONVERSATION_MESSAGE_ROLES.assistant;

  return (
    <li className="border-t border-[var(--line)] pt-5">
      <p className="m-0 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
        {message.role === CONVERSATION_MESSAGE_ROLES.user ? "You" : "Assistant"}
      </p>
      <p className="mt-3 max-w-3xl text-base leading-7">
        {isAssistant && (
          <span aria-label={displayContent}>
            <span aria-hidden="true">
              {settledContent}
              <span
                key={visibleContent.length}
                style={{ opacity: 0.72, transition: "opacity 90ms ease-out" }}
              >
                {latestCharacter}
              </span>
              {isRevealing && !shouldReduceMotion
                ? <span className="ml-0.5 animate-pulse">▍</span>
                : null}
            </span>
          </span>
        )}
        {!isAssistant && message.content}
      </p>
    </li>
  );
}

function useBufferedText(content: string, shouldAnimate: boolean) {
  const shouldReduceMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ?? false;
  const [visibleLength, setVisibleLength] = useState(() =>
    shouldAnimate && !shouldReduceMotion ? 0 : Array.from(content).length);
  const characters = Array.from(content);
  const lastFrameRef = useRef<number | null>(null);
  const characterBudgetRef = useRef(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setVisibleLength(characters.length);
      return;
    }
    if (visibleLength >= characters.length) return;
    let frame = 0;
    const reveal = (timestamp: number) => {
      const previous = lastFrameRef.current ?? timestamp;
      lastFrameRef.current = timestamp;
      const elapsed = Math.min(100, Math.max(0, timestamp - previous));
      const backlog = characters.length - visibleLength;
      const charactersPerSecond = Math.min(
        70,
        36 + Math.max(0, backlog - 300) * 0.15,
      );
      characterBudgetRef.current += elapsed * charactersPerSecond / 1_000;
      const revealCount = Math.floor(characterBudgetRef.current);
      if (revealCount > 0) {
        characterBudgetRef.current -= revealCount;
        setVisibleLength((current) => Math.min(characters.length, current + revealCount));
        return;
      }
      frame = globalThis.requestAnimationFrame(reveal);
    };
    frame = globalThis.requestAnimationFrame(reveal);
    return () => globalThis.cancelAnimationFrame(frame);
  }, [characters.length, shouldReduceMotion, visibleLength]);

  return {
    shouldReduceMotion,
    visibleContent: characters.slice(0, visibleLength).join(""),
  };
}
