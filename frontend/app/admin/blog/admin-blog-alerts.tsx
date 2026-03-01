type AdminBlogAlertsProps = {
  successMessage: string | null;
  errorMessage: string | null;
};

export function AdminBlogAlerts({ successMessage, errorMessage }: AdminBlogAlertsProps) {
  return (
    <>
      {successMessage ? (
        <div className="mb-4 rounded-md border border-accent bg-accent/20 px-3 py-2 text-sm text-foreground">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-4 rounded-md border border-border bg-muted/60 px-3 py-2 text-sm text-foreground">
          {errorMessage}
        </div>
      ) : null}
    </>
  );
}
