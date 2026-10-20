import { Marker, MarkerContent } from "@repo/ui/components/marker";
import { useTranslations } from "next-intl";

import type { ChatRoomModel, ChatRow } from "../hooks/use-chat-room";
import { ChatMessageRow } from "./chat-message-row";

type ChatRowViewProps = { row: ChatRow; model: ChatRoomModel["row"] };

/** One virtual row: a day divider, the unread divider, the start note or a message. */
export function ChatRowView({ row, model }: ChatRowViewProps) {
  const t = useTranslations("Examples.chat");

  if (row.type === "message") return <ChatMessageRow item={row} model={model} />;
  return (
    <Marker variant="separator" className="py-3 text-xs">
      <MarkerContent>
        {row.type === "day"
          ? model.dayLabel(row.day)
          : row.type === "unread"
            ? t("unread")
            : t("start")}
      </MarkerContent>
    </Marker>
  );
}
