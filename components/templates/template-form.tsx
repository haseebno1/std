"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Template } from "@/lib/types"
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
import { toast } from "@/components/ui/use-toast"
import { Save, Trash, Download } from "lucide-react"

const templateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  clientId: z.string(),
  brandId: z.string(),
  layout: z.enum(["horizontal", "vertical"]),
  frontImage: z.string(),
  // Add more fields as needed
})

export function TemplateForm({ initialTemplate }: { initialTemplate: Template | undefined }) {
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: initialTemplate || {
      name: "",
      clientId: "",
      brandId: "",
      layout: "horizontal",
      frontImage: "/placeholder.svg?height=300&width=500",
    },
  })
  
  const onSubmit = async (data: z.infer<typeof templateSchema>) => {
    try {
      setSaving(true)
      // Simulate API call
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
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="client1">Acme Corporation</SelectItem>
                              <SelectItem value="client2">Globex Inc.</SelectItem>
                              <SelectItem value="client3">Umbrella Corp</SelectItem>
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
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="brand1">Corporate</SelectItem>
                              <SelectItem value="brand2">Marketing</SelectItem>
                              <SelectItem value="brand3">IT Department</SelectItem>
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
                    <CardTitle>Preview Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={form.watch("frontImage")} 
                        alt="Template Preview" 
                        className="w-full h-auto aspect-video object-cover"
                      />
                    </div>
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

