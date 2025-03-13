import { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface EntityCardProps {
  title: string
  subtitle?: string
  description?: string
  icon: LucideIcon
  id?: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "info"
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  actionLabel?: string
  onAction?: () => void
  className?: string
  children?: ReactNode
  footer?: ReactNode
  hideActions?: boolean
}

export function EntityCard({
  title,
  subtitle,
  description,
  icon: Icon,
  id,
  badge,
  badgeVariant = "outline",
  onClick,
  onEdit,
  onDelete,
  actionLabel = "Manage",
  onAction,
  className,
  children,
  footer,
  hideActions = false,
}: EntityCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn("overflow-hidden hover:shadow-md transition-shadow cursor-pointer group", className)}
        onClick={onClick}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {title}
                  {badge && (
                    <Badge variant={badgeVariant} className="ml-2 text-xs">
                      {badge}
                    </Badge>
                  )}
                </CardTitle>
                {subtitle && (
                  <CardDescription className="mt-1">{subtitle}</CardDescription>
                )}
              </div>
            </div>
            {!hideActions && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {description && (
            <CardDescription className="mt-2">
              {description}
            </CardDescription>
          )}
          {id && (
            <CardDescription className="mt-2">
              <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">ID: {id}</span>
            </CardDescription>
          )}
        </CardHeader>
        {children && (
          <CardContent className="pb-4">
            {children}
          </CardContent>
        )}
        {(footer || onAction) && (
          <CardFooter className="bg-muted/30 pt-4">
            {footer || (
              <Button
                variant="ghost"
                className="w-full text-primary hover:text-primary/80"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.();
                }}
              >
                {actionLabel}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
} 