"use client"

import type { ThemeColors } from "@/types/chat"

import { useMemo } from "react"
import { useTheme } from "next-themes"
import { THEME_COLORS } from "@/lib/welcome-constants"

export function useThemeColors(): ThemeColors {
  const { theme } = useTheme()

  return useMemo((): ThemeColors => {
    const isDark = theme === "dark"
    const colorSet = isDark ? THEME_COLORS.DARK : THEME_COLORS.LIGHT

    return {
      isDark,
      liquidMetalColor: colorSet.liquidMetal,
      pulsingBorderBack: colorSet.pulsingBorderBack,
      pulsingBorderColors: colorSet.pulsingBorderColors,
      focusBorderColor: colorSet.focusBorder,
    }
  }, [theme])
}
