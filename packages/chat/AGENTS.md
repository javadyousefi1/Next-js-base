# packages/chat — AGENTS.md

`@repo/chat`: a headless chat — all the logic, no UI. Any backend plugs in through a
`ChatTransport`; any design renders the state. Repository rules: [`../../AGENTS.md`](../../AGENTS.md).
Working example: `apps/sample` → `/examples/chat` (`src/features/chat`).

- `types` — `ChatMessage`, `ChatEvent`, `HistoryPage`, `MessageDraft` and **`ChatTransport`**
  (`loadHistory`, `send`, `subscribe` required; `edit`, `remove`, `markRead`, `setTyping`
  optional — the store reports them in `capabilities`). Map the backend's shape to these.
- `websocket-transport` — `createWebSocketTransport({ createSocket, codec? })`: requests wait for
  their reply by `requestId`, other frames are events; queue until open, reconnect with backoff,
  request timeout. Another wire protocol = another `SocketCodec` (`jsonSocketCodec` is default).
- `polling-transport` — `createPollingTransport(api)` for a REST API: the app writes the calls
  (its HTTP client + zod) and a `poll(cursor)` for changes.
- `chat-store` — `createChatStore({ transport, currentUserId })`: first page, `loadOlder`,
  optimistic `send` (`sending` → `sent` | `failed`, `retry` with the same `clientId`), `edit`
  (optimistic, rolls back), `remove` (awaits the server: use it in `modal.confirm`'s `onAction`),
  typing (`notifyTyping` per keystroke, throttled; others' typing expires), read receipts
  (`markRead`, `readBy`, `firstUnreadId`), connection status. Pure and unit-tested.
- `timeline` — `buildTimeline(messages, options)`: rows for a list — day dividers (by time
  zone), the unread divider, side (`isOwn`), grouping, `isRead`, `replyTo`; keys stable across the
  optimistic → server swap.
- `use-chat` — `useChat(options)`: the store in React (connects on mount; remount via `key` to
  switch transport). `use-chat-scroll` — `useChatScroll({ items, … })`: a virtualized list
  (TanStack Virtual, `anchorTo: "end"`) that opens at the latest message, follows new ones at the
  bottom, keeps the position when history is prepended, loads older near the top and counts
  unseen messages.
- Tests: `bun test` (store, timeline, both transports with fakes).
