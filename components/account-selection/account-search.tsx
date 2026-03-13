"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AccountSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function AccountSearch({ searchQuery, onSearchChange }: AccountSearchProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search accounts..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9 w-full"
      />
    </div>
  )
}
