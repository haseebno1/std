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
import { Plus, Search, MoreVertical, Edit, Trash2, Briefcase } from "lucide-react"
import { fetchBrands, fetchClients, saveBrand, deleteBrand } from "@/lib/api"
import type { Brand, Client } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

function BrandList() {
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
        const [brandsData, clientsData] = await Promise.all([fetchBrands(), fetchClients()])
        setBrands(brandsData)
        setClients(clientsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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
      const brandToAdd: Brand = {
        id: `brand-${Date.now()}`,
        name: newBrand.name,
        clientId: newBrand.clientId,
      }

      await saveBrand(brandToAdd)
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
      await saveBrand(currentBrand)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground">Manage your organization's brands</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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
        <Select value={selectedClient || ""} onValueChange={(value) => setSelectedClient(value === "" ? null : value)}>
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
              {!searchQuery && !selectedClient && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="mt-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Brand
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBrands.map((brand) => (
                <Card key={brand.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{brand.name}</CardTitle>
                        <CardDescription>Client: {getClientName(brand.clientId)}</CardDescription>
                      </div>
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
                    </div>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setCurrentBrand(brand)
                        setIsEditDialogOpen(true)
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
                  <TableHead>Client</TableHead>
                  <TableHead>ID</TableHead>
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
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>{getClientName(brand.clientId)}</TableCell>
                      <TableCell>{brand.id}</TableCell>
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
                value={newBrand.clientId || ""}
                onValueChange={(value) => setNewBrand({ ...newBrand, clientId: value })}
              >
                <SelectTrigger id="brandClient">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
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
                value={currentBrand?.clientId || ""}
                onValueChange={(value) => setCurrentBrand(currentBrand ? { ...currentBrand, clientId: value } : null)}
              >
                <SelectTrigger id="editBrandClient">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
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

