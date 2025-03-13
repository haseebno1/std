import { supabase } from './supabase'
import type { Client, Brand, Template, Employee, Activity, Settings } from "./types"

// Client operations
export async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchClientById(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createClient(client: Omit<Client, 'id'>) {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateClient(id: string, client: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Brand operations
export async function fetchBrands(clientId?: string) {
  let query = supabase
    .from('brands')
    .select('*, clients(*)')
    .order('created_at', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchBrandById(id: string) {
  const { data, error } = await supabase
    .from('brands')
    .select('*, clients(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createBrand(brand: Omit<Brand, 'id'>) {
  const { data, error } = await supabase
    .from('brands')
    .insert([brand])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBrand(id: string, brand: Partial<Brand>) {
  const { data, error } = await supabase
    .from('brands')
    .update(brand)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBrand(id: string) {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Template operations
export async function fetchTemplates(clientId?: string, brandId?: string) {
  try {
    let query = supabase
      .from('templates')
      .select('*, clients(*), brands(*)')
      .order('created_at', { ascending: false })

    if (clientId) {
      query = query.eq('client_id', clientId)
    }
    if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    const { data, error } = await query
    if (error) throw error
    
    // Ensure each template has both naming conventions and parse safely
    const enrichedData = data?.map(template => {
      try {
        // Handle custom_fields safely to avoid JSON parsing errors
        let customFields = [];
        try {
          if (typeof template.custom_fields === 'string') {
            customFields = JSON.parse(template.custom_fields);
          } else if (Array.isArray(template.custom_fields)) {
            customFields = template.custom_fields;
          } else if (Array.isArray(template.customFields)) {
            customFields = template.customFields;
          }
        } catch (parseError) {
          console.error("Error parsing custom_fields:", parseError);
          customFields = [];
        }
        
        return {
          ...template,
          // Add camelCase variants if they don't exist
          clientId: template.clientId || template.client_id,
          brandId: template.brandId || template.brand_id,
          frontImage: template.frontImage || template.front_image,
          backImage: template.backImage || template.back_image,
          customFields: customFields,
          custom_fields: customFields
        };
      } catch (itemError) {
        console.error("Error processing template:", itemError);
        // Return a minimal valid template
        return {
          id: template.id,
          name: template.name || "Unknown Template",
          client_id: template.client_id,
          brand_id: template.brand_id,
          customFields: [],
          custom_fields: [],
          layout: template.layout || "horizontal",
          created_at: template.created_at,
          updated_at: template.updated_at
        };
      }
    }) || []
    
    return enrichedData
  } catch (error) {
    console.error("fetchTemplates error:", error);
    throw error;
  }
}

export async function fetchTemplateById(id: string) {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*, clients(*), brands(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    
    // Process custom fields safely
    let customFields = [];
    try {
      if (typeof data.custom_fields === 'string') {
        customFields = JSON.parse(data.custom_fields);
      } else if (Array.isArray(data.custom_fields)) {
        customFields = data.custom_fields;
      } else if (Array.isArray(data.customFields)) {
        customFields = data.customFields;
      }
    } catch (parseError) {
      console.error("Error parsing custom_fields in template:", parseError);
      customFields = [];
    }
    
    // Return enriched template with both naming conventions
    return {
      ...data,
      clientId: data.clientId || data.client_id,
      brandId: data.brandId || data.brand_id,
      frontImage: data.frontImage || data.front_image,
      backImage: data.backImage || data.back_image,
      customFields: customFields,
      custom_fields: customFields
    }
  } catch (error) {
    console.error("fetchTemplateById error:", error);
    throw error;
  }
}

export async function createTemplate(template: Template | Omit<Template, 'id'>) {
  // Create a copy of template without the relationship fields that don't exist in the database
  // Also remove any existing ID to avoid primary key conflicts
  const { clients, brands, id, ...templateWithoutRelationsAndId } = template as any;
  
  // Always generate a fresh UUID for new templates
  const templateId = crypto.randomUUID();
  
  // Prepare the database-compatible template object
  const dbTemplate = {
    ...templateWithoutRelationsAndId,
    id: templateId,
    // Ensure we have both naming conventions in the database
    client_id: template.client_id || template.clientId,
    brand_id: template.brand_id || template.brandId,
    front_image: template.front_image || template.frontImage,
    back_image: template.back_image || template.backImage,
    // Ensure custom_fields is a valid JSONB array
    custom_fields: template.custom_fields || template.customFields || [],
    // Add camelCase variants for the frontend
    clientId: template.client_id || template.clientId,
    brandId: template.brand_id || template.brandId,
    frontImage: template.front_image || template.frontImage,
    backImage: template.back_image || template.backImage,
    customFields: template.custom_fields || template.customFields || [],
    // Ensure timestamps are set
    created_at: 'created_at' in template ? template.created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log("Creating template with new ID:", templateId);
  console.log("Template object structure:", Object.keys(dbTemplate));
  console.log("Saving template with custom fields:", JSON.stringify(dbTemplate.custom_fields, null, 2));

  try {
  const { data, error } = await supabase
    .from('templates')
      .insert([dbTemplate])
    .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Exception during template creation:", error);
    throw error;
  }
}

export async function updateTemplate(id: string, template: Partial<Template>) {
  // Remove relationship fields that don't exist in the database
  const { clients, brands, ...templateWithoutRelations } = template;
  
  // Prepare the database-compatible template object
  const dbTemplate = {
    ...templateWithoutRelations,
    // Ensure we have both naming conventions in the database
    ...(template.client_id || template.clientId ? {
      client_id: template.client_id || template.clientId,
      clientId: template.client_id || template.clientId,
    } : {}),
    ...(template.brand_id || template.brandId ? {
      brand_id: template.brand_id || template.brandId,
      brandId: template.brand_id || template.brandId,
    } : {}),
    ...(template.front_image || template.frontImage ? {
      front_image: template.front_image || template.frontImage,
      frontImage: template.front_image || template.frontImage,
    } : {}),
    ...(template.back_image || template.backImage ? {
      back_image: template.back_image || template.backImage,
      backImage: template.back_image || template.backImage,
    } : {}),
    // Ensure custom_fields is properly handled
    ...(template.custom_fields || template.customFields ? {
      custom_fields: template.custom_fields || template.customFields || [],
      customFields: template.custom_fields || template.customFields || [],
    } : {}),
    // Always update the updated_at timestamp
    updated_at: new Date().toISOString(),
  };

  console.log("Updating template with ID:", id);
  console.log("Template object structure:", Object.keys(dbTemplate));
  console.log("Updating template with custom fields:", JSON.stringify(dbTemplate.custom_fields, null, 2));

  try {
  const { data, error } = await supabase
    .from('templates')
      .update(dbTemplate)
    .eq('id', id)
    .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Exception during template update:", error);
    throw error;
  }
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Employee operations
export async function fetchEmployees(templateId?: string) {
  console.log("Fetching employees...", templateId ? `with templateId: ${templateId}` : "all");

  try {
    let query = supabase
      .from('employees')
      .select('*, templates(*)')
      .order('created_at', { ascending: false });

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} employees`);
    
    if (data && data.length > 0) {
      console.log("Sample employee data:", JSON.stringify(data[0].data, null, 2).substring(0, 200) + "...");
    }
    
    // Ensure each employee has both naming conventions and valid data
    const enrichedData = data?.map(employee => {
      // Make sure data is an object, not null
      if (!employee.data || typeof employee.data !== 'object') {
        employee.data = {};
      }
      
      return {
        ...employee,
        // Add camelCase variants if they don't exist
        templateId: employee.templateId || employee.template_id,
        // Ensure data is always an object even if database returns null
        data: employee.data || {}
      };
    }) || [];
    
    return enrichedData;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
}

export async function fetchEmployeeById(id: string) {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*, templates(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching employee by ID:", error);
      throw error;
    }
    
    // Ensure data exists and is properly formatted
    if (!data) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    
    // Make sure data is an object, not null
    if (!data.data || typeof data.data !== 'object') {
      data.data = {};
    }
    
    // Add templateId for convenience
    return {
      ...data,
      templateId: data.templateId || data.template_id,
      // Ensure data is always an object even if database returns null
      data: data.data || {}
    };
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    throw error;
  }
}

export async function createEmployee(employee: any) {
  // Extract what we need for the database (only valid DB columns)
  // Very important - only include fields that exist in the database schema
  const { templateId, ...rest } = employee;
  
  // Generate a UUID if not provided or ensure it's in the correct format
  const employeeId = employee.id || crypto.randomUUID();
  
  // Make sure data is properly formatted as JSON for storage
  let formattedData = employee.data;
  
  // Handle null, undefined, or non-object data
  if (!formattedData || typeof formattedData !== 'object') {
    console.warn("Employee data is missing or invalid, initializing empty object");
    formattedData = {};
  }
  
  // Prepare the database-compatible employee object with only valid columns
  const dbEmployee = {
    ...rest,
    id: employeeId,
    // Ensure we have the snake_case naming required by the database
    template_id: templateId || employee.template_id,
    // Ensure data is formatted correctly for JSONB column
    data: formattedData,
    // Ensure timestamps are set
    created_at: employee.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log("Creating employee with ID:", employeeId);
  console.log("Creating employee with template_id:", dbEmployee.template_id);
  console.log("Employee data keys:", Object.keys(formattedData || {}));
  console.log("Employee data sample:", JSON.stringify(formattedData, null, 2).substring(0, 200) + "...");
  
  try {
    // First check if an employee with this ID already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('id', employeeId)
      .maybeSingle();
      
    if (existingEmployee) {
      console.log(`Employee with ID ${employeeId} already exists, updating...`);
      // Update instead of insert
      const { data, error } = await supabase
        .from('employees')
        .update(dbEmployee)
        .eq('id', employeeId)
        .select()
        .single();
        
      if (error) {
        console.error("Supabase error during update:", error);
        throw error;
      }
      
      console.log("Employee updated successfully:", data.id);
      // Add back the camelCase property for frontend use
      return {
        ...data,
        templateId: data.template_id
      };
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('employees')
        .insert([dbEmployee])
        .select()
        .single();

      if (error) {
        console.error("Supabase error during insert:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        throw error;
      }
      
      console.log("Employee created successfully:", data.id);
      console.log("Returned data from database:", JSON.stringify(data, null, 2));
      // Add back the camelCase property for frontend use
      return {
        ...data,
        templateId: data.template_id
      };
    }
  } catch (error) {
    console.error("Detailed error during employee creation:", error);
    throw error;
  }
}

export async function updateEmployee(id: string, employee: Partial<Employee>) {
  // Extract what we need for the database (only valid DB columns)
  // Very important - only include fields that exist in the database schema
  const { templateId, ...rest } = employee as any;
  
  // Prepare the database-compatible employee object with only valid columns
  const dbEmployee = {
    ...rest,
    // If template_id is being updated, ensure we use the correct name
    ...(templateId ? { template_id: templateId } : {})
  };

  console.log("Updating employee with ID:", id);

  try {
  const { data, error } = await supabase
    .from('employees')
      .update(dbEmployee)
    .eq('id', id)
    .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    // Add back the camelCase property for frontend use
    return {
      ...data,
      templateId: data.template_id
    };
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Activity operations
export async function fetchActivities(limit: number = 10) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function createActivity(activity: Omit<Activity, 'id'>) {
  const { data, error } = await supabase
    .from('activities')
    .insert([{
      ...activity,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Settings operations
export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateSettings(settings: Partial<Settings>) {
  const { data, error } = await supabase
    .from('settings')
    .update(settings)
    .eq('id', 1)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function saveSettings(settings: Partial<Settings>) {
  const { data, error } = await supabase
    .from('settings')
    .update(settings)
    .eq('id', 1)
    .select()
    .single()

  if (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
  return data;
}

