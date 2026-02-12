import Image from "next/image";

import { tr, type Locale } from "@/lib/i18n";

type BrandMascotCardProps = {
  locale: Locale;
};

export function BrandMascotCard({ locale }: BrandMascotCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/85 via-slate-900/70 to-blue-950/70 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="absolute -top-12 -right-8 h-36 w-36 rounded-full bg-cyan-400/15 blur-2xl" aria-hidden="true" />
      <div className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" aria-hidden="true" />

      <div className="relative flex flex-col items-center gap-3">
        <Image
          src="/mascot/demumumind-anime-mascot.svg"
          alt={tr(
            locale,
            "Anime-style DemumuMind mascot in dark blue cyber aesthetic",
            "Аниме-маскот DemumuMind в темно-синем кибер-стиле",
          )}
          width={220}
          height={220}
          className="h-auto w-[190px] sm:w-[220px]"
          unoptimized
          priority
        />

        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.15em] text-cyan-300 uppercase">
            {tr(locale, "Brand mascot", "Фирменный маскот")}
          </p>
          <p className="mt-1 max-w-[20rem] text-xs text-slate-300">
            {tr(
              locale,
              "Anime-inspired character tuned to the DemumuMind dark UI palette.",
              "Аниме-персонаж, стилизованный под темную палитру интерфейса DemumuMind.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
