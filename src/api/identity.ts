/**
 * Identity API. Cookie holds the JWT; this module only maps JSON shapes.
 *   POST /auth/register
 *   GET  /auth/login     — browser navigation (Auth0)
 *   GET  /auth/logout    — browser navigation (Auth0)
 *   GET  /auth/me
 */

import { request } from "./http";

const identityUrl = import.meta.env.VITE_IDENTITY_API_URL ?? "";

function identityPath(path: string): string {
  return `${identityUrl.replace(/\/$/, "")}${path}`;
}

export type AuthUser = {
  tenantId: string;
  brokerId: string;
  email: string;
};

export function registerTenant(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  return request<AuthUser>(identityUrl, "/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export function getMe(): Promise<AuthUser> {
  return request<AuthUser>(identityUrl, "/auth/me");
}

/** Full navigation so Identity can 302 to Auth0. Do not fetch. */
export function beginLogin(): void {
  window.location.assign(identityPath("/auth/login"));
}

/** Full navigation so Identity can 302 to Auth0 logout. Do not fetch. */
export function beginLogout(): void {
  window.location.assign(identityPath("/auth/logout"));
}
