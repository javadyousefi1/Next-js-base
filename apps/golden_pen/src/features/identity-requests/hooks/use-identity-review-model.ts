"use client";

import { useTranslations } from "next-intl";

import { useCities } from "@/features/base-info/hooks/use-cities";
import { useProvinces } from "@/features/base-info/hooks/use-provinces";
import { groupDocuments } from "@/features/profile/group-documents";
import type { User } from "@/features/users/schemas/user.schema";

import { identityDetailQuery } from "../api/identity-requests.queries";
import { isImageUrl, REVIEW_GROUPS, reviewFieldValues } from "../review-fields";

/**
 * Everything the review sheet renders for one user: their identity from `GET /User/Get`
 * (status, reviewer message, labelled field groups, documents per kind) and the avatar.
 */
export function useIdentityReviewModel(user: User) {
  const tProfile = useTranslations("Profile");
  const query = identityDetailQuery.useQuery({ userId: user.id });
  const identity = query.data?.identity ?? null;

  const { provinces } = useProvinces();
  const { cities } = useCities(identity?.provinceId ?? null);
  const values = reviewFieldValues(identity, {
    province: provinces.find((province) => province.id === identity?.provinceId)?.name ?? null,
    city: cities.find((city) => city.id === identity?.cityId)?.name ?? null,
  });

  return {
    isLoading: query.isPending,
    isError: query.isError,
    retry: () => void query.refetch(),
    avatarUrl: query.data?.info.avatarUrl ?? null,
    status: identity?.statusType ?? user.identityStatus,
    message: identity?.message ?? null,
    groups: REVIEW_GROUPS.map((group) => ({
      key: group.key,
      title:
        group.key === "nationalId"
          ? tProfile("fields.nationalId")
          : tProfile(`sections.${group.key}`),
      fields: group.fields.map((field) => ({
        key: field,
        label: tProfile(`fields.${field}`),
        value: values[field] ?? "—",
      })),
    })),
    documents: groupDocuments(identity?.documents ?? []).map((group) => ({
      kind: group.kind,
      title: tProfile(`documents.kinds.${group.kind}`),
      items: group.items.map((document) => ({
        name: document.name,
        url: document.url,
        isImage: isImageUrl(document.url),
      })),
    })),
  };
}
