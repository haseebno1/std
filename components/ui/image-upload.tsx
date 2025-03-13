"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface ImageUploadProps {
  value: string | null
  onChange: (value: string | null) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
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

  if (value) {
    return (
      <div className="relative border rounded-md overflow-hidden">
        <img
          src={value}
          alt="Preview"
          className="w-full h-32 object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 rounded-full"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-md p-4 text-center cursor-pointer
        hover:border-primary/50 transition-colors
        ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        {isDragActive ? "Drop the image here" : "Drag & drop an image here, or click to select"}
      </p>
    </div>
  )
} 