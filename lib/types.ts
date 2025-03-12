export interface Position {
  x: number
  y: number
}

export interface FieldStyle {
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  color?: string
  textAlign?: string
  width?: number
  height?: number
}

export interface CustomField {
  id: string
  name: string
  type: "text" | "textarea" | "date" | "image"
  required: boolean
  position: Position
  style?: FieldStyle
  side: "front" | "back"
}

export interface Template {
  id: string
  name: string
  clientId: string
  brandId: string
  frontImage: string
  backImage?: string
  layout: "horizontal" | "vertical"
  customFields: CustomField[]
}

export interface EmployeeData {
  [key: string]: string | Date | null
}

export interface Employee {
  id: string
  templateId: string
  data: EmployeeData
}

export interface Client {
  id: string
  name: string
}

export interface Brand {
  id: string
  name: string
  clientId: string
}

export interface Activity {
  id: string
  type: string
  message: string
  timestamp: string
  userId?: string
}

export interface Settings {
  general: {
    companyName: string
    defaultTemplate: string
    cardSize: string
    enableBatchProcessing: boolean
  }
  appearance: {
    theme: string
    primaryColor: string
    logoUrl: string
  }
  notifications: {
    emailNotifications: boolean
    emailAddress: string
    notifyOnCardGeneration: boolean
    notifyOnTemplateChanges: boolean
  }
}

