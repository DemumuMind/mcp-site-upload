"use client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
type ClientReferenceItem = {
    client: string;
    badge: string;
    where: string;
    smoke: string;
};
type ClientReferenceProps = {
    title: string;
    description: string;
    whereLabel: string;
    smokeLabel: string;
    items: ClientReferenceItem[];
    onClientChange: (client: string) => void;
};
export function ClientReference({ title, description, whereLabel, smokeLabel, items, onClientChange, }: ClientReferenceProps) {
    const initialClient = useMemo(() => items[0]?.client ?? "", [items]);
    const [activeClient, setActiveClient] = useState(initialClient);
    const selectedItem = useMemo(() => items.find((item) => item.client === activeClient) ?? items[0], [activeClient, items]);
    if (!selectedItem) {
        return null;
    }
    return (<div className="space-y-4 rounded-3xl border border-white/10 bg-indigo-950/72 p-6 sm:p-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight text-violet-50 sm:text-3xl">{title}</h3>
        <p className="text-sm leading-7 text-violet-200 sm:text-base">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
            const isActive = item.client === selectedItem.client;
            return (<Button key={item.client} type="button" variant={isActive ? "default" : "outline"} className={cn("h-9 rounded-full px-4 text-xs", isActive
                    ? "bg-cyan-500 text-white hover:bg-cyan-400"
                    : "border-white/20 bg-indigo-900/70 text-violet-100 hover:bg-indigo-900")} onClick={() => {
                    if (isActive) {
                        return;
                    }
                    setActiveClient(item.client);
                    onClientChange(item.client);
                }}>
              {item.client}
            </Button>);
        })}
      </div>

      <Card className="border-white/10 bg-indigo-900/70">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-2 text-lg text-violet-50">
            <span>{selectedItem.client}</span>
            <Badge variant="outline" className="border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
              {selectedItem.badge}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-violet-200">
          <div>
            <p className="text-xs font-semibold tracking-[0.1em] text-violet-300 uppercase">{whereLabel}</p>
            <p>{selectedItem.where}</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.1em] text-violet-300 uppercase">{smokeLabel}</p>
            <p>{selectedItem.smoke}</p>
          </div>
        </CardContent>
      </Card>
    </div>);
}
