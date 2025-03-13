"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TemplateSelector } from "@/components/template-selector"
import { DynamicForm } from "@/components/dynamic-form"
import { CardPreview } from "@/components/card-preview"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { useSearchParams, useRouter } from "next/navigation"
import type { Template, EmployeeData, Employee } from "@/lib/types"
import { fetchTemplateById, fetchEmployeeById } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function CardGenerator() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const employeeId = searchParams.get("employee")

  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [employeeData, setEmployeeData] = useState<EmployeeData>({})
  const [activeTab, setActiveTab] = useState("template")
  const [loading, setLoading] = useState(false)

  // Load employee data if employeeId is provided
  useEffect(() => {
    if (employeeId) {
      setLoading(true)
      fetchEmployeeById(employeeId)
        .then(async (employee: Employee) => {
          // Load the template for this employee
          const template = await fetchTemplateById(employee.templateId)

          setSelectedTemplate(template)
          setEmployeeData(employee.data)

          // Find client and brand for this template
          setSelectedClient(template.clientId)
          setSelectedBrand(template.brandId)

          // Go directly to the form tab
          setActiveTab("form")
        })
        .catch((error) => {
          console.error("Error loading employee:", error)
          toast({
            title: "Error",
            description: "Failed to load employee data",
            variant: "destructive",
          })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [employeeId])

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    // Initialize employee data with empty values for all template fields
    const initialData: EmployeeData = {}
    template.customFields.forEach((field) => {
      initialData[field.id] = field.type === "image" ? null : ""
    })
    setEmployeeData(initialData)
    setActiveTab("form")
  }

  const handleFormSubmit = (data: EmployeeData) => {
    setEmployeeData(data)
    setActiveTab("preview")
  }

  const handleReset = () => {
    // Clear the employee parameter from the URL
    if (employeeId) {
      router.push("/dashboard/generate")
    }

    setSelectedClient(null)
    setSelectedBrand(null)
    setSelectedTemplate(null)
    setEmployeeData({})
    setActiveTab("template")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-8">
              <Skeleton className="h-8 w-64" />
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="aspect-[1.586/1] rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-none bg-card dark:bg-card">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 gap-4 bg-muted/50 p-2 rounded-none border-b">
            <TabsTrigger 
              value="template" 
              className="data-[state=active]:bg-background dark:data-[state=active]:bg-background"
            >
              Select Template
            </TabsTrigger>
            <TabsTrigger 
              value="form" 
              disabled={!selectedTemplate}
              className="data-[state=active]:bg-background dark:data-[state=active]:bg-background"
            >
              Employee Details
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              disabled={!selectedTemplate || Object.keys(employeeData).length === 0}
              className="data-[state=active]:bg-background dark:data-[state=active]:bg-background"
            >
              Preview & Download
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="template" className="p-6">
                <TemplateSelector
                  onSelectClient={setSelectedClient}
                  onSelectBrand={setSelectedBrand}
                  onSelectTemplate={handleTemplateSelect}
                  selectedClient={selectedClient}
                  selectedBrand={selectedBrand}
                />
              </TabsContent>

              <TabsContent value="form" className="p-6">
                {selectedTemplate && (
                  <div className="space-y-6">
                    <DynamicForm 
                      template={selectedTemplate} 
                      initialData={employeeData} 
                      onSubmit={handleFormSubmit} 
                    />
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("template")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Templates
                      </Button>
                      <Button type="submit" form="employee-form">
                        Preview Card
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="p-6">
                {selectedTemplate && Object.keys(employeeData).length > 0 && (
                  <div className="space-y-6">
                    <CardPreview template={selectedTemplate} employeeData={employeeData} />
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Start Over
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("form")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Edit Details
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </Card>
    </motion.div>
  )
}

