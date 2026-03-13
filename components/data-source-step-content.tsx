"use client"

import { useState } from "react"
import { DataSourceGrid } from "@/components/data-source-grid"
import { DataSourceCategorySidebar } from "@/components/data-source-category-sidebar"
import { cn } from "@/lib/utils"

export function DataSourceStepContent() {
  const [activeCategory, setActiveCategory] = useState("advertising")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-full relative">
      <DataSourceCategorySidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isCollapsed={isCollapsed}
      />

      {/* Resize Handle */}
      <div
        className="absolute top-0 bottom-0 w-6 cursor-col-resize transition-all duration-300 group z-10"
        style={{
          left: isCollapsed ? '64px' : '256px'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        onMouseEnter={() => {
          document.body.style.cursor = 'col-resize'
        }}
        onMouseLeave={() => {
          document.body.style.cursor = 'default'
        }}
      >
        {/* Elegant hover background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar-accent/15 via-sidebar-accent/8 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out"></div>

        {/* Subtle animated border line */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-sidebar-border group-hover:bg-sidebar-accent/60 transition-all duration-300"></div>

        {/* Animated dots indicator */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-400 delay-150">
          <div className="w-1.5 h-1.5 bg-sidebar-foreground/30 rounded-full animate-pulse transition-all duration-300 group-hover:bg-sidebar-foreground/50"></div>
          <div className="w-1 h-1 bg-sidebar-foreground/50 rounded-full animate-pulse delay-100 transition-all duration-300 group-hover:bg-sidebar-foreground/70"></div>
          <div className="w-1.5 h-1.5 bg-sidebar-foreground/30 rounded-full animate-pulse delay-200 transition-all duration-300 group-hover:bg-sidebar-foreground/50"></div>
        </div>

        {/* Subtle ripple effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-sidebar-accent/20 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <DataSourceGrid activeCategory={activeCategory} searchQuery={searchQuery} />
      </div>
    </div>
  )
}
