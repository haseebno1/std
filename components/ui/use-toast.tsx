"use client"

import { createContext, useContext, useState } from "react"

type ToastType = "default" | "success" | "error" | "warning" | "destructive"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  toast: (props: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, variant }])
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id)
    }, 5000)
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`rounded-md p-4 shadow-md ${
              toast.variant === "error" ? "bg-red-100 text-red-800" :
              toast.variant === "success" ? "bg-green-100 text-green-800" :
              toast.variant === "warning" ? "bg-yellow-100 text-yellow-800" :
              "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100"
            }`}
          >
            <div className="flex justify-between">
              <h3 className="font-medium">{toast.title}</h3>
              <button onClick={() => dismiss(toast.id)}>×</button>
            </div>
            {toast.description && <p className="text-sm">{toast.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const toast = (props: Omit<Toast, "id">) => {
  // This is a fallback for when the hook is used outside of a component
  console.warn("Toast called outside component context - this is a no-op")
  console.info("Toast would have shown:", props)
} 