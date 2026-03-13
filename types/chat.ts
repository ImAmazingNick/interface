export interface AnimatedBorderProps {
  isVisible: boolean
  backgroundColor?: string
  colors?: string[]
}

export interface ShaderProps {
  color?: string
}

export interface ThemeColors {
  isDark: boolean
  liquidMetalColor: string
  pulsingBorderBack: string
  pulsingBorderColors: readonly string[]
  focusBorderColor: string
}

export interface AnimationConfig {
  duration: number
  type?: "spring" | "tween" | "keyframes" | "inertia"
  stiffness?: number
  damping?: number
  delay?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export type ModelType = "gpt-4" | "gpt-3.5-turbo" | "claude-3" | "claude-3-haiku"

export interface Template {
  id: string
  title: string
  prompt: string
  color: string
  image: string
  tag: string
  date: string
}
