"use client"

import { useState, useEffect } from "react"
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const templates = [
  {
    id: "template1",
    name: "Corporate ID Card",
    client: "Acme Corporation",
    brand: "Corporate",
    status: "active",
    updatedAt: "2 days ago"
  },
  {
    id: "template2",
    name: "Event Staff Badge",
    client: "Globex Inc.",
    brand: "Marketing",
    status: "active",
    updatedAt: "1 week ago"
  },
  {
    id: "template3",
    name: "Security Access Card",
    client: "Umbrella Corp",
    brand: "IT Department",
    status: "draft",
    updatedAt: "3 days ago"
  },
  {
    id: "template4",
    name: "Visitor Pass",
    client: "Acme Corporation",
    brand: "Security",
    status: "archived",
    updatedAt: "2 months ago"
  },
  {
    id: "template5",
    name: "Contractor Badge",
    client: "Globex Inc.",
    brand: "HR",
    status: "active",
    updatedAt: "1 day ago"
  }
]

export function RecentTemplatesTable() {
  const [loaded, setLoaded] = useState(false)
  
  useEffect(() => {
    setLoaded(true)
  }, [])
  
  return (
    <Card>
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template, index) => (
              <motion.tr
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: loaded ? 1 : 0,
                  y: loaded ? 0 : 10 
                }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.2
                }}
                className="transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  <Link href={`/dashboard/templates/${template.id}`} className="hover:underline">
                    {template.name}
                  </Link>
                </TableCell>
                <TableCell>{template.client}</TableCell>
                <TableCell>{template.brand}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={cn(
                      "px-2 py-0.5",
                      template.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100" :
                      template.status === "draft" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100" :
                      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    )}
                  >
                    {template.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {template.updatedAt}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
} 