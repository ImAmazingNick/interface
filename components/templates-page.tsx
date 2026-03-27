"use client"

import { Fragment, useState, useMemo, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Grid3X3, Table as TableIcon, Plus, FolderOpen, FileText, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getBreadcrumbs, getNavChildren, getAncestorIds, getAllDescendantIds, ARTIFACT_TYPE_LABELS } from "@/lib/navigation"
import { getStatusBadgeClass, getStatusLabel } from "@/lib/status-utils"
import type { ItemStatus } from "@/lib/status-utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useSortableData } from "@/hooks/use-sortable-data"
import { useFilterableData } from "@/hooks/use-filterable-data"
import { SearchInput } from "@/components/shared/search-input"
import { SortableTableHead } from "@/components/shared/sortable-table-head"
import { ActiveFilterBar } from "@/components/shared/active-filter-bar"
import { FilterPopover } from "@/components/shared/filter-popover"
import { SortPopover } from "@/components/shared/sort-popover"
import type { SortColumn } from "@/components/shared/sort-popover"
import { DEBOUNCE_DELAYS } from "@/constants"
import type { FilterColumnConfig } from "@/types/filters"

interface TemplatesPageProps {
  folderType: string
  typeFilter?: string           // filter items by artifact type, undefined = show all
  onAddNew?: (folderType: string) => void
  onItemNavigate?: (itemId: string) => void
  onSwitchToAllTab?: () => void
  tree?: import("@/types").TreeNavigationItem[]
  onRenameItem?: (itemId: string, newTitle: string) => void
  onDeleteItem?: (itemId: string) => void
}

const ADD_BUTTON_LABELS: Record<string, string> = {
  dashboards: "New Dashboard",
  reports: "New Report",
  connections: "New Connection",
  "data-explorer": "New Query",
  recipes: "New Recipe",
  admin: "New Item",
  chats: "New Chat",
}

interface DisplayItem {
  id: string
  title: string
  subtitle: string
  tag: string
  isFolder: boolean
  artifactType?: string
  status?: ItemStatus
  updated: string
  updatedBy: string
  description?: string
  relatedTo?: { id: string; title: string; type?: string }[]
  relatedToTitle: string
  account: string
  sharedWith?: { id: string; name: string; avatar?: string }[]
  sharedBy?: string
  dataTable?: string
}

