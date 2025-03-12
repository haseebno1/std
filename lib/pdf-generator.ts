import type { Template, EmployeeData } from "./types"
import { jsPDF } from "jspdf"
import { toast } from "@/hooks/use-toast"

export async function generatePDF(
  template: Template,
  employeeData: EmployeeData,
  frontCanvas?: HTMLCanvasElement | null,
  backCanvas?: HTMLCanvasElement | null,
): Promise<void> {
  try {
    if (!frontCanvas) {
      throw new Error("Front canvas element not found")
    }

    // Create a new PDF document
    const orientation = template.layout === "horizontal" ? "landscape" : "portrait"
    const doc = new jsPDF({
      orientation,
      unit: "mm",
      format: "credit-card", // Standard credit card size
    })

    // Convert front canvas to image
    const frontImgData = frontCanvas.toDataURL("image/png")

    // Add front image to PDF
    doc.addImage(frontImgData, "PNG", 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight())

    // If back canvas exists, add a new page and add back image
    if (backCanvas && template.backImage) {
      doc.addPage()
      const backImgData = backCanvas.toDataURL("image/png")
      doc.addImage(backImgData, "PNG", 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight())
    }

    // Generate filename based on employee name or ID
    let filename = "employee-card.pdf"
    if (employeeData.fullName) {
      filename = `${employeeData.fullName.toString().replace(/\s+/g, "-").toLowerCase()}-card.pdf`
    } else if (employeeData.employeeId) {
      filename = `employee-${employeeData.employeeId.toString()}-card.pdf`
    }

    // Save the PDF
    doc.save(filename)

    console.log("PDF generated successfully")
    return Promise.resolve()
  } catch (error) {
    console.error("Error generating PDF:", error)
    toast({
      title: "Error",
      description: "Failed to generate PDF",
      variant: "destructive",
    })
    return Promise.reject(error)
  }
}

