import type { Platform, UserGame } from "../types/api";

export const isDesignPreviewEnabled =
  import.meta.env.VITE_DESIGN_PREVIEW === "true";

export const designPreviewPlatforms: Platform[] = [
  {
    id: -1,
    name: "Steam",
    slug: "steam",
    scanner_key: "steam",
    enabled: true
  },
  {
    id: -2,
    name: "Epic",
    slug: "epic",
    scanner_key: "epic",
    enabled: true
  },
  {
    id: -3,
    name: "Manual",
    slug: "manual",
    scanner_key: "manual",
    enabled: true
  }
];

const [steam, epic, manual] = designPreviewPlatforms;

export const designPreviewGames: UserGame[] = [
  previewGame(-101, "Counter-Strike 2", steam, "steam", "730", 461_520, true),
  previewGame(-102, "Hades", steam, "steam", "1145360", 260_100, true),
  previewGame(-103, "Fortnite", epic, "epic", "fortnite", 556_380, false),
  previewGame(-104, "Epic Seven", manual, "manual", null, 101_160, false),
  previewGame(-105, "Need for Speed Heat", steam, "steam", "1222680", 130_800, false),
  previewGame(-106, "Hollow Knight", steam, "steam", "367520", 149_100, false),
  previewGame(-107, "Genshin Impact", epic, "epic", "genshin-impact", 757_500, true),
  previewGame(-108, "Sekiro", steam, "steam", "814380", 236_640, false)
];

export function isDesignPreviewGame(userGame: UserGame): boolean {
  return userGame.metadata?.design_preview === true || userGame.id < 0;
}

function previewGame(
  id: number,
  name: string,
  platform: Platform,
  source: string,
  externalId: string | null,
  totalPlaytimeSeconds: number,
  isFavorite: boolean
): UserGame {
  const installRoot = source === "manual" ? "D:\\Games" : `D:\\${platform.name}Library`;
  const folder = name.replace(/[^\w\s-]/g, "").replace(/\s+/g, " ");

  return {
    id,
    game_id: id - 1000,
    platform_id: platform.id,
    library_id: id - 2000,
    install_path: `${installRoot}\\${folder}`,
    executable_path: `${installRoot}\\${folder}\\${folder.replace(/\s+/g, "")}.exe`,
    launch_command: source === "steam" && externalId ? `steam://rungameid/${externalId}` : null,
    is_favorite: isFavorite,
    last_played_at: "2026-05-29T18:22:00.000000Z",
    total_playtime_seconds: totalPlaytimeSeconds,
    source,
    external_id: externalId,
    metadata: {
      design_preview: true,
      note: "Visual-only mock used when VITE_DESIGN_PREVIEW=true"
    },
    game: {
      id: id - 1000,
      platform_id: platform.id,
      external_id: externalId,
      name,
      slug: name.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, ""),
      cover_url: null,
      description: "Design preview game",
      release_date: null,
      metadata: {
        design_preview: true
      }
    },
    platform,
    library: {
      id: id - 2000,
      platform_id: platform.id,
      path: installRoot,
      drive_letter: "D:",
      label: `${platform.name} Preview Library`,
      source,
      is_active: true,
      last_scanned_at: null
    }
  };
}
