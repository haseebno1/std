import { BatchGenerator } from "@/components/batch-generator"

export default function BatchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Batch Card Generation</h1>
        <p className="text-muted-foreground">Generate multiple employee cards at once</p>
      </div>
      <BatchGenerator />
    </div>
  )
}

