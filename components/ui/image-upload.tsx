"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value: string | null
  onChange: (value: string | null) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          onChange(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"]
    },
    maxFiles: 1,
  })

  const onRemove = () => {
    // Set to null instead of removing to trigger proper state updates
    onChange(null)
  }

  if (value) {
    return (
      <div className={cn(
        "relative h-full w-full group overflow-hidden",
        className
      )}>
        <img
          src={value}
          alt="Uploaded image"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            Remove
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center cursor-pointer rounded-md border-2 border-dashed border-muted-foreground/25 p-4 transition-colors",
        isDragActive ? "border-primary/50 bg-primary/5" : "hover:border-primary/50",
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-center text-muted-foreground">
        {isDragActive ? "Drop the image here" : "Drag & drop an image here, or click to select"}
      </p>
    </div>
  )
} 