import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
  hasFooter?: boolean
  hasIcon?: boolean
}

export function SkeletonCard({ className, hasFooter = true, hasIcon = true }: SkeletonCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          {hasIcon && (
            <Skeleton className="h-12 w-12 rounded-full" />
          )}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      {hasFooter && (
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      )}
    </Card>
  )
}

export function SkeletonGrid({ count = 6, ...props }: { count?: number } & SkeletonCardProps) {
  return (
    <motion.div 
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <SkeletonCard {...props} />
          </motion.div>
        ))}
    </motion.div>
  )
} 