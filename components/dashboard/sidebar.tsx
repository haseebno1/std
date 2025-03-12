"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  LayoutTemplate, Users, CreditCard, Settings, 
  Menu, X, Home 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
  { name: "Cards", href: "/dashboard/cards", icon: CreditCard },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)
  
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setExpanded(prev => !prev)}
      >
        {expanded ? <X size={18} /> : <Menu size={18} />}
      </Button>
      
      <motion.div 
        className={cn(
          "fixed inset-y-0 z-40 flex flex-col border-r bg-card",
          expanded ? "left-0" : "-left-72",
          "lg:left-0 w-72 transition-all duration-300"
        )}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div className="flex h-16 items-center px-6 border-b">
          <h2 className="text-xl font-semibold text-primary">
            Card Generator
          </h2>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md my-1 relative",
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-primary-foreground z-10" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                />
                <span className={cn("z-10", isActive && "text-primary-foreground")}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
      </motion.div>
    </>
  )
}

