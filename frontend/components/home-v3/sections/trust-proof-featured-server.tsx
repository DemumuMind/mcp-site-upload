"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { HomeFeaturedServer } from "@/lib/home/types";

export function TrustProofFeaturedServerCard({
  server,
  featuredAuthLabel,
  featuredToolsLabel,
}: {
  server: HomeFeaturedServer;
  featuredAuthLabel: string;
  featuredToolsLabel: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <article className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card/30 p-4 shadow-2xl shadow-black backdrop-blur-md transition-[border-color,background-color] duration-200 ease-out hover:border-primary/40 hover:bg-card/50">
          <BorderBeam size={120} duration={10} className="opacity-0 group-hover:opacity-100" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background/80 shadow-inner">
                <Star className="size-5 text-primary transition-transform duration-200 ease-out motion-safe:will-change-transform group-hover:scale-110" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">{server.name}</h3>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                    {server.verificationLabel}
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-[10px] font-bold text-primary">
              {server.category}
            </Badge>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-[10px] font-medium tracking-wide text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="text-primary/70 uppercase">{featuredAuthLabel}:</span>
                <span className="text-foreground">{server.authLabel}</span>
              </span>
            </div>
            <span className="rounded-full bg-muted/30 px-2 py-0.5 text-foreground/80">
              {server.toolsCount} {featuredToolsLabel}
            </span>
          </div>
        </article>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Star className="size-6 text-primary" />
            {server.name}
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Detailed information about this trusted MCP server.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="mb-2 text-xs font-bold tracking-widest text-primary uppercase">Capabilities</h4>
            <p className="text-sm text-foreground">
              This server provides {server.toolsCount} specialized tools for agentic workflows, focusing on{" "}
              {server.category}.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Category</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{server.category}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Auth Model</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{server.authLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-400">
            <div className="size-2 animate-pulse rounded-full bg-emerald-500" />
            {server.verificationLabel}
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-3">
          <Button asChild variant="outline" className="rounded-md border-border">
            <Link href="/catalog">Visit Catalog</Link>
          </Button>
          <Button asChild className="rounded-md">
            <Link href="/submit-server">Integrate Now</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
