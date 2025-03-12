export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between space-x-2">
        <div className="h-4 w-1/3 bg-muted rounded-md animate-pulse" />
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="h-12 w-2/3 bg-muted rounded-md animate-pulse" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-1/4 bg-muted rounded-md animate-pulse" />
        <div className="h-4 w-1/4 bg-muted rounded-md animate-pulse" />
      </div>
    </div>
  )
} 