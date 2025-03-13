"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Template, Client, Brand } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Form, FormControl, FormField, FormItem, 
  FormLabel, FormMessage
} from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TemplatePreview } from "@/components/templates/template-preview"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "@/components/ui/use-toast"
import { Save, Trash, Download } from "lucide-react"
import { fetchClients, fetchBrands } from "@/lib/api"
import { getDefaultTemplateSvgUrl } from "@/lib/utils"
import { useSearchParams } from "next/navigation"

const templateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  clientId: z.string(),
  brandId: z.string(),
  layout: z.enum(["horizontal", "vertical"]),
  frontImage: z.string(),
  backImage: z.string().optional(),
  // Add more fields as needed
})

export function TemplateForm({ 
  initialTemplate, 
  onSubmit: externalSubmit 
}: { 
  initialTemplate: Template | undefined;
  onSubmit?: (template: Template) => void;
}) {
  const searchParams = useSearchParams()
  const clientParam = searchParams.get('client')
  const brandParam = searchParams.get('brand')
  
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImageTab, setActiveImageTab] = useState("front")
  
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: initialTemplate || {
      name: "",
      clientId: clientParam || "",
      brandId: brandParam || "",
      layout: "horizontal",
      frontImage: getDefaultTemplateSvgUrl(),
      backImage: "",
    },
  })
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [clientsData, brandsData] = await Promise.all([
          fetchClients(),
          fetchBrands()
        ])
        setClients(clientsData)
        setBrands(brandsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  // Filter brands based on selected client
  const filteredBrands = brands.filter(brand => 
    !form.watch("clientId") || brand.clientId === form.watch("clientId")
  )
  
  const onSubmit = async (data: z.infer<typeof templateSchema>) => {
    try {
      setSaving(true)
      
      // Create a complete template object
      const completeTemplate: Template = {
        ...(initialTemplate || {}),
        ...data,
        id: initialTemplate?.id || `template-${Date.now()}`,
        customFields: initialTemplate?.customFields || [],
      }
      
      // Call external submit handler if provided
      if (externalSubmit) {
        externalSubmit(completeTemplate)
        return
      }
      
      // Simulate API call if no external handler
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Template saved",
        description: "Your template has been saved successfully",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {initialTemplate?.id ? "Edit Template" : "Create Template"}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="space-y-4 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter template name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              // Reset brand when client changes
                              form.setValue("brandId", "")
                            }}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loading ? (
                                <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                              ) : clients.length === 0 ? (
                                <SelectItem value="none" disabled>No clients available</SelectItem>
                              ) : (
                                clients.map(client => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                            disabled={!form.watch("clientId")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loading ? (
                                <SelectItem value="loading" disabled>Loading brands...</SelectItem>
                              ) : !form.watch("clientId") ? (
                                <SelectItem value="none" disabled>Select a client first</SelectItem>
                              ) : filteredBrands.length === 0 ? (
                                <SelectItem value="none" disabled>No brands available for this client</SelectItem>
                              ) : (
                                filteredBrands.map(brand => (
                                  <SelectItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="layout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Layout</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select layout" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="horizontal">Horizontal</SelectItem>
                              <SelectItem value="vertical">Vertical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle>Card Design</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs value={activeImageTab} onValueChange={setActiveImageTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="front">Front Side</TabsTrigger>
                        <TabsTrigger value="back">Back Side</TabsTrigger>
                      </TabsList>
                      <TabsContent value="front" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="frontImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Front Image</FormLabel>
                              <FormControl>
                                <ImageUpload
                                  value={field.value}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange(getDefaultTemplateSvgUrl())}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="back" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="backImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Back Image</FormLabel>
                              <FormControl>
                                <ImageUpload
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onRemove={() => field.onChange("")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Add custom fields that will appear on the card</p>
                  {/* Custom fields editor will go here */}
                </CardContent>
              </Card>
              
              <CardFooter className="flex justify-end gap-2 px-0">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="min-w-32"
                >
                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Template
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="preview">
          <Card className="w-full">
            <CardContent className="p-6">
              <TemplatePreview 
                template={{
                  id: initialTemplate?.id || "preview",
                  name: form.watch("name"),
                  clientId: form.watch("clientId"),
                  brandId: form.watch("brandId"),
                  layout: form.watch("layout"),
                  frontImage: form.watch("frontImage"),
                  backImage: form.watch("backImage"),
                  customFields: initialTemplate?.customFields || [],
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

