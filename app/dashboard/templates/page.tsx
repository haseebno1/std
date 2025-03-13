"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TemplateList } from "@/components/templates/template-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { SkeletonGrid } from "@/components/ui/skeleton-card"

export default function TemplatesPage() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Manage your ID card templates for different clients and brands."
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button asChild>
            <Link href="/dashboard/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Link>
          </Button>
        </motion.div>
      </PageHeader>
      
      {isLoading ? (
        <SkeletonGrid count={6} hasFooter />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TemplateList hideActions={true} />
        </motion.div>
      )}
    </div>
  )
}

