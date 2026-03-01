import Link from "next/link";

type CookieSettingsButtonProps = {
    label: string;
};
export function CookieSettingsButton({ label }: CookieSettingsButtonProps) {
    return (<Link href="/cookie-settings" className="inline-flex min-h-11 min-w-11 items-center rounded-sm py-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:min-h-0 sm:py-0">
      {label}
    </Link>);
}

