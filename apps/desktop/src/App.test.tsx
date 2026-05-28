import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

const tauriMocks = vi.hoisted(() => ({
  launchGame: vi.fn(),
  revealGameInFolder: vi.fn(),
  scanSteamGames: vi.fn(),
  selectManualExecutable: vi.fn(),
  validateExecutablePath: vi.fn()
}));

vi.mock("./lib/tauriCommands", () => ({
  tauriCommands: tauriMocks
}));

const user = {
  id: 1,
  name: "Jogador Ludex",
  email: "demo@ludex.local"
};

const steam = {
  id: 1,
  name: "Steam",
  slug: "steam",
  scanner_key: "steam",
  enabled: true
};

const userGame = {
  id: 10,
  game_id: 20,
  platform_id: 1,
  library_id: 30,
  install_path: "D:\\SteamLibrary\\steamapps\\common\\Hades",
  executable_path: "D:\\SteamLibrary\\steamapps\\common\\Hades\\x64\\Hades.exe",
  launch_command: null,
  is_favorite: false,
  last_played_at: null,
  total_playtime_seconds: 3600,
  source: "steam",
  external_id: "1145360",
  metadata: { library_path: "D:\\SteamLibrary" },
  game: {
    id: 20,
    platform_id: 1,
    external_id: "1145360",
    name: "Hades",
    slug: "hades",
    cover_url: null,
    description: null,
    release_date: null,
    metadata: null
  },
  platform: steam,
  library: {
    id: 30,
    platform_id: 1,
    path: "D:\\SteamLibrary",
    drive_letter: "D:",
    label: "Steam Library",
    source: "steam",
    is_active: true,
    last_scanned_at: null
  }
};

const manualGame = {
  ...userGame,
  id: 11,
  game_id: 21,
  platform_id: 4,
  library_id: 31,
  install_path: "D:\\Games\\Meu Jogo",
  executable_path: "D:\\Games\\Meu Jogo\\game.exe",
  source: "manual",
  external_id: null,
  game: {
    ...userGame.game,
    id: 21,
    platform_id: 4,
    external_id: null,
    name: "Meu Jogo",
    slug: "meu-jogo"
  },
  platform: {
    id: 4,
    name: "Manual",
    slug: "manual",
    scanner_key: "manual",
    enabled: true
  },
  library: {
    ...userGame.library,
    id: 31,
    platform_id: 4,
    path: "D:\\Games\\Meu Jogo",
    drive_letter: "D:",
    label: "Manual Library",
    source: "manual"
  }
};

const steamDetectedGame = {
  name: "Counter-Strike 2",
  platform: "steam" as const,
  source: "steam" as const,
  external_id: "730",
  install_path:
    "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive",
  executable_path: null,
  launch_command: "steam://rungameid/730",
  metadata: {
    appid: "730",
    library_path: "D:\\SteamLibrary",
    manifest_path: "D:\\SteamLibrary\\steamapps\\appmanifest_730.acf",
    installdir: "Counter-Strike Global Offensive",
    launch_command: "steam://rungameid/730"
  }
};

