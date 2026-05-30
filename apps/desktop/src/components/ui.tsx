import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Gamepad2, Search, Sparkles } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "grid gap-3" : "flex items-center gap-3"}>
      <div
        className={`grid place-items-center rounded-2xl bg-gradient-to-br from-ludex-violet via-ludex-pink to-ludex-cyan text-white shadow-neon ${
          compact ? "h-16 w-16" : "h-11 w-11"
        }`}
      >
        <Gamepad2 size={compact ? 30 : 22} />
      </div>
      <div className={compact ? "leading-tight" : ""}>
        <h1 className={compact ? "text-[2.55rem] font-semibold tracking-normal text-white" : "text-xl font-semibold tracking-normal text-white"}>Ludex</h1>
        <p className={compact ? "text-base font-semibold text-ludex-pink" : "text-xs font-medium text-ludex-cyan"}>ピコ~</p>
      </div>
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ludex-violet to-ludex-pink px-4 py-3 text-sm font-semibold text-white shadow-neon transition hover:-translate-y-0.5 hover:shadow-[0_0_34px_rgba(255,79,216,0.22)] focus:outline-none focus:ring-2 focus:ring-ludex-cyan/70 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-medium text-white transition hover:border-ludex-cyan/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ludex-cyan/60 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-ludex-muted transition hover:border-ludex-cyan/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-ludex-cyan/60 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function StatusBadge({
  children,
  tone = "cyan"
}: {
  children: ReactNode;
  tone?: "cyan" | "pink" | "violet" | "muted" | "success";
}) {
  const tones = {
    cyan: "border-ludex-cyan/30 bg-ludex-cyan/10 text-cyan-100",
    pink: "border-ludex-pink/30 bg-ludex-pink/10 text-pink-100",
    violet: "border-ludex-violet/30 bg-ludex-violet/10 text-violet-100",
    muted: "border-white/10 bg-white/[0.06] text-ludex-muted",
    success: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${tones}`}
    >
      {children}
    </span>
  );
}

export function NoticeBanner({
  children,
  tone = "info"
}: {
  children: ReactNode;
  tone?: "info" | "error" | "success";
}) {
  const tones = {
    info: "border-ludex-cyan/25 bg-ludex-cyan/10 text-cyan-100",
    error: "border-ludex-pink/30 bg-ludex-pink/10 text-pink-100",
    success: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
  }[tone];

  return <div className={`rounded-xl border px-4 py-3 text-sm ${tones}`}>{children}</div>;
}

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ludex-panel/80 p-8 text-center shadow-neon">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.07] text-ludex-cyan">
        <Sparkles size={22} />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ludex-muted">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SearchInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      className={`flex min-w-72 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-ludex-muted transition focus-within:border-ludex-cyan/50 focus-within:bg-white/[0.08] ${className}`}
    >
      <Search size={18} />
      <span className="sr-only">Buscar jogos</span>
      <input
        className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-ludex-muted"
        placeholder="Buscar na biblioteca"
        {...props}
      />
    </label>
  );
}

export function Panel({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-black/25 ${className}`}>
      {children}
    </section>
  );
}
