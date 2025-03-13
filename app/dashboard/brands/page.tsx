"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BrandList } from "@/components/brands/brand-list"
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { fetchBrands, fetchClients, saveBrand, deleteBrand } from "@/lib/api"
import type { Brand, Client } from "@/lib/types"
import { Plus, Briefcase } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { SkeletonGrid } from "@/components/ui/skeleton-card"
import { EmptyState } from "@/components/ui/empty-state"

export default function BrandsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const clientParam = searchParams.get('client')
  const editParam = searchParams.get('edit')
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null)
  const [newBrand, setNewBrand] = useState<{
    name: string
    clientId: string
  }>({
    name: "",
    clientId: clientParam || "",
  })
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [brands, setBrands] = useState<Brand[]>([])
  
  // Load clients and brands
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, brandsData] = await Promise.all([
          fetchClients(),
          fetchBrands()
        ])
        setClients(clientsData)
        setBrands(brandsData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        setLoading(false)
      }
    }
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      loadData()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Handle URL parameters
  useEffect(() => {
    // If client param is present, set it in the new brand form
    if (clientParam) {
      setNewBrand(prev => ({ ...prev, clientId: clientParam }))
      setIsAddDialogOpen(true)
    }
    
    // If edit param is present, load the brand for editing
    if (editParam) {
      const loadBrand = async () => {
        try {
          const brands = await fetchBrands()
          const brandToEdit = brands.find(b => b.id === editParam)
          if (brandToEdit) {
            setCurrentBrand(brandToEdit)
            setIsEditDialogOpen(true)
          }
        } catch (error) {
          console.error("Error loading brand for editing:", error)
        }
      }
      
      loadBrand()
    }
  }, [clientParam, editParam])
  
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
        id: `brand-${newBrand.name.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`,
        name: newBrand.name,
        clientId: newBrand.clientId,
      }

      await saveBrand(brandToAdd)
      setNewBrand({ name: "", clientId: "" })
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Brand added successfully",
      })
      
      // Clear URL parameters and refresh the page
      router.push('/dashboard/brands')
      router.refresh()
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
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Brand updated successfully",
      })
      
      // Clear URL parameters and refresh the page
      router.push('/dashboard/brands')
      router.refresh()
    } catch (error) {
      console.error("Error updating brand:", error)
      toast({
        title: "Error",
        description: "Failed to update brand",
        variant: "destructive",
      })
    }
  }
  
  const handleCloseDialog = () => {
    setIsAddDialogOpen(false)
    setIsEditDialogOpen(false)
    // Clear URL parameters
    router.push('/dashboard/brands')
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        description="Manage brands associated with your clients"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </motion.div>
      </PageHeader>
      
      {loading ? (
        <SkeletonGrid count={6} hasFooter />
      ) : brands.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No brands found"
          description="You haven't added any brands yet. Add your first brand to get started."
          actionLabel="Add Brand"
          actionIcon={Plus}
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BrandList hideActions={true} />
        </motion.div>
      )}
      
      {/* Add Brand Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
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
                value={newBrand.clientId || (clientParam ? clientParam : "select-client")}
                onValueChange={(value) => setNewBrand({ ...newBrand, clientId: value === "select-client" ? "" : value })}
                disabled={!!clientParam}
              >
                <SelectTrigger id="brandClient">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                  ) : clients.length === 0 ? (
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
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleAddBrand}>Add Brand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
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
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                  ) : clients.length === 0 ? (
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
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleEditBrand}>Update Brand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

