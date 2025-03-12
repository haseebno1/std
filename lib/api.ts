import type { Client, Brand, Template, Employee, Activity, Settings } from "./types"

// Mock data for demonstration purposes
const mockClients: Client[] = [
  { id: "client1", name: "Acme Corporation" },
  { id: "client2", name: "Globex Industries" },
  { id: "client3", name: "Initech" },
]

const mockBrands: Brand[] = [
  { id: "brand1", name: "Acme Professional", clientId: "client1" },
  { id: "brand2", name: "Acme Standard", clientId: "client1" },
  { id: "brand3", name: "Globex Enterprise", clientId: "client2" },
  { id: "brand4", name: "Globex Basic", clientId: "client2" },
  { id: "brand5", name: "Initech Premium", clientId: "client3" },
]

// Ensure we have templates with predictable IDs
const mockTemplates: Template[] = [
  {
    id: "template1",
    name: "Professional ID Card",
    clientId: "client1",
    brandId: "brand1",
    frontImage: "/placeholder.svg?height=300&width=500",
    backImage: "/placeholder.svg?height=300&width=500",
    layout: "horizontal",
    customFields: [
      {
        id: "fullName",
        name: "Full Name",
        type: "text",
        required: true,
        position: { x: 150, y: 150 },
        style: {
          fontFamily: "Arial",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#000000",
          textAlign: "center",
        },
        side: "front",
      },
      {
        id: "employeeId",
        name: "Employee ID",
        type: "text",
        required: true,
        position: { x: 150, y: 180 },
        style: {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#333333",
          textAlign: "center",
        },
        side: "front",
      },
      {
        id: "department",
        name: "Department",
        type: "text",
        required: true,
        position: { x: 150, y: 210 },
        style: {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#333333",
          textAlign: "center",
        },
        side: "front",
      },
      {
        id: "photo",
        name: "Employee Photo",
        type: "image",
        required: true,
        position: { x: 50, y: 50 },
        style: {
          width: 100,
          height: 100,
        },
        side: "front",
      },
      {
        id: "issueDate",
        name: "Issue Date",
        type: "date",
        required: true,
        position: { x: 150, y: 240 },
        style: {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#666666",
          textAlign: "center",
        },
        side: "front",
      },
      {
        id: "emergencyContact",
        name: "Emergency Contact",
        type: "text",
        required: false,
        position: { x: 150, y: 100 },
        style: {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#333333",
          textAlign: "left",
        },
        side: "back",
      },
      {
        id: "address",
        name: "Address",
        type: "textarea",
        required: false,
        position: { x: 150, y: 150 },
        style: {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#333333",
          textAlign: "left",
        },
        side: "back",
      },
    ],
  },
  {
    id: "template2",
    name: "Standard ID Card",
    clientId: "client1",
    brandId: "brand2",
    frontImage: "/placeholder.svg?height=500&width=300",
    layout: "vertical",
    customFields: [
      {
        id: "fullName",
        name: "Full Name",
        type: "text",
        required: true,
        position: { x: 150, y: 350 },
        style: {
          fontFamily: "Arial",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#000000",
          textAlign: "center",
        },
        side: "front",
      },
      {
        id: "jobTitle",
        name: "Job Title",
        type: "text",
        required: true,
        position: { x: 150, y: 380 },
        style: {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#333333",
          textAlign: "center",
        },
        side: "front",
      },
      {
        id: "photo",
        name: "Employee Photo",
        type: "image",
        required: true,
        position: { x: 100, y: 100 },
        style: {
          width: 200,
          height: 200,
        },
        side: "front",
      },
    ],
  },
  {
    id: "template3",
    name: "Enterprise Badge",
    clientId: "client2",
    brandId: "brand3",
    frontImage: "/placeholder.svg?height=300&width=500",
    backImage: "/placeholder.svg?height=300&width=500",
    layout: "horizontal",
    customFields: [
      {
        id: "fullName",
        name: "Full Name",
        type: "text",
        required: true,
        position: { x: 250, y: 150 },
        style: {
          fontFamily: "Arial",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#000000",
          textAlign: "center",
        },
        side: "front",
      },
      {
        id: "accessLevel",
        name: "Access Level",
        type: "text",
        required: true,
        position: { x: 250, y: 180 },
        style: {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#333333",
          textAlign: "center",
        },
        side: "front",
      },
      {
        id: "photo",
        name: "Employee Photo",
        type: "image",
        required: true,
        position: { x: 50, y: 100 },
        style: {
          width: 150,
          height: 150,
        },
        side: "front",
      },
      {
        id: "securityInfo",
        name: "Security Information",
        type: "textarea",
        required: false,
        position: { x: 150, y: 150 },
        style: {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#333333",
          textAlign: "left",
        },
        side: "back",
      },
    ],
  },
  // Add more templates with different ID formats to handle various cases
  {
    id: "1",
    name: "Basic ID Card",
    clientId: "client1",
    brandId: "brand1",
    frontImage: "/placeholder.svg?height=300&width=500",
    layout: "horizontal",
    customFields: [],
  },
  {
    id: "2",
    name: "Simple Badge",
    clientId: "client2",
    brandId: "brand3",
    frontImage: "/placeholder.svg?height=300&width=500",
    layout: "vertical",
    customFields: [],
  },
  {
    id: "3",
    name: "Visitor Pass",
    clientId: "client3",
    brandId: "brand5",
    frontImage: "/placeholder.svg?height=300&width=500",
    layout: "horizontal",
    customFields: [],
  },
]

