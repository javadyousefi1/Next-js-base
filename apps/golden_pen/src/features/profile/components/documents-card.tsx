"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useTranslations } from "next-intl";

import { useProfileDocuments } from "../hooks/use-profile-documents";
import type { ProfileIdentity } from "../schemas/profile.schema";
import { DocumentDropzone } from "./document-dropzone";

/** «مدارک»: the uploaded documents per kind, each opening in a new tab, with a drop zone. */
export function DocumentsCard({ identity }: { identity: ProfileIdentity | null }) {
  const t = useTranslations("Profile.documents");
  const groups = useProfileDocuments(identity);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        {groups.map((group) => (
          <section key={group.kind} className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">{t(`kinds.${group.kind}`)}</h3>
            <DocumentDropzone kind={group.kind} />
            {group.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm" data-testid={`${group.kind}-list`}>
                {group.items.map((document) => (
                  <li key={`${document.name}-${document.url}`}>
                    {document.url ? (
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {document.name}
                      </a>
                    ) : (
                      document.name
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
