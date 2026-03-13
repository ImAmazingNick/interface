import type { AnimationConfig } from "@/types/chat"

export const QUICK_ACTIONS = [
  "Analyze data trends",
  "Create visualizations",
  "Build dashboards",
  "Generate insights",
  "KPI analysis",
] as const

export const ANIMATIONS: Record<string, AnimationConfig> = {
  FOCUS: {
    duration: 0.5,
    type: "spring",
    stiffness: 200,
    damping: 20,
  },
  BORDER: {
    duration: 0.6,
    delay: 0.1,
  },
  CHIPS: {
    duration: 0.4,
    delay: 0.1,
  },
}

export const KEYBOARD_SHORTCUTS = {
  SEND: ["Meta", "Enter"] as const,
  SEND_ALT: ["Control", "Enter"] as const,
} as const

export const THEME_COLORS = {
  DARK: {
    liquidMetal: "hsl(270, 60%, 55%)",
    pulsingBorderBack: "hsl(0, 0%, 0%)",
    pulsingBorderColors: [
      "hsl(270, 60%, 55%)",
      "hsl(280, 70%, 65%)",
      "hsl(120, 30%, 75%)",
      "hsl(275, 55%, 50%)",
      "hsl(270, 40%, 30%)",
    ] as const,
    focusBorder: "hsl(270, 60%, 55%)",
  },
  LIGHT: {
    liquidMetal: "hsl(270, 50%, 45%)",
    pulsingBorderBack: "hsl(0, 0%, 100%)",
    pulsingBorderColors: [
      "hsl(270, 50%, 45%)",
      "hsl(280, 60%, 55%)",
      "hsl(120, 25%, 70%)",
      "hsl(275, 45%, 40%)",
      "hsl(270, 30%, 80%)",
    ] as const,
    focusBorder: "hsl(270, 50%, 45%)",
  },
} as const

export const SHADER_CONFIG = {
  LIQUID_METAL: {
    repetition: 4,
    softness: 0.5,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    distortion: 0.1,
    contour: 1,
    shape: "circle" as const,
    offsetX: 0,
    offsetY: 0,
    scale: 0.58,
    rotation: 50,
    speed: 5,
  },
  PULSING_BORDER: {
    roundness: 0.18,
    thickness: 0,
    softness: 0,
    intensity: 0.3,
    bloom: 2,
    spots: 2,
    spotSize: 0.25,
    pulse: 0,
    smoke: 0.35,
    smokeSize: 0.4,
    scale: 0.7,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    speed: 1,
  },
} as const