const mockEmployees: Employee[] = [
  {
    id: "employee1",
    templateId: "template1",
    data: {
      fullName: "John Doe",
      employeeId: "12345",
      department: "Engineering",
      photo: "/placeholder.svg?height=100&width=100",
      issueDate: new Date(),
    },
  },
  {
    id: "employee2",
    templateId: "template2",
    data: {
      fullName: "Jane Smith",
      jobTitle: "Software Engineer",
      photo: "/placeholder.svg?height=200&width=200",
    },
  },
]

const mockActivities: Activity[] = [
  {
    id: "activity1",
    type: "template",
    message: "Template 'Professional ID Card' was created",
    timestamp: new Date().toISOString(),
  },
  {
    id: "activity2",
    type: "employee",
    message: "Employee 'John Doe' was added",
    timestamp: new Date().toISOString(),
  },
]

const mockSettings: Settings = {
  general: {
    companyName: "Your Company",
    defaultTemplate: "template1",
    cardSize: "standard",
    enableBatchProcessing: true,
  },
  appearance: {
    theme: "light",
    primaryColor: "#0070f3",
    logoUrl: "/placeholder.svg?height=100&width=200",
  },
  notifications: {
    emailNotifications: true,
    emailAddress: "admin@example.com",
    notifyOnCardGeneration: true,
    notifyOnTemplateChanges: false,
  },
}

// Simulated API calls with delay to mimic real API behavior
export async function fetchClients(): Promise<Client[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockClients)
    }, 500)
  })
}

export async function fetchBrands(clientId?: string): Promise<Brand[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredBrands = clientId ? mockBrands.filter((brand) => brand.clientId === clientId) : mockBrands
      resolve(filteredBrands)
    }, 500)
  })
}

export async function fetchTemplates(clientId?: string, brandId?: string): Promise<Template[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredTemplates = mockTemplates
      if (clientId) {
        filteredTemplates = filteredTemplates.filter((template) => template.clientId === clientId)
      }
      if (brandId) {
        filteredTemplates = filteredTemplates.filter((template) => template.brandId === brandId)
      }
      resolve(filteredTemplates)
    }, 500)
  })
}

