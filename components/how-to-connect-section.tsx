"use client";
import { useMemo } from "react";
import { CheckCircle2, Copy, FileCode2, Search } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
type HowToConnectSectionProps = {
    serverName: string;
    serverUrl: string;
    onConfigCopied?: () => void;
};
function toConfigKey(serverName: string): string {
    return serverName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}
export function HowToConnectSection({ serverName, serverUrl, onConfigCopied, }: HowToConnectSectionProps) {
    const locale = useLocale();
    const configSnippet = useMemo(() => {
        const configKey = toConfigKey(serverName) || "example-server";
        return JSON.stringify({
            mcpServers: {
                [configKey]: {
                    type: "sse",
                    url: serverUrl,
                },
            },
        }, null, 2);
    }, [serverName, serverUrl]);
    async function handleCopyConfig() {
        try {
            await navigator.clipboard.writeText(configSnippet);
            onConfigCopied?.();
            toast.success(tr(locale, "Config snippet copied to clipboard.", "Config snippet copied to clipboard."));
        }
        catch {
            toast.error(tr(locale, "Unable to copy config snippet.", "Unable to copy config snippet."));
        }
    }
    return (<section id="how-to-use" className="space-y-4 rounded-2xl border border-blacksmith bg-card p-6 sm:p-8">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          {tr(locale, "How to connect an MCP server", "How to connect an MCP server")}
        </h3>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {tr(locale, "Use this quick flow for Claude Desktop and other MCP-compatible clients. Pick a server, paste config, restart the client, and test a tool call.", "Use this quick flow for Claude Desktop and other MCP-compatible clients. Pick a server, paste config, restart the client, and test a tool call.")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blacksmith bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Search className="size-4 text-primary"/>
              {tr(locale, "1. Select server", "1. Select server")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {tr(locale, "Open the catalog and choose a server that matches your workflow and auth requirements.", "Open the catalog and choose a server that matches your workflow and auth requirements.")}
          </CardContent>
        </Card>

        <Card className="border-blacksmith bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <FileCode2 className="size-4 text-primary"/>
              {tr(locale, "2. Add config", "2. Add config")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {tr(locale, "Copy this snippet into your claude_desktop_config.json file.", "Copy this snippet into your claude_desktop_config.json file.")}
          </CardContent>
        </Card>

        <Card className="border-blacksmith bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <CheckCircle2 className="size-4 text-primary"/>
              {tr(locale, "3. Verify tools", "3. Verify tools")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {tr(locale, "Restart your client and call one tool from this server to confirm connectivity.", "Restart your client and call one tool from this server to confirm connectivity.")}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-blacksmith bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            {tr(locale, "Example config for", "Example config for")} {" "}
            <span className="font-medium text-foreground">{serverName}</span>
          </div>
          <Button type="button" variant="outline" className="border-blacksmith bg-card hover:bg-accent" onClick={handleCopyConfig}>
            <Copy className="size-4"/>
            {tr(locale, "Copy config", "Copy config")}
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-blacksmith bg-card p-3 text-xs text-foreground">
          <code>{configSnippet}</code>
        </pre>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="size-4 text-primary"/>
        {tr(locale, "Tip: keep endpoint secrets out of source control and store them via environment variables where possible.", "Tip: keep endpoint secrets out of source control and store them via environment variables where possible.")}
      </div>
    </section>);
}

