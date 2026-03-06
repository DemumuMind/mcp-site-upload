"use client";
import { useMemo } from "react";
import { CheckCircle2, Copy, FileCode2, Search } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { tr } from "@/lib/i18n";

type HowToConnectSectionProps = { serverName: string; serverUrl: string; onConfigCopied?: () => void; };
function toConfigKey(serverName: string): string { return serverName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"); }

export function HowToConnectSection({ serverName, serverUrl, onConfigCopied }: HowToConnectSectionProps) {
  const locale = useLocale();
  const configSnippet = useMemo(() => {
    const configKey = toConfigKey(serverName) || "example-server";
    return JSON.stringify({ mcpServers: { [configKey]: { type: "sse", url: serverUrl } } }, null, 2);
  }, [serverName, serverUrl]);

  async function handleCopyConfig() {
    try {
      await navigator.clipboard.writeText(configSnippet);
      onConfigCopied?.();
      toast.success(tr(locale, "Config snippet copied to clipboard.", "Config snippet copied to clipboard."));
    } catch {
      toast.error(tr(locale, "Unable to copy config snippet.", "Unable to copy config snippet."));
    }
  }

  return (
    <section id="how-to-use" className="editorial-panel">
      <div className="space-y-2">
        <h3 className="type-section-title text-foreground">{tr(locale, "How to connect an MCP server", "How to connect an MCP server")}</h3>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{tr(locale, "Use this quick flow for Claude Desktop and other MCP-compatible clients. Pick a server, paste config, restart the client, and test a tool call.", "Use this quick flow for Claude Desktop and other MCP-compatible clients. Pick a server, paste config, restart the client, and test a tool call.")}</p>
      </div>
      <div className="mt-6 grid gap-px border border-border/60 bg-border/60 md:grid-cols-3">
        {[{ icon: Search, title: tr(locale, "1. Select server", "1. Select server"), text: tr(locale, "Open the catalog and choose a server that matches your workflow and auth requirements.", "Open the catalog and choose a server that matches your workflow and auth requirements.") }, { icon: FileCode2, title: tr(locale, "2. Add config", "2. Add config"), text: tr(locale, "Copy this snippet into your claude_desktop_config.json file.", "Copy this snippet into your claude_desktop_config.json file.") }, { icon: CheckCircle2, title: tr(locale, "3. Verify tools", "3. Verify tools"), text: tr(locale, "Restart your client and call one tool from this server to confirm connectivity.", "Restart your client and call one tool from this server to confirm connectivity.") }].map((item) => (
          <div key={item.title} className="bg-background px-5 py-5 sm:px-6">
            <div className="flex items-center gap-2 text-base font-semibold text-foreground"><item.icon className="size-4 text-primary" />{item.title}</div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 border border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          <div className="text-sm text-muted-foreground">{tr(locale, "Example config for", "Example config for")} <span className="font-medium text-foreground">{serverName}</span></div>
          <Button type="button" variant="outline" className="px-6" onClick={handleCopyConfig}><Copy className="size-4" />{tr(locale, "Copy config", "Copy config")}</Button>
        </div>
        <pre className="overflow-x-auto px-4 py-4 text-xs text-foreground sm:px-5"><code>{configSnippet}</code></pre>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="size-4 text-primary" />{tr(locale, "Tip: keep endpoint secrets out of source control and store them via environment variables where possible.", "Tip: keep endpoint secrets out of source control and store them via environment variables where possible.")}</div>
    </section>
  );
}
