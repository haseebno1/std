"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { TemplateEditor } from "@/components/template-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Template } from "@/lib/types"
import { fetchTemplateById, saveTemplate } from "@/lib/api"

export default function TemplateEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("id")
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(!!templateId)

  // Load template if ID is provided
  useEffect(() => {
    if (templateId) {
      fetchTemplateById(templateId)
        .then(data => {
          setTemplate(data)
          setLoading(false)
        })
        .catch(error => {
          console.error("Error loading template:", error)
          toast({
            title: "Error",
            description: "Failed to load template data",
            variant: "destructive",
          })
          setLoading(false)
        })
    }
  }, [templateId])

  const handleSave = async (updatedTemplate: Template) => {
    try {
      await saveTemplate(updatedTemplate)
      toast({
        title: "Success",
        description: "Template saved successfully",
      })
      router.push("/dashboard/templates")
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      })
    }
  }

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
            <h1 className="text-3xl font-bold">
              {templateId ? "Edit Template" : "Create Template"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Design your ID card template with drag-and-drop fields
          </p>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-[600px] rounded-lg bg-muted/30 animate-pulse" />
      ) : (
        <TemplateEditor 
          initialTemplate={template || undefined} 
          onSave={handleSave} 
        />
      )}
    </div>
  )
} 