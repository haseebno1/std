"use client"

import { ReactNode, useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/ui/use-toast"
import { MotionProvider } from "@/components/motion-provider"
import { Toaster } from "@/components/ui/toaster"
import { useRequireAuth } from "@/lib/auth"
import { checkSupabaseConnection } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { usePathname } from "next/navigation"

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isConnected, setIsConnected] = useState(true);
  const pathname = usePathname();
  const { isLoading } = useRequireAuth({ shouldRedirect: pathname !== "/login" });
  
  // Check Supabase connection on initial load
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      
      if (!connected) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the database. Some features may not work correctly.",
          variant: "destructive",
        });
      }
    };
    
    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionProvider>
        <ToastProvider>
          {isConnected ? (
            children
          ) : (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
              <div className="w-full max-w-md space-y-4 rounded-lg border bg-background p-6 shadow-lg">
                <h2 className="text-2xl font-bold">Connection Error</h2>
                <p className="text-muted-foreground">
                  We are having trouble connecting to our services. This might be due to:
                </p>
                <ul className="ml-6 list-disc text-muted-foreground">
                  <li>A network connectivity issue</li>
                  <li>Our servers may be temporarily unavailable</li>
                  <li>Your login session may have expired</li>
                </ul>
                <p className="text-muted-foreground">
                  Please try refreshing the page or try again later.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}
          <Toaster />
        </ToastProvider>
      </MotionProvider>
    </ThemeProvider>
  )
} 