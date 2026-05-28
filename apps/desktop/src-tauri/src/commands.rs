use crate::scanners::{
    EpicGamesScanner, ManualScanner, MockScanner, ScannerManager, SteamScanner, XboxScanner,
};
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Clone, Serialize)]
pub struct ManualExecutableSelection {
    pub executable_path: String,
    pub install_path: String,
    pub suggested_name: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ExecutableValidation {
    pub executable_path: String,
    pub install_path: String,
    pub file_name: String,
}

#[tauri::command]
pub fn scan_games_mock() -> Vec<crate::scanners::ScannedGame> {
    let manager = ScannerManager::new(vec![
        Box::new(MockScanner),
        Box::new(SteamScanner::new()),
        Box::new(EpicGamesScanner),
        Box::new(XboxScanner),
        Box::new(ManualScanner),
    ]);
    manager.scan_all()
}

#[tauri::command]
pub fn scan_steam_games() -> Result<crate::scanners::SteamScanResult, String> {
    SteamScanner::new().scan_installed_games()
}

#[tauri::command]
pub fn launch_game_stub(executable_path: String) -> Result<String, String> {
    if executable_path.trim().is_empty() {
        return Err("Executable path is required.".to_string());
    }

    Ok("Launch is intentionally stubbed in Phase 1.".to_string())
}

#[tauri::command]
pub fn select_manual_executable() -> Result<Option<ManualExecutableSelection>, String> {
    let Some(path) = rfd::FileDialog::new()
        .add_filter("Windows executable", &["exe"])
        .pick_file()
    else {
        return Ok(None);
    };

    let validation = validate_executable_path_internal(&path)?;

    Ok(Some(ManualExecutableSelection {
        executable_path: validation.executable_path,
        install_path: validation.install_path,
        suggested_name: suggested_game_name(&path),
    }))
}

#[tauri::command]
pub fn validate_executable_path(executable_path: String) -> Result<ExecutableValidation, String> {
    validate_executable_path_internal(Path::new(&executable_path))
}

#[tauri::command]
pub fn launch_game(executable_path: String) -> Result<String, String> {
    let validation = validate_executable_path(executable_path)?;
    let path = PathBuf::from(&validation.executable_path);

    Command::new(&path)
        .current_dir(&validation.install_path)
        .spawn()
        .map_err(|error| format!("Não foi possível abrir o jogo: {error}"))?;

    Ok("Jogo iniciado pelo Ludex.".to_string())
}

#[tauri::command]
pub fn reveal_game_in_folder(path: String) -> Result<String, String> {
    let path = validate_local_path_candidate(&path)?;
    let target = if path.is_file() {
        path.parent()
            .ok_or_else(|| "Não foi possível localizar a pasta do arquivo.".to_string())?
            .to_path_buf()
    } else if path.is_dir() {
        path
    } else {
        return Err("O caminho informado não é um arquivo ou pasta existente.".to_string());
    };

    Command::new("explorer.exe")
        .arg(&target)
        .spawn()
        .map_err(|error| format!("Não foi possível abrir a pasta: {error}"))?;

    Ok("Pasta aberta pelo Ludex.".to_string())
}

fn validate_executable_path_internal(path: &Path) -> Result<ExecutableValidation, String> {
    let path = validate_local_path_candidate(
        path.to_str()
            .ok_or_else(|| "O caminho do executável é inválido.".to_string())?,
    )?;

    if !path.is_file() {
        return Err("O caminho informado não é um arquivo.".to_string());
    }

    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default();

    if !extension.eq_ignore_ascii_case("exe") {
        return Err("Selecione um arquivo .exe válido.".to_string());
    }

    let parent = path
        .parent()
        .ok_or_else(|| "Não foi possível localizar a pasta do executável.".to_string())?;
    let file_name = path
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "O nome do executável é inválido.".to_string())?;

    Ok(ExecutableValidation {
        executable_path: path.display().to_string(),
        install_path: parent.display().to_string(),
        file_name: file_name.to_string(),
    })
}

fn validate_local_path_candidate(path: &str) -> Result<PathBuf, String> {
    let trimmed = path.trim();

    if trimmed.is_empty() {
        return Err("Informe um caminho local válido.".to_string());
    }

    if trimmed.contains("://") {
        return Err("URLs não são permitidas para jogos locais.".to_string());
    }

    if trimmed.starts_with("\\\\") {
        return Err("Caminhos remotos ou de rede não são permitidos nesta fase.".to_string());
    }

    let path = PathBuf::from(trimmed);
    if !path.is_absolute() {
        return Err("Use um caminho local absoluto para o executável.".to_string());
    }

    if !path.exists() {
        return Err("O caminho informado não existe.".to_string());
    }

    Ok(path)
}

fn suggested_game_name(path: &Path) -> String {
    path.file_stem()
        .and_then(|value| value.to_str())
        .map(|value| value.replace(['_', '-'], " "))
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| "Jogo manual".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn rejects_empty_executable_path() {
        let result = validate_local_path_candidate("");

        assert!(result.is_err());
    }

    #[test]
    fn rejects_url_paths() {
        let result = validate_local_path_candidate("https://example.com/game.exe");

        assert!(result.is_err());
    }

    #[test]
    fn rejects_unc_paths() {
        let result = validate_local_path_candidate("\\\\server\\share\\game.exe");

        assert!(result.is_err());
    }

    #[test]
    fn builds_suggested_game_name_from_executable() {
        let name = suggested_game_name(Path::new("D:\\Games\\pixel-shrine.exe"));

        assert_eq!(name, "pixel shrine");
    }

    #[test]
    fn rejects_existing_non_exe_files() {
        let path = std::env::temp_dir().join("ludex-test-file.txt");
        fs::write(&path, "not an executable").expect("create temp file");

        let result = validate_executable_path_internal(&path);

        let _ = fs::remove_file(path);
        assert!(result.is_err());
    }

    #[test]
    fn accepts_existing_exe_files() {
        let path = std::env::temp_dir().join("ludex-test-game.exe");
        fs::write(&path, "stub executable").expect("create temp exe");

        let result = validate_executable_path_internal(&path);

        let _ = fs::remove_file(path);
        assert!(result.is_ok());
    }
}
