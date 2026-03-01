export default function Loading() {
    return (<div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
      <div className="h-4 w-16 animate-pulse rounded-full bg-muted"/>
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted"/>
      <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-muted"/>
    </div>);
}

