"use client"

import * as React from "react"
import { useCallback, useState, useRef, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FolderPlus, Pencil, Trash2, Link, Copy } from "lucide-react"
import type { TreeNavigationItem } from "@/types"

interface TreeContextMenuProps {
  children: React.ReactNode
  item: TreeNavigationItem
  onCreateFolder?: (parentId: string) => void
  onRename?: (itemId: string) => void
  onDelete?: (itemId: string) => void
  onDuplicate?: (itemId: string) => void
}

export function TreeContextMenu({
  children,
  item,
  onCreateFolder,
  onRename,
  onDelete,
  onDuplicate,
}: TreeContextMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isFolder = item.type === "folder"
  const isSection = item.type === "section"
  const isSearch = item.type === "search"
  const isMore = item.type === "more"

  // Don't show context menu for non-content items
  if (isSection || isSearch || isMore) {
    return <>{children}</>
  }

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPosition({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }, [])

  const handleCreateFolder = useCallback(() => {
    onCreateFolder?.(item.id)
    setOpen(false)
  }, [item.id, onCreateFolder])

  const handleRename = useCallback(() => {
    onRename?.(item.id)
    setOpen(false)
  }, [item.id, onRename])

  const handleDelete = useCallback(() => {
    onDelete?.(item.id)
    setOpen(false)
  }, [item.id, onDelete])

  const handleDuplicate = useCallback(() => {
    onDuplicate?.(item.id)
    setOpen(false)
  }, [item.id, onDuplicate])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard?.writeText(`#${item.id}`)
    setOpen(false)
  }, [item.id])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/*
        Hidden trigger positioned at cursor coordinates.
        Uses a 1x1px fixed button so Radix Popper can read its bounding rect.
        Cannot use sr-only (it clips to 0x0 which breaks Popper positioning).
      */}
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          className="fixed w-px h-px overflow-hidden pointer-events-none opacity-0"
          style={{ left: position.x, top: position.y }}
          tabIndex={-1}
          aria-hidden
        />
      </DropdownMenuTrigger>

      {/* The actual visible children with right-click handler */}
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>

      <DropdownMenuContent
        align="start"
        sideOffset={2}
        className="w-52"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {isFolder && (
          <>
            <DropdownMenuItem onClick={handleCreateFolder}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
              <DropdownMenuShortcut>&#8679;N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleRename}>
          <Pencil className="h-4 w-4 mr-2" />
          Rename
          <DropdownMenuShortcut>F2</DropdownMenuShortcut>
        </DropdownMenuItem>
        {!isFolder && (
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
          <DropdownMenuShortcut>&#9003;</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
