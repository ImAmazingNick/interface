export type ThoughtStepType =
  | 'thinking'
  | 'web_search'
  | 'browsing'
  | 'tool_use'
  | 'conclusion'
  | 'query'
  | 'artifact'

export type ThoughtStepStatus = 'pending' | 'active' | 'completed' | 'error'

export interface ThoughtStep {
  id: string
  type: ThoughtStepType
  title: string
  content: string
  status: ThoughtStepStatus
  timestamp: Date
  duration?: number
  metadata?: {
    url?: string
    query?: string
    results?: string[]
    artifactId?: string
    toolName?: string
  }
}

export type SessionStatus = 'active' | 'completed' | 'paused' | 'error'

export interface SessionMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  thoughtSteps?: ThoughtStep[]
}

export interface Session {
  id: string
  title: string
  status: SessionStatus
  createdAt: Date
  updatedAt: Date
  messages: SessionMessage[]
  thoughtSteps: ThoughtStep[]
  relatedArtifacts: string[]
  relatedItems: { id: string; title: string; type?: string }[]
  agentModel?: string
}

export type CenterViewTab = string  // artifact type slug, 'all', or 'sessions'
