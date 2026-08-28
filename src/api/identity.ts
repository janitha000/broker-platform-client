/**
 * Identity API only. Maps to AuthController:
 *   POST /auth/register
 *   POST /auth/login
 *
 * Why this is separate from http.ts:
 * - http.ts does not know about "tenant" or "accessToken".
 * - This file is the only place that knows Identity's paths and JSON shapes.
 */

import { request } from "./http";

const identityUrl =
  import.meta.env.VITE_IDENTITY_API_URL ?? "http://localhost:5250";

export type AuthUser = {
  tenantId: string;
  brokerId: string;
  email: string;
  accessToken: string;
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

export function login(email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>(identityUrl, "/auth/login", {
    method: "POST",
    body: { email, password },
  });
}
