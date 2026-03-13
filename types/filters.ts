import type React from "react"

/** Describes a single column/field that can be filtered on */
export interface FilterColumnConfig<T = Record<string, unknown>> {
  /** Machine key matching the data field (e.g. "status", "tag", "updatedBy") */
  key: string
  /** Human-readable label shown in the column picker (e.g. "Status", "Type") */
  label: string
  /** Custom value extractor. Return a string or string[] for multi-value fields. Defaults to `String(item[key])` */
  accessor?: (item: T) => string | string[] | undefined | null
  /** Display transform for the value (e.g. "template" → "Template") */
  formatValue?: (raw: string) => string
  /** Optional icon shown next to the column name in the picker */
  icon?: React.ComponentType<{ className?: string }>
}

/** Runtime filter state: column key → set of selected values */
export type FilterState = Record<string, Set<string>>
