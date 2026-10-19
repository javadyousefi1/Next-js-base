"use client";

import { Can } from "@repo/access/access-context";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAccessExample } from "../hooks/use-access-example";
import { HiddenNote } from "./hidden-note";

/** `<Can>`, `useAccess()`, `permissionsOf` and `ruleForPath` from `@repo/access`. */
export function AccessExample() {
  const t = useTranslations("Examples.access");
  const example = useAccessExample();

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <InfoIcon />
        <AlertDescription>{t("hint")}</AlertDescription>
      </Alert>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("yours.title")}</CardTitle>
            <CardDescription>{t("yours.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {example.isReady ? (
              <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{t("yours.roles")}</dt>
                <dd className="flex flex-wrap gap-1">
                  {example.roles.map((role) => (
                    <Badge key={role}>{role}</Badge>
                  ))}
                </dd>
                <dt className="text-muted-foreground">{t("yours.permissions")}</dt>
                <dd className="flex flex-wrap gap-1">
                  {example.permissions.length === 0
                    ? t("yours.none")
                    : example.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary">
                          {permission}
                        </Badge>
                      ))}
                </dd>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">{t("yours.loading")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("can.title")}</CardTitle>
            <CardDescription>{t("can.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Can permission="users.read" fallback={<HiddenNote text={t("can.noUsersRead")} />}>
              <p>{t("can.usersRead")}</p>
            </Can>
            <Can role="admin" fallback={<HiddenNote text={t("can.noAdmin")} />}>
              <p>{t("can.admin")}</p>
            </Can>
            <Can role={["admin", "moderator"]} fallback={<HiddenNote text={t("can.noStaff")} />}>
              <p>{t("can.staff")}</p>
            </Can>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("policy.title")}</CardTitle>
            <CardDescription>{t("policy.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("policy.role")}</TableHead>
                  <TableHead>{t("policy.grants")}</TableHead>
                  <TableHead>{t("policy.permissions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {example.policy.map((row) => (
                  <TableRow key={row.role}>
                    <TableCell className="font-medium">{row.role}</TableCell>
                    <TableCell dir="ltr" className="font-mono text-xs">
                      {row.grants.join(", ") || "—"}
                    </TableCell>
                    <TableCell dir="ltr" className="font-mono text-xs">
                      {row.permissions.join(", ") || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("routes.title")}</CardTitle>
            <CardDescription>{t("routes.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("routes.path")}</TableHead>
                  <TableHead>{t("routes.rule")}</TableHead>
                  <TableHead>{t("routes.allowed")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {example.routes.map((route) => (
                  <TableRow key={route.path}>
                    <TableCell dir="ltr" className="font-mono text-xs">
                      {route.path}
                    </TableCell>
                    <TableCell className="text-xs">{route.rule}</TableCell>
                    <TableCell>
                      <Badge variant={route.allowed ? "secondary" : "destructive"}>
                        {route.allowed ? t("routes.yes") : t("routes.no")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
