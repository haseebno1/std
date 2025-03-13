"use client"

import { CardGenerator } from "@/components/card-generator"
import { PageHeader } from "@/components/ui/page-header"
import { motion } from "framer-motion"

export default function GeneratePage() {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Generate Employee Cards"
        description="Select a template and enter employee details to generate cards"
      />
      <CardGenerator />
    </motion.div>
  )
}

