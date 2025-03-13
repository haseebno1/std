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
  type: string
  required: boolean
  side: "front" | "back"
  position: {
    x: number
    y: number
  }
  style?: {
    fontSize?: number
    fontWeight?: string | number
    color?: string
    fontFamily?: string
    textAlign?: string
    width?: number
    height?: number
  }
}

export interface Template {
  id: string
  name: string
  client_id: string
  brand_id: string
  layout: "horizontal" | "vertical"
  front_image?: string
  back_image?: string
  custom_fields: CustomField[]
  customFields?: CustomField[]
  clientId?: string
  brandId?: string
  frontImage?: string
  backImage?: string
  created_at: string
  updated_at: string
  clients?: Client
  brands?: Brand
}

export interface EmployeeData {
  [key: string]: string | Date | null
}

export interface Employee {
  id: string
  template_id: string
  templateId?: string
  data: Record<string, any>
  created_at: string
  updated_at: string
  templates?: Template
}

export interface Client {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  client_id: string
  created_at: string
  updated_at: string
  clients?: Client
}

export interface Activity {
  id: string
  type: "create" | "update" | "delete"
  entity_type: "client" | "brand" | "template" | "employee"
  entity_id: string
  entity_name: string
  user_id: string
  details?: string
  timestamp: string
}

export interface Settings {
  id: number
  theme: string
  default_template_id?: string
  updated_at: string
}

