"use client"

import { useRef, useState } from "react"
import type { Template } from "@/lib/types"
import { cn, getTemplateSvgUrl } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TemplatePreviewProps {
  template: Template
  className?: string
}

export function TemplatePreview({ template, className }: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("front")

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => {
        console.log("Tab changed to:", value, "template:", template);
        setActiveTab(value);
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="front">Front Side</TabsTrigger>
          <TabsTrigger value="back">Back Side</TabsTrigger>
        </TabsList>
        <TabsContent value="front" className="pt-4">
          <div 
            ref={containerRef}
            className={cn(
              "relative w-full overflow-hidden rounded-lg border bg-background",
              template.layout === "horizontal" ? "aspect-[1.586/1]" : "aspect-[0.63/1]",
              className
            )}
          >
            <div className="relative h-full w-full">
              {template.front_image ? (
                <img
                  src={template.front_image}
                  alt={`${template.name} front`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={getTemplateSvgUrl(template.layout)}
                  alt={`${template.name} front template`}
                  className="h-full w-full object-cover"
                />
              )}
              {/* Custom field placeholders will be rendered here */}
              <div className="absolute inset-0 p-4">
                {(template.custom_fields || template.customFields || [])?.filter(field => field.side === "front").map((field, index) => (
                  <div
                    key={index}
                    className="absolute rounded bg-black/20 p-2 text-sm text-white"
            style={{
                      left: `${field.position.x}px`,
                      top: `${field.position.y}px`,
                      ...(field.style || {})
                    }}
                  >
                    {field.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="back" className="pt-4">
          <div 
            className={cn(
              "relative w-full overflow-hidden rounded-lg border bg-background",
              template.layout === "horizontal" ? "aspect-[1.586/1]" : "aspect-[0.63/1]",
              className
            )}
          >
            <div className="relative h-full w-full">
              {template.back_image && template.back_image !== "" ? (
                <img
                  src={template.back_image}
                  alt={`${template.name} back`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={getTemplateSvgUrl(template.layout)}
                  alt={`${template.name} back template`}
                  className="h-full w-full object-cover opacity-70"
                />
              )}
              {/* Custom field placeholders for back side */}
              <div className="absolute inset-0 p-4">
                {(template.custom_fields || template.customFields || [])?.filter(field => field.side === "back").map((field, index) => (
                  <div
                    key={index}
                    className="absolute rounded bg-black/20 p-2 text-sm text-white"
                    style={{
                      left: `${field.position.x}px`,
                      top: `${field.position.y}px`,
                      ...(field.style || {})
                    }}
                  >
                    {field.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 