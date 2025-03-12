"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TemplateEditor } from "@/components/template-editor"
import type { Template } from "@/lib/types"

export default function TemplatesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])

  const handleSaveTemplate = (template: Template) => {
    // Check if template already exists
    const existingIndex = templates.findIndex((t) => t.id === template.id)

    if (existingIndex >= 0) {
      // Update existing template
      setTemplates((prev) => prev.map((t, i) => (i === existingIndex ? template : t)))
    } else {
      // Add new template
      setTemplates((prev) => [...prev, template])
    }

    setIsCreating(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Management</h1>
            <p className="text-gray-600">Create and manage card templates</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>Create New Template</Button>
        </div>

        {isCreating ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <TemplateEditor onSave={handleSaveTemplate} />
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-xl font-medium mb-2">No Templates Yet</h2>
            <p className="text-gray-500 mb-6">Create your first template to get started</p>
            <Button onClick={() => setIsCreating(true)}>Create Template</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setIsCreating(true)
                }}
              >
                <div className="aspect-[1.586/1] bg-gray-100 overflow-hidden">
                  <img
                    src={template.frontImage || "/placeholder.svg"}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-500">
                    {template.layout === "horizontal" ? "Horizontal" : "Vertical"} •{template.customFields.length}{" "}
                    fields
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

