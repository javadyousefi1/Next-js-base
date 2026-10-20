"use client";

import type { ChatTransport } from "@repo/chat/types";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@repo/ui/components/empty";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { ArrowDownIcon, MessageSquareOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useChatRoom } from "../hooks/use-chat-room";
import { ChatComposer } from "./chat-composer";
import { ChatRowView } from "./chat-row-view";
import { ChatSkeleton } from "./chat-skeleton";

type ChatRoomProps = { transport: ChatTransport; currentUserId: string };

/** Header, virtualized conversation, "jump to latest" and the composer. */
export function ChatRoom({ transport, currentUserId }: ChatRoomProps) {
  const t = useTranslations("Examples.chat");
  const { scrollRef, measureElement, ...room } = useChatRoom({ transport, currentUserId });

  return (
    <Card className="h-full gap-0 overflow-hidden py-0">
      <CardHeader className="flex items-center gap-3 border-b py-3">
        <Avatar>
          <AvatarFallback>{room.title.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <CardTitle>{room.title}</CardTitle>
          <CardDescription aria-live="polite" className={cn(room.isTyping && "text-primary")}>
            {room.subtitle}
          </CardDescription>
        </div>
      </CardHeader>

      <div className="relative flex min-h-0 flex-1 flex-col">
        {room.status === "error" ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquareOffIcon />
              </EmptyMedia>
              <EmptyDescription>{t("loadError")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={room.retryLoad}>{t("retry")}</Button>
            </EmptyContent>
          </Empty>
        ) : room.status !== "ready" ? (
          <ChatSkeleton />
        ) : (
          <div
            ref={scrollRef}
            role="log"
            aria-label={room.conversationLabel}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="relative w-full" style={{ height: room.totalSize }}>
              {room.virtualRows.map(({ virtual, row }) => (
                <div
                  key={virtual.key}
                  ref={measureElement}
                  data-index={virtual.index}
                  className="absolute inset-x-0 top-0 px-4"
                  style={{ transform: `translateY(${virtual.start}px)` }}
                >
                  <ChatRowView row={row} model={room.row} />
                </div>
              ))}
            </div>
          </div>
        )}

        {room.loadingOlder && (
          <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center">
            <Badge variant="secondary">
              <Spinner aria-label={t("loadingOlder")} />
            </Badge>
          </div>
        )}

        {!room.isAtEnd && (
          <Button
            variant="outline"
            size="icon"
            className="absolute end-4 bottom-4 rounded-full shadow-md"
            aria-label={room.unseen > 0 ? room.unseenLabel : t("jumpToLatest")}
            onClick={room.jumpToEnd}
          >
            <ArrowDownIcon />
            {room.unseen > 0 && (
              <Badge className="absolute -end-2 -top-2 h-5 min-w-5 px-1 tabular-nums">
                {room.unseen}
              </Badge>
            )}
          </Button>
        )}
      </div>

      <ChatComposer composer={room.composer} disabled={room.status !== "ready"} />
    </Card>
  );
}
