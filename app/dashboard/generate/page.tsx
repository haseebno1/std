import { CardGenerator } from "@/components/card-generator"

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Employee Cards</h1>
        <p className="text-muted-foreground">Select a template and enter employee details to generate cards</p>
      </div>
      <CardGenerator />
    </div>
  )
}

