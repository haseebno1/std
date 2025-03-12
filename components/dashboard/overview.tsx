"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileIcon as FileTemplate, Users, Building2, Briefcase, Printer, ArrowRight, Plus } from "lucide-react"
import {
  fetchTemplatesCount,
  fetchClientsCount,
  fetchBrandsCount,
  fetchEmployeesCount,
  fetchRecentActivity,
} from "@/lib/api"
import type { Activity } from "@/lib/types"

export function DashboardOverview() {
  const [stats, setStats] = useState({
    templates: 0,
    clients: 0,
    brands: 0,
    employees: 0,
  })
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [templates, clients, brands, employees, activity] = await Promise.all([
          fetchTemplatesCount(),
          fetchClientsCount(),
          fetchBrandsCount(),
          fetchEmployeesCount(),
          fetchRecentActivity(),
        ])

        setStats({
          templates,
          clients,
          brands,
          employees,
        })
        setRecentActivity(activity)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your employee card generation system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Templates"
          value={stats.templates}
          icon={<FileTemplate className="h-5 w-5" />}
          href="/dashboard/templates"
          loading={loading}
        />
        <StatCard
          title="Clients"
          value={stats.clients}
          icon={<Building2 className="h-5 w-5" />}
          href="/dashboard/clients"
          loading={loading}
        />
        <StatCard
          title="Brands"
          value={stats.brands}
          icon={<Briefcase className="h-5 w-5" />}
          href="/dashboard/brands"
          loading={loading}
        />
        <StatCard
          title="Employees"
          value={stats.employees}
          icon={<Users className="h-5 w-5" />}
          href="/dashboard/employees"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform right away</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-between">
              <Link href="/dashboard/templates/new">
                <div className="flex items-center">
                  <FileTemplate className="mr-2 h-4 w-4" />
                  <span>Create New Template</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link href="/dashboard/employees/new">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Add New Employee</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link href="/dashboard/generate">
                <div className="flex items-center">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Generate Cards</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link href="/dashboard/batch">
                <div className="flex items-center">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Batch Generation</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 rounded-md p-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="space-y-2">
                        <div className="h-4 w-[200px] rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-[150px] rounded bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 rounded-md">
                    <div className="mt-1">
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              View All Activity
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  href: string
  loading?: boolean
}

function StatCard({ title, value, icon, href, loading = false }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-7 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link href={href}>View All</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "template":
      return <FileTemplate className="h-5 w-5 text-blue-500" />
    case "employee":
      return <Users className="h-5 w-5 text-green-500" />
    case "client":
      return <Building2 className="h-5 w-5 text-purple-500" />
    case "brand":
      return <Briefcase className="h-5 w-5 text-orange-500" />
    case "card":
      return <Printer className="h-5 w-5 text-red-500" />
    default:
      return <Plus className="h-5 w-5" />
  }
}

