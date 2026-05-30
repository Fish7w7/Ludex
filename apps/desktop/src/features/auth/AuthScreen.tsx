import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Play, UserPlus } from "lucide-react";
import { BrandMark, NoticeBanner, PrimaryButton } from "../../components/ui";
import { useAuth } from "./AuthProvider";

export function AuthScreen() {
  const { login, register, error, clearError } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("Jogador Ludex");
  const [email, setEmail] = useState(
    () => `jogador-${Date.now()}@ludex.local`
  );
  const [password, setPassword] = useState("password1234");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    clearError();
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível autenticar no Ludex."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-ludex-ink px-6 text-ludex-text">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(155,92,255,0.24),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(40,244,255,0.16),transparent_28%),linear-gradient(135deg,#080912_0%,#101225_52%,#05070d_100%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-7 shadow-neon backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <BrandMark />
          <span className="rounded-full border border-ludex-cyan/30 bg-ludex-cyan/10 px-3 py-1 text-xs text-cyan-100">
            beta
          </span>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white">Entre no arcade.</h2>
          <p className="mt-2 text-sm leading-6 text-ludex-muted">
            Sincronize sua biblioteca local e mantenha seus jogos no mesmo lugar.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.05] p-1">
          {(["login", "register"] as const).map((tab) => (
            <button
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ludex-cyan/60 ${
                mode === tab
                  ? "bg-ludex-cyan text-ludex-ink shadow-neon"
                  : "text-ludex-muted hover:text-white"
              }`}
              key={tab}
              onClick={() => setMode(tab)}
              type="button"
            >
              {tab === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <Field label="Nome">
              <input
                className="input-surface"
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </Field>
          ) : null}

          <Field label="Email">
            <input
              className="input-surface"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </Field>

          <Field label="Senha">
            <input
              className="input-surface"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </Field>

          {formError ?? error ? (
            <NoticeBanner tone="error">{formError ?? error}</NoticeBanner>
          ) : null}

          <PrimaryButton className="w-full" disabled={isSubmitting} type="submit">
            {mode === "register" ? <UserPlus size={18} /> : <Play size={18} />}
            {isSubmitting
              ? "Conectando..."
              : mode === "register"
                ? "Criar conta"
                : "Entrar"}
          </PrimaryButton>
        </form>
      </section>
    </main>
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
