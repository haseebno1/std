"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function GeneratePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const employeeId = searchParams.get("employee")

  useEffect(() => {
    // If an employee ID is provided, redirect to the employee page with the cards tab
    if (employeeId) {
      router.replace(`/dashboard/employees/${employeeId}?tab=cards`)
    } else {
      // Otherwise, redirect to the employees list
      router.replace("/dashboard/employees")
    }
  }, [employeeId, router])

  // Show a loading state while redirecting
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-1/3" />
      <p className="text-muted-foreground">Redirecting to the new employee card generation page...</p>
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}

