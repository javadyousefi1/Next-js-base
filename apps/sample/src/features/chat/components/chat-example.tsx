"use client";

import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { useTranslations } from "next-intl";

import { useChatExample } from "../hooks/use-chat-example";
import { ChatRoom } from "./chat-room";
import { ChatSkeleton } from "./chat-skeleton";

/** The chat over a switchable backend; switching remounts the room with the other transport. */
export function ChatExample() {
  const t = useTranslations("Examples.chat");
  const example = useChatExample();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Label id="chat-backend">{t("transport")}</Label>
        <ToggleGroup
          variant="outline"
          aria-labelledby="chat-backend"
          value={[example.backend]}
          onValueChange={example.selectBackend}
        >
          {example.backends.map((backend) => (
            <ToggleGroupItem key={backend.value} value={backend.value}>
              {backend.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="h-[calc(100dvh-16rem)] min-h-[28rem]">
        {example.transport && example.currentUserId ? (
          <ChatRoom
            key={example.backend}
            transport={example.transport}
            currentUserId={example.currentUserId}
          />
        ) : (
          <ChatSkeleton />
        )}
      </div>
    </div>
  );
}
