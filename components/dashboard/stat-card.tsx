import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ReactNode
  color: string
  textColor: string
}

export function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon,
  color,
  textColor 
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full", color)}>
          <div className={cn(textColor)}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {trend === "up" ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : trend === "down" ? (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          ) : null}
          <p className={cn(
            "text-xs",
            trend === "up" ? "text-green-500" : 
            trend === "down" ? "text-red-500" : 
            "text-muted-foreground"
          )}>
            {change} from last month
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 