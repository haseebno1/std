"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { TemplateForm } from "@/components/templates/template-form"
import { fetchTemplateById } from "@/lib/api"
import type { Template } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Page: Attempting to load template with ID:", templateId)
        console.log("Page: Type of templateId:", typeof templateId)

        if (!templateId) {
          throw new Error("No template ID provided")
        }

        try {
          const data = await fetchTemplateById(templateId)
          console.log("Page: Template loaded successfully:", data)
          setTemplate(data)
        } catch (specificError) {
          console.error("Page: Error fetching template:", specificError)

          // Create a default template with this ID as a last resort
          console.log("Page: Creating default template with ID:", templateId)
          const defaultTemplate: Template = {
            id: templateId,
            name: "New Template",
            clientId: "client1", // Default to first client
            brandId: "brand1", // Default to first brand
            frontImage: "/placeholder.svg?height=300&width=500",
            layout: "horizontal",
            customFields: [],
          }

          setTemplate(defaultTemplate)
          // Show a warning instead of an error
          toast({
            title: "Template not found",
            description: "Created a new template instead",
            variant: "warning",
          })
        }
      } catch (error) {
        console.error("Page: Error in template loading process:", error)
        setError("Failed to load template. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (templateId) {
      loadTemplate()
    } else {
      setError("No template ID provided")
      setLoading(false)
    }
  }, [templateId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/dashboard/templates")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
      </div>
    )
  }

  return <TemplateForm initialTemplate={template || undefined} />
}

