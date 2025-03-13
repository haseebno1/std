import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create a single instance of the Supabase client
export const supabase = createClientComponentClient()

// Utility function to check if Supabase is connected
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Simple query to test the connection
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

// Handle common Supabase errors
export function handleSupabaseError(error: any): string {
  if (!error) return 'Unknown error occurred';
  
  // Format error message for display
  if (typeof error === 'string') return error;
  
  // Handle specific error codes
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return 'This record already exists';
      case '23503': // Foreign key violation
        return 'Referenced record not found';
      case '23514': // Check violation
        return 'Data validation failed';
      case 'PGRST116': // JWT expired
        return 'Your session has expired, please log in again';
      case '401':
      case 'PGRST106': // JWT invalid
        return 'Authentication failed, please log in again';
      case '409':
        return 'Conflict with existing data';
      default:
        return error.message || `Database error: ${error.code}`;
    }
  }
  
  return error.message || 'An unexpected error occurred';
} 

