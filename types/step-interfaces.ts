export interface BaseStepProps {
  onNext?: () => void
  onPrevious?: () => void
  onComplete?: () => void
  isCompleted?: boolean
}

export interface Account {
  id: string
  name: string
  accountId: string
  type: string
  status: StatusType
}

export interface DataSourceConnection {
  id: string
  name: string
  email: string
  accounts: Account[]
}

export interface Connection {
  id: string
  name: string
  icon: any | string
  status: "connected" | "disconnected" | "error"
  connections: DataSourceConnection[]
}

export interface ProcessingStep {
  id: string
  title: string
  status: "pending" | "processing" | "completed" | "error"
}

export interface DataSourceStep {
  id: string
  name: string
  symbol: string
  color: string
  status: "pending" | "processing" | "completed" | "error"
  substeps: ProcessingStep[]
}

export type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "connected"
  | "disconnected"
  | "error"
  | "processing"
  | "completed"
