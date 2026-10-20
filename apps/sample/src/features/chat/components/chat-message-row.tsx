import type { TimelineItem } from "@repo/chat/timeline";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Bubble, BubbleContent } from "@repo/ui/components/bubble";
import { Button } from "@repo/ui/components/button";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@repo/ui/components/message";
import { cn } from "@repo/ui/lib/utils";
import { CheckCheckIcon, CheckIcon, CircleAlertIcon, ClockIcon, RotateCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ChatRoomModel } from "../hooks/use-chat-room";
import { ChatMessageActions } from "./chat-message-actions";

type ChatMessageRowProps = {
  item: Extract<TimelineItem, { type: "message" }>;
  model: ChatRoomModel["row"];
};

/** A message: side, avatar and name once per group, reply quote, bubble, time and delivery. */
export function ChatMessageRow({ item, model }: ChatMessageRowProps) {
  const t = useTranslations("Examples.chat");
  const { message, isOwn, isFirstInGroup, isLastInGroup, replyTo } = item;
  const failed = message.status === "failed";

  return (
    <Message
      align={isOwn ? "end" : "start"}
      role="article"
      data-message-id={message.id}
      className={cn(
        "group/row pt-0.5",
        isFirstInGroup && "pt-3",
        model.highlightedId === message.id && "rounded-lg bg-primary/5 ring-2 ring-primary/30",
      )}
    >
      {!isOwn && (
        <MessageAvatar className={cn(!isLastInGroup && "invisible")}>
          <Avatar size="sm">
            <AvatarFallback>{model.authorName(message.authorId).slice(0, 1)}</AvatarFallback>
          </Avatar>
        </MessageAvatar>
      )}
      <MessageContent className="gap-1">
        {isFirstInGroup && !isOwn && (
          <MessageHeader>{model.authorName(message.authorId)}</MessageHeader>
        )}
        <div className={cn("flex items-center gap-1", isOwn && "flex-row-reverse")}>
          <Bubble
            align={isOwn ? "end" : "start"}
            variant={
              message.deleted ? "outline" : failed ? "destructive" : isOwn ? "default" : "muted"
            }
          >
            {replyTo && !message.deleted && (
              <BubbleContent
                render={
                  <button
                    type="button"
                    aria-label={t("jumpToReply", { name: model.authorName(replyTo.authorId) })}
                    onClick={() => model.jumpTo(replyTo)}
                  />
                }
                className="w-full border-s-2 border-s-current py-1 text-xs opacity-80"
              >
                <span className="block font-medium">{model.authorName(replyTo.authorId)}</span>
                <span className="line-clamp-1">
                  {replyTo.deleted ? t("deleted") : replyTo.text}
                </span>
              </BubbleContent>
            )}
            <BubbleContent
              dir="auto"
              className={cn(
                "whitespace-pre-wrap",
                message.deleted && "text-muted-foreground italic",
              )}
            >
              {message.deleted ? t("deleted") : message.text}
            </BubbleContent>
          </Bubble>
          {!message.deleted && <ChatMessageActions message={message} isOwn={isOwn} model={model} />}
        </div>
        {(isLastInGroup || failed || message.status === "sending") && (
          <MessageFooter className="gap-1">
            <time dateTime={message.createdAt}>{model.time(message.createdAt)}</time>
            {message.editedAt && !message.deleted && <span>· {t("edited")}</span>}
            {isOwn && message.status === "sending" && (
              <ClockIcon className="size-3" aria-label={t("sending")} />
            )}
            {isOwn &&
              !failed &&
              message.status !== "sending" &&
              (item.isRead ? (
                <CheckCheckIcon className="size-3.5 text-primary" aria-label={t("read")} />
              ) : (
                <CheckIcon className="size-3.5" aria-label={t("sent")} />
              ))}
            {failed && (
              <>
                <CircleAlertIcon className="size-3.5 text-destructive" aria-hidden />
                <span className="text-destructive">{t("failed")}</span>
                <Button variant="link" size="xs" onClick={() => model.retry(message)}>
                  <RotateCwIcon data-icon="inline-start" />
                  {t("retry")}
                </Button>
              </>
            )}
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
