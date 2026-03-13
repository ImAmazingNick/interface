"use client"

import type { ShaderProps } from "@/types/chat"

import { LiquidMetal } from "@paper-design/shaders-react"
import { memo } from "react"
import { SHADER_CONFIG } from "@/lib/welcome-constants"

export const LiquidMetalOrb = memo<ShaderProps>(({ color }) => {
  const config = SHADER_CONFIG.LIQUID_METAL

  return (
    <>
      <LiquidMetal
        style={{ height: 80, width: 80, filter: "blur(14px)", position: "absolute" }}
        colorBack="hsl(0, 0%, 0%, 0)"
        colorTint={color}
        repetition={config.repetition}
        softness={config.softness}
        shiftRed={config.shiftRed}
        shiftBlue={config.shiftBlue}
        distortion={config.distortion}
        contour={config.contour}
        shape={config.shape}
        offsetX={config.offsetX}
        offsetY={config.offsetY}
        scale={config.scale}
        rotation={config.rotation}
        speed={config.speed}
      />
      <LiquidMetal
        style={{ height: 80, width: 80 }}
        colorBack="hsl(0, 0%, 0%, 0)"
        colorTint={color}
        repetition={config.repetition}
        softness={config.softness}
        shiftRed={config.shiftRed}
        shiftBlue={config.shiftBlue}
        distortion={config.distortion}
        contour={config.contour}
        shape={config.shape}
        offsetX={config.offsetX}
        offsetY={config.offsetY}
        scale={config.scale}
        rotation={config.rotation}
        speed={config.speed}
      />
    </>
  )
})

LiquidMetalOrb.displayName = "LiquidMetalOrb"
