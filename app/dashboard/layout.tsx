"use client"

import { motion, AnimatePresence } from "framer-motion"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col w-full">
        <DashboardHeader />
        <AnimatePresence mode="wait">
          <motion.main 
            className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
            key={window.location.pathname}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}

