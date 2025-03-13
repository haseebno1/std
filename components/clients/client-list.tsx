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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, MoreVertical, Edit, Trash2, Building2 } from "lucide-react"
import { fetchClients, saveClient, deleteClient } from "@/lib/api"
import type { Client } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ClientListProps {
  hideActions?: boolean;
}

function ClientList({ hideActions = false }: ClientListProps) {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"grid" | "table">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [newClientName, setNewClientName] = useState("")

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchClients()
        setClients(data)
      } catch (error) {
        console.error("Error loading clients:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
        id: `client-${Date.now()}`,
        name: newClientName,
      }

      await saveClient(newClient)
      setClients([...clients, newClient])
      setNewClientName("")
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Client added successfully",
      })
    } catch (error) {
      console.error("Error adding client:", error)
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      })
    }
  }

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
      await saveClient(currentClient)
      setClients(clients.map((client) => (client.id === currentClient.id ? currentClient : client)))
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Client updated successfully",
      })
    } catch (error) {
      console.error("Error updating client:", error)
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClient = async () => {
    if (!currentClient) return

    try {
      await deleteClient(currentClient.id)
      setClients(clients.filter((client) => client.id !== currentClient.id))
      setIsDeleteDialogOpen(false)
      toast({
        title: "Success",
        description: "Client deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      })
    }
  }

  const handleViewClient = (clientId: string) => {
    router.push(`/dashboard/clients/${clientId}`)
  }

  return (
    <div className="space-y-6">
      {!hideActions && (
        <div className="flex items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
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
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">No clients found</h2>
              <p className="mt-2 text-center text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "Get started by adding a new client"}
              </p>
              {!searchQuery && !hideActions && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="mt-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClients.map((client) => (
                <Card 
                  key={client.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleViewClient(client.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{client.name}</CardTitle>
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
                                setCurrentClient(client);
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
                                setCurrentClient(client);
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
                    <CardDescription className="mt-2">
                      <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">ID: {client.id}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="bg-muted/30 pt-4">
                    <Button
                      variant="ghost"
                      className="w-full text-primary hover:text-primary/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewClient(client.id);
                      }}
                    >
                      Manage Client
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
                          <Skeleton className="h-9 w-9" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow 
                      key={client.id}
                      className="cursor-pointer"
                      onClick={() => handleViewClient(client.id)}
                    >
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.id}</TableCell>
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
                                setCurrentClient(client)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setCurrentClient(client)
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

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClient}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditClient}>Update Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Export both as named export and default export
export { ClientList }
export default ClientList

