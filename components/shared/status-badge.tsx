import { Badge } from "@/components/ui/badge"
import type { StatusType } from "@/types/step-interfaces"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "active":
      case "connected":
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      case "inactive":
      case "disconnected":
        return "bg-gray-50 text-gray-700 border-gray-200"
      case "pending":
      case "processing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "error":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <Badge variant="outline" className={`text-xs ${getStatusColor(status)} ${className}`}>
      {status}
    </Badge>
  )
}
