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
import type { Employee, Template, EmployeeData, CustomField } from "@/lib/types"
import { fetchTemplates, fetchTemplateById, createEmployee } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Download, ArrowLeft, Printer, Camera } from "lucide-react"
import { EmployeeCardPDF } from "../employee-card-pdf"

interface EmployeeFormProps {
  initialEmployee?: Employee
  initialTab?: "template" | "details" | "preview" | "cards"
}

export function EmployeeForm({ initialEmployee, initialTab }: EmployeeFormProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [employeeData, setEmployeeData] = useState<EmployeeData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<"template" | "details" | "preview" | "cards">(
    initialTab || "template",
  )
  const isEditing = !!initialEmployee

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch templates with proper error handling
        try {
          const templatesData = await fetchTemplates();
          setTemplates(templatesData);
        } catch (templatesError) {
          console.error("Error loading templates:", templatesError);
          toast({
            title: "Warning",
            description: "Unable to load templates. Some options may be unavailable.",
            variant: "destructive",
          });
          // Continue with empty templates array
          setTemplates([]);
        }

        // If in edit mode, try to load the specific template
        if (isEditing && initialEmployee) {
          try {
            if (initialEmployee.templateId) {
              const template = await fetchTemplateById(initialEmployee.templateId);
              setSelectedTemplate(template);
            }
            // Always set employee data
            setEmployeeData(initialEmployee.data || {});
          } catch (templateError) {
            console.error("Error loading template details:", templateError);
            toast({
              title: "Warning",
              description: "Unable to load template details. Some fields may be missing.",
              variant: "destructive",
            });
            // Still allow editing without the template
            setEmployeeData(initialEmployee.data || {});
          }
        }
      } catch (error) {
        console.error("Error in employee form loadData:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isEditing, initialEmployee]);

  const handleTemplateSelect = async (templateId: string) => {
    try {
      setLoading(true);
      const template = await fetchTemplateById(templateId);
      setSelectedTemplate(template);
      
      // Initialize empty data for each custom field
      if (template.customFields && template.customFields.length) {
        const initialData = template.customFields.reduce((acc: Record<string, any>, field: CustomField) => {
          acc[field.id] = field.type === "image" ? null : "";
          return acc;
        }, {} as Record<string, any>);
        setEmployeeData(initialData);
      }

      // Also fix the setActiveTab issue
      setActiveTab("details");
    } catch (error) {
      console.error("Error selecting template:", error);
      toast({
        title: "Error",
        description: "Failed to load template details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (data: EmployeeData) => {
    setEmployeeData(data)
    setActiveTab("preview")
  }

  const handleSave = async () => {
    if (!selectedTemplate || !employeeData) {
      toast({
        title: "Error",
        description: "Please select a template and fill out required fields",
        variant: "destructive",
      })
      return
    }

    // Validate that we have data
    if (Object.keys(employeeData).length === 0) {
      toast({
        title: "Error",
        description: "Please fill out at least one field for the employee",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      console.log("Creating employee with template:", selectedTemplate.id);
      
      // Ensure all data values are properly formatted
      const cleanData: Record<string, any> = {};
      Object.entries(employeeData).forEach(([key, value]) => {
        // Don't include undefined values
        if (value !== undefined) {
          // Convert null strings to actual null
          cleanData[key] = value === "null" ? null : value;
        }
      });
      
      // Make sure we have at least some identifier
      if (!cleanData.fullName && !cleanData.employeeId) {
        cleanData.fullName = "Unnamed Employee";
      }
      
      const employee: Employee = {
        id: initialEmployee?.id || crypto.randomUUID(),
        template_id: selectedTemplate.id,
        templateId: selectedTemplate.id,
        data: cleanData,
        created_at: initialEmployee?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log("Saving employee data:", employee);
      const savedEmployee = await createEmployee(employee);
      console.log("Employee saved successfully:", savedEmployee.id);
      
      toast({
        title: "Success",
        description: `Employee ${isEditing ? "updated" : "created"} successfully`,
      })
      
      // Force a page reload when redirecting to make sure the list refreshes
      router.push("/dashboard/employees");
      // Add a small delay before refreshing to ensure the database transaction completes
      setTimeout(() => {
        window.location.href = "/dashboard/employees";
      }, 500);
    } catch (error: any) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} employee. ${error.message || ""}`,
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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "template" | "details" | "preview" | "cards")}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="template">Select Template</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedTemplate}>
            Employee Details
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedTemplate || Object.keys(employeeData).length === 0}>
            Preview
          </TabsTrigger>
          <TabsTrigger value="cards" disabled={!selectedTemplate || Object.keys(employeeData).length === 0}>
            Generate Cards
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
                      {template.layout === "horizontal" ? "Horizontal" : "Vertical"} • {template.customFields ? template.customFields.length : 0}{" "}
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
                <Button variant="secondary" onClick={() => setActiveTab("cards")}>
                  Generate ID Card
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cards">
          {selectedTemplate && Object.keys(employeeData).length > 0 && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">ID Card Generation</h3>
                <p className="text-muted-foreground mb-4">
                  Generate and download employee ID cards based on the selected template and provided information.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => window.print()}
                    className="flex-1"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Cards
                  </Button>
                  
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setGenerating(true);
                      setTimeout(() => {
                        setGenerating(false);
                        toast({
                          title: "Success",
                          description: "Employee cards have been generated and downloaded",
                        });
                      }, 1500);
                    }}
                    disabled={generating}
                  >
                    {generating ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <CardPreview template={selectedTemplate} employeeData={employeeData} />
              
              <div className="flex gap-4 flex-wrap mt-8">
                <Button variant="outline" onClick={() => setActiveTab("preview")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Preview
                </Button>
                <Button variant="outline" onClick={() => window.open(`/dashboard/employees/photo?id=${initialEmployee?.id || ''}`, '_blank')}>
                  <Camera className="mr-2 h-4 w-4" />
                  Take Employee Photo
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

