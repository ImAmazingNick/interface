import type React from "react"
export interface Step {
  id: string
  title: string
  description: string
  completed: boolean
  content: React.ReactNode
}

export interface NavigationItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
}

export interface TreeNavigationItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  type: 'folder' | 'file' | 'section' | 'search' | 'more'
  children?: TreeNavigationItem[]
  expanded?: boolean
  href?: string
  status?: 'template' | 'private' | 'shared'
  tag?: string
  updated?: string
  updatedBy?: string
  description?: string
  relatedTo?: { id: string; title: string; type?: string }[]
  account?: string
  sharedWith?: { id: string; name: string; avatar?: string }[]
  sharedBy?: string
  dataTable?: string
}

export interface DataSourceCategory {
  id: string
  name: string
  connected: number
  total: number
}

export interface DataSource {
  id: string
  name: string
  category: string
  connected: boolean
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

export interface Account {
  id: string
  name: string
  email?: string
  status: "active" | "inactive"
  campaigns?: number
  revenue?: string
}

export interface Connection {
  id: string
  name: string
  email: string
  accounts: Account[]
  expanded?: boolean
}

export interface DataSourceConnection {
  id: string
  name: string
  connections: Connection[]
  expanded?: boolean
}

export interface ProcessingStep {
  id: string
  name: string
  status: "pending" | "processing" | "completed" | "error"
  icon: React.ComponentType<{ className?: string }>
}

export interface DataSourceProcessing {
  id: string
  name: string
  symbol: string
  color: string
  steps: ProcessingStep[]
  completed: boolean
  expanded?: boolean
}

export interface StepContentProps {
  step: Step
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
  hasPrevious: boolean
  hasNext: boolean
}

export interface StepNavigationProps {
  steps: Step[]
  currentStep: string
  onStepSelect: (stepId: string) => void
}

export interface ArtifactPanelContent {
  type: 'ai-artifact'
  title: string
  artifactType?: 'code' | 'document' | 'chart' | 'table'
}

export interface MainNavigationProps {
  activeItem: string
  onItemSelect: (item: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onPlusClick?: (id: string) => void
  sidebarWidth?: number
  onWidthChange?: (width: number) => void
}

export interface CategoryGroup {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  navItemIds: string[]
}
