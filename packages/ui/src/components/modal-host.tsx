"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { ModalCloseContext } from "@repo/ui/hooks/use-modal-close";
import { useModalEntries } from "@repo/ui/hooks/use-modal-entries";
import { useModalPrompt } from "@repo/ui/hooks/use-modal-prompt";
import {
  modalStore,
  resolveModalButton,
  type ModalEntry,
  type ModalVariant,
} from "@repo/ui/lib/modal";
import { cn } from "cn";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";

/** Default texts of the modal buttons (pass translations from the app). */
export type ModalHostLabels = {
  confirm: string;
  cancel: string;
  ok: string;
  close: string;
};

const DEFAULT_LABELS: ModalHostLabels = {
  confirm: "Confirm",
  cancel: "Cancel",
  ok: "OK",
  close: "Close",
};

const VARIANTS: Record<
  ModalVariant,
  { icon?: LucideIcon; media: string; action: "default" | "destructive" }
> = {
  default: { media: "", action: "default" },
  info: { icon: InfoIcon, media: "bg-primary/10 text-primary", action: "default" },
  success: { icon: CircleCheckIcon, media: "bg-success/10 text-success", action: "default" },
  warning: { icon: TriangleAlertIcon, media: "bg-warning/10 text-warning", action: "default" },
  destructive: {
    icon: CircleAlertIcon,
    media: "bg-destructive/10 text-destructive",
    action: "destructive",
  },
};

const SIZES = {
  sm: "sm:max-w-xs",
  default: "sm:max-w-sm",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
};

const closeHandlers = (id: number) => ({
  onOpenChange: (open: boolean) => {
    if (!open) modalStore.dismiss(id);
  },
  onOpenChangeComplete: (open: boolean) => {
    if (!open) modalStore.remove(id);
  },
});

/**
 * Renders the modals opened with `modal.confirm/alert/prompt/open` (`@repo/ui/lib/modal`).
 * Mount it once, next to the `Toaster`.
 */
function ModalHost({ labels }: { labels?: Partial<ModalHostLabels> }) {
  const entries = useModalEntries();
  const texts = { ...DEFAULT_LABELS, ...labels };

  return entries.map((entry) => {
    if (entry.kind === "custom") return <CustomModal key={entry.id} entry={entry} labels={texts} />;
    if (entry.kind === "prompt") return <PromptModal key={entry.id} entry={entry} labels={texts} />;
    return <ConfirmModal key={entry.id} entry={entry} labels={texts} />;
  });
}

function VariantIcon({ variant }: { variant: ModalVariant | undefined }) {
  const { icon: Icon, media } = VARIANTS[variant ?? "default"];
  if (!Icon) return null;
  return (
    <AlertDialogMedia className={media}>
      <Icon />
    </AlertDialogMedia>
  );
}

function ConfirmModal({
  entry,
  labels,
}: {
  entry: Extract<ModalEntry, { kind: "confirm" | "alert" }>;
  labels: ModalHostLabels;
}) {
  const { options, pending } = entry;
  const actionType = VARIANTS[options.variant ?? "default"].action;
  const isAlert = entry.kind === "alert";
  const action = isAlert
    ? resolveModalButton(entry.options.okButton, labels.ok, actionType)
    : resolveModalButton(entry.options.actionButton, labels.confirm, actionType);
  const cancel =
    isAlert || entry.options.cancelButton === false
      ? undefined
      : resolveModalButton(entry.options.cancelButton, labels.cancel, "outline");

  return (
    <AlertDialog open={entry.open} {...closeHandlers(entry.id)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <VariantIcon variant={options.variant} />
          {options.title && <AlertDialogTitle>{options.title}</AlertDialogTitle>}
          <AlertDialogDescription render={<div />}>{entry.content}</AlertDialogDescription>
        </AlertDialogHeader>
        {entry.error && (
          <p role="alert" className="text-sm text-destructive">
            {entry.error}
          </p>
        )}
        <AlertDialogFooter>
          {cancel && (
            <Button
              variant={cancel.type}
              disabled={pending !== undefined}
              onClick={() => void modalStore.answer(entry.id, "no")}
            >
              {pending === "no" && <Spinner data-icon="inline-start" />}
              {cancel.label}
            </Button>
          )}
          <Button
            variant={action.type}
            disabled={pending !== undefined}
            onClick={() =>
              isAlert ? modalStore.close(entry.id) : void modalStore.answer(entry.id, "yes")
            }
          >
            {pending === "yes" && <Spinner data-icon="inline-start" />}
            {action.label}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PromptModal({
  entry,
  labels,
}: {
  entry: Extract<ModalEntry, { kind: "prompt" }>;
  labels: ModalHostLabels;
}) {
  const { options } = entry;
  const { inputRef, value, onChange, onSubmit } = useModalPrompt(entry);
  const inputId = `modal-prompt-${entry.id}`;
  const action = resolveModalButton(
    options.actionButton,
    labels.confirm,
    VARIANTS[options.variant ?? "default"].action,
  );
  const cancel =
    options.cancelButton === false
      ? undefined
      : resolveModalButton(options.cancelButton, labels.cancel, "outline");

  return (
    <Dialog open={entry.open} {...closeHandlers(entry.id)}>
      <DialogContent showCloseButton={false} initialFocus={inputRef}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            {options.title && <DialogTitle>{options.title}</DialogTitle>}
            <DialogDescription render={<div />}>{entry.content}</DialogDescription>
          </DialogHeader>
          <Field data-invalid={entry.error ? true : undefined}>
            {options.label && <FieldLabel htmlFor={inputId}>{options.label}</FieldLabel>}
            <Input
              ref={inputRef}
              id={inputId}
              type={options.inputType ?? "text"}
              placeholder={options.placeholder}
              value={value}
              onChange={onChange}
              aria-invalid={entry.error ? true : undefined}
            />
            {entry.error && <FieldError>{entry.error}</FieldError>}
          </Field>
          <DialogFooter>
            {cancel && (
              <Button
                type="button"
                variant={cancel.type}
                onClick={() => modalStore.dismiss(entry.id)}
              >
                {cancel.label}
              </Button>
            )}
            <Button type="submit" variant={action.type}>
              {action.label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomModal({
  entry,
  labels,
}: {
  entry: Extract<ModalEntry, { kind: "custom" }>;
  labels: ModalHostLabels;
}) {
  const { title, description, size = "default", dismissible = true } = entry.options;

  return (
    <Dialog open={entry.open} {...closeHandlers(entry.id)}>
      <DialogContent
        showCloseButton={dismissible}
        closeLabel={labels.close}
        className={cn(SIZES[size])}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <ModalCloseContext value={(value) => modalStore.close(entry.id, value)}>
          {entry.content}
        </ModalCloseContext>
      </DialogContent>
    </Dialog>
  );
}

export { ModalHost };
