import { supabase } from './supabase'
import type { Client, Brand, Template, Employee, Activity, Settings } from "./types"

// Client operations
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
  
  if (error) throw error
  return data
}

export async function createClient(client: Omit<Client, 'id'>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Brand operations
export async function getBrands(clientId?: string): Promise<Brand[]> {
  let query = supabase.from('brands').select('*')
  if (clientId) {
    query = query.eq('clientId', clientId)
  }
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function createBrand(brand: Omit<Brand, 'id'>): Promise<Brand> {
  const { data, error } = await supabase
    .from('brands')
    .insert([brand])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Template operations
export async function getTemplates(filters?: { clientId?: string; brandId?: string }): Promise<Template[]> {
  let query = supabase.from('templates').select('*')
  if (filters?.clientId) {
    query = query.eq('clientId', filters.clientId)
  }
  if (filters?.brandId) {
    query = query.eq('brandId', filters.brandId)
  }
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function createTemplate(template: Omit<Template, 'id'>): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .insert([template])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTemplate(id: string, template: Partial<Template>): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .update(template)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Employee operations
export async function getEmployees(templateId?: string): Promise<Employee[]> {
  let query = supabase.from('employees').select('*')
  if (templateId) {
    query = query.eq('templateId', templateId)
  }
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert([employee])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Activity operations
export async function getActivities(limit: number = 10): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert([activity])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Settings operations
export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single()
  
  if (error) throw error
  return data
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .update(settings)
    .eq('id', 1) // Assuming we have a single settings record
    .select()
    .single()
  
  if (error) throw error
  return data
} 