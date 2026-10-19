"use client";

import { Avatar, AvatarFallback, AvatarGroup } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import { Separator } from "@repo/ui/components/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { useTranslations } from "next-intl";

import { useUiExample } from "../hooks/use-ui-example";
import { GallerySection } from "./gallery-section";

const PEOPLE = [
  { initials: "SA", name: "Sara Ahmadi", active: true },
  { initials: "RK", name: "Reza Karimi", active: false },
  { initials: "NM", name: "Neda Moradi", active: true },
];

export function UiDisplayTab() {
  const t = useTranslations("Examples.ui");
  const ui = useUiExample();

  return (
    <>
      <GallerySection title={t("display.avatars")}>
        <AvatarGroup>
          {PEOPLE.map((person) => (
            <Avatar key={person.initials}>
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </GallerySection>

      <GallerySection title={t("display.breadcrumb")}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t("display.home")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t("display.library")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("display.data")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </GallerySection>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{t("display.table")}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("display.name")}</TableHead>
              <TableHead>{t("display.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PEOPLE.map((person) => (
              <TableRow key={person.initials}>
                <TableCell>{person.name}</TableCell>
                <TableCell>
                  <Badge variant={person.active ? "secondary" : "outline"}>
                    {person.active ? t("statusActive") : t("statusPaused")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("display.pagination")} — {t("display.page", { page: ui.pagination.page })}
        </h2>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text={t("display.previous")}
                aria-disabled={!ui.pagination.hasPrevious}
                onClick={ui.pagination.goTo(ui.pagination.page - 1)}
              />
            </PaginationItem>
            {ui.pagination.pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === ui.pagination.page}
                  onClick={ui.pagination.goTo(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                text={t("display.next")}
                aria-disabled={!ui.pagination.hasNext}
                onClick={ui.pagination.goTo(ui.pagination.page + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </>
  );
}
