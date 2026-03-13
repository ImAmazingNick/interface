"use client"

import { X, Code, FileText, BarChart3, Table } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import type { ArtifactPanelContent } from "@/types"

interface ArtifactPanelProps {
  content: ArtifactPanelContent | null
  onClose: () => void
}

const ARTIFACT_ICONS = {
  code: Code,
  document: FileText,
  chart: BarChart3,
  table: Table,
}

function AiArtifactContent({ artifactType }: { artifactType?: string }) {
  const type = artifactType || "document"
  const Icon = ARTIFACT_ICONS[type as keyof typeof ARTIFACT_ICONS] || FileText

  return (
    <div className="px-5 py-5">
      <div className="rounded-lg min-h-[400px] flex flex-col bg-muted/20 border border-border/50 shadow-sm overflow-hidden">
        {/* Artifact header bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30 bg-muted/40">
          <Icon className="h-3.5 w-3.5 text-muted-foreground/40" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
            {type}
          </span>
        </div>

        {/* Artifact body */}
        <div className="flex-1 flex items-center justify-center p-6 bg-background/60">
          {type === "code" ? (
            <div className="w-full space-y-2.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <span className="text-[11px] text-muted-foreground/20 tabular-nums w-5 text-right select-none">{i + 1}</span>
                  <div
                    className="h-3 rounded-sm bg-muted/50"
                    style={{ width: `${30 + Math.random() * 50}%` }}
                  />
                </div>
              ))}
            </div>
          ) : type === "chart" ? (
            <div className="flex items-end gap-2.5 h-36">
              {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-9 bg-primary/10 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="w-full space-y-3.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-3 rounded-sm bg-muted/40"
                  style={{ width: `${50 + Math.random() * 40}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ArtifactPanel({ content, onClose }: ArtifactPanelProps) {
  if (!content) return null

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-5 border-b border-border bg-background/95 backdrop-blur-sm shadow-[0_1px_2px_-1px_rgba(0,0,0,0.06)]">
        <AnimatePresence mode="wait">
          <motion.h2
            key={content.title}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="text-[15px] font-semibold text-foreground truncate"
          >
            {content.title}
          </motion.h2>
        </AnimatePresence>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted shrink-0"
          aria-label="Close artifact panel"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait">
          <motion.div
            key={content.type}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <AiArtifactContent artifactType={content.artifactType} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
