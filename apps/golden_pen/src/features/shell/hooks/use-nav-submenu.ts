"use client";

import { useSidebar } from "@repo/ui/components/sidebar";
import { useState } from "react";

/**
 * Open state of a collapsible sidebar item. It opens by itself when a child page becomes active;
 * in the icon-collapsed sidebar (where sub-items are hidden) a click expands the sidebar instead.
 */
export function useNavSubmenu(hasActiveChild: boolean) {
  const sidebar = useSidebar();
  const [open, setOpen] = useState(hasActiveChild);
  const [wasActive, setWasActive] = useState(hasActiveChild);

  // Adjust state while rendering (instead of an effect) when the active page moves into this item.
  if (hasActiveChild !== wasActive) {
    setWasActive(hasActiveChild);
    if (hasActiveChild) setOpen(true);
  }

  const onOpenChange = (next: boolean) => {
    if (sidebar.state === "collapsed" && !sidebar.isMobile) {
      sidebar.setOpen(true);
      setOpen(true);
      return;
    }
    setOpen(next);
  };

  return { open, onOpenChange };
}
