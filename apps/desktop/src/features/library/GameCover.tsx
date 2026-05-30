import type { CSSProperties } from "react";
import { Gamepad2, Sparkles } from "lucide-react";

const coverGradients = [
  "linear-gradient(140deg, rgba(155,92,255,0.92), rgba(30,42,126,0.88) 48%, rgba(40,244,255,0.7))",
  "linear-gradient(140deg, rgba(255,79,216,0.9), rgba(74,28,121,0.9) 52%, rgba(11,19,42,0.96))",
  "linear-gradient(140deg, rgba(26,204,255,0.88), rgba(24,35,87,0.94) 48%, rgba(255,148,208,0.75))",
  "linear-gradient(140deg, rgba(30,42,126,0.94), rgba(10,146,162,0.86) 52%, rgba(6,9,22,0.96))",
  "linear-gradient(140deg, rgba(255,158,69,0.9), rgba(155,92,255,0.9) 48%, rgba(15,22,58,0.96))"
];

function hashText(value: string): number {
  return [...value].reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

function coverStyle(name: string, platform: string): CSSProperties {
  const gradient = coverGradients[hashText(`${name}-${platform}`) % coverGradients.length];

  return {
    backgroundImage: [
      "radial-gradient(circle at 82% 18%, rgba(255,255,255,0.82) 0 4%, transparent 4.5%)",
      "radial-gradient(circle at 18% 24%, rgba(255,255,255,0.16) 0 1px, transparent 2px)",
      "radial-gradient(circle at 74% 72%, rgba(40,244,255,0.22), transparent 28%)",
      "linear-gradient(180deg, transparent 42%, rgba(3,6,16,0.82) 100%)",
      gradient
    ].join(", ")
  };
}

export function GameCover({
  className = "",
  coverUrl,
  name,
  platform,
  showGlyph = true
}: {
  className?: string;
  coverUrl?: string | null;
  name: string;
  platform: string;
  showGlyph?: boolean;
}) {
  if (coverUrl) {
    return <img alt="" className={`object-cover ${className}`} src={coverUrl} />;
  }

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-cover bg-center ${className}`}
      style={coverStyle(name, platform)}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.14),transparent_34%,rgba(0,0,0,0.22)_76%)]" />
      <div className="absolute -left-8 bottom-8 h-28 w-28 rounded-full bg-ludex-violet/35 blur-2xl" />
      <div className="absolute right-4 top-4 text-white/75">
        <Sparkles size={18} />
      </div>
      {showGlyph ? (
        <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[1.35rem] border border-white/15 bg-black/28 text-white shadow-[0_0_34px_rgba(40,244,255,0.22)] backdrop-blur-sm">
          <Gamepad2 size={30} />
        </div>
      ) : null}
      <div className="absolute bottom-3 right-3 text-[11px] font-semibold text-white/55">
        ピコ~
      </div>
    </div>
  );
}
