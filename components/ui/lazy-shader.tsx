"use client"

import type React from "react"

import { lazy, Suspense } from "react"

const LiquidMetalOrb = lazy(() =>
  import("@/components/shaders/liquid-metal-orb").then((m) => ({ default: m.LiquidMetalOrb })),
)
const AnimatedBorder = lazy(() =>
  import("@/components/shaders/animated-border").then((m) => ({ default: m.AnimatedBorder })),
)

interface LazyShaderProps {
  component: "orb" | "border"
  fallback?: React.ReactNode
  [key: string]: any
}

const ShaderFallback = () => (
  <div className="flex items-center justify-center h-20 w-20 bg-muted/20 rounded-full animate-pulse" />
)

export function LazyShader({ component, fallback = <ShaderFallback />, ...props }: LazyShaderProps) {
  return (
    <Suspense fallback={fallback}>
      {component === "orb" ? (
        <LiquidMetalOrb color={props.color} />
      ) : (
        <AnimatedBorder
          isVisible={props.isVisible ?? true}
          backgroundColor={props.backgroundColor}
          colors={props.colors}
        />
      )}
    </Suspense>
  )
}
