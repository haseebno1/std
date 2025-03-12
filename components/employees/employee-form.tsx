"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DynamicForm } from "@/components/dynamic-form"
import { CardPreview } from "@/components/card-preview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Employee, Template, EmployeeData } from "@/lib/types"
import { fetchTemplates, fetchTemplateById, saveEmployee } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface EmployeeFormProps {
  initialEmployee?: Employee
}

export function EmployeeForm({ initialEmployee }: EmployeeFormProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [employeeData, setEmployeeData] = useState<EmployeeData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"template" | "details" | "preview">(
    initialEmployee ? "details" : "template",
  )
  const isEditing = !!initialEmployee

  useEffect(() => {
    const loadData = async () => {
      try {
        const templatesData = await fetchTemplates()
        setTemplates(templatesData)

        if (isEditing && initialEmployee) {
          const template = await fetchTemplateById(initialEmployee.templateId)
          setSelectedTemplate(template)
          setEmployeeData(initialEmployee.data)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isEditing, initialEmployee])

  const handleTemplateSelect = async (templateId: string) => {
    try {
      const template = await fetchTemplateById(templateId)
      setSelectedTemplate(template)

      // Initialize employee data with empty values for all template fields
      const initialData: EmployeeData = {}
      template.customFields.forEach((field) => {
        initialData[field.id] = field.type === "image" ? null : ""
      })
      setEmployeeData(initialData)

      setActiveTab("details")
    } catch (error) {
      console.error("Error loading template:", error)
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = (data: EmployeeData) => {
    setEmployeeData(data)
    setActiveTab("preview")
  }

  const handleSave = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const employee: Employee = {
        id: initialEmployee?.id || `employee-${Date.now()}`,
        templateId: selectedTemplate.id,
        data: employeeData,
      }

      await saveEmployee(employee)
      toast({
        title: "Success",
        description: `Employee ${isEditing ? "updated" : "created"} successfully`,
      })
      router.push("/dashboard/employees")
    } catch (error) {
      console.error("Error saving employee:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} employee`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? "Edit Employee" : "Add Employee"}</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update employee information" : "Create a new employee record"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/employees")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !selectedTemplate || Object.keys(employeeData).length === 0}>
            {saving ? "Saving..." : isEditing ? "Update Employee" : "Save Employee"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "template" | "details" | "preview")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="template">Select Template</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedTemplate}>
            Employee Details
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedTemplate || Object.keys(employeeData).length === 0}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateSelect">Select Template</Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedTemplate?.id || ""} onValueChange={handleTemplateSelect}>
                  <SelectTrigger id="templateSelect">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-lg" />
                  ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-primary ${
                      selectedTemplate?.id === template.id ? "border-2 border-primary" : ""
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="aspect-[1.5/1] bg-gray-100 dark:bg-gray-800 rounded-md mb-4 overflow-hidden">
                      <img
                        src={template.frontImage || "/placeholder.svg"}
                        alt={template.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.layout === "horizontal" ? "Horizontal" : "Vertical"} • {template.customFields.length}{" "}
                      fields
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("details")}>Continue to Employee Details</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          {selectedTemplate && (
            <DynamicForm template={selectedTemplate} initialData={employeeData} onSubmit={handleFormSubmit} />
          )}
        </TabsContent>

        <TabsContent value="preview">
          {selectedTemplate && Object.keys(employeeData).length > 0 && (
            <div className="space-y-6">
              <CardPreview template={selectedTemplate} employeeData={employeeData} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveTab("details")}>
                  Back to Details
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : isEditing ? "Update Employee" : "Save Employee"}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

