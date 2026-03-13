"use client"

import type { AnimatedBorderProps } from "@/types/chat"

import { PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import { memo } from "react"
import { SHADER_CONFIG } from "@/lib/welcome-constants"

export const AnimatedBorder = memo<AnimatedBorderProps>(({ isVisible, backgroundColor, colors }) => {
  const config = SHADER_CONFIG.PULSING_BORDER

  return (
    <motion.div
      className="absolute w-full h-full z-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <PulsingBorder
        style={{ height: "146.5%", minWidth: "143%" }}
        colorBack={backgroundColor}
        roundness={config.roundness}
        thickness={config.thickness}
        softness={config.softness}
        intensity={config.intensity}
        bloom={config.bloom}
        spots={config.spots}
        spotSize={config.spotSize}
        pulse={config.pulse}
        smoke={config.smoke}
        smokeSize={config.smokeSize}
        scale={config.scale}
        rotation={config.rotation}
        offsetX={config.offsetX}
        offsetY={config.offsetY}
        speed={config.speed}
        colors={colors}
      />
    </motion.div>
  )
})

AnimatedBorder.displayName = "AnimatedBorder"
