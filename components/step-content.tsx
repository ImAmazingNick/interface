"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface StepContentProps {
  step: {
    id: string
    title: string
    description: string
    content: React.ReactNode
    completed: boolean
  }
  onPrevious?: () => void
  onNext?: () => void
  onComplete?: () => void
  hasPrevious: boolean
  hasNext: boolean
}

export function StepContent({ step, onPrevious, onNext, onComplete, hasPrevious, hasNext }: StepContentProps) {
  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 md:p-6 bg-background/80 backdrop-blur-sm border-b border-border/20">
        <div className="w-full max-w-none">
          <div className="mb-0.5 md:mb-1">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-0 md:mb-0.5">{step.title}</h1>
            <p className="text-base md:text-lg text-muted-foreground">{step.description}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-4 md:p-6 w-full">
          <div className="w-full max-w-none">
            <div className="w-full">{step.content}</div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4 md:p-6 flex-shrink-0 w-full">
        <div className="w-full flex items-center justify-between">
          <div>
            {hasPrevious && (
              <Button variant="outline" onClick={onPrevious} className="gap-3 bg-transparent h-12 px-8 text-base cursor-pointer">
                <ChevronLeft className="h-5 w-5" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasNext && (
              <Button onClick={onNext} className="gap-3 h-12 px-10 text-base cursor-pointer">
                Next
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
