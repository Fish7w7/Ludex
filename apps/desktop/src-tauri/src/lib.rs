mod commands;
mod scanners;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::scan_games_mock,
            commands::scan_steam_games,
            commands::launch_game_stub,
            commands::select_manual_executable,
            commands::validate_executable_path,
            commands::launch_game,
            commands::reveal_game_in_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running Ludex");
}
