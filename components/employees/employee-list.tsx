"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, MoreVertical, Edit, Trash2, Users, Printer } from "lucide-react"
import { fetchEmployees, fetchTemplates, deleteEmployee } from "@/lib/api"
import type { Employee, Template } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface EmployeeListProps {
  hideActions?: boolean;
  initialEmployees?: Employee[];
}

function EmployeeList({ hideActions = false, initialEmployees }: EmployeeListProps) {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees || [])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(!initialEmployees)
  const [view, setView] = useState<"grid" | "table">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)

  // Add a cache reference to prevent repeated fetches
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Avoid duplicate fetches
    if (fetchedRef.current && !initialEmployees) return;
    
    const loadData = async () => {
      try {
        // First load employees to ensure we have that data even if templates fail
        if (!initialEmployees) {
          try {
            const employeesData = await fetchEmployees();
            setEmployees(employeesData);
          } catch (employeeError) {
            console.error("Error loading employees:", employeeError);
            toast({
              title: "Error",
              description: "Failed to load employee data",
              variant: "destructive",
            });
          }
        }
        
        // Fetch templates separately with error handling
        try {
          const templatesData = await fetchTemplates();
          setTemplates(templatesData);
        } catch (templateError: any) {
          // Continue without templates - we'll just show "Unknown Template"
          console.error("Template error:", templateError.message || "Unknown error");
          setTemplates([]);
        }
        
        setLoading(false);
        fetchedRef.current = true;
      } catch (error) {
        console.error("Error in loadData:", error);
        setLoading(false);
        fetchedRef.current = true;
      }
    }
    
    loadData();
  }, [initialEmployees]);

  const filteredEmployees = employees.filter((employee) => {
    // Safety check for employee data
    if (!employee.data) {
      return false;
    }
    
    const matchesSearch =
      searchQuery === "" || // If no search query, include all
      getPrimaryName(employee).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getEmployeeId(employee).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getEmployeePosition(employee).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTemplate = !selectedTemplate || employee.templateId === selectedTemplate || employee.template_id === selectedTemplate;

    return matchesSearch && matchesTemplate
  })

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return

    try {
      await deleteEmployee(employeeToDelete)
      setEmployees((prev) => prev.filter((employee) => employee.id !== employeeToDelete))
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      })
    }
  }

  const getTemplateName = (templateId: string | undefined) => {
    if (!templateId) return "Unknown Template";
    const template = templates.find((t) => t.id === templateId);
    return template ? template.name : "Unknown Template";
  }

  // Find primary fields (name and photo) in employee data
  const getPrimaryName = (employee: Employee) => {
    // First check if there's a custom field with type "name"
    const nameField = Object.entries(employee.data || {}).find(
      ([key, value]) => {
        const fieldKey = key.toLowerCase();
        return fieldKey.includes('name') || 
              fieldKey === 'fullname' || 
              fieldKey === 'employee_name' ||
              fieldKey === 'employeename';
      }
    );
    
    return nameField 
      ? nameField[1]?.toString() 
      : employee.data?.fullName?.toString() || "Unnamed Employee";
  };

  const getEmployeePhoto = (employee: Employee) => {
    // Find photo field in employee data
    const photoField = Object.entries(employee.data || {}).find(
      ([key, value]) =>
        typeof value === "string" && 
        (value.startsWith("data:image") || 
         key.toLowerCase().includes("photo") || 
         key.toLowerCase().includes("image") ||
         key.toLowerCase().includes("picture")),
    );

    return photoField ? photoField[1] : null;
  };

  const getEmployeeInitials = (employee: Employee) => {
    const fullName = getPrimaryName(employee);
    const nameParts = fullName.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getEmployeePosition = (employee: Employee) => {
    // Look for position-related fields in a priority order
    const positionKeys = ['jobTitle', 'job_title', 'position', 'role', 'department'];
    
    for (const key of positionKeys) {
      if (employee.data?.[key]) {
        return employee.data[key].toString();
      }
    }
    
    // Check for any key that might contain position-related terms
    const positionField = Object.entries(employee.data || {}).find(
      ([key, value]) => {
        const fieldKey = key.toLowerCase();
        return fieldKey.includes('title') || 
               fieldKey.includes('position') || 
               fieldKey.includes('role') ||
               fieldKey.includes('department');
      }
    );
    
    return positionField 
      ? positionField[1]?.toString() 
      : "No position";
  };

  const getEmployeeId = (employee: Employee) => {
    // Look for ID-related fields
    const idKeys = ['employeeId', 'employee_id', 'id', 'badgeNumber', 'badge_number'];
    
    for (const key of idKeys) {
      if (employee.data?.[key]) {
        return employee.data[key].toString();
      }
    }
    
    // Check for any key that might contain ID-related terms
    const idField = Object.entries(employee.data || {}).find(
      ([key, value]) => {
        const fieldKey = key.toLowerCase();
        return fieldKey.includes('id') || 
               fieldKey.includes('number') || 
               fieldKey.includes('badge');
      }
    );
    
    return idField 
      ? idField[1]?.toString() 
      : "N/A";
  };

  return (
    <div className="space-y-6">
      {!hideActions && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-muted-foreground">Manage your employee records</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedTemplate || ""}
          onValueChange={(value) => setSelectedTemplate(value === "" ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Templates" />
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
      </div>

      <Tabs value={view} onValueChange={(value) => setView(value as "grid" | "table")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">No employees found</h2>
              <p className="mt-2 text-center text-muted-foreground">
                {searchQuery || selectedTemplate
                  ? "Try adjusting your search or filters"
                  : "Get started by adding a new employee"}
              </p>
              {!searchQuery && !selectedTemplate && (
                <Button asChild className="mt-6">
                  <Link href="/dashboard/employees/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id}>
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={getEmployeePhoto(employee) || ""}
                        alt={getPrimaryName(employee)}
                      />
                      <AvatarFallback>{getEmployeeInitials(employee)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {getPrimaryName(employee)}
                      </CardTitle>
                      <CardDescription>
                        {getEmployeePosition(employee)}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-auto">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/${employee.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/${employee.id}?tab=cards`)}>
                          <Printer className="mr-2 h-4 w-4" />
                          Generate Card
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setEmployeeToDelete(employee.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Employee ID</div>
                      <div>{getEmployeeId(employee)}</div>
                      <div className="text-muted-foreground">Template</div>
                      <div>{getTemplateName(employee.templateId || employee.template_id)}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`/dashboard/employees/${employee.id}?tab=cards`)}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Generate Card
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-5 w-[140px]" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-9 w-9" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={getEmployeePhoto(employee) || ""}
                              alt={getPrimaryName(employee)}
                            />
                            <AvatarFallback>{getEmployeeInitials(employee)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {getPrimaryName(employee)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getEmployeeId(employee)}</TableCell>
                      <TableCell>
                        {getEmployeePosition(employee)}
                      </TableCell>
                      <TableCell>{getTemplateName(employee.templateId || employee.template_id)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/${employee.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/${employee.id}?tab=cards`)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Generate Card
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setEmployeeToDelete(employee.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Export both as named export and default export
export { EmployeeList }
export default EmployeeList

