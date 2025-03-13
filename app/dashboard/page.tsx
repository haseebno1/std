"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { CardSkeleton } from "@/components/ui/card-skeleton"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { Plus, Users, LayoutTemplate, CreditCard, FileText, Building2, Briefcase, Activity } from "lucide-react"
import Link from "next/link"
import { RecentActivityTable } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"

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
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    }
  }
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your ID card management system"
      >
        <div className="flex gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Button asChild variant="outline">
              <Link href="/dashboard/generate">
                <Plus className="mr-2 h-4 w-4" />
                Generate Card
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <Button asChild>
              <Link href="/dashboard/templates/new">
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Link>
            </Button>
          </motion.div>
        </div>
      </PageHeader>
      
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
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
              title="Clients" 
              value="36" 
              change="+8.2%"
              trend="up"
              icon={<Building2 className="h-4 w-4" />}
              color="bg-amber-50 dark:bg-amber-950"
              textColor="text-amber-600 dark:text-amber-400"
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
      
      {/* Quick Actions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            whileHover="hover"
          >
            <Card className="h-full overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <Link href="/dashboard/generate" className="block h-full">
                <CardHeader className="pb-2">
                  <div className="p-3 w-12 h-12 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Plus className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardTitle className="text-lg">Generate Card</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Create a new ID card for an employee</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 p-0 hover:bg-transparent hover:text-blue-700">
                    Get Started →
                  </Button>
                </CardFooter>
              </Link>
            </Card>
          </motion.div>
          
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            whileHover="hover"
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full overflow-hidden border-none shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <Link href="/dashboard/batch" className="block h-full">
                <CardHeader className="pb-2">
                  <div className="p-3 w-12 h-12 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardTitle className="text-lg">Batch Generator</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Generate multiple cards at once</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400 p-0 hover:bg-transparent hover:text-green-700">
                    Get Started →
                  </Button>
                </CardFooter>
              </Link>
            </Card>
          </motion.div>
          
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            whileHover="hover"
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full overflow-hidden border-none shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <Link href="/dashboard/templates" className="block h-full">
                <CardHeader className="pb-2">
                  <div className="p-3 w-12 h-12 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <LayoutTemplate className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardTitle className="text-lg">Templates</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">View and edit your card templates</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 p-0 hover:bg-transparent hover:text-purple-700">
                    Explore →
                  </Button>
                </CardFooter>
              </Link>
            </Card>
          </motion.div>
          
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            whileHover="hover"
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full overflow-hidden border-none shadow-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
              <Link href="/dashboard/clients" className="block h-full">
                <CardHeader className="pb-2">
                  <div className="p-3 w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Building2 className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardTitle className="text-lg">Clients</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Manage your clients and brands</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="text-amber-600 dark:text-amber-400 p-0 hover:bg-transparent hover:text-amber-700">
                    Manage →
                  </Button>
                </CardFooter>
              </Link>
            </Card>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg overflow-hidden shadow-md bg-card"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Recent Activity
          </h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        {loading ? (
          <div className="w-full h-[300px] bg-muted/30 animate-pulse" />
        ) : (
          <RecentActivityTable />
        )}
      </motion.div>
    </div>
  )
}

