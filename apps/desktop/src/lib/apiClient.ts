import { clearAuthToken, getAuthToken } from "./tokenStore";

const DEFAULT_API_URL = "http://127.0.0.1:8000/api";

export const apiBaseUrl =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  DEFAULT_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuth?: boolean;
};

function normalizeErrorMessage(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    return "Não foi possível processar a resposta da API.";
  }

  const maybeErrors = "errors" in payload ? payload.errors : undefined;
  if (typeof maybeErrors === "object" && maybeErrors !== null) {
    const messages = Object.entries(maybeErrors)
      .flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${field}: ${String(message)}`);
        }

        return [`${field}: ${String(value)}`];
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  const maybeMessage = "message" in payload ? payload.message : undefined;
  if (typeof maybeMessage === "string") {
    return maybeMessage;
  }

  return "Não foi possível processar a solicitação.";
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const token = getAuthToken();
  if (token && !options.skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      body,
      headers
    });
  } catch {
    throw new ApiError("Não foi possível conectar à API do Ludex.", 0);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : undefined;

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }

    throw new ApiError(normalizeErrorMessage(payload), response.status, payload);
  }

  return payload as T;
}
