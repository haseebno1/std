"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Template, Client, Brand, CustomField } from "@/lib/types"
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
import { Save, Trash, Download, ArrowLeft, ArrowRight } from "lucide-react"
import { fetchClients, fetchBrands } from "@/lib/api"
import { getTemplateSvgUrl } from "@/lib/utils"
import { useSearchParams } from "next/navigation"

const templateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  client_id: z.string(),
  brand_id: z.string(),
  layout: z.enum(["horizontal", "vertical"]),
  front_image: z.string(),
  back_image: z.string().optional(),
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
  
  const [currentStep, setCurrentStep] = useState<"edit" | "preview">("edit")
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImageTab, setActiveImageTab] = useState("front")
  const [customFields, setCustomFields] = useState<CustomField[]>(
    initialTemplate?.custom_fields?.map(field => ({
      ...field,
      side: field.side as "front" | "back"
    })) || []
  )
  
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: initialTemplate || {
      name: "",
      client_id: clientParam || "",
      brand_id: brandParam || "",
      layout: "horizontal",
      front_image: getTemplateSvgUrl("horizontal"),
      back_image: "",
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
    !form.watch("client_id") || brand.client_id === form.watch("client_id")
  )
  
  const onSubmit = async (data: z.infer<typeof templateSchema>) => {
    try {
      setSaving(true)
      
      // Create a complete template object
      const completeTemplate: Template = {
        ...(initialTemplate || {}),
        ...data,
        // Don't generate an ID here - let the API do it
        ...(initialTemplate?.id ? { id: initialTemplate.id } : {}),
        // Ensure custom_fields from state is included
        custom_fields: customFields,
        customFields: customFields,
        clientId: data.client_id,
        brandId: data.brand_id,
        frontImage: data.front_image,
        backImage: data.back_image || "",
        back_image: data.back_image || "",
        created_at: initialTemplate?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      console.log("Submitting template with custom fields:", JSON.stringify(completeTemplate.custom_fields, null, 2));
      
      // Call external submit handler if provided
      if (externalSubmit) {
        await externalSubmit(completeTemplate)
        
        toast({
          title: "Template saved",
          description: "Your template has been saved successfully",
          variant: "success",
        })
        
        return
      }
      
      toast({
        title: "Error",
        description: "No submit handler provided. Please try again.",
        variant: "destructive",
      })
    } catch (error: any) {
      console.error("Error saving template:", error)
      
      toast({
        title: "Error",
        description: error.message || "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNextStep = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      // Create a template object with current data
      const templateData = form.getValues()
      const completeTemplate: Template = {
        ...(initialTemplate || {}),
        ...templateData,
        // Don't generate an ID here - let the API do it
        ...(initialTemplate?.id ? { id: initialTemplate.id } : {}),
        // Ensure custom_fields from state is included
        custom_fields: customFields,
        customFields: customFields,
        clientId: templateData.client_id,
        brandId: templateData.brand_id,
        frontImage: templateData.front_image,
        backImage: templateData.back_image || "",
        back_image: templateData.back_image || "",
        created_at: initialTemplate?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      console.log("Next step with template custom fields:", JSON.stringify(completeTemplate.custom_fields, null, 2));
      
      // Save the data if an external submit handler is provided
      if (externalSubmit) {
        await externalSubmit(completeTemplate)
      }
      
      // Move to the preview step
      setCurrentStep("preview")
      
      toast({
        title: "Design saved",
        description: "Your template design has been saved. You can now preview it.",
        variant: "success",
      })
    } catch (error: any) {
      console.error("Error saving template:", error)
      
      toast({
        title: "Error",
        description: error.message || "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep("edit")
  }

  // Fix the useEffect hook that updates the SVG template when the layout changes
  useEffect(() => {
    const currentLayout = form.watch("layout")
    const currentFrontImage = form.watch("front_image")
    const currentBackImage = form.watch("back_image")
    
    // Only update if the current image is an SVG template
    if (currentFrontImage && (
      currentFrontImage.includes("/horizontal-card.svg") || 
      currentFrontImage.includes("/vertical-card.svg")
    )) {
      form.setValue("front_image", getTemplateSvgUrl(currentLayout))
    }
    
    if (currentBackImage && (
      currentBackImage.includes("/horizontal-card.svg") || 
      currentBackImage.includes("/vertical-card.svg")
    )) {
      form.setValue("back_image", getTemplateSvgUrl(currentLayout))
    }
  }, [form, form.watch("layout")])

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
      
      {currentStep === "edit" ? (
        <div className="space-y-4 pt-4">
          <Form {...form}>
            <form className="space-y-8">
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
                      name="client_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              // Reset brand when client changes
                              form.setValue("brand_id", "")
                            }}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-popover">
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
                      name="brand_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                            disabled={!form.watch("client_id")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-popover">
                              {loading ? (
                                <SelectItem value="loading" disabled>Loading brands...</SelectItem>
                              ) : !form.watch("client_id") ? (
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
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Update SVG templates when layout changes
                              const currentFrontImage = form.watch("front_image");
                              const currentBackImage = form.watch("back_image");
                              
                              // Only update if the current image is an SVG template
                              if (currentFrontImage && (
                                currentFrontImage.includes("/horizontal-card.svg") || 
                                currentFrontImage.includes("/vertical-card.svg")
                              )) {
                                form.setValue("front_image", getTemplateSvgUrl(value as "horizontal" | "vertical"));
                              }
                              
                              if (currentBackImage && (
                                currentBackImage.includes("/horizontal-card.svg") || 
                                currentBackImage.includes("/vertical-card.svg")
                              )) {
                                form.setValue("back_image", getTemplateSvgUrl(value as "horizontal" | "vertical"));
                              }
                            }}
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
                    <div className={`relative ${form.watch("layout") === "horizontal" ? "aspect-[1.586/1]" : "aspect-[0.63/1]"}`}>
                    <Tabs value={activeImageTab} onValueChange={setActiveImageTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="front">Front Side</TabsTrigger>
                        <TabsTrigger value="back">Back Side</TabsTrigger>
                      </TabsList>
                      <TabsContent value="front" className="space-y-4">
                        <FormField
                          control={form.control}
                            name="front_image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Front Image</FormLabel>
                              <FormControl>
                                  <div className={`relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 ${form.watch("layout") === "horizontal" ? "aspect-[1.586/1]" : "aspect-[0.63/1]"}`}>
                                    {field.value ? (
                                      <div className="group relative h-full w-full">
                                        <img
                                          src={field.value}
                                          alt="Front side"
                                          className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                          <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => field.onChange(getTemplateSvgUrl(form.watch("layout")))}
                                          >
                                            Replace
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => field.onChange("")}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                <ImageUpload
                                        value={field.value || null}
                                  onChange={field.onChange}
                                        className={form.watch("layout") === "horizontal" ? "aspect-[1.586/1]" : "aspect-[0.63/1]"}
                                />
                                    )}
                                  </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="back" className="space-y-4">
                        <FormField
                          control={form.control}
                            name="back_image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Back Image</FormLabel>
                              <FormControl>
                                  <div className={`relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 ${form.watch("layout") === "horizontal" ? "aspect-[1.586/1]" : "aspect-[0.63/1]"}`}>
                                    {field.value ? (
                                      <div className="group relative h-full w-full">
                                        <img
                                          src={field.value}
                                          alt="Back side"
                                          className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                          <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => field.onChange(getTemplateSvgUrl(form.watch("layout")))}
                                          >
                                            Replace
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => field.onChange("")}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                <ImageUpload
                                        value={field.value || null}
                                  onChange={field.onChange}
                                        className={form.watch("layout") === "horizontal" ? "aspect-[1.586/1]" : "aspect-[0.63/1]"}
                                />
                                    )}
                                  </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>
        </div>
      ) : (
          <Card className="w-full">
            <CardContent className="p-6">
              <TemplatePreview 
                template={{
                  id: initialTemplate?.id || "preview",
                  name: form.watch("name"),
                client_id: form.watch("client_id"),
                brand_id: form.watch("brand_id"),
                  layout: form.watch("layout"),
                front_image: form.watch("front_image") || getTemplateSvgUrl(form.watch("layout")),
                back_image: form.watch("back_image") || "",
                custom_fields: customFields,
                customFields: customFields,
                clientId: form.watch("client_id"),
                brandId: form.watch("brand_id"),
                frontImage: form.watch("front_image") || getTemplateSvgUrl(form.watch("layout")),
                backImage: form.watch("back_image") || "",
                created_at: initialTemplate?.created_at || new Date().toISOString(),
                updated_at: initialTemplate?.updated_at || new Date().toISOString(),
                }}
              />
            </CardContent>
          </Card>
      )}
      
      <div className="flex justify-between items-center gap-4">
        {currentStep === "preview" ? (
          <Button 
            variant="outline" 
            type="button"
            onClick={handlePreviousStep}
            className="px-6"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Edit
          </Button>
        ) : (
          <div></div>
        )}
        
        {currentStep === "edit" ? (
          <Button 
            type="button"
            onClick={handleNextStep}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg ml-auto"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        ) : (
          <Button 
            type="button"
            disabled={saving}
            onClick={form.handleSubmit(onSubmit)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg ml-auto"
          >
            {saving ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Template
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

