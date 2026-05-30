import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "node:path";
import {
  selectManualExecutable,
  validateExecutablePath
} from "./scanners/manual/manualScanner.js";
import { ipcChannels, requireStringArgument } from "./ipc.js";
import { launchGame, revealGameInFolder } from "./services/launcher.js";
import { EpicScanner } from "./scanners/epic/epicScanner.js";
import { SteamScanner } from "./scanners/steam/steamScanner.js";

const isDev = Boolean(process.env.ELECTRON_RENDERER_URL);

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1040,
    minHeight: 680,
    title: "Ludex",
    backgroundColor: "#080912",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle(ipcChannels.selectManualExecutable, () => selectManualExecutable());
  ipcMain.handle(ipcChannels.validateExecutablePath, (_event, executablePath: unknown) =>
    validateExecutablePath(requireStringArgument(executablePath, "executable_path"))
  );
  ipcMain.handle(ipcChannels.launchGame, (_event, executablePath: unknown) =>
    launchGame(requireStringArgument(executablePath, "executable_path"))
  );
  ipcMain.handle(ipcChannels.revealGameInFolder, (_event, candidate: unknown) =>
    revealGameInFolder(requireStringArgument(candidate, "path"))
  );
  ipcMain.handle(ipcChannels.scanSteamGames, () => new SteamScanner().scanInstalledGames());
  ipcMain.handle(ipcChannels.scanEpicGames, () => new EpicScanner().scanInstalledGames());
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
