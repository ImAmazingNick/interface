"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const categories = [
  {
    id: "all",
    name: "All",
    connected: 2,
    total: 15,
  },
  {
    id: "connected",
    name: "Connected",
    connected: 2,
    total: 2,
  },
  {
    id: "analytics",
    name: "Analytics",
    connected: 0,
    total: 3,
  },
  {
    id: "advertising",
    name: "Ads",
    connected: 1,
    total: 3,
  },
  {
    id: "email",
    name: "Email",
    connected: 1,
    total: 3,
  },
  {
    id: "ecommerce",
    name: "Commerce",
    connected: 0,
    total: 3,
  },
  {
    id: "social",
    name: "Social",
    connected: 0,
    total: 3,
  },
]

interface CategoriesSidebarProps {
  onCategorySelect: (categoryId: string) => void
  onSearch: (query: string) => void
  activeCategory: string
}

export function CategoriesSidebar({ onCategorySelect, onSearch, activeCategory }: CategoriesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId)

    // Smooth scroll to category section
    const categoryElement = document.getElementById(categoryId)
    if (categoryElement) {
      categoryElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      })
    }
  }

  return (
    <div className="w-64 min-w-64 bg-background border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="px-4 py-6 space-y-1">
        {categories.map((category, index) => {
          const isActive = activeCategory === category.id

          return (
            <Button
              key={category.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11 text-left font-medium rounded-lg transition-all duration-300 ease-out",
                isActive
                  ? "bg-primary/10 border border-primary/20 shadow-sm hover:bg-primary/15 hover:border-primary/30 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5"
                  : "hover:bg-muted/60 hover:border hover:border-border/60 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5",
              )}
              onClick={() => handleCategorySelect(category.id)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "font-medium transition-colors duration-200",
                      isActive ? "text-primary" : "text-card-foreground",
                    )}
                  >
                    {category.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {category.connected > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700">
                      {category.connected}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{category.total}</span>
                </div>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
