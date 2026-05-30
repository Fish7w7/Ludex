import { BrandMark } from "../../components/ui";

export function LoadingSplash() {
  return (
    <main className="grid min-h-screen place-items-center bg-ludex-ink text-ludex-text">
      <div className="text-center">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <p className="mt-5 text-sm text-ludex-muted">Carregando sessão...</p>
      </div>
    </main>
  );
}
