"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { Input } from "@repo/ui/components/input";
import { Kbd } from "@repo/ui/components/kbd";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { CheckIcon, ChevronDownIcon, CopyIcon, PauseIcon, PlayIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useHooksExample } from "../hooks/use-hooks-example";

/** Every `@repo/hooks` hook in a small working demo. */
export function HooksExample() {
  const t = useTranslations("Examples.hooks");
  const example = useHooksExample();

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("debounce.title")}</CardTitle>
          <CardDescription>{t("debounce.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label htmlFor="hooks-search">{t("debounce.label")}</Label>
          <Input
            id="hooks-search"
            value={example.debounce.value}
            onChange={example.debounce.onChange}
            placeholder={t("debounce.placeholder")}
          />
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-muted-foreground">{t("debounce.typed")}</dt>
            <dd>{example.debounce.value || "—"}</dd>
            <dt className="text-muted-foreground">{t("debounce.debounced")}</dt>
            <dd>{example.debounce.debounced || "—"}</dd>
            <dt className="text-muted-foreground">{t("debounce.calls")}</dt>
            <dd className="tabular-nums">{example.debounce.calls}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("interval.title")}</CardTitle>
          <CardDescription>{t("interval.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-muted-foreground">{t("interval.count")}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{example.interval.count}</dd>
            <dt className="text-muted-foreground">{t("interval.previous")}</dt>
            <dd className="tabular-nums">{example.interval.previous ?? "—"}</dd>
          </dl>
          <Button variant="outline" onClick={example.interval.toggle}>
            {example.interval.running ? (
              <PauseIcon data-icon="inline-start" />
            ) : (
              <PlayIcon data-icon="inline-start" />
            )}
            {example.interval.running ? t("interval.pause") : t("interval.resume")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("storage.title")}</CardTitle>
          <CardDescription>{t("storage.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label htmlFor="hooks-note">{t("storage.label")}</Label>
          <Textarea
            id="hooks-note"
            value={example.storage.value}
            onChange={example.storage.onChange}
            placeholder={t("storage.placeholder")}
          />
          <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>{t("storage.saved", { count: example.storage.length })}</span>
            <Button variant="ghost" size="sm" onClick={example.storage.clear}>
              {t("storage.clear")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("disclosure.title")}</CardTitle>
          <CardDescription>{t("disclosure.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Collapsible open={example.details.open} onOpenChange={example.details.onOpenChange}>
            <CollapsibleTrigger render={<Button variant="outline" />}>
              {example.details.open ? t("disclosure.hide") : t("disclosure.toggle")}
              <ChevronDownIcon data-icon="inline-end" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 text-sm text-muted-foreground">
              {t("disclosure.content")}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("clipboard.title")}</CardTitle>
          <CardDescription>{t("clipboard.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <code dir="ltr" className="rounded bg-muted px-2 py-1 font-mono text-xs">
            {example.clipboard.text}
          </code>
          <Button variant="outline" onClick={example.clipboard.copy}>
            {example.clipboard.copied ? (
              <CheckIcon data-icon="inline-start" />
            ) : (
              <CopyIcon data-icon="inline-start" />
            )}
            {example.clipboard.copied ? t("clipboard.copied") : t("clipboard.copy")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("environment.title")}</CardTitle>
          <CardDescription>{t("environment.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
            <dt className="text-muted-foreground">{t("environment.wide")}</dt>
            <dd>{example.environment.isWide ? t("environment.yes") : t("environment.no")}</dd>
            <dt className="text-muted-foreground">{t("environment.client")}</dt>
            <dd>{example.environment.isClient ? t("environment.yes") : t("environment.no")}</dd>
            <dt className="text-muted-foreground">{t("environment.lastKey")}</dt>
            <dd>
              {example.environment.lastKey ? (
                <Kbd>{example.environment.lastKey}</Kbd>
              ) : (
                t("environment.pressAKey")
              )}
            </dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
