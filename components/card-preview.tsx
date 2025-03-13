"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Loader2 } from "lucide-react"
import type { Template, EmployeeData } from "@/lib/types"

interface CardPreviewProps {
  template: Template
  employeeData: EmployeeData
}

export function CardPreview({ template, employeeData }: CardPreviewProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // TODO: Implement card download logic
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("Error downloading card:", error)
    } finally {
      setDownloading(false)
    }
  }

  const formatFieldValue = (value: string | Date | null): string => {
    if (!value) return ""
    if (value instanceof Date) return value.toLocaleDateString()
    return value
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Card Preview</h2>
        <Button 
          onClick={handleDownload} 
          disabled={downloading}
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
            <Download className="mr-2 h-4 w-4" />
              Download Card
            </>
          )}
          </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div 
                className="aspect-[1.586/1] relative bg-muted"
                style={{
                  backgroundImage: `url(${template.frontImage || "/placeholder.svg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Render front side field values */}
                {template.customFields
                  .filter(field => field.side === "front")
                  .map(field => (
                    <div
                      key={field.id}
                      className="absolute"
                      style={{
                        top: `${field.position.y}%`,
                        left: `${field.position.x}%`,
                        transform: "translate(-50%, -50%)",
                        color: field.style?.color || "#000000",
                        fontSize: `${field.style?.fontSize || 16}px`,
                        fontWeight: field.style?.fontWeight || "normal",
                      }}
                    >
                      {formatFieldValue(employeeData[field.id])}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div 
                className="aspect-[1.586/1] relative bg-muted"
                style={{
                  backgroundImage: `url(${template.backImage || "/placeholder.svg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Render back side field values */}
                {template.customFields
                  .filter(field => field.side === "back")
                  .map(field => (
                    <div
                      key={field.id}
                      className="absolute"
                      style={{
                        top: `${field.position.y}%`,
                        left: `${field.position.x}%`,
                        transform: "translate(-50%, -50%)",
                        color: field.style?.color || "#000000",
                        fontSize: `${field.style?.fontSize || 16}px`,
                        fontWeight: field.style?.fontWeight || "normal",
                      }}
                    >
                      {formatFieldValue(employeeData[field.id])}
                    </div>
                  ))}
          </div>
            </CardContent>
          </Card>
        </motion.div>
            </div>
    </div>
  )
}

