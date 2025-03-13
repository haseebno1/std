"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, LayoutTemplate, Building2, Edit } from "lucide-react"
import { fetchBrands, fetchClients, fetchTemplates } from "@/lib/api"
import type { Brand, Client, Template } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function BrandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.id as string
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Fetch brand details
        const brands = await fetchBrands()
        const currentBrand = brands.find(b => b.id === brandId)
        
        if (!currentBrand) {
          router.push('/dashboard/brands')
          return
        }
        
        setBrand(currentBrand)
        
        // Fetch client details
        const clients = await fetchClients()
        const brandClient = clients.find(c => c.id === currentBrand.clientId)
        setClient(brandClient || null)
        
        // Fetch templates for this brand
        const templatesData = await fetchTemplates(undefined, brandId)
        setTemplates(templatesData)
      } catch (error) {
        console.error("Error loading brand data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [brandId, router])
  
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
                {brand?.name}
                <Badge variant="outline" className="ml-2">Brand</Badge>
              </>
            )}
          </h1>
          <p className="text-muted-foreground">
            {loading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <>Brand for {client?.name}</>
            )}
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
                Brand Information
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/brands?edit=${brandId}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Brand Name</h3>
                  <p>{brand?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Brand ID</h3>
                  <p className="font-mono text-sm">{brand?.id}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Client</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-3 w-3 text-primary" />
                    </div>
                    <Link 
                      href={`/dashboard/clients/${brand?.clientId}`}
                      className="text-primary hover:underline"
                    >
                      {client?.name}
                    </Link>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Number of Templates</h3>
                  <p>{templates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Templates
                <Button asChild>
                  <Link href={`/dashboard/templates/new?brand=${brandId}&client=${brand?.clientId}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Template
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>
                Templates associated with this brand
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <LayoutTemplate className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">No templates yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first template for this brand
                  </p>
                  <Button 
                    className="mt-4" 
                    asChild
                  >
                    <Link href={`/dashboard/templates/new?brand=${brandId}&client=${brand?.clientId}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Template
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map(template => (
                    <div 
                      key={template.id} 
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => router.push(`/dashboard/templates/editor?id=${template.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 overflow-hidden rounded-md border">
                          <img
                            src={template.frontImage}
                            alt={template.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {template.layout === "horizontal" ? "Horizontal" : "Vertical"}
                          </p>
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
    </div>
  )
} 