const steamUserGame = {
  ...userGame,
  id: 12,
  game_id: 22,
  install_path: steamDetectedGame.install_path,
  executable_path: "",
  external_id: "730",
  game: {
    ...userGame.game,
    id: 22,
    external_id: "730",
    name: "Counter-Strike 2",
    slug: "counter-strike-2"
  }
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function mockAuthenticatedApi(games = [userGame]) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();

    if (url.endsWith("/me")) {
      return jsonResponse({ user });
    }

    if (url.endsWith("/platforms")) {
      return jsonResponse({ data: [steam] });
    }

    if (url.endsWith("/user-games")) {
      return jsonResponse({ data: games });
    }

    if (url.endsWith("/user-games/10/favorite") && init?.method === "POST") {
      return jsonResponse({ data: { ...userGame, is_favorite: true } });
    }

    if (url.endsWith("/user-games/sync") && init?.method === "POST") {
      const body = JSON.parse(String(init.body ?? "{}"));

      if (body.source === "steam") {
        return jsonResponse({ synced: 1, data: [steamUserGame] });
      }

      return jsonResponse({ synced: 1, data: [manualGame] });
    }

    if (
      url.endsWith("/user-games/10/play-sessions/start") &&
      init?.method === "POST"
    ) {
      return jsonResponse({
        data: {
          id: 50,
          user_game_id: 10,
          started_at: "2026-05-28T00:00:00.000000Z",
          ended_at: null,
          duration_seconds: null
        }
      });
    }

    return jsonResponse({ message: "Not found" }, 404);
  });
}

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.values(tauriMocks).forEach((mock) => mock.mockReset());
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the unauthenticated auth screen", () => {
    render(<App />);

    expect(screen.getByText("Ludex")).toBeInTheDocument();
    expect(screen.getByText("ピコ~")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
  });

  it("renders an authenticated empty library state", async () => {
    window.localStorage.setItem("ludex.authToken", "test-token");
    vi.stubGlobal("fetch", mockAuthenticatedApi([]));

    render(<App />);

    expect(await screen.findByText("Biblioteca vazia")).toBeInTheDocument();
    expect(screen.getByText("Importar jogos mockados")).toBeInTheDocument();
  });

  it("renders games loaded from the API", async () => {
    window.localStorage.setItem("ludex.authToken", "test-token");
    vi.stubGlobal("fetch", mockAuthenticatedApi());

    render(<App />);

    expect(await screen.findAllByText("Hades")).toHaveLength(2);
    expect(screen.getAllByText("Steam").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("D:\\SteamLibrary\\steamapps\\common\\Hades").length
    ).toBeGreaterThan(0);
  });

  it("favorites a user game through the API", async () => {
    const fetchMock = mockAuthenticatedApi();
    window.localStorage.setItem("ludex.authToken", "test-token");
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await screen.findAllByText("Hades");
    await userEvent.click(screen.getAllByLabelText("Adicionar aos favoritos")[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/api/user-games/10/favorite",
        expect.objectContaining({
          method: "POST"
        })
      );
    });
  });

  it("syncs a manually added executable with the API payload", async () => {
    const fetchMock = mockAuthenticatedApi([]);
    tauriMocks.validateExecutablePath.mockResolvedValue({
      executable_path: "D:\\Games\\Meu Jogo\\game.exe",
      install_path: "D:\\Games\\Meu Jogo",
      file_name: "game.exe"
    });
    window.localStorage.setItem("ludex.authToken", "test-token");
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await screen.findByText("Biblioteca vazia");
    await userEvent.click(screen.getAllByText("Adicionar jogo manual")[0]);
    await userEvent.type(screen.getByLabelText("Nome do jogo"), "Meu Jogo");
    await userEvent.type(
      screen.getByLabelText("Caminho do executável"),
      "D:\\Games\\Meu Jogo\\game.exe"
    );
    await userEvent.click(screen.getByText("Adicionar à biblioteca"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/api/user-games/sync",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            source: "manual",
            games: [
              {
                name: "Meu Jogo",
                platform: "manual",
                install_path: "D:\\Games\\Meu Jogo",
                executable_path: "D:\\Games\\Meu Jogo\\game.exe",
                metadata: {
                  added_by: "manual",
                  scanner: "ManualScanner"
                }
              }
            ]
          })
        })
      );
    });
  });

  it("shows an error when trying to play a game without executable path", async () => {
    window.localStorage.setItem("ludex.authToken", "test-token");
    vi.stubGlobal("fetch", mockAuthenticatedApi([{ ...userGame, executable_path: "" }]));

    render(<App />);

    await screen.findAllByText("Hades");
    await userEvent.click(screen.getByText("Jogar"));

    expect(
      await screen.findByText("O jogo selecionado não tem um executável local salvo.")
    ).toBeInTheDocument();
    expect(tauriMocks.launchGame).not.toHaveBeenCalled();
  });

  it("launches a game through Tauri and starts a play session", async () => {
    const fetchMock = mockAuthenticatedApi();
    tauriMocks.launchGame.mockResolvedValue("ok");
    window.localStorage.setItem("ludex.authToken", "test-token");
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await screen.findAllByText("Hades");
    await userEvent.click(screen.getByText("Jogar"));

    await waitFor(() => {
      expect(tauriMocks.launchGame).toHaveBeenCalledWith(
        "D:\\SteamLibrary\\steamapps\\common\\Hades\\x64\\Hades.exe"
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/api/user-games/10/play-sessions/start",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("shows Steam games found before importing", async () => {
    tauriMocks.scanSteamGames.mockResolvedValue({
      steam_path: "C:\\Program Files (x86)\\Steam",
      libraries: [{ path: "D:\\SteamLibrary", manifest_count: 1 }],
      games: [steamDetectedGame]
    });
    window.localStorage.setItem("ludex.authToken", "test-token");
    vi.stubGlobal("fetch", mockAuthenticatedApi([]));

    render(<App />);

    await screen.findByText("Biblioteca vazia");
    await userEvent.click(screen.getByText("Scanner"));
    await userEvent.click(
      screen.getByRole("button", { name: "Escanear Steam" })
    );

    expect(await screen.findByText("Counter-Strike 2")).toBeInTheDocument();
    expect(screen.getByText("AppID 730")).toBeInTheDocument();
    expect(screen.getByText("D:\\SteamLibrary")).toBeInTheDocument();
  });

  it("imports selected Steam games with platform steam", async () => {
    const fetchMock = mockAuthenticatedApi([]);
    tauriMocks.scanSteamGames.mockResolvedValue({
      steam_path: "C:\\Program Files (x86)\\Steam",
      libraries: [{ path: "D:\\SteamLibrary", manifest_count: 1 }],
      games: [steamDetectedGame]
    });
    window.localStorage.setItem("ludex.authToken", "test-token");
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await screen.findByText("Biblioteca vazia");
    await userEvent.click(screen.getByText("Scanner"));
    await userEvent.click(
      screen.getByRole("button", { name: "Escanear Steam" })
    );
    await screen.findByText("Counter-Strike 2");
    await userEvent.click(screen.getByText("Importar selecionados (1)"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/api/user-games/sync",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            source: "steam",
            games: [
              {
                name: "Counter-Strike 2",
                platform: "steam",
                install_path:
                  "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive",
                executable_path: null,
                external_id: "730",
                metadata: steamDetectedGame.metadata
              }
            ]
          })
        })
      );
    });
  });

  it("shows a friendly Steam not found error", async () => {
    tauriMocks.scanSteamGames.mockRejectedValue(
      new Error("Steam não encontrada neste computador.")
    );
    window.localStorage.setItem("ludex.authToken", "test-token");
    vi.stubGlobal("fetch", mockAuthenticatedApi([]));

    render(<App />);

    await screen.findByText("Biblioteca vazia");
    await userEvent.click(screen.getByText("Scanner"));
    await userEvent.click(
      screen.getByRole("button", { name: "Escanear Steam" })
    );

    expect(
      await screen.findByText("Steam não encontrada neste computador.")
    ).toBeInTheDocument();
  });
});
