"use client"

import type React from "react"

import { memo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { DATA_SOURCE_CATEGORIES } from "@/constants"
import type { DataSourceCategory } from "@/types"

interface DataSourceCategorySidebarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isCollapsed?: boolean
}

const CategoryButton = memo(function CategoryButton({
  category,
  isActive,
  onClick,
  isCollapsed = false,
}: {
  category: DataSourceCategory
  isActive: boolean
  onClick: () => void
  isCollapsed?: boolean
}) {
  const handleClick = useCallback(() => {
    onClick()
  }, [onClick])

  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-center h-10 text-left font-medium rounded-lg transition-all duration-300 ease-out cursor-pointer",
          isActive
            ? "bg-gray-100 text-sidebar-foreground shadow-sm"
            : "text-sidebar-foreground hover:bg-gray-100 hover:text-sidebar-foreground",
        )}
        onClick={handleClick}
        title={category.name}
      >
        <div className="flex items-center justify-center gap-1">
          {category.connected > 0 && (
            <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-100 text-green-700">
              {category.connected}
            </Badge>
          )}
        </div>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 h-11 text-left font-medium rounded-lg transition-all duration-300 ease-out cursor-pointer",
        isActive
          ? "bg-primary/10 border border-primary/20 shadow-sm hover:bg-primary/15 hover:border-primary/30 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5"
          : "hover:bg-muted/60 hover:border hover:border-border/60 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5",
      )}
      onClick={handleClick}
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
})

export const DataSourceCategorySidebar = memo(function DataSourceCategorySidebar({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  isCollapsed = false,
}: DataSourceCategorySidebarProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value)
    },
    [onSearchChange],
  )

  const handleCategoryChange = useCallback(
    (category: string) => {
      onCategoryChange(category)
    },
    [onCategoryChange],
  )

  return (
    <div className={cn(
      "flex-shrink-0 transition-all duration-300",
      isCollapsed ? "w-16 min-w-16" : "w-64 min-w-64"
    )}>
      {!isCollapsed && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sources..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      <div className={cn("space-y-1", isCollapsed ? "px-2 py-4" : "")}>
        {DATA_SOURCE_CATEGORIES.map((category) => (
          <CategoryButton
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onClick={() => handleCategoryChange(category.id)}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  )
})
