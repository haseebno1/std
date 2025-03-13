"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, LayoutTemplate } from "lucide-react"
import type { Template } from "@/lib/types"
import { fetchClients, fetchBrands, fetchTemplates } from "@/lib/api"
import { cn } from "@/lib/utils"

interface TemplateSelectorProps {
  onSelectClient: (clientId: string) => void
  onSelectBrand: (brandId: string) => void
  onSelectTemplate: (template: Template) => void
  selectedClient: string | null
  selectedBrand: string | null
}

export function TemplateSelector({
  onSelectClient,
  onSelectBrand,
  onSelectTemplate,
  selectedClient,
  selectedBrand,
}: TemplateSelectorProps) {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true)
      try {
        const clientsData = await fetchClients()
        setClients(clientsData)
      } catch (error) {
        console.error("Error loading clients:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  useEffect(() => {
    const loadBrands = async () => {
      if (!selectedClient) {
        setBrands([])
        return
      }

      setLoading(true)
      try {
        const brandsData = await fetchBrands(selectedClient)
        setBrands(brandsData)
      } catch (error) {
        console.error("Error loading brands:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBrands()
  }, [selectedClient])

  useEffect(() => {
    const loadTemplates = async () => {
      if (!selectedClient || !selectedBrand) {
        setTemplates([])
        setFilteredTemplates([])
        return
      }

      setLoading(true)
      try {
        const templatesData = await fetchTemplates(selectedClient, selectedBrand)
        setTemplates(templatesData)
        setFilteredTemplates(templatesData)
      } catch (error) {
        console.error("Error loading templates:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [selectedClient, selectedBrand])

  // Filter templates based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTemplates(templates)
      return
    }

    const filtered = templates.filter((template) => template.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredTemplates(filtered)
  }, [searchQuery, templates])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Select Template</h2>
        <p className="text-muted-foreground">Choose a client, brand, and template to generate employee cards</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-2">Client</label>
          {loading && !clients.length ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedClient || ""}
              onValueChange={(value) => {
                onSelectClient(value)
                onSelectBrand("")
              }}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Brand</label>
          {loading && selectedClient ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedBrand || ""}
              onValueChange={(value) => onSelectBrand(value)}
              disabled={!selectedClient || brands.length === 0}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!selectedClient || !selectedBrand}
            />
          </div>
        </div>
      </div>

      {selectedClient && selectedBrand && (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={container}
          className="mt-8"
        >
          <h3 className="text-lg font-medium mb-4">Available Templates</h3>
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="aspect-[1.586/1] rounded-lg" />
                ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card className="bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <LayoutTemplate className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {templates.length === 0
                    ? "No templates found for the selected brand."
                    : "No templates match your search criteria."}
                </p>
                {templates.length > 0 && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <motion.div 
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              variants={container}
            >
              {filteredTemplates.map((template) => (
                <motion.div key={template.id} variants={item}>
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-lg",
                      "group relative overflow-hidden border dark:bg-card"
                    )}
                    onClick={() => onSelectTemplate(template)}
                  >
                    <div className="aspect-[1.586/1] bg-muted/30 overflow-hidden">
                      <motion.img
                        src={template.frontImage || "/placeholder.svg"}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium truncate">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.layout === "horizontal" ? "Horizontal" : "Vertical"} • {template.customFields.length}{" "}
                          fields
                        </p>
                        <Button 
                          className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          variant="secondary"
                        >
                          Select Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}

