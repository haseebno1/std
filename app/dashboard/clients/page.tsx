"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ClientList } from "@/components/clients/client-list"
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { fetchClients, createClient, deleteClient } from "@/lib/api"
import type { Client } from "@/lib/types"
import { Plus, Users } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { SkeletonGrid } from "@/components/ui/skeleton-card"
import { EmptyState } from "@/components/ui/empty-state"
import { supabase } from "@/lib/supabase"
import { useRequireAuth } from "@/lib/auth"

export default function ClientsPage() {
  // Use the auth hook
  useRequireAuth()

  const searchParams = useSearchParams()
  const router = useRouter()
  
  const editParam = searchParams.get('edit')
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])

  // Load clients data
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchClients()
        setClients(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading clients:", error)
        setIsLoading(false)
        
        // Only redirect on auth errors
        if (error.message?.includes('JWT') || error.message?.includes('auth')) {
          router.push('/login')
        } else {
          toast({
            title: "Error",
            description: "Failed to load clients",
            variant: "destructive",
          })
        }
      }
    }
    
    loadClients()
  }, [router])
  
  // Handle URL parameters
  useEffect(() => {
    // If edit param is present, load the client for editing
    if (editParam) {
      const loadClient = async () => {
        try {
          const clients = await fetchClients()
          const clientToEdit = clients.find(c => c.id === editParam)
          if (clientToEdit) {
            setCurrentClient(clientToEdit)
            setIsEditDialogOpen(true)
          }
        } catch (error) {
          console.error("Error loading client for editing:", error)
        }
      }
      
      loadClient()
    }
  }, [editParam])
  
  const handleEditClient = async () => {
    if (!currentClient || !currentClient.name.trim()) {
      toast({
        title: "Error",
        description: "Client name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      await createClient(currentClient)
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Client updated successfully",
      })
      
      // Clear URL parameters and refresh the page
      router.push('/dashboard/clients')
      router.refresh()
    } catch (error) {
      console.error("Error updating client:", error)
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      })
    }
  }
  
  const handleAddClient = async () => {
    if (!newClientName.trim()) {
      toast({
        title: "Error",
        description: "Client name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const newClient: Client = {
        id: crypto.randomUUID(),
        name: newClientName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await createClient(newClient)
      setNewClientName("")
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Client added successfully",
      })
      
      // Refresh the page
      router.refresh()
    } catch (error: any) {
      console.error("Error adding client:", error)
      if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        router.push('/login')
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add client",
          variant: "destructive",
        })
      }
    }
  }
  
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false)
    setIsAddDialogOpen(false)
    // Clear URL parameters
    router.push('/dashboard/clients')
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your clients and their associated brands"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </motion.div>
      </PageHeader>
      
      {isLoading ? (
        <SkeletonGrid count={6} hasFooter />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description="You haven't added any clients yet. Add your first client to get started."
          actionLabel="Add Client"
          actionIcon={Plus}
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ClientList hideActions={true} />
        </motion.div>
      )}
      
      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
            <DialogDescription>Add a new client to your organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleAddClient}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editClientName">Client Name</Label>
              <Input
                id="editClientName"
                placeholder="Enter client name"
                value={currentClient?.name || ""}
                onChange={(e) => setCurrentClient(currentClient ? { ...currentClient, name: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleEditClient}>Update Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

