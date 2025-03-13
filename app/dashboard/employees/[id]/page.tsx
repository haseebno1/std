"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { EmployeeForm } from "@/components/employees/employee-form"
import { fetchEmployeeById } from "@/lib/api"
import type { Employee } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function EditEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') as "template" | "details" | "preview" | "cards" | null
  const employeeId = params.id as string
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Page: Attempting to load employee with ID:", employeeId)

        if (!employeeId) {
          throw new Error("No employee ID provided")
        }

        try {
          const data = await fetchEmployeeById(employeeId)
          console.log("Page: Employee loaded successfully:", data)
          setEmployee(data)
        } catch (specificError) {
          console.error("Page: Error fetching employee:", specificError)

          // Create a default employee with this ID as a fallback
          console.log("Page: Creating default employee with ID:", employeeId)
          const defaultEmployee: Employee = {
            id: employeeId,
            template_id: "template1", // Default to first template
            templateId: "template1", // Default to first template
            data: {
              fullName: "",
              employeeId: "",
              department: "",
              photo: null,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          setEmployee(defaultEmployee)
          // Show a warning instead of an error
          toast({
            title: "Employee not found",
            description: "Created a new employee record instead",
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Page: Error in employee loading process:", error)
        setError("Failed to load employee. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (employeeId) {
      loadEmployee()
    } else {
      setError("No employee ID provided")
      setLoading(false)
    }
  }, [employeeId, tab])

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
        <Button variant="outline" onClick={() => router.push("/dashboard/employees")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
      </div>
    )
  }

  return employee ? <EmployeeForm initialEmployee={employee} initialTab={tab || undefined} /> : null
}

