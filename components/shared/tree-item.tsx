"use client"

import type React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Folder, FolderOpen } from "lucide-react"
import { ExpansionControl } from "./expansion-control"
import type { ReactNode } from "react"

interface TreeItemProps {
  id: string
  isExpanded: boolean
  onToggle: () => void
  isSelected: boolean
  isIndeterminate?: boolean
  onSelect: () => void
  icon?: ReactNode
  children: ReactNode
  badge?: ReactNode
  className?: string
  level?: number
  nonInteractive?: boolean
}

export function TreeItem({
  id,
  isExpanded,
  onToggle,
  isSelected,
  isIndeterminate = false,
  onSelect,
  icon,
  children,
  badge,
  className = "",
  level = 0,
  nonInteractive = false,
}: TreeItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (nonInteractive) return
    
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault()
        onSelect()
        break
      case "ArrowRight":
        if (!isExpanded) {
          e.preventDefault()
          onToggle()
        }
        break
      case "ArrowLeft":
        if (isExpanded) {
          e.preventDefault()
          onToggle()
        }
        break
    }
  }

  const ariaLabel = nonInteractive 
    ? `Tree item. Level ${level + 1}.`
    : `${isSelected ? "Selected" : "Not selected"} ${
        isIndeterminate ? "partially selected" : ""
      } tree item. ${isExpanded ? "Expanded" : "Collapsed"}. Level ${level + 1}.`

  return (
    <div
      className={`flex items-center gap-2 p-2 hover:bg-[#f5f5f0] rounded-md group w-full cursor-pointer ${
        isSelected ? "" : ""
      } ${className}`}
      role="treeitem"
      aria-expanded={nonInteractive ? undefined : isExpanded}
      aria-selected={nonInteractive ? undefined : isSelected}
      aria-level={level + 1}
      aria-label={ariaLabel}
      tabIndex={nonInteractive ? -1 : 0}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        // Don't trigger if clicking on checkbox elements
        const target = e.target as HTMLElement
        if (!target.matches('input') &&
            !target.closest('input') &&
            !target.matches('button') &&
            !target.closest('button')) {
          // Handle tree item expansion for connected sources
          if (!nonInteractive && onToggle) {
            onToggle()
          }
        }
      }}
    >
      {!nonInteractive && (
        <ExpansionControl
          isExpanded={isExpanded}
          onToggle={onToggle}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} tree item`}
        />
      )}

      {!nonInteractive && (
        <Checkbox
          checked={isSelected}
          ref={(el) => {
            if (el && 'indeterminate' in el) {
              (el as HTMLInputElement).indeterminate = isIndeterminate
            }
          }}
          onCheckedChange={onSelect}
          className="h-4 w-4 data-[state=checked]:bg-purple-900 data-[state=checked]:border-purple-900 border-gray-400 data-[state=checked]:text-white cursor-pointer relative z-10"
          aria-label={`${isSelected ? "Unselect" : "Select"} this item`}
        />
      )}

      {icon ||
        (!nonInteractive && (isExpanded ? (
          <FolderOpen className="h-4 w-4 text-primary" aria-hidden="true" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )))}

      <div className="flex-1 min-w-0">{children}</div>

      {badge && (
        <div className="flex items-center gap-2" aria-hidden="true">
          {badge}
        </div>
      )}
    </div>
  )
}
