"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

interface ExpansionControlProps {
  isExpanded: boolean
  onToggle: () => void
  className?: string
}

export function ExpansionControl({ isExpanded, onToggle, className = "" }: ExpansionControlProps) {
  return (
    <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 hover:bg-muted ${className}`} onClick={onToggle}>
      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Button>
  )
}
