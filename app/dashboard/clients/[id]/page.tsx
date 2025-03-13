"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Briefcase, Building2, Edit, Search } from "lucide-react"
import { fetchClients, fetchBrands } from "@/lib/api"
import type { Client, Brand } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Fetch client details
        const clients = await fetchClients()
        const currentClient = clients.find(c => c.id === clientId)
        
        if (!currentClient) {
          router.push('/dashboard/clients')
          return
        }
        
        setClient(currentClient)
        
        // Fetch brands for this client
        const brandsData = await fetchBrands(clientId)
        setBrands(brandsData)
      } catch (error) {
        console.error("Error loading client data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [clientId, router])
  
  // Filter brands based on search query
  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {loading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <>
                {client?.name}
                <Badge variant="outline" className="ml-2">Client</Badge>
              </>
            )}
          </h1>
          <p className="text-muted-foreground">
            Manage client details and associated brands
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Client Information
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/clients?edit=${clientId}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Client Name</h3>
                  <p>{client?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Client ID</h3>
                  <p className="font-mono text-sm">{client?.id}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Number of Brands</h3>
                  <p>{brands.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Brands
                <Button onClick={() => router.push(`/dashboard/brands?client=${clientId}`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Brand
                </Button>
              </CardTitle>
              <CardDescription>
                Brands associated with this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {brands.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">No brands yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first brand for this client
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => router.push(`/dashboard/brands?client=${clientId}`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Brand
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {brands.map(brand => (
                    <div 
                      key={brand.id} 
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{brand.name}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>All Brands</CardTitle>
          <CardDescription>
            Manage all brands associated with this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search brands..."
                  className="pl-8 w-full max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => router.push(`/dashboard/brands?client=${clientId}`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </div>
            
            {filteredBrands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                {brands.length === 0 ? (
                  <>
                    <h3 className="font-medium">No brands yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first brand for this client
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => router.push(`/dashboard/brands?client=${clientId}`)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Brand
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium">No brands found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      No brands match your search query
                    </p>
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBrands.map(brand => (
                      <TableRow 
                        key={brand.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                      >
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell className="font-mono text-xs">{brand.id}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/brands?edit=${brand.id}`);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 