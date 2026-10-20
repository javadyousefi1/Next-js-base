"use client";

import { buildTimeline, dayKey, type TimelineItem } from "@repo/chat/timeline";
import type { ChatMessage, ChatTransport } from "@repo/chat/types";
import { useChat } from "@repo/chat/use-chat";
import { useChatScroll } from "@repo/chat/use-chat-scroll";
import { modal } from "@repo/ui/lib/modal";
import { useLocale, useTranslations } from "next-intl";
import { type ChangeEvent, type KeyboardEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { formatChatDay, formatChatTime } from "../chat-format";
import { CHAT_BOT } from "../mock/chat-seed";

/** A timeline row, plus the "start of the conversation" note once all history is loaded. */
export type ChatRow = TimelineItem | { type: "start"; key: "start" };

const START_ROW: ChatRow = { type: "start", key: "start" };
const HIGHLIGHT_MS = 1600;

/** Height guesses (real heights are measured). */
function estimateSize(row: ChatRow): number {
  if (row.type !== "message") return 44;
  const lines = Math.ceil(row.message.text.length / 48);
  return (
    (row.isFirstInGroup ? 44 : 28) +
    lines * 20 +
    (row.replyTo ? 44 : 0) +
    (row.isLastInGroup ? 22 : 0)
  );
}

type ChatRoomOptions = { transport: ChatTransport; currentUserId: string };

/**
 * Everything the chat room view renders: the virtualized rows, the header status, the composer
 * (send, reply, edit, typing) and the message actions. Logic lives in `@repo/chat`; this hook
 * adds the app's texts, date formats and modals.
 */
export function useChatRoom({ transport, currentUserId }: ChatRoomOptions) {
  const t = useTranslations("Examples.chat");
  const locale = useLocale();
  const chat = useChat({ transport, currentUserId, pageSize: 40 });
  const { store } = chat;

  const timeline = useMemo(
    () =>
      buildTimeline(chat.messages, {
        currentUserId,
        readBy: chat.readBy,
        firstUnreadId: chat.firstUnreadId,
      }),
    [chat.messages, chat.readBy, chat.firstUnreadId, currentUserId],
  );
  const rows = useMemo<ChatRow[]>(
    () => (chat.status === "ready" && !chat.hasMore ? [START_ROW, ...timeline] : timeline),
    [chat.status, chat.hasMore, timeline],
  );

  const scroll = useChatScroll<ChatRow>({
    items: rows,
    estimateSize,
    hasMore: chat.hasMore,
    loadingOlder: chat.loadingOlder,
    onLoadOlder: () => void store.loadOlder(),
    onSeeLatest: () => store.markRead(),
    countsAsNew: (row) => row.type === "message" && !row.isOwn,
  });

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const authorName = (authorId: string) =>
    authorId === currentUserId ? t("you") : authorId === CHAT_BOT.id ? t("botName") : authorId;
  // Read once (render must stay pure); a chat left open past midnight keeps yesterday's labels.
  const [today] = useState(() => dayKey(new Date().toISOString()));
  const resetComposer = () => {
    setText("");
    setReplyTo(null);
    setEditing(null);
  };
  const focusComposer = () => requestAnimationFrame(() => textareaRef.current?.focus());

  const submit = () => {
    if (editing) {
      store.edit(editing.id, text).catch(() => toast.error(t("editFailed")));
      resetComposer();
      return;
    }
    if (!store.send(text, { replyToId: replyTo?.id ?? null })) return;
    resetComposer();
    // Own messages always bring the reader to the bottom.
    requestAnimationFrame(() => scroll.scrollToEnd("smooth"));
  };

  return {
    status: chat.status,
    retryLoad: () => void store.start(),
    title: t("botName"),
    subtitle: chat.typingUserIds.length > 0 ? t("status.typing") : t(`status.${chat.connection}`),
    isTyping: chat.typingUserIds.length > 0,
    conversationLabel: t("conversation", { name: t("botName") }),

    // Virtualized list
    scrollRef: scroll.scrollRef,
    measureElement: scroll.measureElement,
    totalSize: scroll.totalSize,
    virtualRows: scroll.virtualItems.flatMap((virtual) => {
      const row = rows[virtual.index];
      return row ? [{ virtual, row }] : [];
    }),
    loadingOlder: chat.loadingOlder,
    isAtEnd: scroll.isAtEnd,
    unseen: scroll.unseen,
    unseenLabel: t("newMessages", { count: scroll.unseen }),
    jumpToEnd: () => scroll.scrollToEnd("smooth"),

    // Rows
    row: {
      dayLabel: (day: string) =>
        formatChatDay(day, today, locale, { today: t("today"), yesterday: t("yesterday") }),
      time: (iso: string) => formatChatTime(iso, locale),
      authorName,
      highlightedId,
      canEdit: store.capabilities.edit,
      canDelete: store.capabilities.remove,
      reply: (message: ChatMessage) => {
        setEditing(null);
        setReplyTo(message);
        focusComposer();
      },
      edit: (message: ChatMessage) => {
        setReplyTo(null);
        setEditing(message);
        setText(message.text);
        focusComposer();
      },
      remove: (message: ChatMessage) => {
        void modal.confirm(t("deleteText"), {
          variant: "destructive",
          title: t("deleteTitle"),
          actionButton: { type: "destructive", label: t("delete") },
          onAction: async (action) => {
            if (action === "yes") await store.remove(message.id);
          },
        });
      },
      copy: (message: ChatMessage) => {
        void navigator.clipboard.writeText(message.text).then(() => toast.success(t("copied")));
      },
      retry: (message: ChatMessage) => store.retry(message.clientId ?? message.id),
      /** Scrolls to a replied-to message and highlights it for a moment. */
      jumpTo: (message: ChatMessage) => {
        if (!scroll.scrollToKey(`message:${message.clientId ?? message.id}`)) return;
        setHighlightedId(message.id);
        setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
      },
    },

    // Composer
    composer: {
      textareaRef,
      text,
      mode: editing ? ("edit" as const) : replyTo ? ("reply" as const) : null,
      replyToName: replyTo ? authorName(replyTo.authorId) : "",
      quote: (editing ?? replyTo)?.text ?? "",
      canSend: text.trim().length > 0,
      onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
        if (!editing) store.notifyTyping();
      },
      /** Enter sends, Shift+Enter is a new line, Escape cancels a reply/edit. */
      onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Escape" && (editing || replyTo)) resetComposer();
        if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
        event.preventDefault();
        submit();
      },
      submit,
      cancel: resetComposer,
    },
  };
}

export type ChatRoomModel = ReturnType<typeof useChatRoom>;
