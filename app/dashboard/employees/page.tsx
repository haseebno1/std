"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { EmployeeList } from "@/components/employees/employee-list"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { SkeletonGrid } from "@/components/ui/skeleton-card"
import { EmptyState } from "@/components/ui/empty-state"
import { fetchEmployees } from "@/lib/api"
import type { Employee } from "@/lib/types"

export default function EmployeesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchEmployees();
        setEmployees(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading employees:", error);
        setIsLoading(false);
      }
    };
    
    // Load data only once when the component mounts
    loadEmployees();
  }, []);
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your employee records and ID cards."
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button asChild>
            <Link href="/dashboard/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        </motion.div>
      </PageHeader>
      
      {isLoading ? (
        <SkeletonGrid count={6} hasFooter />
      ) : employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description="You haven't added any employees yet. Add your first employee to get started."
          actionLabel="Add Employee"
          actionIcon={Plus}
          onAction={() => window.location.href = "/dashboard/employees/new"}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmployeeList hideActions={true} initialEmployees={employees} />
        </motion.div>
      )}
    </div>
  )
} 