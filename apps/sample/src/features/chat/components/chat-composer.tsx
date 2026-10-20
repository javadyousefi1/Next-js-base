import { Button } from "@repo/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@repo/ui/components/input-group";
import { PencilIcon, ReplyIcon, SendHorizontalIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ChatRoomModel } from "../hooks/use-chat-room";

type ChatComposerProps = { composer: ChatRoomModel["composer"]; disabled: boolean };

/** The message box: Enter sends, Shift+Enter breaks the line, a banner while replying/editing. */
export function ChatComposer({ composer, disabled }: ChatComposerProps) {
  const t = useTranslations("Examples.chat");
  const { textareaRef, ...model } = composer;

  return (
    <div className="flex flex-col gap-2 border-t p-3">
      {model.mode && (
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs">
          {model.mode === "reply" ? (
            <ReplyIcon className="size-4" />
          ) : (
            <PencilIcon className="size-4" />
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-medium">
              {model.mode === "reply" ? t("replyingTo", { name: model.replyToName }) : t("editing")}
            </span>
            <span className="truncate text-muted-foreground" dir="auto">
              {model.quote}
            </span>
          </div>
          <Button variant="ghost" size="icon-xs" aria-label={t("cancel")} onClick={model.cancel}>
            <XIcon />
          </Button>
        </div>
      )}
      <InputGroup>
        <InputGroupTextarea
          ref={textareaRef}
          dir="auto"
          rows={1}
          value={model.text}
          disabled={disabled}
          placeholder={t("placeholder")}
          aria-label={t("messageLabel")}
          className="max-h-40 min-h-10"
          onChange={model.onChange}
          onKeyDown={model.onKeyDown}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-sm"
            variant="default"
            aria-label={t("send")}
            disabled={disabled || !model.canSend}
            onClick={model.submit}
          >
            <SendHorizontalIcon className="rtl:rotate-180" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
