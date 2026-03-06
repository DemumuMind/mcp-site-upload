import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
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
        <article className="group cursor-pointer border border-border/60 p-4 transition-colors hover:border-primary/40 hover:bg-white/[0.03]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center border border-border/70 bg-background/40">
                <Star className="size-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">{server.name}</h3>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                    {server.verificationLabel}
                  </p>
                </div>
              </div>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>

          <div className="mt-4 grid gap-2 border-t border-border/50 pt-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase sm:grid-cols-3">
            <p>{server.category}</p>
            <p>
              {featuredAuthLabel}: <span className="text-foreground">{server.authLabel}</span>
            </p>
            <p className="sm:text-right">
              <span className="text-foreground">{server.toolsCount}</span> {featuredToolsLabel}
            </p>
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
            <div className="size-2 rounded-full bg-emerald-500" />
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
