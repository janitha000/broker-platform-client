/**
 * Identity API. Cookie holds the JWT; this module only maps JSON shapes.
 *   POST /auth/register
 *   POST /auth/login
 *   POST /auth/logout
 *   GET  /auth/me
 */

import { request } from "./http";

const identityUrl = import.meta.env.VITE_IDENTITY_API_URL ?? "";

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

export function login(email: string, password: string): Promise<AuthUser> {
  return request<AuthUser>(identityUrl, "/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function getMe(): Promise<AuthUser> {
  return request<AuthUser>(identityUrl, "/auth/me");
}

export function logout(): Promise<void> {
  return request<void>(identityUrl, "/auth/logout", { method: "POST" });
}
