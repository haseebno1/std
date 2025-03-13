"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { TemplateEditor } from "@/components/template-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Template } from "@/lib/types"
import { fetchTemplateById, createTemplate } from "@/lib/api"
import { handleSupabaseError } from "@/lib/supabase"

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
            description: handleSupabaseError(error) || "Failed to load template data",
            variant: "destructive",
          })
          setLoading(false)
        })
    }
  }, [templateId])

  const handleSave = async (updatedTemplate: Template) => {
    try {
      // If we're editing an existing template, use the same ID
      // otherwise let the API generate a new ID
      const templateToSave = {
        ...updatedTemplate,
        // Ensure both naming conventions are present
        client_id: updatedTemplate.clientId || updatedTemplate.client_id,
        brand_id: updatedTemplate.brandId || updatedTemplate.brand_id,
        front_image: updatedTemplate.frontImage || updatedTemplate.front_image,
        back_image: updatedTemplate.backImage || updatedTemplate.back_image,
        custom_fields: updatedTemplate.customFields || updatedTemplate.custom_fields || [],
        // And in reverse
        clientId: updatedTemplate.client_id || updatedTemplate.clientId,
        brandId: updatedTemplate.brand_id || updatedTemplate.brandId, 
        frontImage: updatedTemplate.front_image || updatedTemplate.frontImage,
        backImage: updatedTemplate.back_image || updatedTemplate.backImage,
        customFields: updatedTemplate.custom_fields || updatedTemplate.customFields || [],
        updated_at: new Date().toISOString(),
      };
      
      await createTemplate(templateToSave);
      
      toast({
        title: "Success",
        description: "Template saved successfully",
      })
      router.push("/dashboard/templates")
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: handleSupabaseError(error) || "Failed to save template",
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