"use client"

import { useState, useEffect } from "react"
import { TemplateSelector } from "@/components/template-selector"
import { DynamicForm } from "@/components/dynamic-form"
import { CardPreview } from "@/components/card-preview"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams, useRouter } from "next/navigation"
import type { Template, EmployeeData, Employee } from "@/lib/types"
import { fetchTemplateById, fetchEmployeeById } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

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
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="template">Select Template</TabsTrigger>
          <TabsTrigger value="form" disabled={!selectedTemplate}>
            Employee Details
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedTemplate || Object.keys(employeeData).length === 0}>
            Preview & Download
          </TabsTrigger>
        </TabsList>

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
            <DynamicForm template={selectedTemplate} initialData={employeeData} onSubmit={handleFormSubmit} />
          )}
        </TabsContent>

        <TabsContent value="preview" className="p-6">
          {selectedTemplate && Object.keys(employeeData).length > 0 && (
            <div className="space-y-6">
              <CardPreview template={selectedTemplate} employeeData={employeeData} />
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  Start Over
                </Button>
                <Button onClick={() => setActiveTab("form")}>Edit Details</Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

