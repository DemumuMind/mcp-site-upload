import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ProseH2(props: ComponentPropsWithoutRef<"h2">) {
  return <h2 className="mt-10 text-2xl font-semibold tracking-tight text-white sm:text-3xl" {...props} />;
}

function ProseH3(props: ComponentPropsWithoutRef<"h3">) {
  return <h3 className="mt-8 text-xl font-semibold tracking-tight text-white sm:text-2xl" {...props} />;
}

function ProseP(props: ComponentPropsWithoutRef<"p">) {
  return <p className="text-base leading-8 text-slate-200/95" {...props} />;
}

function ProseUl(props: ComponentPropsWithoutRef<"ul">) {
  return <ul className="space-y-2 pl-6 text-base leading-8 text-slate-200/95 marker:text-cyan-300 list-disc" {...props} />;
}

function ProseOl(props: ComponentPropsWithoutRef<"ol">) {
  return <ol className="space-y-2 pl-6 text-base leading-8 text-slate-200/95 marker:text-cyan-300 list-decimal" {...props} />;
}

function ProseA(props: ComponentPropsWithoutRef<"a">) {
  const { href = "", className, ...rest } = props;
  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={cn("font-medium text-cyan-200 underline underline-offset-4 transition hover:text-cyan-100", className)}
        {...rest}
      />
    );
  }

  return (
    <Link
      href={href}
      className={cn("font-medium text-cyan-200 underline underline-offset-4 transition hover:text-cyan-100", className)}
      {...rest}
    />
  );
}

function ProseBlockquote(props: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className="my-8 border-l-2 border-cyan-300/55 bg-cyan-500/6 px-4 py-2 text-base italic leading-8 text-cyan-100"
      {...props}
    />
  );
}

export const blogV2MdxComponents = {
  h2: ProseH2,
  h3: ProseH3,
  p: ProseP,
  ul: ProseUl,
  ol: ProseOl,
  a: ProseA,
  blockquote: ProseBlockquote,
};
