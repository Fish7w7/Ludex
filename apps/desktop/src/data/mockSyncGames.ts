import type { SyncDetectedGame } from "../types/api";

export const mockSyncGames: SyncDetectedGame[] = [
  {
    name: "Counter-Strike 2",
    platform: "steam",
    install_path:
      "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive",
    executable_path:
      "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive\\game\\bin\\win64\\cs2.exe",
    external_id: "730",
    metadata: {
      library_path: "D:\\SteamLibrary",
      phase: "phase_3_mock"
    }
  },
  {
    name: "Hades",
    platform: "steam",
    install_path: "E:\\SteamLibrary\\steamapps\\common\\Hades",
    executable_path: "E:\\SteamLibrary\\steamapps\\common\\Hades\\x64\\Hades.exe",
    external_id: "1145360",
    metadata: {
      library_path: "E:\\SteamLibrary",
      phase: "phase_3_mock"
    }
  },
  {
    name: "Epic Seven",
    platform: "manual",
    install_path: "G:\\Games\\EpicSeven",
    executable_path: "G:\\Games\\EpicSeven\\EpicSeven.exe",
    metadata: {
      library_path: "G:\\Games",
      phase: "phase_3_mock"
    }
  }
];

