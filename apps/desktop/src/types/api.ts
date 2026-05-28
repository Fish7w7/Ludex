export type ApiEnvelope<T> = {
  data: T;
};

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
};

export type AuthResponse = {
  user: ApiUser;
  token: string;
};

export type Platform = {
  id: number;
  name: string;
  slug: string;
  scanner_key: string;
  enabled: boolean;
};

export type Game = {
  id: number;
  platform_id: number | null;
  external_id: string | null;
  name: string;
  slug: string;
  cover_url: string | null;
  description: string | null;
  release_date: string | null;
  metadata: Record<string, unknown> | null;
};

export type GameLibrary = {
  id: number;
  platform_id: number;
  path: string;
  drive_letter: string | null;
  label: string | null;
  source: string;
  is_active: boolean;
  last_scanned_at: string | null;
};

export type UserGame = {
  id: number;
  game_id: number;
  platform_id: number;
  library_id: number | null;
  install_path: string;
  executable_path: string;
  launch_command: string | null;
  is_favorite: boolean;
  last_played_at: string | null;
  total_playtime_seconds: number;
  source: string;
  external_id: string | null;
  metadata: Record<string, unknown> | null;
  game?: Game;
  platform?: Platform;
  library?: GameLibrary | null;
};

export type PlaySession = {
  id: number;
  user_game_id: number;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
};

export type SyncDetectedGame = {
  name: string;
  platform: string;
  install_path: string;
  executable_path?: string | null;
  external_id?: string;
  metadata?: Record<string, unknown>;
};

export type SyncUserGamesResponse = {
  synced: number;
  data: UserGame[];
};
