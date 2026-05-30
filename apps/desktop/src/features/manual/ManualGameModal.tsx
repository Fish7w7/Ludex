import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { FilePlus, FolderOpen, X } from "lucide-react";
import { NoticeBanner, PrimaryButton, SecondaryButton } from "../../components/ui";
import { desktopCommands } from "../../lib/desktopCommands";
import { deriveGameName, isWindowsExecutablePath } from "./manualGame";

export function ManualGameModal({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (draft: {
    name: string;
    executablePath: string;
    libraryPath?: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [executablePath, setExecutablePath] = useState("");
  const [libraryPath, setLibraryPath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  async function selectExecutable() {
    setError(null);
    setIsSelecting(true);

    try {
      const selected = await desktopCommands.selectManualExecutable();
      if (!selected) {
        return;
      }

      setExecutablePath(selected.executable_path);
      setLibraryPath((currentPath) => currentPath || selected.install_path);
      setName((currentName) => currentName || selected.suggested_name);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível selecionar o executável."
      );
    } finally {
      setIsSelecting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Informe o nome do jogo.");
      return;
    }

    if (!executablePath.trim()) {
      setError("Selecione ou informe um executável .exe.");
      return;
    }

    if (!isWindowsExecutablePath(executablePath)) {
      setError("Selecione um arquivo .exe válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        executablePath,
        libraryPath: libraryPath || undefined
      });
      setName("");
      setExecutablePath("");
      setLibraryPath("");
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível adicionar o jogo manual."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-ludex-panel p-6 shadow-neon">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ludex-cyan">ManualScanner</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">
              Adicionar jogo manual
            </h3>
          </div>
          <button
            aria-label="Fechar"
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.07] text-ludex-muted transition hover:text-white focus:outline-none focus:ring-2 focus:ring-ludex-cyan/60"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Field label="Nome do jogo">
            <input
              className="input-surface"
              onChange={(event) => setName(event.target.value)}
              placeholder="Meu Jogo"
              value={name}
            />
          </Field>

          <Field label="Caminho do executável">
            <div className="flex gap-2">
              <input
                className="input-surface min-w-0 flex-1"
                onBlur={() => {
                  if (!name.trim() && executablePath.trim()) {
                    setName(deriveGameName(executablePath));
                  }
                }}
                onChange={(event) => setExecutablePath(event.target.value)}
                placeholder="D:\\Games\\Meu Jogo\\game.exe"
                value={executablePath}
              />
              <SecondaryButton
                className="shrink-0"
                disabled={isSelecting}
                onClick={selectExecutable}
              >
                <FolderOpen size={16} />
                {isSelecting ? "Selecionando..." : "Selecionar .exe"}
              </SecondaryButton>
            </div>
          </Field>

          <Field label="Pasta/biblioteca opcional">
            <input
              className="input-surface"
              onChange={(event) => setLibraryPath(event.target.value)}
              placeholder="D:\\Games\\Meu Jogo"
              value={libraryPath}
            />
          </Field>

          <NoticeBanner>
            Plataforma: Manual. O Ludex só enviará este executável após sua confirmação.
          </NoticeBanner>

          {error ? <NoticeBanner tone="error">{error}</NoticeBanner> : null}

          <div className="flex justify-end gap-3 pt-2">
            <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
            <PrimaryButton disabled={isSubmitting} type="submit">
              <FilePlus size={16} />
              {isSubmitting ? "Adicionando..." : "Adicionar à biblioteca"}
            </PrimaryButton>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  children,
  label
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-ludex-muted">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
