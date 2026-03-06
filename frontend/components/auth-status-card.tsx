import { type ReactNode } from "react";

type AuthStatusCardProps = {
  containerClassName: string;
  topBorderClassName?: string;
  contentClassName?: string;
  title: ReactNode;
  titleClassName?: string;
  message?: ReactNode;
  messageClassName?: string;
  action?: ReactNode;
};

export function AuthStatusCard({
  containerClassName,
  topBorderClassName,
  contentClassName = "p-5 sm:p-6",
  title,
  titleClassName = "text-2xl font-semibold tracking-[-0.03em] text-foreground",
  message,
  messageClassName = "mt-3 text-sm leading-7 text-muted-foreground",
  action,
}: AuthStatusCardProps) {
  return (
    <div className={`editorial-panel ${containerClassName}`}>
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-px ${topBorderClassName ?? "bg-gradient-to-r from-transparent via-primary/30 to-transparent"}`} />
      <div className={contentClassName}>
        <h1 className={titleClassName}>{title}</h1>
        {message ? <p className={messageClassName}>{message}</p> : null}
        {action}
      </div>
    </div>
  );
}
