import { Clock3, FolderGit2, ShieldAlert, ShieldCheck } from "lucide-react";

import { tr, type Locale } from "@/lib/i18n";

type AccountStatsSectionProps = {
  locale: Locale;
  totalSubmissions: number;
  activeCount: number;
  pendingCount: number;
  rejectedCount: number;
};

const statItems = [
  {
    key: "total",
    icon: FolderGit2,
    tone: "text-foreground",
    label: "Total submissions",
    getValue: ({ totalSubmissions }: AccountStatsSectionProps) => totalSubmissions,
  },
  {
    key: "active",
    icon: ShieldCheck,
    tone: "text-emerald-300",
    label: "Active",
    getValue: ({ activeCount }: AccountStatsSectionProps) => activeCount,
  },
  {
    key: "pending",
    icon: Clock3,
    tone: "text-amber-300",
    label: "Pending",
    getValue: ({ pendingCount }: AccountStatsSectionProps) => pendingCount,
  },
  {
    key: "rejected",
    icon: ShieldAlert,
    tone: "text-rose-300",
    label: "Rejected",
    getValue: ({ rejectedCount }: AccountStatsSectionProps) => rejectedCount,
  },
] as const;

export function AccountStatsSection(props: AccountStatsSectionProps) {
  const { locale } = props;

  return (
    <section className="border-y border-border/60">
      <div className="grid gap-px bg-border/60 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <div key={item.key} className="bg-background px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                  {tr(locale, item.label, item.label)}
                </p>
                <p className={`mt-3 text-4xl font-semibold tracking-[-0.04em] ${item.tone}`}>
                  {item.getValue(props)}
                </p>
              </div>
              <item.icon className={`mt-1 size-5 ${item.tone}`} aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
