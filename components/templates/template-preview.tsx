import { Card, CardContent } from "@/components/ui/card"
import type { Template } from "@/lib/types"

export function TemplatePreview({ template }: { template: Template }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <Card className={`w-[350px] ${template.layout === "vertical" ? "h-[500px]" : "h-[220px]"}`}>
        <CardContent className="p-0 overflow-hidden relative">
          <div 
            className={`${template.layout === "vertical" ? "h-36" : "w-28 h-full absolute left-0"}`}
            style={{
              backgroundImage: `url(${template.frontImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
          
          <div 
            className={`p-4 ${template.layout === "vertical" ? "" : "ml-28"}`}
          >
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-lg font-bold">[Employee Name]</h3>
              <p className="text-sm text-muted-foreground">[Job Title]</p>
              
              <div className="my-2 space-y-1">
                {template.customFields.map((field, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{field.name}</span>
                    <span className="text-sm">[{field.name} Value]</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto">
                <div className="w-24 h-24 mx-auto mt-2 bg-muted rounded-md flex items-center justify-center">
                  QR Code
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground mt-4">
        Preview of "{template.name}" template
      </p>
    </div>
  )
} 