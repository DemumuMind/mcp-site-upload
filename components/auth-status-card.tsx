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
  contentClassName = "p-6 sm:p-8",
  title,
  titleClassName = "text-2xl font-semibold text-foreground",
  message,
  messageClassName = "mt-2 text-sm text-muted-foreground",
  action,
}: AuthStatusCardProps) {
  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px ${topBorderClassName ?? "bg-gradient-to-r from-transparent via-primary/30 to-transparent"}`}
      />
      <div className={`relative ${contentClassName}`}>
        <h1 className={titleClassName}>{title}</h1>
        {message ? <p className={messageClassName}>{message}</p> : null}
        {action}
      </div>
    </div>
  );
}
