import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, ApiError } from "./apiClient";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

describe("apiRequest", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the stored bearer token", async () => {
    window.localStorage.setItem("ludex.authToken", "abc123");
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        jsonResponse({ ok: true })
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest<{ ok: boolean }>("/me");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/me",
      expect.objectContaining({
        headers: expect.any(Headers)
      })
    );
    const [, requestOptions] = fetchMock.mock.calls[0];
    const headers = requestOptions?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer abc123");
  });

  it("normalizes unavailable API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      })
    );

    await expect(apiRequest("/me")).rejects.toMatchObject({
      message: "Não foi possível conectar à API do Ludex.",
      status: 0
    });
  });

  it("shows a friendly platform validation error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          {
            message: "The selected games.0.platform is invalid.",
            errors: {
              "games.0.platform": ["The selected games.0.platform is invalid."]
            }
          },
          422
        )
      )
    );

    await expect(apiRequest("/user-games/sync", { method: "POST" })).rejects.toMatchObject({
      message:
        "Não foi possível importar os jogos. Verifique se as plataformas estão cadastradas no backend.",
      status: 422
    });
  });

  it("normalizes expired session errors", async () => {
    window.localStorage.setItem("ludex.authToken", "expired-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ message: "Unauthenticated." }, 401))
    );

    await expect(apiRequest("/me")).rejects.toMatchObject({
      message: "Sua sessão expirou. Faça login novamente.",
      status: 401
    });
    expect(window.localStorage.getItem("ludex.authToken")).toBeNull();
  });
});
