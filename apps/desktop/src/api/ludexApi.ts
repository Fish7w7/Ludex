import { apiRequest } from "../lib/apiClient";
import type {
  ApiEnvelope,
  ApiUser,
  AuthResponse,
  Platform,
  PlaySession,
  SyncDetectedGame,
  SyncUserGamesResponse,
  UserGame
} from "../types/api";

type MaybeNestedData<T> = T[] | { data?: T[] };

function listFromResponse<T>(response: ApiEnvelope<MaybeNestedData<T>>): T[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return Array.isArray(response.data.data) ? response.data.data : [];
}

function unwrapResource<T>(value: T | ApiEnvelope<T>): T {
  if (typeof value === "object" && value !== null && "data" in value) {
    return value.data;
  }

  return value;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
};

export const ludexApi = {
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: payload,
      skipAuth: true
    });
  },

  login(payload: LoginPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
      skipAuth: true
    });
  },

  logout(): Promise<{ status: string }> {
    return apiRequest<{ status: string }>("/auth/logout", { method: "POST" });
  },

  async me(): Promise<ApiUser> {
    const response = await apiRequest<{ user: ApiUser }>("/me");
    return response.user;
  },

  async platforms(): Promise<Platform[]> {
    const response = await apiRequest<ApiEnvelope<MaybeNestedData<Platform>>>(
      "/platforms"
    );
    return listFromResponse(response);
  },

  async userGames(): Promise<UserGame[]> {
    const response = await apiRequest<ApiEnvelope<MaybeNestedData<UserGame>>>(
      "/user-games"
    );
    return listFromResponse(response);
  },

  async userGame(id: number): Promise<UserGame> {
    const response = await apiRequest<ApiEnvelope<UserGame>>(`/user-games/${id}`);
    return response.data;
  },

  syncDetectedGames(games: SyncDetectedGame[]): Promise<SyncUserGamesResponse> {
    return apiRequest<SyncUserGamesResponse>("/user-games/sync", {
      method: "POST",
      body: {
        source: "mock",
        games
      }
    });
  },

  syncManualGame(game: SyncDetectedGame): Promise<SyncUserGamesResponse> {
    return apiRequest<SyncUserGamesResponse>("/user-games/sync", {
      method: "POST",
      body: {
        source: "manual",
        games: [game]
      }
    });
  },

  syncSteamGames(games: SyncDetectedGame[]): Promise<SyncUserGamesResponse> {
    return apiRequest<SyncUserGamesResponse>("/user-games/sync", {
      method: "POST",
      body: {
        source: "steam",
        games
      }
    });
  },

  async favoriteUserGame(id: number): Promise<UserGame> {
    const response = await apiRequest<ApiEnvelope<UserGame>>(
      `/user-games/${id}/favorite`,
      { method: "POST" }
    );
    return response.data;
  },

  async unfavoriteUserGame(id: number): Promise<UserGame> {
    const response = await apiRequest<ApiEnvelope<UserGame>>(
      `/user-games/${id}/favorite`,
      { method: "DELETE" }
    );
    return response.data;
  },

  async startPlaySession(id: number): Promise<PlaySession> {
    const response = await apiRequest<ApiEnvelope<PlaySession>>(
      `/user-games/${id}/play-sessions/start`,
      { method: "POST" }
    );
    return response.data;
  },

  async finishPlaySession(
    id: number,
    playSessionId?: number
  ): Promise<{ session: PlaySession; userGame: UserGame }> {
    const response = await apiRequest<{
      data: PlaySession;
      user_game: UserGame | ApiEnvelope<UserGame>;
    }>(`/user-games/${id}/play-sessions/finish`, {
      method: "POST",
      body: playSessionId ? { play_session_id: playSessionId } : {}
    });

    return {
      session: response.data,
      userGame: unwrapResource(response.user_game)
    };
  }
};
