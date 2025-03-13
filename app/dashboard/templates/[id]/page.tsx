"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  
  useEffect(() => {
    if (templateId) {
      router.replace(`/dashboard/templates/editor?id=${encodeURIComponent(templateId)}`)
    }
  }, [templateId, router])
  
  return (
    <div className="w-full h-[600px] flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Redirecting to template editor...</div>
    </div>
  )
}

