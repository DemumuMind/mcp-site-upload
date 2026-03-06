"use client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ClientReferenceItem = { client: string; badge: string; where: string; smoke: string; };
type ClientReferenceProps = { title: string; description: string; whereLabel: string; smokeLabel: string; items: ClientReferenceItem[]; onClientChange: (client: string) => void; };

export function ClientReference({ title, description, whereLabel, smokeLabel, items, onClientChange }: ClientReferenceProps) {
  const initialClient = useMemo(() => items[0]?.client ?? "", [items]);
  const [activeClient, setActiveClient] = useState(initialClient);
  const selectedItem = useMemo(() => items.find((item) => item.client === activeClient) ?? items[0], [activeClient, items]);
  if (!selectedItem) return null;

  return (
    <div className="editorial-panel">
      <div className="space-y-2">
        <h3 className="type-section-title text-foreground">{title}</h3>
        <p className="text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = item.client === selectedItem.client;
          return <Button key={item.client} type="button" variant={isActive ? "default" : "outline"} className="h-10 px-4 text-xs" onClick={() => { if (isActive) return; setActiveClient(item.client); onClientChange(item.client); }}>{item.client}</Button>;
        })}
      </div>
      <div className="mt-5 border border-border/60">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          <h4 className="text-lg font-semibold text-foreground">{selectedItem.client}</h4>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">{selectedItem.badge}</Badge>
        </div>
        <div className="editorial-list text-sm leading-7 text-muted-foreground">
          <div className="px-4 py-4 sm:px-5"><p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{whereLabel}</p><p className="mt-2">{selectedItem.where}</p></div>
          <div className="px-4 py-4 sm:px-5"><p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{smokeLabel}</p><p className="mt-2">{selectedItem.smoke}</p></div>
        </div>
      </div>
    </div>
  );
}
