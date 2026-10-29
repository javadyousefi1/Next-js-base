/** Mock data of the profile: identity of the demo admin and the provinces/cities lookups. */
export type MockDocument = { fieldType: string; name: string; url: string | null };

export type MockIdentity = {
  statusType: number;
  message: string | null;
  specialty: string | null;
  bio: string | null;
  licenseNumber: string | null;
  barAssociation: string | null;
  provinceId: number | null;
  cityId: number | null;
  nationalId: string | null;
  companyName: string | null;
  companyNationalId: string | null;
  companyRegistrationNumber: string | null;
  companyRepresentativeName: string | null;
  documents: MockDocument[];
};

/** A user who has not sent identity data yet: status 0 (none), everything empty. */
export function emptyIdentity(): MockIdentity {
  return {
    statusType: 0,
    message: null,
    specialty: null,
    bio: null,
    licenseNumber: null,
    barAssociation: null,
    provinceId: null,
    cityId: null,
    nationalId: null,
    companyName: null,
    companyNationalId: null,
    companyRegistrationNumber: null,
    companyRepresentativeName: null,
    documents: [],
  };
}

/** The demo admin's identity: rejected, with a reason and two seeded documents. */
export function seededIdentity(): MockIdentity {
  return {
    ...emptyIdentity(),
    statusType: 4,
    message: "تصویر پروانه خوانا نیست.",
    specialty: "حقوق خانواده",
    licenseNumber: "12345",
    barAssociation: "کانون وکلای مرکز",
    provinceId: 1,
    cityId: 1,
    nationalId: "0012345678",
    documents: [
      { fieldType: "licenseFile", name: "پروانه.pdf", url: "https://example.com/license.pdf" },
      { fieldType: "documents", name: "قرارداد.pdf", url: "https://example.com/contract.pdf" },
    ],
  };
}

export const MOCK_PROVINCES = [
  { id: 1, name: "تهران" },
  { id: 2, name: "اصفهان" },
  { id: 3, name: "فارس" },
];

/** Cities by `provinceId`. */
export const MOCK_CITIES: Record<number, { id: number; name: string }[]> = {
  1: [
    { id: 1, name: "تهران" },
    { id: 2, name: "ری" },
    { id: 3, name: "شمیرانات" },
  ],
  2: [
    { id: 11, name: "اصفهان" },
    { id: 12, name: "کاشان" },
    { id: 13, name: "نجف‌آباد" },
  ],
  3: [
    { id: 21, name: "شیراز" },
    { id: 22, name: "مرودشت" },
  ],
};

const provinceNameOf = (id: number | null) => MOCK_PROVINCES.find((p) => p.id === id)?.name ?? null;
const cityNameOf = (provinceId: number | null, id: number | null) =>
  MOCK_CITIES[provinceId ?? 0]?.find((city) => city.id === id)?.name ?? null;

/** The identity as `UserIdentityRsDto`: ids plus the province/city names. */
export function identityResponse(identity: MockIdentity) {
  return {
    ...identity,
    province: provinceNameOf(identity.provinceId),
    city: cityNameOf(identity.provinceId, identity.cityId),
    requestedAt: null,
    verifiedAt: null,
    verifiedBy: null,
    inviteCodeUsed: null,
  };
}
