import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BridgePageLink = {
  href: string;
  label: string;
  description: string;
};

type BridgePageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  links?: BridgePageLink[];
};

export function BridgePageShell({
  eyebrow,
  title,
  description,
  links = [],
}: BridgePageShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-10">
        {eyebrow ? (
          <Badge className="w-fit border-blue-400/35 bg-blue-500/10 text-blue-200">
            {eyebrow}
          </Badge>
        ) : null}

        <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          {description}
        </p>
      </div>

      {links.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {links.map((item) => (
            <Card key={item.href} className="border-white/10 bg-slate-900/65">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-100">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 transition hover:text-white"
                  >
                    {item.label}
                    <ArrowRight className="size-4" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