/** Shared action menu for table rows and grid cards — Rename / Delete with confirmation popovers */
function ItemActionMenu({
  item,
  tree,
  onRenameItem,
  onDeleteItem,
  triggerClassName,
}: {
  item: DisplayItem
  tree?: import("@/types").TreeNavigationItem[]
  onRenameItem?: (itemId: string, newTitle: string) => void
  onDeleteItem?: (itemId: string) => void
  triggerClassName?: string
}) {
  const [action, setAction] = useState<"rename" | "delete" | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (action === "rename") {
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [action])

  return (
    <Popover
      open={action !== null}
      onOpenChange={(open) => { if (!open) setAction(null) }}
    >
      <PopoverAnchor asChild>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer",
                  triggerClassName ?? "h-8 w-8"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setRenameValue(item.title)
                  setAction("rename")
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  setAction("delete")
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="end"
        side="bottom"
        className="w-64"
        onClick={(e) => e.stopPropagation()}
      >
        {action === "delete" && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Delete {item.isFolder ? "folder" : "item"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                This will permanently delete &ldquo;{item.title}&rdquo;
                {item.isFolder && tree && (() => {
                  const count = getAllDescendantIds(item.id, tree).size
                  return count > 0 ? <> and all {count} items inside it</> : null
                })()}.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  onDeleteItem?.(item.id)
                  setAction(null)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
        {action === "rename" && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (renameValue.trim()) {
                onRenameItem?.(item.id, renameValue.trim())
                setAction(null)
              }
            }}
          >
            <div>
              <p className="text-sm font-medium mb-2">Rename {item.isFolder ? "folder" : "item"}</p>
              <Input
                ref={inputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Item name"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" type="button" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs" type="submit" disabled={!renameValue.trim()}>
                Rename
              </Button>
            </div>
          </form>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function TemplatesPage({
  folderType,
  typeFilter,
  onAddNew,
  onItemNavigate,
  onSwitchToAllTab,
  tree,
  onRenameItem,
  onDeleteItem,
}: TemplatesPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const supportsGridView = folderType === "dashboards" || folderType === "recipes"
  const [viewMode, setViewMode] = useLocalStorage<"grid" | "table">('view-mode-preference', 'table')
  const effectiveViewMode = supportsGridView ? viewMode : "table"

  const debouncedSearch = useDebouncedValue(searchTerm, DEBOUNCE_DELAYS.SEARCH)

  const breadcrumbs = getBreadcrumbs(folderType, tree)
  const ancestors = breadcrumbs.slice(0, -1)
  const folderTitle = breadcrumbs[breadcrumbs.length - 1]?.title ?? folderType

  const navChildren = getNavChildren(folderType, tree)

  // Build display items: folders first, then files — all from the tree
  // For recipes: flatten children of category folders so individual recipes appear in the table
  const allItems = useMemo((): DisplayItem[] => {
    const folders: DisplayItem[] = []
    const files: DisplayItem[] = []

    const addItem = (item: typeof navChildren[number], parentTitle?: string) => {
      if (item.type === "section" || item.type === "more") return
      const isFolder = item.type === "folder"

      // For recipes: show folders as navigable items (no flattening)

      const childCount = item.children?.length ?? 0
      const entry: DisplayItem = {
        id: item.id,
        title: item.title,
        subtitle: isFolder && childCount > 0
          ? `${childCount} ${childCount === 1 ? "item" : "items"}`
          : "",
        tag: parentTitle || item.tag || (isFolder ? "Folder" : "File"),
        isFolder,
        artifactType: item.artifactType,
        status: item.status,
        updated: item.updated || "",
        updatedBy: item.updatedBy || "",
        description: item.description,
        relatedTo: item.relatedTo,
        relatedToTitle: item.relatedTo?.map(r => r.title).join(", ") ?? "",
        account: item.account ?? "",
        sharedWith: item.sharedWith,
        sharedBy: item.sharedBy,
        dataTable: item.dataTable,
      }
      if (isFolder) folders.push(entry)
      else files.push(entry)
    }

    for (const item of navChildren) {
      addItem(item)
    }

    return [...folders, ...files]
  }, [navChildren])

  const isConnections = folderType === "connections"
  const isDashboards = folderType === "dashboards"
  const isChats = folderType === "chats"
  const isRecipes = folderType === "recipes" || getAncestorIds(folderType, tree).includes("recipes")
  const hideDescription = isDashboards || isRecipes

  // Filter items based on active tab
  const typeFilteredItems = useMemo(() => {
    if (!typeFilter) return allItems // "All" tab: folders + files
    // Type filter: items of this type + folders (folders always visible for navigation)
    return allItems.filter(item => item.isFolder || item.artifactType === typeFilter)
  }, [allItems, typeFilter])

  const FILTER_COLUMNS: FilterColumnConfig<DisplayItem>[] = useMemo(() => {
    const cols: FilterColumnConfig<DisplayItem>[] = [
      { key: "status", label: "Status", formatValue: (v) => getStatusLabel(v as ItemStatus) },
    ]
    if (!isChats) {
      cols.push({ key: "tag", label: "Type" })
    }
    cols.push({ key: "updatedBy", label: "Updated by" })
    if (isConnections) {
      cols.push({ key: "account", label: "Account" })
    } else if (!isRecipes) {
      cols.push({
        key: "relatedToTitle",
        label: "Related to",
        accessor: (item) => item.relatedTo?.map(r => r.title),
      })
    }
    return cols
  }, [isConnections, isChats, isRecipes])

  const SORT_COLUMNS: SortColumn[] = useMemo(() => {
    const cols: SortColumn[] = [
      { key: "title", label: "Name" },
      { key: "status", label: "Status" },
      { key: "updated", label: "Updated" },
      { key: "updatedBy", label: "By" },
    ]
    if (!isChats) {
      cols.splice(1, 0, { key: "tag", label: "Type" })
    }
    if (isRecipes) {
      cols.splice(1, 0, { key: "dataTable", label: "Data Table" })
    } else if (isConnections) {
      cols.splice(1, 0, { key: "account", label: "Account" })
    } else {
      cols.splice(1, 0, { key: "relatedToTitle", label: "Related to" })
    }
    return cols
  }, [isConnections, isChats, isRecipes])

  const {
    filteredData,
    filters,
    toggleFilterValue,
    clearFilter,
    clearAllFilters,
    availableValues,
    activeFilters: columnFilters,
    hasActiveFilters,
  } = useFilterableData({
    data: typeFilteredItems,
    columns: FILTER_COLUMNS,
    searchTerm: debouncedSearch,
    searchKeys: ["title", "tag", "description", "account", "relatedToTitle", "updatedBy", "dataTable"],
  })

  // Build full active filters list (search chip + column filter chips)
  const activeFilters = useMemo(() => {
    const result = [...columnFilters]
    if (searchTerm) {
      result.unshift({
        key: "search",
        label: `Search: "${searchTerm}"`,
        onRemove: () => setSearchTerm(""),
      })
    }
    return result
  }, [searchTerm, columnFilters])

  // Default sort by recently updated — replaces the old "Recents" tab concept
  const defaultSort = { key: "updated", direction: "desc" as const }
  const { sortedData, sortConfig, requestSort } = useSortableData(filteredData, defaultSort)

  const hasItems = allItems.length > 0

  const handleItemClick = (item: DisplayItem) => {
    onItemNavigate?.(item.id)
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* -- Header -------------------------------------------------------- */}
      <div className="sticky top-0 z-10 flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm shadow-[0_1px_2px_-1px_rgba(0,0,0,0.06)]">
        <div className="h-14 flex items-center justify-between px-6">
          <nav className="flex items-center gap-1.5 min-w-0 mr-4" aria-label="Breadcrumb">
            {ancestors.map((crumb) => (
              <Fragment key={crumb.id}>
                <button
                  onClick={() => onItemNavigate?.(crumb.id)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {crumb.title}
                </button>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" aria-hidden="true" />
              </Fragment>
            ))}
            <h1 className="text-sm font-semibold text-foreground truncate">{folderTitle}</h1>
            {hasItems && (
              <span className="text-xs text-muted-foreground/70 ml-1.5 shrink-0 tabular-nums">
                {filteredData.length !== typeFilteredItems.length
                  ? `${filteredData.length} of ${typeFilteredItems.length}`
                  : typeFilteredItems.length}
              </span>
            )}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              inputClassName="h-8 w-48 text-sm"
            />

            <FilterPopover
              columns={FILTER_COLUMNS}
              filters={filters}
              availableValues={availableValues}
              onToggleValue={toggleFilterValue}
              onClearFilter={clearFilter}
            />

            <SortPopover
              columns={SORT_COLUMNS}
              sortConfig={sortConfig}
              onSort={requestSort}
            />

            {supportsGridView && (
              <>
                <div className="w-px h-5 bg-border/40 mx-0.5" />
                <div className="flex items-center border border-border rounded-md p-0.5">
                  {([
                    { mode: "grid" as const, icon: Grid3X3, label: "Grid view" },
                    { mode: "table" as const, icon: TableIcon, label: "Table view" },
                  ]).map(({ mode, icon: Icon, label }) => (
                    <Button
                      key={mode}
                      variant={effectiveViewMode === mode ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode(mode)}
                      className="h-7 w-7 p-0"
                      aria-label={label}
                      aria-pressed={effectiveViewMode === mode}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  ))}
                </div>
              </>
            )}

            <div className="w-px h-5 bg-border/40 mx-0.5" />

            <Button
              size="sm"
              onClick={() => onAddNew?.(folderType)}
              className="h-8 gap-1.5 text-sm px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              {ADD_BUTTON_LABELS[folderType] ?? "Add New"}
            </Button>
          </div>
        </div>
      </div>

      {/* -- Active filter bar --------------------------------------------- */}
      <ActiveFilterBar
        filters={activeFilters}
        onClearAll={() => {
          setSearchTerm("")
          clearAllFilters()
        }}
      />

      {/* -- Content ------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {hasItems && sortedData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* -- Grid view ------------------------------------------------ */}
            {effectiveViewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                {sortedData.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.02 * i }}
                  >
                    <Card
                      className="cursor-pointer transition-[box-shadow,border-color] duration-200 hover:shadow-sm border border-border/60 hover:border-border group px-4 py-3 flex flex-col gap-2"
                      onClick={() => handleItemClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleItemClick(item) } }}
                      aria-label={`Open ${item.title}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                          item.isFolder
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                            : "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
                        }`}>
                          {item.isFolder ? <FolderOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`block text-sm truncate ${item.isFolder ? "font-medium text-foreground" : "text-foreground"}`}>
                            {item.title}
                          </span>
                          {!isConnections && !hideDescription && item.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
                          )}
                        </div>
                        {item.isFolder && item.subtitle && (
                          <span className="text-[11px] text-muted-foreground shrink-0">{item.subtitle}</span>
                        )}
                        {/* Action menu on hover, chevron otherwise */}
                        <div className="shrink-0 relative flex items-center justify-center">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:opacity-0 transition-opacity" />
                          <div className="absolute inset-y-0 right-0 flex items-center">
                            <ItemActionMenu
                              item={item}
                              tree={tree}
                              onRenameItem={onRenameItem}
                              onDeleteItem={onDeleteItem}
                              triggerClassName="h-6 w-6"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Metadata row */}
                      <div className="flex items-center gap-2 pl-11">
                        {item.status && (
                          <Badge variant="outline" className={`text-[11px] ${getStatusBadgeClass(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </Badge>
                        )}
                        {!item.isFolder && isConnections && item.account && (
                          <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">{item.account}</span>
                        )}
                        {!item.isFolder && !isConnections && item.relatedTo?.length ? (
                          <div className="flex items-center gap-1">
                            {item.relatedTo.slice(0, 2).map((rel) => (
                              <button
                                key={rel.id}
                                onClick={(e) => { e.stopPropagation(); onItemNavigate?.(rel.id) }}
                                className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/60 transition-colors cursor-pointer truncate max-w-[100px]"
                              >
                                {rel.title}
                              </button>
                            ))}
                            {item.relatedTo.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">+{item.relatedTo.length - 2}</span>
                            )}
                          </div>
                        ) : null}
                        {item.updated && (
                          <span className="text-[11px] text-muted-foreground tabular-nums ml-auto">{item.updated}</span>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* -- Table view ----------------------------------------------- */}
            {effectiveViewMode === "table" && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-b border-border">
                    <SortableTableHead
                      label="Name"
                      sortKey="title"
                      currentSortKey={sortConfig.key}
                      currentDirection={sortConfig.direction}
                      onSort={requestSort}
                      className="w-[40%]"
                    />
                    {isRecipes ? (
                      <SortableTableHead
                        label="Data Table"
                        sortKey="dataTable"
                        currentSortKey={sortConfig.key}
                        currentDirection={sortConfig.direction}
                        onSort={requestSort}
                        className="w-[280px]"
                      />
                    ) : (
                      <SortableTableHead
                        label={isConnections ? "Account" : "Related to"}
                        sortKey={isConnections ? "account" : "relatedToTitle"}
                        currentSortKey={sortConfig.key}
                        currentDirection={sortConfig.direction}
                        onSort={requestSort}
                        className="w-[200px]"
                      />
                    )}
                    {!isChats && (
                      <SortableTableHead
                        label="Type"
                        sortKey="tag"
                        currentSortKey={sortConfig.key}
                        currentDirection={sortConfig.direction}
                        onSort={requestSort}
                        className="w-[110px]"
                      />
                    )}
                    <SortableTableHead
                      label="Status"
                      sortKey="status"
                      currentSortKey={sortConfig.key}
                      currentDirection={sortConfig.direction}
                      onSort={requestSort}
                      className="w-[120px]"
                    />
                    <SortableTableHead
                      label="Updated"
                      sortKey="updated"
                      currentSortKey={sortConfig.key}
                      currentDirection={sortConfig.direction}
                      onSort={requestSort}
                      className="w-[150px]"
                    />
                    <SortableTableHead
                      label="By"
                      sortKey="updatedBy"
                      currentSortKey={sortConfig.key}
                      currentDirection={sortConfig.direction}
                      onSort={requestSort}
                      className="w-[110px]"
                    />
                    <th className="w-[44px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, delay: 0.015 * i }}
                      className="border-b border-border/60 last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors duration-150 group"
                      onClick={() => handleItemClick(item)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${item.title}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleItemClick(item)
                        }
                      }}
                    >
                      {/* Primary: Name — strongest visual weight */}
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                            item.isFolder
                              ? "bg-amber-100/80 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                              : "bg-stone-100/80 text-stone-500 dark:bg-stone-800/60 dark:text-stone-400"
                          }`}>
                            {item.isFolder ? <FolderOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className={`truncate block text-sm font-semibold text-foreground`}>{item.title}</span>
                            {!isConnections && !hideDescription && item.description && (
                              <p className="text-[13px] text-muted-foreground/80 line-clamp-1 mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {/* Related to / Account / Data Table */}
                      <TableCell className="py-3 px-4">
                        {isRecipes ? (
                          item.dataTable ? (
                            <code className="text-xs text-foreground/70 font-mono bg-muted/80 px-1.5 py-0.5 rounded break-all dark:text-foreground/60">{item.dataTable}</code>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">&mdash;</span>
                          )
                        ) : isConnections ? (
                          item.account ? (
                            <span className="text-[13px] text-foreground/70 truncate block max-w-[180px]">{item.account}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">&mdash;</span>
                          )
                        ) : item.relatedTo?.length ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            {item.relatedTo.map((rel) => (
                              <button
                                key={rel.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onItemNavigate?.(rel.id)
                                }}
                                className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950/70 transition-colors cursor-pointer truncate max-w-[180px]"
                              >
                                {rel.title}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">&mdash;</span>
                        )}
                      </TableCell>
                      {/* Secondary: Type — hidden for chats */}
                      {!isChats && (
                        <TableCell className="py-3 px-4">
                          {item.isFolder ? (
                            <span className="text-[13px] font-medium text-amber-600 dark:text-amber-400">{item.subtitle || "Folder"}</span>
                          ) : (
                            <span className="text-[13px] text-foreground/70">{item.tag}</span>
                          )}
                        </TableCell>
                      )}
                      {/* Secondary: Status */}
                      <TableCell className="py-3 px-4">
                        {item.status && (
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[13px] font-medium py-0.5 px-2.5 ${getStatusBadgeClass(item.status)}`}
                            >
                              {getStatusLabel(item.status)}
                              {item.status === "shared" && item.sharedWith && item.sharedWith.length > 0 && (
                                <span className="ml-1 text-emerald-600/70 dark:text-emerald-400/70">&middot; {item.sharedWith.length}</span>
                              )}
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      {/* Tertiary: Updated */}
                      <TableCell className="py-3 px-4 text-[13px] text-foreground/60 tabular-nums">{item.updated}</TableCell>
                      {/* Tertiary: By */}
                      <TableCell className="py-3 px-4 text-[13px] text-foreground/55">{item.updatedBy}</TableCell>
                      {/* Actions */}
                      <TableCell className="py-3 px-2 w-[44px]">
                        <ItemActionMenu
                          item={item}
                          tree={tree}
                          onRenameItem={onRenameItem}
                          onDeleteItem={onDeleteItem}
                        />
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </motion.div>
        )}

        {/* Type filter empty state — type tab has no items in this folder */}
        {hasItems && typeFilteredItems.length === 0 && typeFilter && (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">
              No {ARTIFACT_TYPE_LABELS[typeFilter]?.toLowerCase() ?? typeFilter} in this folder
            </p>
            {onSwitchToAllTab && (
              <button
                onClick={onSwitchToAllTab}
                className="text-xs text-primary hover:text-primary/80 font-medium mt-2 transition-colors cursor-pointer"
              >
                View all items
              </button>
            )}
          </div>
        )}

        {/* No search/filter results */}
        {hasItems && typeFilteredItems.length > 0 && filteredData.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? <>No items match &ldquo;{searchTerm}&rdquo;</>
                : "No items match your filters"}
            </p>
            <button
              onClick={() => { setSearchTerm(""); clearAllFilters() }}
              className="text-xs text-primary hover:text-primary/80 font-medium mt-2 transition-colors cursor-pointer"
            >
              Clear {hasActiveFilters ? "filters" : "search"}
            </button>
          </div>
        )}

        {/* Empty state */}
        {!hasItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="w-11 h-11 bg-muted/60 rounded-xl flex items-center justify-center mb-4">
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No items yet</p>
            <p className="text-xs text-muted-foreground mb-5">
              Get started by creating your first item.
            </p>
            <Button size="sm" onClick={() => onAddNew?.(folderType)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {ADD_BUTTON_LABELS[folderType] ?? "Add New"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
