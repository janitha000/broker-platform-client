/**
 * Shared HTTP helper. No React — just fetch.
 *
 * Why this file exists:
 * - Pages should not copy-paste fetch + JSON + error handling.
 * - Origination (Slice 2) will reuse the same helper with a different base URL.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
};

export async function request<T>(baseUrl: string, path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;

  const headers = new Headers();
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
