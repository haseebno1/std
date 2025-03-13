"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CardPreview } from "@/components/card-preview"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Template, EmployeeData } from "@/lib/types"
import { fetchTemplateById, fetchEmployeeById } from "@/lib/api"

export default function CardPreviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const employeeId = searchParams.get("employee")
  
  const [template, setTemplate] = useState<Template | null>(null)
  const [employeeData, setEmployeeData] = useState<EmployeeData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!templateId) {
        setError("Template ID is required")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Load template
        const templateData = await fetchTemplateById(templateId)
        setTemplate(templateData)

        // Load employee data if provided
        if (employeeId) {
          const employee = await fetchEmployeeById(employeeId)
          setEmployeeData(employee.data || {})
        }

        setLoading(false)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load data")
        setLoading(false)
      }
    }

    loadData()
  }, [templateId, employeeId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Card Preview</h1>
          </div>
          <p className="text-muted-foreground">
            Preview and download the generated ID card
          </p>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-[600px] rounded-lg bg-muted/30 animate-pulse" />
      ) : error ? (
        <div className="p-6 bg-destructive/10 text-destructive rounded-lg">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
      ) : template ? (
        <CardPreview 
          template={template} 
          employeeData={employeeData} 
        />
      ) : null}
    </div>
  )
} 