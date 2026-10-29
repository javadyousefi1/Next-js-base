"use client";

import { useState } from "react";

import type { User } from "@/features/users/schemas/user.schema";

/**
 * Which row the review sheet shows. The user stays after closing so the sheet keeps its
 * content during the closing animation.
 */
export function useIdentityReview() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return {
    user,
    isOpen,
    open: (next: User) => {
      setUser(next);
      setIsOpen(true);
    },
    setOpen: setIsOpen,
  };
}
