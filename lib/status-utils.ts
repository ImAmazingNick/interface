export type ItemStatus = "template" | "private" | "shared"

export function getStatusBadgeClass(status: ItemStatus) {
  if (status === "template") return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
  if (status === "private") return "border-gray-300/70 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-900/60 dark:text-gray-300"
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
}

export function getStatusLabel(status: ItemStatus) {
  if (status === "template") return "Template"
  if (status === "private") return "Private"
  return "Shared"
}
