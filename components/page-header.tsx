import { Fragment } from "react"
import { ChevronRight } from "lucide-react"
import type { BreadcrumbItem } from "@/lib/navigation"

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  onBreadcrumbClick?: (id: string) => void
}

export function PageHeader({ breadcrumbs, onBreadcrumbClick }: PageHeaderProps) {
  if (breadcrumbs.length === 0) return null

  return (
    <nav className="flex items-center gap-1 mb-5" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, i) => {
        const isLast = i === breadcrumbs.length - 1
        const isClickable = !isLast && !!onBreadcrumbClick

        return (
          <Fragment key={crumb.id}>
            {i > 0 && (
              <ChevronRight className="h-[10px] w-[10px] text-muted-foreground/30 flex-shrink-0" />
            )}
            <span
              className={[
                "text-[11px] leading-none tracking-wide select-none",
                isLast
                  ? "text-foreground/75 font-medium"
                  : "text-muted-foreground/55",
                isClickable
                  ? "hover:text-foreground/70 cursor-pointer transition-colors duration-150"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={isClickable ? () => onBreadcrumbClick(crumb.id) : undefined}
            >
              {crumb.title}
            </span>
          </Fragment>
        )
      })}
    </nav>
  )
}
