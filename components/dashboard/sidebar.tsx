"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutTemplate, Users, Settings, 
  Menu, X, Home, Plus, FileText, Eye,
  Building2, Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
  { name: "Batch Generator", href: "/dashboard/batch", icon: FileText },
  { name: "Clients", href: "/dashboard/clients", icon: Building2 },
  { name: "Brands", href: "/dashboard/brands", icon: Briefcase },
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={expanded ? "close" : "open"}
            initial={{ opacity: 0, rotate: expanded ? -90 : 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: expanded ? 90 : -90 }}
            transition={{ duration: 0.2 }}
          >
            {expanded ? <X size={18} /> : <Menu size={18} />}
          </motion.div>
        </AnimatePresence>
      </Button>
      
      <motion.div 
        className={cn(
          "fixed inset-y-0 z-40 flex flex-col border-r bg-card",
          expanded ? "left-0" : "-left-72",
          "lg:static lg:left-0 w-72 transition-all duration-300"
        )}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex h-16 items-center px-6 border-b">
          <motion.h2 
            className="text-xl font-semibold text-primary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Card Generator
          </motion.h2>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)) ||
              (item.href === "/dashboard" && pathname === "/dashboard");
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
              >
                <Link
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
              </motion.div>
            )
          })}
        </nav>
      </motion.div>
    </>
  )
}

