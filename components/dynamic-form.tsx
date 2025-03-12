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

  // Dynamically build the form schema based on template fields
  const formSchema = buildFormSchema(template.customFields)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData as any,
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

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Combine form values with image files
    const formData: EmployeeData = { ...values }

    // Add image files to the form data
    Object.keys(imagePreviewUrls).forEach((fieldId) => {
      if (imagePreviewUrls[fieldId]) {
        formData[fieldId] = imagePreviewUrls[fieldId]
      }
    })

    onSubmit(formData)
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {frontFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Front Side Fields</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {frontFields.map((field) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={field.id as any}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>
                          {field.name} {field.required && <span className="text-destructive">*</span>}
                        </FormLabel>
                        <FormControl>
                          {renderFieldInput(field, formField, handleImageChange, imagePreviewUrls, handleRemoveImage)}
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
                    name={field.id as any}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>
                          {field.name} {field.required && <span className="text-destructive">*</span>}
                        </FormLabel>
                        <FormControl>
                          {renderFieldInput(field, formField, handleImageChange, imagePreviewUrls, handleRemoveImage)}
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

function buildFormSchema(fields: CustomField[]) {
  const shape: Record<string, z.ZodTypeAny> = {}

  fields.forEach((field) => {
    let validator: z.ZodTypeAny

    switch (field.type) {
      case "text":
      case "image":
        validator = field.required
          ? z.string().min(1, { message: `${field.name} is required` })
          : z.string().optional().nullable()
        break
      case "textarea":
        validator = field.required
          ? z.string().min(1, { message: `${field.name} is required` })
          : z.string().optional().nullable()
        break
      case "date":
        validator = field.required
          ? z.date({ required_error: `${field.name} is required` })
          : z.date().optional().nullable()
        break
      default:
        validator = z.string().optional().nullable()
    }

    shape[field.id] = validator
  })

  return z.object(shape)
}

function renderFieldInput(
  field: CustomField,
  formField: any,
  handleImageChange: (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => void,
  imagePreviewUrls: Record<string, string>,
  handleRemoveImage: (fieldId: string) => void,
) {
  switch (field.type) {
    case "text":
      return <Input {...formField} />

    case "textarea":
      return <Textarea {...formField} />

    case "date":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !formField.value && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formField.value ? format(formField.value, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={formField.value} onSelect={formField.onChange} initialFocus />
          </PopoverContent>
        </Popover>
      )

    case "image":
      return (
        <div className="space-y-2">
          {imagePreviewUrls[field.id] ? (
            <div className="relative border rounded-md overflow-hidden">
              <img
                src={imagePreviewUrls[field.id] || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-32 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={() => handleRemoveImage(field.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`file-${field.id}`)?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                id={`file-${field.id}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(field.id, e)}
              />
            </div>
          )}
        </div>
      )

    default:
      return <Input {...formField} />
  }
}

