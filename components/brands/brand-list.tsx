"use client"

import { useState, useEffect } from "react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, MoreVertical, Edit, Trash2, Briefcase, Building2 } from "lucide-react"
import { fetchBrands, fetchClients, createBrand, deleteBrand } from "@/lib/api"
import type { Brand, Client } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface BrandListProps {
  hideActions?: boolean;
  clientFilter?: string;
  hideClientColumn?: boolean;
}

function BrandList({ hideActions = false, clientFilter, hideClientColumn = false }: BrandListProps) {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"grid" | "table">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null)
  const [newBrand, setNewBrand] = useState<{
    name: string
    clientId: string
  }>({
    name: "",
    clientId: "",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandsData, clientsData] = await Promise.all([
          clientFilter ? fetchBrands(clientFilter) : fetchBrands(), 
          fetchClients()
        ])
        setBrands(brandsData)
        setClients(clientsData)
        
        // If a client filter is provided, set it as the selected client
        if (clientFilter) {
          setSelectedClient(clientFilter)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [clientFilter])

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClient = !selectedClient || brand.clientId === selectedClient
    return matchesSearch && matchesClient
  })

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : "Unknown Client"
  }

  const handleAddBrand = async () => {
    if (!newBrand.name.trim() || !newBrand.clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // Generate a unique ID using a more stable approach
      const brandToAdd: Brand = {
        id: crypto.randomUUID(),
        name: newBrand.name,
        client_id: newBrand.clientId,
        clientId: newBrand.clientId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await createBrand(brandToAdd)
      setBrands([...brands, brandToAdd])
      setNewBrand({ name: "", clientId: "" })
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Brand added successfully",
      })
    } catch (error) {
      console.error("Error adding brand:", error)
      toast({
        title: "Error",
        description: "Failed to add brand",
        variant: "destructive",
      })
    }
  }

  const handleEditBrand = async () => {
    if (!currentBrand || !currentBrand.name.trim() || !currentBrand.clientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      await createBrand(currentBrand)
      setBrands(brands.map((brand) => (brand.id === currentBrand.id ? currentBrand : brand)))
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Brand updated successfully",
      })
    } catch (error) {
      console.error("Error updating brand:", error)
      toast({
        title: "Error",
        description: "Failed to update brand",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBrand = async () => {
    if (!currentBrand) return

    try {
      await deleteBrand(currentBrand.id)
      setBrands(brands.filter((brand) => brand.id !== currentBrand.id))
      setIsDeleteDialogOpen(false)
      toast({
        title: "Success",
        description: "Brand deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast({
        title: "Error",
        description: "Failed to delete brand",
        variant: "destructive",
      })
    }
  }

  const handleViewBrand = (brandId: string) => {
    router.push(`/dashboard/brands/${brandId}`)
  }

  return (
    <div className="space-y-6">
      {!hideActions && (
        <>
          <div className="flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search brands..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
            <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "table")} className="hidden md:block">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {!clientFilter && (
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={selectedClient || "all"}
                onValueChange={(value) => setSelectedClient(value === "all" ? null : value)}
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
      </div>
          )}
        </>
      )}

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
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Briefcase className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">No brands found</h2>
              <p className="mt-2 text-center text-muted-foreground">
                {searchQuery || selectedClient
                  ? "Try adjusting your search or filters"
                  : "Get started by adding a new brand"}
              </p>
              {!searchQuery && !selectedClient && !hideActions && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="mt-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Brand
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBrands.map((brand) => (
                <Card 
                  key={brand.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleViewBrand(brand.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Briefcase className="h-5 w-5" />
                        </div>
                      <div>
                          <CardTitle className="text-xl">{brand.name}</CardTitle>
                        </div>
                      </div>
                      {!hideActions && (
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentBrand(brand);
                                setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentBrand(brand);
                                setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      )}
                    </div>
                    <CardDescription className="mt-2 space-y-1">
                      <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">ID: {brand.id}</span>
                      {!hideClientColumn && (
                        <div className="flex items-center mt-1">
                          <Building2 className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{getClientName(brand.clientId)}</span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="bg-muted/30 pt-4">
                    <Button
                      variant="ghost"
                      className="w-full text-primary hover:text-primary/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewBrand(brand.id);
                      }}
                    >
                      Manage Brand
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
                  {!hideClientColumn && <TableHead>Client</TableHead>}
                  <TableHead>ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        {!hideClientColumn && (
                        <TableCell>
                          <Skeleton className="h-5 w-[150px]" />
                        </TableCell>
                        )}
                        <TableCell>
                          <Skeleton className="h-5 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-9 w-9" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No brands found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBrands.map((brand) => (
                    <TableRow 
                      key={brand.id}
                      className="cursor-pointer"
                      onClick={() => handleViewBrand(brand.id)}
                    >
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      {!hideClientColumn && <TableCell>{getClientName(brand.clientId)}</TableCell>}
                      <TableCell className="font-mono text-xs">{brand.id}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentBrand(brand)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setCurrentBrand(brand)
                                setIsDeleteDialogOpen(true)
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

      {/* Add Brand Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
            <DialogDescription>Add a new brand to your organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                placeholder="Enter brand name"
                value={newBrand.name}
                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandClient">Client</Label>
              <Select
                value={newBrand.clientId || "select-client"}
                onValueChange={(value) => setNewBrand({ ...newBrand, clientId: value === "select-client" ? "" : value })}
              >
                <SelectTrigger id="brandClient">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <SelectItem value="no-clients" disabled>No clients available</SelectItem>
                  ) : (
                    clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBrand}>Add Brand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>Update brand information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editBrandName">Brand Name</Label>
              <Input
                id="editBrandName"
                placeholder="Enter brand name"
                value={currentBrand?.name || ""}
                onChange={(e) => setCurrentBrand(currentBrand ? { ...currentBrand, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBrandClient">Client</Label>
              <Select
                value={currentBrand?.clientId || "select-client"}
                onValueChange={(value) => setCurrentBrand(currentBrand ? { ...currentBrand, clientId: value === "select-client" ? "" : value } : null)}
              >
                <SelectTrigger id="editBrandClient">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <SelectItem value="no-clients" disabled>No clients available</SelectItem>
                  ) : (
                    clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBrand}>Update Brand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Brand Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this brand? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBrand}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Export both as named export and default export
export { BrandList }
export default BrandList

