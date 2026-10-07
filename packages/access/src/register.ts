/**
 * Apps register their roles and permissions once, so `<Can>` and `useAccess()` are typed:
 * declare module "@repo/access/register" { interface Register { role: AppRole; permission: AppPermission } }
 */
export interface Register {}

export type Role = Register extends { role: infer R extends string } ? R : string;
export type Permission = Register extends { permission: infer P extends string } ? P : string;
