"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { useTranslations } from "next-intl";

import { QueryError } from "@/components/feedback/query-error";

import { useProfile } from "../hooks/use-profile";
import { PROFILE_TABS, useProfileTab } from "../hooks/use-profile-tab";
import { DocumentsCard } from "./documents-card";
import { IdentityRequestCard } from "./identity-request-card";
import { ProfileIdentityForm } from "./profile-identity-form";
import { ProfileInfoForm } from "./profile-info-form";
import { ProfileLoading } from "./profile-loading";
import { ProfileSideCard } from "./profile-side-card";

/** The profile page body: a sticky side card and the tabs (basic info, identity, documents). */
export function ProfileContent() {
  const t = useTranslations("Profile.tabs");
  const { profile, isLoading, refetch } = useProfile();
  const { tab, selectTab } = useProfileTab();

  if (isLoading) return <ProfileLoading />;
  if (!profile) return <QueryError onRetry={refetch} />;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-20">
        <ProfileSideCard profile={profile} />
      </div>
      <Tabs value={tab} onValueChange={selectTab}>
        <TabsList className="w-full">
          {PROFILE_TABS.map((value) => (
            <TabsTrigger key={value} value={value}>
              {t(value)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="info" keepMounted>
          <ProfileInfoForm info={profile.info} />
        </TabsContent>
        <TabsContent value="identity" keepMounted>
          <div className="flex flex-col gap-4">
            <IdentityRequestCard identity={profile.identity} />
            <ProfileIdentityForm identity={profile.identity} />
          </div>
        </TabsContent>
        <TabsContent value="documents" keepMounted>
          <DocumentsCard identity={profile.identity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
