import { FolderOpen, FileText, ChevronRight } from "lucide-react"
import type { NavItem } from "@/lib/navigation"

interface NavRowProps {
  item: NavItem & { path?: string }
  isLast: boolean
  onNavigate: (id: string) => void
}

export function NavRow({ item, isLast, onNavigate }: NavRowProps) {
  const isFolder = item.type === "folder"
  const childCount = item.children?.length ?? 0

  return (
    <div
      className={`flex items-center px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors group ${
        !isLast ? "border-b border-border/40" : ""
      }`}
      onClick={() => onNavigate(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onNavigate(item.id)
        }
      }}
    >
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center mr-3 flex-shrink-0 ${
          isFolder
            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
            : "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
        }`}
      >
        {isFolder ? (
          <FolderOpen className="h-3.5 w-3.5" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span
          className={`block text-sm truncate ${
            isFolder ? "font-medium text-foreground" : "text-foreground/90"
          }`}
        >
          {item.title}
        </span>
        {item.path && (
          <span className="block text-[11px] text-muted-foreground/50 truncate mt-0.5">
            {item.path}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        {isFolder && childCount > 0 && (
          <span className="text-[11px] text-muted-foreground/40">
            {childCount} {childCount === 1 ? "item" : "items"}
          </span>
        )}
        {isFolder ? (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
        ) : (
          <div className="w-3.5" />
        )}
      </div>
    </div>
  )
}
