"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { useTranslations } from "next-intl";

/** The declarative overlay primitives (for questions, prefer `modal.*`: see the modal example). */
export function UiOverlaysTab() {
  const t = useTranslations("Examples.ui.overlays");
  const tModal = useTranslations("Modal");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>{t("dialog")}</DialogTrigger>
        <DialogContent closeLabel={tModal("close")}>
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dialogText")}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="outline" />}>
          {t("alertDialog")}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alertTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("alertText")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tModal("cancel")}</AlertDialogCancel>
            <AlertDialogAction>{t("continue")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>{t("sheet")}</SheetTrigger>
        <SheetContent closeLabel={tModal("close")}>
          <SheetHeader>
            <SheetTitle>{t("sheetTitle")}</SheetTitle>
            <SheetDescription>{t("sheetText")}</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>{t("popover")}</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>{t("popoverTitle")}</PopoverTitle>
            <PopoverDescription>{t("popoverText")}</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>

      <Tooltip>
        <TooltipTrigger render={<Button variant="ghost" />}>{t("tooltip")}</TooltipTrigger>
        <TooltipContent>{t("tooltipText")}</TooltipContent>
      </Tooltip>
    </div>
  );
}
