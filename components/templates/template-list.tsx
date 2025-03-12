"use client"

import { useState, useEffect } from "react"
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
import { Plus, Search, MoreVertical, Edit, Copy, Trash2, FileIcon as FileTemplate } from "lucide-react"
import { fetchTemplates, fetchClients, fetchBrands, deleteTemplate } from "@/lib/api"
import type { Template, Client, Brand } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

function TemplateList() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"grid" | "table">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [templatesData, clientsData, brandsData] = await Promise.all([
          fetchTemplates(),
          fetchClients(),
          fetchBrands(),
        ])
        setTemplates(templatesData)
        setClients(clientsData)
        setBrands(brandsData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load templates",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClient = !selectedClient || template.clientId === selectedClient
    const matchesBrand = !selectedBrand || template.brandId === selectedBrand
    return matchesSearch && matchesClient && matchesBrand
  })

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return

    try {
      await deleteTemplate(templateToDelete)
      setTemplates((prev) => prev.filter((template) => template.id !== templateToDelete))
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  const handleEditTemplate = (templateId: string) => {
    console.log("List: Navigating to edit template with ID:", templateId)
    console.log("List: Type of templateId:", typeof templateId)

    // Use direct navigation with the router to ensure proper ID handling
    router.push(`/dashboard/templates/${encodeURIComponent(templateId)}`)
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : "Unknown Client"
  }

  const getBrandName = (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId)
    return brand ? brand.name : "Unknown Brand"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">Manage your card templates</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedClient || ""}
          onValueChange={(value) => {
            setSelectedClient(value === "" ? null : value)
            setSelectedBrand(null)
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedBrand || ""}
          onValueChange={(value) => setSelectedBrand(value === "" ? null : value)}
          disabled={!selectedClient}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands
              .filter((brand) => !selectedClient || brand.clientId === selectedClient)
              .map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
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
                    <CardHeader className="p-0">
                      <Skeleton className="h-48 rounded-t-lg" />
                    </CardHeader>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <FileTemplate className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">No templates found</h2>
              <p className="mt-2 text-center text-muted-foreground">
                {searchQuery || selectedClient || selectedBrand
                  ? "Try adjusting your search or filters"
                  : "Get started by creating a new template"}
              </p>
              {!searchQuery && !selectedClient && !selectedBrand && (
                <Button asChild className="mt-6">
                  <Link href="/dashboard/templates/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="aspect-[1.5/1] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <img
                        src={template.frontImage || "/placeholder.svg"}
                        alt={template.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                          {getClientName(template.clientId)} • {getBrandName(template.brandId)}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTemplate(template.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setTemplateToDelete(template.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span className="capitalize">{template.layout}</span>
                      <span className="mx-2">•</span>
                      <span>{template.customFields.length} fields</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" className="w-full" onClick={() => handleEditTemplate(template.id)}>
                      Edit Template
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
                  <TableHead>Client</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Layout</TableHead>
                  <TableHead>Fields</TableHead>
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
                          <Skeleton className="h-5 w-[180px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[50px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-9 w-9" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{getClientName(template.clientId)}</TableCell>
                      <TableCell>{getBrandName(template.brandId)}</TableCell>
                      <TableCell className="capitalize">{template.layout}</TableCell>
                      <TableCell>{template.customFields.length}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTemplate(template.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setTemplateToDelete(template.id)
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
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Export both as named export and default export
export { TemplateList }
export default TemplateList

