"use client"

import { useRef, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import type { Template, EmployeeData } from "@/lib/types"
import { generatePDF } from "@/lib/pdf-generator"
import { toast } from "@/hooks/use-toast"

interface CardPreviewProps {
  template: Template
  employeeData: EmployeeData
}

export function CardPreview({ template, employeeData }: CardPreviewProps) {
  const frontCanvasRef = useRef<HTMLCanvasElement>(null)
  const backCanvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState("front")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const renderCard = async (side: "front" | "back") => {
      const canvasRef = side === "front" ? frontCanvasRef : backCanvasRef
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Load template image safely
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
            const value = employeeData[field.id]
            if (!value) return

            if (field.type === "image" && typeof value === "string") {
              // Draw image field
              const img = document.createElement("img")
              img.crossOrigin = "anonymous"
              img.src = value
              img.onload = () => {
                // Draw image at specified position with specified dimensions
                ctx.drawImage(
                  img,
                  field.position.x,
                  field.position.y,
                  field.style?.width || 100,
                  field.style?.height || 100,
                )
              }
              img.onerror = () => {
                console.error(`Failed to load image for field ${field.id}`)
              }
            } else {
              // Draw text field
              ctx.font = `${field.style?.fontWeight || ""} ${field.style?.fontSize || "16px"} ${field.style?.fontFamily || "Arial"}`
              ctx.fillStyle = field.style?.color || "#000000"
              ctx.textAlign = (field.style?.textAlign as CanvasTextAlign) || "left"

              if (field.type === "date" && value instanceof Date) {
                ctx.fillText(value.toLocaleDateString(), field.position.x, field.position.y)
              } else if (typeof value === "string") {
                // Handle multiline text for textarea
                if (field.type === "textarea") {
                  const lineHeight = Number.parseInt(field.style?.fontSize || "16px") * 1.2
                  const lines = value.split("\n")
                  lines.forEach((line, index) => {
                    ctx.fillText(line, field.position.x, field.position.y + index * lineHeight)
                  })
                } else {
                  ctx.fillText(value, field.position.x, field.position.y)
                }
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

    renderCard("front")
    if (template.backImage) {
      renderCard("back")
    }
  }, [template, employeeData])

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      await generatePDF(template, employeeData, frontCanvasRef.current, backCanvasRef.current)
      toast({
        title: "Success",
        description: "Card downloaded successfully",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open print window. Please check your popup settings.",
        variant: "destructive",
      })
      return
    }

    const frontCanvas = frontCanvasRef.current
    if (!frontCanvas) return

    const backCanvas = backCanvasRef.current

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Card</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
              page-break-after: always;
            }
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <button onclick="window.print()">Print</button>
          <img src="${frontCanvas.toDataURL("image/png")}" alt="Front of card" />
          ${backCanvas ? `<img src="${backCanvas.toDataURL("image/png")}" alt="Back of card" />` : ""}
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Card Preview</h2>
          <p className="text-muted-foreground">Preview how the employee card will look</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="front">Front</TabsTrigger>
          <TabsTrigger value="back" disabled={!template.backImage}>
            Back
          </TabsTrigger>
        </TabsList>

        <TabsContent value="front" className="pt-4">
          <div className={`mx-auto ${template.layout === "horizontal" ? "max-w-md" : "max-w-sm"}`}>
            <canvas ref={frontCanvasRef} className="w-full h-auto border rounded-md shadow-sm" />
          </div>
        </TabsContent>

        <TabsContent value="back" className="pt-4">
          {template.backImage && (
            <div className={`mx-auto ${template.layout === "horizontal" ? "max-w-md" : "max-w-sm"}`}>
              <canvas ref={backCanvasRef} className="w-full h-auto border rounded-md shadow-sm" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

