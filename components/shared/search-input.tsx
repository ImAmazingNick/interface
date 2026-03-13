"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search\u2026",
  className,
  inputClassName,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none"
        aria-hidden="true"
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("pl-8 pr-8", inputClassName)}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
