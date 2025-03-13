"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import type { Template, CustomField, Position } from "@/lib/types"
import { Plus, Move, Trash2, Image, Type, CalendarDays, AlignLeft, Save, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getDefaultTemplateSvgUrl } from "@/lib/utils"

interface TemplateEditorProps {
  initialTemplate?: Template
  onSave: (template: Template) => void
}

export function TemplateEditor({ initialTemplate, onSave }: TemplateEditorProps) {
  const [template, setTemplate] = useState<Template>(
    initialTemplate || {
      id: `template-${Date.now()}`,
      name: "New Template",
      clientId: "",
      brandId: "",
      frontImage: getDefaultTemplateSvgUrl(),
      layout: "horizontal",
      customFields: [],
    },
  )

  const [activeTab, setActiveTab] = useState<"front" | "back">("front")
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [isAddingField, setIsAddingField] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [newField, setNewField] = useState<CustomField>({
    id: "",
    name: "",
    type: "text",
    required: false,
    position: { x: 100, y: 100 },
    side: "front",
  })

  const frontCanvasRef = useRef<HTMLCanvasElement>(null)
  const backCanvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef(false)
  const dragFieldId = useRef<string | null>(null)
  const dragStartPos = useRef<Position>({ x: 0, y: 0 })

  // Load template images and render fields
  useEffect(() => {
    renderTemplate("front")
    if (template.backImage) {
      renderTemplate("back")
    }
  }, [template, activeTab, selectedField, isPreviewMode])

  const renderTemplate = (side: "front" | "back") => {
    const canvasRef = side === "front" ? frontCanvasRef : backCanvasRef
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Use a safer approach to load template image
    const templateImageSrc = side === "front" ? template.frontImage : template.backImage || ""

    // Only proceed with image loading on the client side
    if (typeof window !== "undefined") {
      const templateImage = document.createElement("img")
      templateImage.crossOrigin = "anonymous"
      templateImage.src = templateImageSrc

      templateImage.onload = () => {
        // Set canvas dimensions based on template image
        canvas.width = templateImage.width
        canvas.height = templateImage.height

        // Draw template image
        ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height)

        // Draw fields on the canvas
        const fieldsForSide = template.customFields.filter((field) => field.side === side)

        fieldsForSide.forEach(async (field) => {
          const value = isPreviewMode ? getPreviewValue(field) : field.name

          if (field.type === "image") {
            // Draw image field
            if (isPreviewMode) {
              // Draw placeholder for image
              ctx.fillStyle = "rgba(200, 200, 200, 0.5)"
              ctx.fillRect(field.position.x, field.position.y, field.style?.width || 100, field.style?.height || 100)
              ctx.strokeStyle = "#999"
              ctx.lineWidth = 2
              ctx.strokeRect(field.position.x, field.position.y, field.style?.width || 100, field.style?.height || 100)
              ctx.fillStyle = "#666"
              ctx.textAlign = "center"
              ctx.fillText(
                "Photo",
                field.position.x + (field.style?.width || 100) / 2,
                field.position.y + (field.style?.height || 100) / 2,
              )
            } else {
              // Draw field placeholder for editing
              ctx.fillStyle = field.id === selectedField ? "rgba(0, 120, 255, 0.3)" : "rgba(200, 200, 200, 0.5)"
              ctx.fillRect(field.position.x, field.position.y, field.style?.width || 100, field.style?.height || 100)

              // Draw border
              ctx.strokeStyle = field.id === selectedField ? "#0078ff" : "#999"
              ctx.lineWidth = 2
              ctx.strokeRect(field.position.x, field.position.y, field.style?.width || 100, field.style?.height || 100)

              // Draw field name in the center
              ctx.fillStyle = "#000"
              ctx.font = "12px Arial"
              ctx.textAlign = "center"
              ctx.fillText(
                field.name,
                field.position.x + (field.style?.width || 100) / 2,
                field.position.y + (field.style?.height || 100) / 2,
              )
            }
          } else {
            // Handle text fields
            ctx.font = `${field.style?.fontWeight || ""} ${field.style?.fontSize || "16px"} ${field.style?.fontFamily || "Arial"}`
            ctx.fillStyle = field.style?.color || "#000000"
            ctx.textAlign = (field.style?.textAlign as CanvasTextAlign) || "left"

            if (isPreviewMode) {
              // In preview mode, show placeholder text
              if (field.type === "date") {
                ctx.fillText("01/01/2025", field.position.x, field.position.y)
              } else if (field.type === "textarea") {
                ctx.fillText("Sample text area content...", field.position.x, field.position.y)
              } else {
                ctx.fillText(field.name, field.position.x, field.position.y)
              }
            } else {
              // For text fields, draw a rectangle with the field name
              const width = 150
              const height = 30

              ctx.fillStyle = field.id === selectedField ? "rgba(0, 120, 255, 0.3)" : "rgba(200, 200, 200, 0.5)"
              ctx.fillRect(field.position.x, field.position.y - 20, width, height)

              // Draw border
              ctx.strokeStyle = field.id === selectedField ? "#0078ff" : "#999"
              ctx.lineWidth = 2
              ctx.strokeRect(field.position.x, field.position.y - 20, width, height)

              // Draw field name
              ctx.fillStyle = "#000"
              ctx.font = "12px Arial"
              ctx.textAlign = "left"
              ctx.fillText(field.name, field.position.x + 5, field.position.y)
            }
          }
        })
      }

      templateImage.onerror = () => {
        console.error(`Failed to load template image for ${side} side`)
        // Draw a placeholder rectangle
        canvas.width = 500
        canvas.height = 300
        ctx.fillStyle = "#f0f0f0"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "#999"
        ctx.font = "16px Arial"
        ctx.textAlign = "center"
        ctx.fillText(`Template image not available (${side} side)`, canvas.width / 2, canvas.height / 2)
      }
    }
  }

  // Add a helper function to get preview values for fields
  const getPreviewValue = (field: CustomField) => {
    switch (field.type) {
      case "text":
        return field.name
      case "textarea":
        return "Sample text area content..."
      case "date":
        return "01/01/2025"
      case "image":
        return null
      default:
        return field.name
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPreviewMode) return

    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    // Check if clicked on a field
    const fieldsForSide = template.customFields.filter((field) => field.side === activeTab)

    for (const field of fieldsForSide) {
      const fieldX = field.position.x
      const fieldY = field.position.y
      const fieldWidth = field.type === "image" ? field.style?.width || 100 : 150
      const fieldHeight = field.type === "image" ? field.style?.height || 100 : 30

      // Adjust y position for text fields
      const adjustedY = field.type === "image" ? fieldY : fieldY - 20

      if (x >= fieldX && x <= fieldX + fieldWidth && y >= adjustedY && y <= adjustedY + fieldHeight) {
        setSelectedField(field.id)
        isDragging.current = true
        dragFieldId.current = field.id
        dragStartPos.current = { x, y }
        return
      }
    }

    // If not clicked on a field, deselect
    setSelectedField(null)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPreviewMode || !isDragging.current || !dragFieldId.current) return

    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    const dx = x - dragStartPos.current.x
    const dy = y - dragStartPos.current.y

    dragStartPos.current = { x, y }

    // Update field position
    setTemplate((prev) => {
      const updatedFields = prev.customFields.map((field) => {
        if (field.id === dragFieldId.current) {
          return {
            ...field,
            position: {
              x: field.position.x + dx,
              y: field.position.y + dy,
            },
          }
        }
        return field
      })

      return {
        ...prev,
        customFields: updatedFields,
      }
    })
  }

  const handleCanvasMouseUp = () => {
    isDragging.current = false
    dragFieldId.current = null
  }

  const handleAddField = () => {
    if (!newField.name || !newField.id) {
      toast({
        title: "Error",
        description: "Field name and ID are required",
        variant: "destructive",
      })
      return
    }

    // Check if ID already exists
    if (template.customFields.some((field) => field.id === newField.id)) {
      toast({
        title: "Error",
        description: "Field ID must be unique",
        variant: "destructive",
      })
      return
    }

    setTemplate((prev) => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        {
          ...newField,
          id: newField.id.trim(),
          side: activeTab,
          style: {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#000000",
            textAlign: "left",
            ...(newField.type === "image" ? { width: 100, height: 100 } : {}),
          },
        },
      ],
    }))

    // Reset new field form
    setNewField({
      id: "",
      name: "",
      type: "text",
      required: false,
      position: { x: 100, y: 100 },
      side: activeTab,
    })

    setIsAddingField(false)

    toast({
      title: "Success",
      description: "Field added successfully",
    })
  }

  const handleDeleteField = (fieldId: string) => {
    setTemplate((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((field) => field.id !== fieldId),
    }))

    if (selectedField === fieldId) {
      setSelectedField(null)
    }

    toast({
      title: "Success",
      description: "Field deleted successfully",
    })
  }

  const handleSaveTemplate = () => {
    if (!template.name || !template.clientId || !template.brandId) {
      toast({
        title: "Error",
        description: "Template name, client, and brand are required",
        variant: "destructive",
      })
      return
    }

    onSave(template)

    toast({
      title: "Success",
      description: "Template saved successfully",
    })
  }

  const handleTemplateImageChange = (side: "front" | "back", url: string) => {
    if (side === "front") {
      setTemplate((prev) => ({
        ...prev,
        frontImage: url,
      }))
    } else {
      setTemplate((prev) => ({
        ...prev,
        backImage: url,
      }))
    }
  }

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />
      case "textarea":
        return <AlignLeft className="h-4 w-4" />
      case "date":
        return <CalendarDays className="h-4 w-4" />
      case "image":
        return <Image className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Template Editor</h2>
          <p className="text-muted-foreground">Design your card template and add custom fields</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="mr-2 h-4 w-4" />
            {isPreviewMode ? "Edit Mode" : "Preview Mode"}
          </Button>
          <Button id="save-template-editor-btn" onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={template.name}
                onChange={(e) => setTemplate((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="templateLayout">Layout</Label>
              <Select
                value={template.layout}
                onValueChange={(value) =>
                  setTemplate((prev) => ({ ...prev, layout: value as "horizontal" | "vertical" }))
                }
              >
                <SelectTrigger id="templateLayout">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "front" | "back")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="front">Front</TabsTrigger>
              <TabsTrigger value="back">Back</TabsTrigger>
            </TabsList>
            <TabsContent value="front" className="space-y-4">
              <div>
                <Label htmlFor="frontImage">Front Image URL</Label>
                <Input
                  id="frontImage"
                  value={template.frontImage}
                  onChange={(e) => handleTemplateImageChange("front", e.target.value)}
                  placeholder="Enter image URL or use placeholder"
                />
              </div>
              <div className="border rounded-md p-4">
                <canvas
                  ref={frontCanvasRef}
                  className="w-full h-auto cursor-pointer"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              </div>
            </TabsContent>
            <TabsContent value="back" className="space-y-4">
              <div>
                <Label htmlFor="backImage">Back Image URL</Label>
                <Input
                  id="backImage"
                  value={template.backImage || ""}
                  onChange={(e) => handleTemplateImageChange("back", e.target.value)}
                  placeholder="Enter image URL or use placeholder"
                />
              </div>
              {template.backImage && (
                <div className="border rounded-md p-4">
                  <canvas
                    ref={backCanvasRef}
                    className="w-full h-auto cursor-pointer"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Custom Fields</h3>
            <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={isPreviewMode}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Field</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <Label htmlFor="fieldName">Field Name</Label>
                      <Input
                        id="fieldName"
                        value={newField.name}
                        onChange={(e) => setNewField((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Full Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldId">Field ID</Label>
                      <Input
                        id="fieldId"
                        value={newField.id}
                        onChange={(e) => setNewField((prev) => ({ ...prev, id: e.target.value.replace(/\s+/g, "") }))}
                        placeholder="e.g. fullName"
                      />
                      <p className="text-xs text-muted-foreground mt-1">No spaces allowed</p>
                    </div>
                  </div>
                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <Label htmlFor="fieldType">Field Type</Label>
                      <Select
                        value={newField.type}
                        onValueChange={(value) => setNewField((prev) => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger id="fieldType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="textarea">Text Area</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="fieldRequired"
                          checked={newField.required}
                          onCheckedChange={(checked) => setNewField((prev) => ({ ...prev, required: checked }))}
                        />
                        <Label htmlFor="fieldRequired">Required Field</Label>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <Label htmlFor="positionX">Position X</Label>
                      <Input
                        id="positionX"
                        type="number"
                        value={newField.position.x}
                        onChange={(e) =>
                          setNewField((prev) => ({
                            ...prev,
                            position: { ...prev.position, x: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="positionY">Position Y</Label>
                      <Input
                        id="positionY"
                        type="number"
                        value={newField.position.y}
                        onChange={(e) =>
                          setNewField((prev) => ({
                            ...prev,
                            position: { ...prev.position, y: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingField(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddField}>Add Field</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-md">
            {template.customFields.filter((field) => field.side === activeTab).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No fields added to this side yet. Click "Add Field" to create one.
              </div>
            ) : (
              <div className="divide-y">
                {template.customFields
                  .filter((field) => field.side === activeTab)
                  .map((field) => (
                    <div
                      key={field.id}
                      className={`p-4 flex justify-between items-center ${selectedField === field.id ? "bg-accent" : ""}`}
                      onClick={() => setSelectedField(field.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">{getFieldTypeIcon(field.type)}</div>
                        <div>
                          <div className="font-medium">{field.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {field.type} • {field.required ? "Required" : "Optional"}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedField(field.id)
                          }}
                          disabled={isPreviewMode}
                        >
                          <Move className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteField(field.id)
                          }}
                          disabled={isPreviewMode}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {selectedField && !isPreviewMode && (
            <div className="border rounded-md p-4 space-y-4">
              <h4 className="font-medium">Field Properties</h4>
              {template.customFields
                .filter((field) => field.id === selectedField)
                .map((field) => (
                  <div key={field.id} className="space-y-4">
                    <div className="grid gap-4 grid-cols-2">
                      <div>
                        <Label>Position X</Label>
                        <Input
                          type="number"
                          value={field.position.x}
                          onChange={(e) => {
                            const value = Number(e.target.value)
                            setTemplate((prev) => ({
                              ...prev,
                              customFields: prev.customFields.map((f) =>
                                f.id === field.id ? { ...f, position: { ...f.position, x: value } } : f,
                              ),
                            }))
                          }}
                        />
                      </div>
                      <div>
                        <Label>Position Y</Label>
                        <Input
                          type="number"
                          value={field.position.y}
                          onChange={(e) => {
                            const value = Number(e.target.value)
                            setTemplate((prev) => ({
                              ...prev,
                              customFields: prev.customFields.map((f) =>
                                f.id === field.id ? { ...f, position: { ...f.position, y: value } } : f,
                              ),
                            }))
                          }}
                        />
                      </div>
                    </div>

                    {field.type === "image" && (
                      <div className="grid gap-4 grid-cols-2">
                        <div>
                          <Label>Width</Label>
                          <Input
                            type="number"
                            value={field.style?.width || 100}
                            onChange={(e) => {
                              const value = Number(e.target.value)
                              setTemplate((prev) => ({
                                ...prev,
                                customFields: prev.customFields.map((f) =>
                                  f.id === field.id
                                    ? {
                                        ...f,
                                        style: {
                                          ...f.style,
                                          width: value,
                                        },
                                      }
                                    : f,
                                ),
                              }))
                            }}
                          />
                        </div>
                        <div>
                          <Label>Height</Label>
                          <Input
                            type="number"
                            value={field.style?.height || 100}
                            onChange={(e) => {
                              const value = Number(e.target.value)
                              setTemplate((prev) => ({
                                ...prev,
                                customFields: prev.customFields.map((f) =>
                                  f.id === field.id
                                    ? {
                                        ...f,
                                        style: {
                                          ...f.style,
                                          height: value,
                                        },
                                      }
                                    : f,
                                ),
                              }))
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {(field.type === "text" || field.type === "textarea" || field.type === "date") && (
                      <>
                        <div>
                          <Label>Font Family</Label>
                          <Select
                            value={field.style?.fontFamily || "Arial"}
                            onValueChange={(value) => {
                              setTemplate((prev) => ({
                                ...prev,
                                customFields: prev.customFields.map((f) =>
                                  f.id === field.id
                                    ? {
                                        ...f,
                                        style: {
                                          ...f.style,
                                          fontFamily: value,
                                        },
                                      }
                                    : f,
                                ),
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select font" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                              <SelectItem value="Courier New">Courier New</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-4 grid-cols-2">
                          <div>
                            <Label>Font Size</Label>
                            <Select
                              value={field.style?.fontSize || "16px"}
                              onValueChange={(value) => {
                                setTemplate((prev) => ({
                                  ...prev,
                                  customFields: prev.customFields.map((f) =>
                                    f.id === field.id
                                      ? {
                                          ...f,
                                          style: {
                                            ...f.style,
                                            fontSize: value,
                                          },
                                        }
                                      : f,
                                  ),
                                }))
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12px">12px</SelectItem>
                                <SelectItem value="14px">14px</SelectItem>
                                <SelectItem value="16px">16px</SelectItem>
                                <SelectItem value="18px">18px</SelectItem>
                                <SelectItem value="20px">20px</SelectItem>
                                <SelectItem value="24px">24px</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Font Weight</Label>
                            <Select
                              value={field.style?.fontWeight || "normal"}
                              onValueChange={(value) => {
                                setTemplate((prev) => ({
                                  ...prev,
                                  customFields: prev.customFields.map((f) =>
                                    f.id === field.id
                                      ? {
                                          ...f,
                                          style: {
                                            ...f.style,
                                            fontWeight: value,
                                          },
                                        }
                                      : f,
                                  ),
                                }))
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select weight" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Text Alignment</Label>
                          <Select
                            value={field.style?.textAlign || "left"}
                            onValueChange={(value) => {
                              setTemplate((prev) => ({
                                ...prev,
                                customFields: prev.customFields.map((f) =>
                                  f.id === field.id
                                    ? {
                                        ...f,
                                        style: {
                                          ...f.style,
                                          textAlign: value,
                                        },
                                      }
                                    : f,
                                ),
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select alignment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Text Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={field.style?.color || "#000000"}
                              onChange={(e) => {
                                setTemplate((prev) => ({
                                  ...prev,
                                  customFields: prev.customFields.map((f) =>
                                    f.id === field.id
                                      ? {
                                          ...f,
                                          style: {
                                            ...f.style,
                                            color: e.target.value,
                                          },
                                        }
                                      : f,
                                  ),
                                }))
                              }}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={field.style?.color || "#000000"}
                              onChange={(e) => {
                                setTemplate((prev) => ({
                                  ...prev,
                                  customFields: prev.customFields.map((f) =>
                                    f.id === field.id
                                      ? {
                                          ...f,
                                          style: {
                                            ...f.style,
                                            color: e.target.value,
                                          },
                                        }
                                      : f,
                                  ),
                                }))
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

