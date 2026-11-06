import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { DataTablePlaceholder } from "@/components/data-table/data-table-placeholder";
import { DataTableToolbarPlaceholder } from "@/components/data-table/data-table-toolbar-placeholder";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { InviteLinkCreateButton } from "@/features/invite-links/components/invite-link-create-button";
import { InviteLinksTable } from "@/features/invite-links/components/invite-links-table";
import { InviteLinksToolbar } from "@/features/invite-links/components/invite-links-toolbar";
import { INVITE_LINKS_COLUMN_KEYS } from "@/features/invite-links/invite-links-column-keys";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/invite-links">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "InviteLinks", ROUTES.inviteLinks);
}

export default async function InviteLinksPage() {
  const t = await getTranslations("InviteLinks");

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={<InviteLinkCreateButton />}
      />
      <div className="flex flex-col gap-4">
        <Suspense fallback={<DataTableToolbarPlaceholder search={false} />}>
          <InviteLinksToolbar />
        </Suspense>
        <Suspense
          fallback={
            <DataTablePlaceholder
              headers={INVITE_LINKS_COLUMN_KEYS.map((key) => t(`columns.${key}`))}
            />
          }
        >
          <InviteLinksTable />
        </Suspense>
      </div>
    </>
  );
}
