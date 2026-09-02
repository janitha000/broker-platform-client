export class ApiError extends Error {
  readonly status: number;
  readonly title: string | undefined;
  readonly fieldErrors: Readonly<Record<string, string>>;
  constructor(
    status: number,
    message: string,
    options: {
      title?: string;
      fieldErrors?: Record<string, string>;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.title = options.title;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | undefined;

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | undefined,
) {
  unauthorizedHandler = handler;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;

  const headers = new Headers();
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    unauthorizedHandler?.();
    throw new ApiError(401, response.statusText);
  }

  if (!response.ok) {
    const problem = await readProblemDetails(response);
    throw new ApiError(response.status, response.statusText, {
      title: problem.title,
      fieldErrors: problem.fieldErrors,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function readProblemDetails(response: Response): Promise<{
  title?: string;
  fieldErrors: Record<string, string>;
}> {
  const text = await response.text();
  if (!text) {
    return { fieldErrors: {} };
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { fieldErrors: {} };
  }
  if (!body || typeof body !== "object") {
    return { fieldErrors: {} };
  }
  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title : undefined;
  const fieldErrors = flattenProblemErrors(record.errors);
  return { title, fieldErrors };
}

function flattenProblemErrors(errors: unknown): Record<string, string> {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    if (!Array.isArray(value) || typeof value[0] !== "string" || value[0].length === 0) {
      continue;
    }
    result[key] = value[0];
  }
  return result;
}
