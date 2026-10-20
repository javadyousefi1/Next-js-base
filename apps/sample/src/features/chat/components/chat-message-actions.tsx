import type { ChatMessage } from "@repo/chat/types";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { CopyIcon, EllipsisVerticalIcon, PencilIcon, ReplyIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ChatRoomModel } from "../hooks/use-chat-room";

type ChatMessageActionsProps = {
  message: ChatMessage;
  isOwn: boolean;
  model: ChatRoomModel["row"];
};

/** Reply, copy, edit, delete — shown on hover or focus of the row. */
export function ChatMessageActions({ message, isOwn, model }: ChatMessageActionsProps) {
  const t = useTranslations("Examples.chat");
  const sent = message.status !== "sending" && message.status !== "failed";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
            aria-label={t("actions")}
          />
        }
      >
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-40">
        <DropdownMenuGroup>
          {sent && (
            <DropdownMenuItem onClick={() => model.reply(message)}>
              <ReplyIcon />
              {t("reply")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => model.copy(message)}>
            <CopyIcon />
            {t("copy")}
          </DropdownMenuItem>
          {isOwn && sent && model.canEdit && (
            <DropdownMenuItem onClick={() => model.edit(message)}>
              <PencilIcon />
              {t("edit")}
            </DropdownMenuItem>
          )}
          {isOwn && (model.canDelete || !sent) && (
            <DropdownMenuItem variant="destructive" onClick={() => model.remove(message)}>
              <Trash2Icon />
              {t("delete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
