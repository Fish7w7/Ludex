use crate::scanners::{
    EpicGamesScanner, ManualScanner, MockScanner, ScannerManager, SteamScanner, XboxScanner,
};

#[tauri::command]
pub fn scan_games_mock() -> Vec<crate::scanners::ScannedGame> {
    let manager = ScannerManager::new(vec![
        Box::new(MockScanner),
        Box::new(SteamScanner),
        Box::new(EpicGamesScanner),
        Box::new(XboxScanner),
        Box::new(ManualScanner),
    ]);
    manager.scan_all()
}

#[tauri::command]
pub fn launch_game_stub(executable_path: String) -> Result<String, String> {
    if executable_path.trim().is_empty() {
        return Err("Executable path is required.".to_string());
    }

    Ok("Launch is intentionally stubbed in Phase 1.".to_string())
}
