"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { TemplateForm } from "@/components/templates/template-form"
import { TemplateEditor } from "@/components/template-editor"
import { CardPreview } from "@/components/card-preview"
import { toast } from "@/components/ui/use-toast"
import type { Template } from "@/lib/types"
import { saveTemplate } from "@/lib/api"
import { getDefaultTemplateSvg, getDefaultTemplateSvgUrl } from "@/lib/utils"

export default function NewTemplatePage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState("info")
  const [template, setTemplate] = useState<Template | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleBasicInfoSubmit = (basicTemplate: Template) => {
    // Set the default SVG as the frontImage if not provided
    const updatedTemplate = {
      ...basicTemplate,
      frontImage: basicTemplate.frontImage || getDefaultTemplateSvgUrl()
    }
    setTemplate(updatedTemplate)
    setActiveStep("editor")
  }
  
  const handleEditorSubmit = (editedTemplate: Template) => {
    setTemplate(editedTemplate)
    setActiveStep("preview")
  }
  
  const handleSaveTemplate = async () => {
    if (!template) return
    
    try {
      setIsSubmitting(true)
      await saveTemplate(template)
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
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Create New Template</h1>
          <p className="text-muted-foreground">
            Create a new ID card template in three simple steps
          </p>
        </div>
      </div>
      
      <Tabs value={activeStep} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="info" 
            onClick={() => template && setActiveStep("info")}
            disabled={!template && activeStep !== "info"}
          >
            1. Basic Info
          </TabsTrigger>
          <TabsTrigger 
            value="editor" 
            onClick={() => template && setActiveStep("editor")}
            disabled={!template}
          >
            2. Design Template
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            onClick={() => template && activeStep === "preview" && setActiveStep("preview")}
            disabled={activeStep !== "preview"}
          >
            3. Preview & Save
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <Card className="p-6">
            <TemplateForm onSubmit={handleBasicInfoSubmit} initialTemplate={template || undefined} />
          </Card>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              form="template-basic-form"
              className="ml-auto"
            >
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="editor" className="space-y-4">
          {template && (
            <>
              <Card className="p-6">
                <TemplateEditor 
                  initialTemplate={template} 
                  onSave={handleEditorSubmit} 
                />
              </Card>
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveStep("info")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Info
                </Button>
                <Button 
                  type="button"
                  onClick={() => document.getElementById("save-template-editor-btn")?.click()}
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          {template && (
            <>
              <Card className="p-6">
                <CardPreview 
                  template={template} 
                  employeeData={{}} 
                />
              </Card>
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveStep("editor")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Editor
                </Button>
                <Button 
                  onClick={handleSaveTemplate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      Save Template
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

