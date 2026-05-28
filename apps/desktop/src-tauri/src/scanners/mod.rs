use serde::Serialize;
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize)]
pub struct ScannedGame {
    pub external_id: Option<String>,
    pub title: String,
    pub source: ScannerSource,
    pub install_path: String,
    pub executable_path: Option<String>,
    pub detected_at: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct DetectedGame {
    pub name: String,
    pub platform: String,
    pub source: String,
    pub external_id: Option<String>,
    pub install_path: String,
    pub executable_path: Option<String>,
    pub launch_command: Option<String>,
    pub metadata: BTreeMap<String, String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SteamLibrary {
    pub path: String,
    pub manifest_count: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct SteamScanResult {
    pub steam_path: String,
    pub libraries: Vec<SteamLibrary>,
    pub games: Vec<DetectedGame>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SteamManifest {
    pub appid: String,
    pub name: String,
    pub installdir: String,
    pub state_flags: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ScannerSource {
    Steam,
    Epic,
    Xbox,
    Manual,
    Mock,
}

pub trait GameScanner {
    fn source(&self) -> ScannerSource;
    fn scan(&self) -> Vec<ScannedGame>;
}

pub struct ScannerManager {
    scanners: Vec<Box<dyn GameScanner>>,
}

impl ScannerManager {
    pub fn new(scanners: Vec<Box<dyn GameScanner>>) -> Self {
        Self { scanners }
    }

    pub fn scan_all(&self) -> Vec<ScannedGame> {
        self.scanners
            .iter()
            .flat_map(|scanner| scanner.scan())
            .collect()
    }
}

pub struct MockScanner;
pub struct SteamScanner {
    candidates: Vec<PathBuf>,
}
pub struct EpicGamesScanner;
pub struct XboxScanner;
pub struct ManualScanner;

impl SteamScanner {
    pub fn new() -> Self {
        Self {
            candidates: default_steam_candidates(),
        }
    }

    #[cfg(test)]
    pub fn with_candidates(candidates: Vec<PathBuf>) -> Self {
        Self { candidates }
    }

    pub fn scan_installed_games(&self) -> Result<SteamScanResult, String> {
        let steam_path = self
            .candidates
            .iter()
            .find(|path| path.join("steamapps").exists())
            .cloned()
            .ok_or_else(|| "Steam não encontrada neste computador.".to_string())?;

        scan_steam_root(&steam_path)
    }
}

impl Default for SteamScanner {
    fn default() -> Self {
        Self::new()
    }
}

impl GameScanner for MockScanner {
    fn source(&self) -> ScannerSource {
        ScannerSource::Mock
    }

    fn scan(&self) -> Vec<ScannedGame> {
        vec![ScannedGame {
            external_id: Some("mock-neon-runner".to_string()),
            title: "Neon Runner".to_string(),
            source: self.source(),
            install_path: "D:\\Games\\SteamLibrary\\steamapps\\common\\Neon Runner".to_string(),
            executable_path: None,
            detected_at: "2026-05-27T00:00:00Z".to_string(),
        }]
    }
}

impl GameScanner for SteamScanner {
    fn source(&self) -> ScannerSource {
        ScannerSource::Steam
    }

    fn scan(&self) -> Vec<ScannedGame> {
        self.scan_installed_games()
            .map(|result| {
                result
                    .games
                    .into_iter()
                    .map(|game| ScannedGame {
                        external_id: game.external_id,
                        title: game.name,
                        source: ScannerSource::Steam,
                        install_path: game.install_path,
                        executable_path: game.executable_path,
                        detected_at: "2026-05-28T00:00:00Z".to_string(),
                    })
                    .collect()
            })
            .unwrap_or_default()
    }
}

impl GameScanner for EpicGamesScanner {
    fn source(&self) -> ScannerSource {
        ScannerSource::Epic
    }

    fn scan(&self) -> Vec<ScannedGame> {
        Vec::new()
    }
}

impl GameScanner for XboxScanner {
    fn source(&self) -> ScannerSource {
        ScannerSource::Xbox
    }

    fn scan(&self) -> Vec<ScannedGame> {
        Vec::new()
    }
}

impl GameScanner for ManualScanner {
    fn source(&self) -> ScannerSource {
        ScannerSource::Manual
    }

    fn scan(&self) -> Vec<ScannedGame> {
        Vec::new()
    }
}

fn scan_steam_root(steam_path: &Path) -> Result<SteamScanResult, String> {
    let library_file = steam_path.join("steamapps").join("libraryfolders.vdf");
    let content = fs::read_to_string(&library_file)
        .map_err(|_| "libraryfolders.vdf não encontrado ou ilegível.".to_string())?;
    let parsed_paths = parse_libraryfolders_vdf(&content)?;

    let mut library_paths = Vec::from([steam_path.to_path_buf()]);
    for library_path in parsed_paths {
        if !library_paths.iter().any(|existing| existing == &library_path) {
            library_paths.push(library_path);
        }
    }

    let mut libraries = Vec::new();
    let mut games = Vec::new();

    for library_path in library_paths {
        if !library_path.exists() {
            continue;
        }

        let steamapps = library_path.join("steamapps");
        if !steamapps.is_dir() {
            continue;
        }

        let manifest_paths = collect_manifest_paths(&steamapps)?;
        let mut manifest_count = 0;

        for manifest_path in manifest_paths {
            let manifest_content = fs::read_to_string(&manifest_path)
                .map_err(|_| format!("Não foi possível ler {}", manifest_path.display()))?;
            let manifest = parse_appmanifest_acf(&manifest_content)?;
            manifest_count += 1;
            games.push(normalize_steam_game(
                &library_path,
                &manifest_path,
                &manifest,
            ));
        }

        libraries.push(SteamLibrary {
            path: library_path.display().to_string(),
            manifest_count,
        });
    }

    if libraries.is_empty() {
        return Err("Nenhuma biblioteca Steam válida foi encontrada.".to_string());
    }

    if games.is_empty() {
        return Err("Nenhum jogo instalado da Steam foi encontrado.".to_string());
    }

    Ok(SteamScanResult {
        steam_path: steam_path.display().to_string(),
        libraries,
        games,
    })
}

fn collect_manifest_paths(steamapps_path: &Path) -> Result<Vec<PathBuf>, String> {
    let entries = fs::read_dir(steamapps_path)
        .map_err(|_| format!("Não foi possível ler {}", steamapps_path.display()))?;
    let mut manifests = entries
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| {
            path.file_name()
                .and_then(|value| value.to_str())
                .map(|name| name.starts_with("appmanifest_") && name.ends_with(".acf"))
                .unwrap_or(false)
        })
        .collect::<Vec<_>>();
    manifests.sort();
    Ok(manifests)
}

fn normalize_steam_game(
    library_path: &Path,
    manifest_path: &Path,
    manifest: &SteamManifest,
) -> DetectedGame {
    let install_path = library_path
        .join("steamapps")
        .join("common")
        .join(&manifest.installdir);
    let launch_command = format!("steam://rungameid/{}", manifest.appid);
    let mut metadata = BTreeMap::new();
    metadata.insert("appid".to_string(), manifest.appid.clone());
    metadata.insert(
        "library_path".to_string(),
        library_path.display().to_string(),
    );
    metadata.insert(
        "manifest_path".to_string(),
        manifest_path.display().to_string(),
    );
    metadata.insert("installdir".to_string(), manifest.installdir.clone());
    metadata.insert("launch_command".to_string(), launch_command.clone());

    if let Some(state_flags) = &manifest.state_flags {
        metadata.insert("state_flags".to_string(), state_flags.clone());
    }

    DetectedGame {
        name: manifest.name.clone(),
        platform: "steam".to_string(),
        source: "steam".to_string(),
        external_id: Some(manifest.appid.clone()),
        install_path: install_path.display().to_string(),
        executable_path: None,
        launch_command: Some(launch_command),
        metadata,
    }
}

pub fn parse_libraryfolders_vdf(content: &str) -> Result<Vec<PathBuf>, String> {
    let tokens = tokenize_vdf(content)?;
    let mut paths = Vec::new();

    for index in 0..tokens.len() {
        if tokens[index] == "path" {
            if let Some(value) = tokens.get(index + 1) {
                push_unique_path(&mut paths, value);
            }
        }

        let is_old_style_numeric_key = tokens[index].chars().all(|ch| ch.is_ascii_digit());
        if is_old_style_numeric_key {
            if let Some(value) = tokens.get(index + 1) {
                if looks_like_windows_path(value) {
                    push_unique_path(&mut paths, value);
                }
            }
        }
    }

    if paths.is_empty() {
        return Err("Nenhuma biblioteca Steam foi encontrada no libraryfolders.vdf.".to_string());
    }

    Ok(paths)
}

pub fn parse_appmanifest_acf(content: &str) -> Result<SteamManifest, String> {
    let pairs = parse_flat_vdf_pairs(content)?;
    let appid = required_pair(&pairs, "appid")?;
    let name = required_pair(&pairs, "name")?;
    let installdir = required_pair(&pairs, "installdir")?;

    Ok(SteamManifest {
        appid,
        name,
        installdir,
        state_flags: pairs.get("StateFlags").cloned(),
    })
}

fn parse_flat_vdf_pairs(content: &str) -> Result<BTreeMap<String, String>, String> {
    let tokens = tokenize_vdf(content)?;
    let mut pairs = BTreeMap::new();
    let mut index = 0;

    while index + 1 < tokens.len() {
        let key = &tokens[index];
        let value = &tokens[index + 1];
        if key != "{" && key != "}" && value != "{" && value != "}" {
            pairs.insert(key.clone(), value.clone());
            index += 2;
        } else {
            index += 1;
        }
    }

    Ok(pairs)
}

fn tokenize_vdf(content: &str) -> Result<Vec<String>, String> {
    let mut tokens = Vec::new();
    let mut chars = content.chars().peekable();

    while let Some(ch) = chars.next() {
        match ch {
            '"' => {
                let mut token = String::new();
                let mut closed = false;

                while let Some(next_ch) = chars.next() {
                    if next_ch == '\\' {
                        if let Some(escaped_ch) = chars.next() {
                            if escaped_ch == '"' || escaped_ch == '\\' {
                                token.push(escaped_ch);
                            } else {
                                token.push('\\');
                                token.push(escaped_ch);
                            }
                        } else {
                            token.push('\\');
                        }
                        continue;
                    }

                    if next_ch == '"' {
                        closed = true;
                        break;
                    }

                    token.push(next_ch);
                }

                if !closed {
                    return Err("VDF inválido: string sem fechamento.".to_string());
                }

                tokens.push(token);
            }
            '{' | '}' => tokens.push(ch.to_string()),
            '/' if chars.peek() == Some(&'/') => {
                for comment_ch in chars.by_ref() {
                    if comment_ch == '\n' {
                        break;
                    }
                }
            }
            ch if ch.is_whitespace() => {}
            _ => {}
        }
    }

    Ok(tokens)
}

fn required_pair(pairs: &BTreeMap<String, String>, key: &str) -> Result<String, String> {
    pairs
        .get(key)
        .filter(|value| !value.trim().is_empty())
        .cloned()
        .ok_or_else(|| format!("Manifest Steam inválido: campo {key} ausente."))
}

fn push_unique_path(paths: &mut Vec<PathBuf>, value: &str) {
    let path = PathBuf::from(value);

    if !paths.iter().any(|existing| existing == &path) {
        paths.push(path);
    }
}

fn looks_like_windows_path(value: &str) -> bool {
    value.len() > 2 && value.as_bytes().get(1) == Some(&b':')
}

fn default_steam_candidates() -> Vec<PathBuf> {
    let mut candidates = Vec::new();

    #[cfg(windows)]
    {
        candidates.extend(steam_paths_from_registry());
    }

    for env_key in ["ProgramFiles(x86)", "ProgramFiles"] {
        if let Some(path) = std::env::var_os(env_key) {
            candidates.push(PathBuf::from(path).join("Steam"));
        }
    }

    candidates.push(PathBuf::from("C:\\Program Files (x86)\\Steam"));
    candidates.push(PathBuf::from("C:\\Program Files\\Steam"));
    dedupe_paths(candidates)
}

fn dedupe_paths(paths: Vec<PathBuf>) -> Vec<PathBuf> {
    paths.into_iter().fold(Vec::new(), |mut acc, path| {
        if !acc.iter().any(|existing| existing == &path) {
            acc.push(path);
        }
        acc
    })
}

#[cfg(windows)]
fn steam_paths_from_registry() -> Vec<PathBuf> {
    use winreg::enums::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};
    use winreg::RegKey;

    let mut paths = Vec::new();
    let probes = [
        (HKEY_CURRENT_USER, "Software\\Valve\\Steam"),
        (HKEY_LOCAL_MACHINE, "Software\\WOW6432Node\\Valve\\Steam"),
        (HKEY_LOCAL_MACHINE, "Software\\Valve\\Steam"),
    ];

    for (hive, key_path) in probes {
        let root = RegKey::predef(hive);
        let Ok(key) = root.open_subkey(key_path) else {
            continue;
        };

        for value_name in ["SteamPath", "InstallPath"] {
            if let Ok(value) = key.get_value::<String, _>(value_name) {
                paths.push(PathBuf::from(value.replace('/', "\\")));
            }
        }
    }

    paths
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn temp_path(name: &str) -> PathBuf {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time")
            .as_nanos();
        std::env::temp_dir().join(format!("ludex-{name}-{suffix}"))
    }

    #[test]
    fn parses_libraryfolders_with_multiple_libraries() {
        let content = r#"
        "libraryfolders"
        {
            "0"
            {
                "path" "C:\\Program Files (x86)\\Steam"
            }
            "1"
            {
                "path" "D:\\SteamLibrary"
            }
            "2" "E:\\Games\\SteamLibrary"
        }
        "#;

        let paths = parse_libraryfolders_vdf(content).expect("parse libraries");

        assert_eq!(paths.len(), 3);
        assert!(paths.contains(&PathBuf::from("D:\\SteamLibrary")));
        assert!(paths.contains(&PathBuf::from("E:\\Games\\SteamLibrary")));
    }

    #[test]
    fn parses_appmanifest_acf() {
        let content = r#"
        "AppState"
        {
            "appid" "730"
            "name" "Counter-Strike 2"
            "installdir" "Counter-Strike Global Offensive"
            "StateFlags" "4"
        }
        "#;

        let manifest = parse_appmanifest_acf(content).expect("parse manifest");

        assert_eq!(manifest.appid, "730");
        assert_eq!(manifest.name, "Counter-Strike 2");
        assert_eq!(manifest.installdir, "Counter-Strike Global Offensive");
        assert_eq!(manifest.state_flags.as_deref(), Some("4"));
    }

    #[test]
    fn normalizes_detected_steam_game() {
        let manifest = SteamManifest {
            appid: "730".to_string(),
            name: "Counter-Strike 2".to_string(),
            installdir: "Counter-Strike Global Offensive".to_string(),
            state_flags: Some("4".to_string()),
        };
        let game = normalize_steam_game(
            Path::new("D:\\SteamLibrary"),
            Path::new("D:\\SteamLibrary\\steamapps\\appmanifest_730.acf"),
            &manifest,
        );

        assert_eq!(game.platform, "steam");
        assert_eq!(game.external_id.as_deref(), Some("730"));
        assert_eq!(
            game.install_path,
            "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive"
        );
        assert_eq!(
            game.metadata.get("launch_command").map(String::as_str),
            Some("steam://rungameid/730")
        );
    }

    #[test]
    fn scan_ignores_missing_library_paths() {
        let steam_root = temp_path("steam-root");
        let library_root = temp_path("steam-library");
        let missing_root = temp_path("missing-library");

        fs::create_dir_all(steam_root.join("steamapps")).expect("steamapps");
        fs::create_dir_all(library_root.join("steamapps").join("common").join("Hades"))
            .expect("library common");
        fs::write(
            steam_root.join("steamapps").join("libraryfolders.vdf"),
            format!(
                r#""libraryfolders" {{
                    "0" {{ "path" "{}" }}
                    "1" {{ "path" "{}" }}
                }}"#,
                steam_root.display(),
                missing_root.display()
            ),
        )
        .expect("libraryfolders");
        fs::write(
            library_root.join("steamapps").join("appmanifest_1145360.acf"),
            r#""AppState" {
                "appid" "1145360"
                "name" "Hades"
                "installdir" "Hades"
            }"#,
        )
        .expect("manifest");
        fs::write(
            steam_root.join("steamapps").join("libraryfolders.vdf"),
            format!(
                r#""libraryfolders" {{
                    "0" {{ "path" "{}" }}
                    "1" {{ "path" "{}" }}
                }}"#,
                library_root.display(),
                missing_root.display()
            ),
        )
        .expect("libraryfolders");

        let scanner = SteamScanner::with_candidates(vec![steam_root.clone()]);
        let result = scanner.scan_installed_games().expect("scan steam");

        assert_eq!(result.games.len(), 1);
        assert_eq!(result.games[0].name, "Hades");

        let _ = fs::remove_dir_all(steam_root);
        let _ = fs::remove_dir_all(library_root);
    }

    #[test]
    fn returns_friendly_error_when_steam_is_missing() {
        let scanner = SteamScanner::with_candidates(vec![temp_path("missing-steam")]);

        let error = scanner.scan_installed_games().expect_err("missing steam");

        assert_eq!(error, "Steam não encontrada neste computador.");
    }
}