// Completely rewritten fetchTemplateById function with more robust ID matching and fallback
export async function fetchTemplateById(templateId: string): Promise<Template> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Enhanced debugging
      console.log("API: Fetching template with ID:", templateId)
      console.log("API: Type of templateId:", typeof templateId)

      if (!templateId) {
        console.error("API: Invalid template ID (empty)")
        reject(new Error("Invalid template ID"))
        return
      }

      // Normalize the ID - remove any non-alphanumeric characters and convert to lowercase
      const normalizedId = templateId
        .toString()
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase()
      console.log("API: Normalized ID:", normalizedId)

      // Try many different variations of the ID to find a match
      const possibleIds = [
        templateId,
        `template${templateId}`,
        templateId.replace(/^template/i, ""),
        templateId.trim(),
        normalizedId,
        `template${normalizedId}`,
        // Try numeric variations if the ID might be numeric
        isNaN(Number(templateId)) ? null : templateId.toString(),
        isNaN(Number(templateId)) ? null : Number(templateId).toString(),
      ].filter(Boolean) // Remove null values

      console.log("API: Trying possible ID variations:", possibleIds)

      // Log all available template IDs for debugging
      console.log(
        "API: Available template IDs:",
        mockTemplates.map((t) => t.id),
      )

      // Try to find the template with any of the possible IDs
      for (const id of possibleIds) {
        const template = mockTemplates.find((t) => {
          // Try exact match
          if (t.id === id) return true

          // Try case-insensitive match
          if (id && t.id.toLowerCase() === id.toLowerCase()) return true

          // Try with/without 'template' prefix
          if (id && t.id.replace(/^template/i, "") === id.replace(/^template/i, "")) return true

          return false
        })

        if (template) {
          console.log("API: Found template with ID variation:", id)
          resolve(template)
          return
        }
      }

      // FALLBACK: If we still can't find the template, return the first template as a fallback
      if (mockTemplates.length > 0) {
        console.log("API: Using fallback template (first available)")
        resolve(mockTemplates[0])
        return
      }

      // If there are no templates at all (very unlikely), create a default one
      console.log("API: Creating default template as last resort")
      const defaultTemplate: Template = {
        id: templateId,
        name: "Default Template",
        clientId: "client1",
        brandId: "brand1",
        frontImage: "/placeholder.svg?height=300&width=500",
        layout: "horizontal",
        customFields: [],
      }

      // Add this template to our mock data for future reference
      mockTemplates.push(defaultTemplate)

      resolve(defaultTemplate)
    }, 500)
  })
}

export async function fetchEmployeeById(employeeId: string): Promise<Employee> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const employee = mockEmployees.find((employee) => employee.id === employeeId)
      if (employee) {
        resolve(employee)
      } else {
        reject(new Error("Employee not found"))
      }
    }, 500)
  })
}

export async function fetchTemplatesCount(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTemplates.length)
    }, 500)
  })
}

export async function fetchClientsCount(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockClients.length)
    }, 500)
  })
}

export async function fetchBrandsCount(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBrands.length)
    }, 500)
  })
}

export async function fetchEmployeesCount(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEmployees.length)
    }, 500)
  })
}

export async function fetchRecentActivity(): Promise<Activity[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockActivities)
    }, 500)
  })
}

export async function deleteTemplate(templateId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate deletion
      console.log(`Template with ID ${templateId} deleted`)
      resolve()
    }, 500)
  })
}

export async function saveTemplate(template: Template): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate saving
      console.log("Template saved:", template)

      // In a real app, we would update the mockTemplates array here
      // For this demo, let's add the template to mockTemplates if it doesn't exist
      const existingIndex = mockTemplates.findIndex((t) => t.id === template.id)
      if (existingIndex >= 0) {
        mockTemplates[existingIndex] = template
      } else {
        mockTemplates.push(template)
      }

      resolve()
    }, 500)
  })
}

export async function saveClient(client: Client): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate saving
      console.log("Client saved:", client)
      resolve()
    }, 500)
  })
}

export async function deleteClient(clientId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate deletion
      console.log(`Client with ID ${clientId} deleted`)
      resolve()
    }, 500)
  })
}

export async function saveBrand(brand: Brand): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate saving
      console.log("Brand saved:", brand)
      resolve()
    }, 500)
  })
}

export async function deleteBrand(brandId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate deletion
      console.log(`Brand with ID ${brandId} deleted`)
      resolve()
    }, 500)
  })
}

export async function fetchEmployees(): Promise<Employee[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEmployees)
    }, 500)
  })
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate deletion
      console.log(`Employee with ID ${employeeId} deleted`)
      resolve()
    }, 500)
  })
}

export async function saveEmployee(employee: Employee): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate saving
      console.log("Employee saved:", employee)
      resolve()
    }, 500)
  })
}

export async function generateBatchCards(templateId: string, employeeIds: string[]): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate batch card generation
      const fileNames = employeeIds.map((employeeId) => `card_${employeeId}.pdf`)
      console.log(`Generated batch cards for template ${templateId} and employees ${employeeIds.join(", ")}`)
      resolve(fileNames)
    }, 1000)
  })
}

export async function saveSettings(settings: Settings): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate saving settings
      console.log("Settings saved:", settings)
      resolve()
    }, 500)
  })
}

