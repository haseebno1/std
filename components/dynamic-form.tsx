"use client"

import type React from "react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Template, EmployeeData, CustomField } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/ui/image-upload"

interface DynamicFormProps {
  template: Template
  initialData: EmployeeData
  onSubmit: (data: EmployeeData) => void
}

export function DynamicForm({ template, initialData, onSubmit }: DynamicFormProps) {
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({})
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Record<string, string>>({})

  // Initialize image previews from initial data
  useState(() => {
    const initialPreviews: Record<string, string> = {}

    Object.entries(initialData).forEach(([key, value]) => {
      if (typeof value === "string" && value.startsWith("data:image")) {
        initialPreviews[key] = value
      }
    })

    if (Object.keys(initialPreviews).length > 0) {
      setImagePreviewUrls(initialPreviews)
    }
  })

  // Create a dynamic schema based on template fields
  const formSchema = z.object(
    template.customFields.reduce((acc, field) => {
      if (field.type === "image") {
        acc[field.id] = z.string().nullable()
      } else if (field.type === "textarea") {
        acc[field.id] = z.string().min(1, "This field is required")
      } else {
        acc[field.id] = z.string().min(1, "This field is required")
      }
      return acc
    }, {} as { [key: string]: z.ZodType<any> })
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  const handleImageChange = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      setImageFiles((prev) => ({ ...prev, [fieldId]: file }))

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviewUrls((prev) => ({
          ...prev,
          [fieldId]: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)

      // Update form value
      form.setValue(fieldId as any, file.name)
    }
  }

  const handleRemoveImage = (fieldId: string) => {
    setImageFiles((prev) => {
      const newFiles = { ...prev }
      delete newFiles[fieldId]
      return newFiles
    })

    setImagePreviewUrls((prev) => {
      const newUrls = { ...prev }
      delete newUrls[fieldId]
      return newUrls
    })

    form.setValue(fieldId as any, null)
  }

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data)
  }

  // Group fields by side (front/back)
  const frontFields = template.customFields.filter((field) => field.side === "front")
  const backFields = template.customFields.filter((field) => field.side === "back")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Employee Details</h2>
        <p className="text-muted-foreground">Fill in the details for the employee card</p>
      </div>

      <Form {...form}>
        <form id="employee-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {frontFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Front Side Fields</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {frontFields.map((field) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>
                          {field.name} {field.required && <span className="text-destructive">*</span>}
                        </FormLabel>
                        <FormControl>
                          {field.type === "textarea" ? (
                            <Textarea
                              {...formField}
                              placeholder={`Enter ${field.name.toLowerCase()}`}
                            />
                          ) : field.type === "image" ? (
                            <ImageUpload
                              value={formField.value}
                              onChange={formField.onChange}
                              onRemove={() => formField.onChange(null)}
                            />
                          ) : (
                            <Input
                              {...formField}
                              type={field.type}
                              placeholder={`Enter ${field.name.toLowerCase()}`}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {backFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Back Side Fields</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {backFields.map((field) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>
                          {field.name} {field.required && <span className="text-destructive">*</span>}
                        </FormLabel>
                        <FormControl>
                          {field.type === "textarea" ? (
                            <Textarea
                              {...formField}
                              placeholder={`Enter ${field.name.toLowerCase()}`}
                            />
                          ) : field.type === "image" ? (
                            <ImageUpload
                              value={formField.value}
                              onChange={formField.onChange}
                              onRemove={() => formField.onChange(null)}
                            />
                          ) : (
                            <Input
                              {...formField}
                              type={field.type}
                              placeholder={`Enter ${field.name.toLowerCase()}`}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full md:w-auto">
            Generate Card
          </Button>
        </form>
      </Form>
    </div>
  )
}

