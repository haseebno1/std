"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, FileUp, Printer, Search } from "lucide-react"
import type { Template, Employee } from "@/lib/types"
import { fetchTemplates, fetchEmployees } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function BatchGenerator() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"select" | "generate">("select")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [templatesData, employeesData] = await Promise.all([fetchTemplates(), fetchEmployees()])
        setTemplates(templatesData)
        setEmployees(employeesData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Filter employees by selected template
    if (selectedTemplate) {
      setSelectedEmployees([])
      setSelectAll(false)
    }
  }, [selectedTemplate])

  const filteredEmployees = selectedTemplate
    ? employees.filter((employee) => employee.templateId === selectedTemplate)
    : employees

  const searchFilteredEmployees = filteredEmployees.filter((employee) => {
    const fullName = employee.data.fullName?.toString().toLowerCase() || ""
    const employeeId = employee.data.employeeId?.toString().toLowerCase() || ""
    const department = employee.data.department?.toString().toLowerCase() || ""

    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      employeeId.includes(searchQuery.toLowerCase()) ||
      department.includes(searchQuery.toLowerCase())
    )
  })

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(searchFilteredEmployees.map((employee) => employee.id))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectEmployee = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId))
      setSelectAll(false)
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId])
      if (selectedEmployees.length + 1 === searchFilteredEmployees.length) {
        setSelectAll(true)
      }
    }
  }

  const handleGenerateCards = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    setProgress(0)
    setGeneratedFiles([])
    setActiveTab("generate")

    try {
      // Simulate batch generation with progress
      const selectedEmployeeData = employees.filter((employee) => selectedEmployees.includes(employee.id))

      const totalEmployees = selectedEmployeeData.length
      let processed = 0

      const files = []

      for (const employee of selectedEmployeeData) {
        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 500))

        processed++
        setProgress(Math.floor((processed / totalEmployees) * 100))

        // In a real app, this would generate actual files
        const fileName = `${employee.data.fullName?.toString().replace(/\s+/g, "-").toLowerCase() || "employee"}-card.pdf`
        files.push(fileName)
      }

      setGeneratedFiles(files)

      toast({
        title: "Success",
        description: `Generated ${files.length} employee cards`,
      })
    } catch (error) {
      console.error("Error generating cards:", error)
      toast({
        title: "Error",
        description: "Failed to generate cards",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
      setProgress(100)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This would handle CSV upload in a real application
    toast({
      title: "CSV Upload",
      description: "CSV upload functionality would be implemented here",
    })
  }

  const getTemplateName = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    return template ? template.name : "Unknown Template"
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "select" | "generate")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="select">Select Employees</TabsTrigger>
          <TabsTrigger value="generate" disabled={selectedEmployees.length === 0}>
            Generate Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Template and Employees</CardTitle>
              <CardDescription>Choose a template and select employees for batch card generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedTemplate || ""}
                    onValueChange={(value) => setSelectedTemplate(value === "" ? null : value)}
                  >
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Templates</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Employees</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search employees..."
                        className="pl-8 w-[200px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="selectAll"
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        disabled={searchFilteredEmployees.length === 0}
                      />
                      <Label htmlFor="selectAll">Select All</Label>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 rounded-md p-2">
                          <Skeleton className="h-5 w-5" />
                          <div className="space-y-1">
                            <Skeleton className="h-5 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : searchFilteredEmployees.length === 0 ? (
                  <div className="rounded-md border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">
                      {selectedTemplate
                        ? "No employees found for the selected template."
                        : "Please select a template to view employees."}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-md p-2">
                    {searchFilteredEmployees.map((employee) => (
                      <div key={employee.id} className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
                        <Checkbox
                          id={`employee-${employee.id}`}
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={() => handleSelectEmployee(employee.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`employee-${employee.id}`} className="font-medium cursor-pointer">
                            {employee.data.fullName?.toString() || "Unnamed Employee"}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {employee.data.employeeId ? `ID: ${employee.data.employeeId}` : ""}{" "}
                            {employee.data.department ? `• Dept: ${employee.data.department}` : ""}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">{getTemplateName(employee.templateId)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Input type="file" id="csvUpload" className="hidden" accept=".csv" onChange={handleFileUpload} />
                  <Button variant="outline" onClick={() => document.getElementById("csvUpload")?.click()}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Or upload a CSV file with employee IDs</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">{selectedEmployees.length} employees selected</div>
              <Button onClick={handleGenerateCards} disabled={selectedEmployees.length === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Generate Cards
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Generation</CardTitle>
              <CardDescription>Generating cards for {selectedEmployees.length} employees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {generatedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Generated Files</h3>
                  <div className="max-h-[300px] overflow-y-auto border rounded-md">
                    {generatedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-accent">
                        <span className="text-sm">{file}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("select")} disabled={generating}>
                Back to Selection
              </Button>
              {generatedFiles.length > 0 && (
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BatchGenerator

