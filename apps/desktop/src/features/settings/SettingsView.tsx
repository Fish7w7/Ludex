import type { ReactNode } from "react";
import { Lock, Palette, PlugZap, Sparkles } from "lucide-react";
import { StatusBadge } from "../../components/ui";
import { apiBaseUrl } from "../../lib/gameUtils";

export function SettingsView() {
  return (
    <div className="grid grid-cols-2 gap-5">
      <SettingsSection
        icon={<PlugZap size={18} />}
        title="API"
        rows={[
          ["Base URL", apiBaseUrl()],
          ["Status", "Conectada após autenticação"]
        ]}
        badge={<StatusBadge tone="success">online</StatusBadge>}
      />
      <SettingsSection
        icon={<Palette size={18} />}
        title="Aparência"
        rows={[
          ["Tema", "Dark neon"],
          ["Identidade", "Japanese cyber arcade + kawaii tech"]
        ]}
        badge={<StatusBadge tone="violet">ピコ~</StatusBadge>}
      />
      <SettingsSection
        icon={<Lock size={18} />}
        title="Segurança"
        rows={[
          ["Token", "localStorage temporário"],
          ["Próximo passo", "Secure storage do Electron"]
        ]}
        badge={<StatusBadge tone="pink">MVP</StatusBadge>}
      />
      <SettingsSection
        icon={<Sparkles size={18} />}
        title="Sobre o Ludex"
        rows={[
          ["Desktop", "Electron + React + TypeScript"],
          ["Backend", "Laravel API + Sanctum"]
        ]}
        badge={<StatusBadge tone="cyan">launcher</StatusBadge>}
      />
    </div>
  );
}

function SettingsSection({
  badge,
  icon,
  rows,
  title
}: {
  badge: ReactNode;
  icon: ReactNode;
  rows: Array<[string, string]>;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-ludex-panel/80 p-5 shadow-neon">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.07] text-ludex-cyan">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        {badge}
      </div>
      <dl className="mt-5 space-y-4 text-sm">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-ludex-muted">{label}</dt>
            <dd className="mt-1 break-words text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
