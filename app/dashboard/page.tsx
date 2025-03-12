"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { CardSkeleton } from "@/components/ui/card-skeleton"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { Plus, Users, LayoutTemplate, CreditCard } from "lucide-react"
import Link from "next/link"
import { RecentTemplatesTable } from "@/components/dashboard/recent-templates"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1200)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Animation variants for staggered animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button asChild>
          <Link href="/dashboard/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>
      
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <StatCard 
              title="Total Employees" 
              value="2,345" 
              change="+12.5%"
              trend="up"
              icon={<Users className="h-4 w-4" />}
              color="bg-blue-50 dark:bg-blue-950"
              textColor="text-blue-600 dark:text-blue-400"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard 
              title="Active Templates" 
              value="48" 
              change="+6.8%"
              trend="up"
              icon={<LayoutTemplate className="h-4 w-4" />}
              color="bg-green-50 dark:bg-green-950"
              textColor="text-green-600 dark:text-green-400"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard 
              title="Cards Generated" 
              value="12,673" 
              change="+24.3%"
              trend="up"
              icon={<CreditCard className="h-4 w-4" />}
              color="bg-purple-50 dark:bg-purple-950"
              textColor="text-purple-600 dark:text-purple-400"
            />
          </motion.div>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold mb-4">Recent Templates</h3>
        {loading ? (
          <div className="w-full h-[300px] rounded-lg bg-muted/30 animate-pulse" />
        ) : (
          <RecentTemplatesTable />
        )}
      </motion.div>
    </div>
  )
}

