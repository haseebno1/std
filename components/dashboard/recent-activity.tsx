"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Building2, 
  Briefcase, 
  LayoutTemplate, 
  Plus, 
  Edit, 
  Trash2 
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Activity types
type ActivityType = "create" | "update" | "delete"
type EntityType = "client" | "brand" | "template" | "employee"

interface Activity {
  id: string
  type: ActivityType
  entityType: EntityType
  entityId: string
  entityName: string
  timestamp: Date
  user: {
    name: string
    avatar?: string
    initials: string
  }
  details?: string
}

export function RecentActivityTable() {
  const [activities, setActivities] = useState<Activity[]>([])
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use mock data
    const mockActivities: Activity[] = [
      {
        id: "act-1",
        type: "create",
        entityType: "client",
        entityId: "client-1",
        entityName: "Acme Corporation",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        user: {
          name: "Admin User",
          initials: "AU"
        }
      },
      {
        id: "act-2",
        type: "create",
        entityType: "brand",
        entityId: "brand-1",
        entityName: "Corporate",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        user: {
          name: "Admin User",
          initials: "AU"
        },
        details: "Client: Acme Corporation"
      },
      {
        id: "act-3",
        type: "create",
        entityType: "template",
        entityId: "template-1",
        entityName: "Corporate ID Card",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        user: {
          name: "Admin User",
          initials: "AU"
        },
        details: "Brand: Corporate"
      },
      {
        id: "act-4",
        type: "update",
        entityType: "template",
        entityId: "template-2",
        entityName: "Event Staff Badge",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        user: {
          name: "Admin User",
          initials: "AU"
        },
        details: "Updated layout and fields"
      },
      {
        id: "act-5",
        type: "create",
        entityType: "employee",
        entityId: "emp-1",
        entityName: "John Smith",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        user: {
          name: "Admin User",
          initials: "AU"
        },
        details: "Department: Marketing"
      },
      {
        id: "act-6",
        type: "delete",
        entityType: "brand",
        entityId: "brand-old",
        entityName: "Old Brand",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        user: {
          name: "Admin User",
          initials: "AU"
        },
        details: "Client: Globex Inc."
      },
    ]
    
    setActivities(mockActivities)
  }, [])
  
  const getActivityIcon = (activity: Activity) => {
    const iconProps = { className: "h-4 w-4" }
    
    // First determine the entity type icon
    let EntityIcon
    switch (activity.entityType) {
      case "client":
        EntityIcon = Building2
        break
      case "brand":
        EntityIcon = Briefcase
        break
      case "template":
        EntityIcon = LayoutTemplate
        break
      case "employee":
        EntityIcon = Users
        break
    }
    
    // Then determine the action icon
    let ActionIcon
    switch (activity.type) {
      case "create":
        ActionIcon = Plus
        break
      case "update":
        ActionIcon = Edit
        break
      case "delete":
        ActionIcon = Trash2
        break
    }
    
    return (
      <div className="flex items-center gap-1">
        <EntityIcon {...iconProps} />
        <ActionIcon {...iconProps} className="h-3 w-3" />
      </div>
    )
  }
  
  const getActivityBadge = (activity: Activity) => {
    let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "info" = "outline"
    let displayLabel = ""
    
    switch (activity.type) {
      case "create":
        variant = "success"
        displayLabel = "Created"
        break
      case "update":
        variant = "info"
        displayLabel = "Updated"
        break
      case "delete":
        variant = "destructive"
        displayLabel = "Deleted"
        break
    }
    
    return <Badge variant={variant}>{displayLabel}</Badge>
  }
  
  const getEntityLink = (activity: Activity) => {
    let href = "#"
    
    switch (activity.entityType) {
      case "client":
        href = `/dashboard/clients/${activity.entityId}`
        break
      case "brand":
        href = `/dashboard/brands/${activity.entityId}`
        break
      case "template":
        href = `/dashboard/templates/editor?id=${activity.entityId}`
        break
      case "employee":
        href = `/dashboard/employees/${activity.entityId}`
        break
    }
    
    // Don't create links for deleted entities
    if (activity.type === "delete") {
      return <span className="text-muted-foreground">{activity.entityName}</span>
    }
    
    return (
      <Link href={href} className="font-medium text-primary hover:underline">
        {activity.entityName}
      </Link>
    )
  }
  
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 60) {
      return "just now"
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }
  
  const getEntityTypeLabel = (type: EntityType) => {
    switch (type) {
      case "client":
        return "Client"
      case "brand":
        return "Brand"
      case "template":
        return "Template"
      case "employee":
        return "Employee"
    }
  }
  
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No recent activity found
              </TableCell>
            </TableRow>
          ) : (
            activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  {getActivityBadge(activity)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity)}
                    <span>{getEntityTypeLabel(activity.entityType)}</span>
                  </div>
                </TableCell>
                <TableCell>{getEntityLink(activity)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {activity.details || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {activity.user.avatar && (
                        <img src={activity.user.avatar} alt={activity.user.name} />
                      )}
                      <AvatarFallback className="text-xs">
                        {activity.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{activity.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatTimestamp(activity.timestamp)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <div className="flex justify-center p-4">
        <Button variant="outline" size="sm">
          View All Activity
        </Button>
      </div>
    </div>
  )
} 