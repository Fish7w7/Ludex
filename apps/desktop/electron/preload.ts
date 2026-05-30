import { contextBridge, ipcRenderer } from "electron";
import type {
  EpicScanResult,
  ExecutableValidation,
  ManualExecutableSelection,
  SteamScanResult
} from "./types.js";
import { ipcChannels } from "./ipc.js";

const desktopApi = {
  selectManualExecutable: (): Promise<ManualExecutableSelection | null> =>
    ipcRenderer.invoke(ipcChannels.selectManualExecutable),

  validateExecutablePath: (executablePath: string): Promise<ExecutableValidation> =>
    ipcRenderer.invoke(ipcChannels.validateExecutablePath, executablePath),

  launchGame: (executablePath: string): Promise<string> =>
    ipcRenderer.invoke(ipcChannels.launchGame, executablePath),

  revealGameInFolder: (path: string): Promise<string> =>
    ipcRenderer.invoke(ipcChannels.revealGameInFolder, path),

  scanSteamGames: (): Promise<SteamScanResult> =>
    ipcRenderer.invoke(ipcChannels.scanSteamGames),

  scanEpicGames: (): Promise<EpicScanResult> =>
    ipcRenderer.invoke(ipcChannels.scanEpicGames)
};

contextBridge.exposeInMainWorld("ludexDesktop", desktopApi);

export type LudexDesktopApi = typeof desktopApi;
