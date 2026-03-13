"use client"

import { useState } from "react"
import { StepNavigation } from "@/components/step-navigation"
import { StepContent } from "@/components/step-content"
import { Button } from "@/components/ui/button"
import type { Step } from "@/types"

interface DashboardWorkflowProps {
  steps: Step[]
  currentStep: string
  onStepSelect: (stepId: string) => void
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
  onExit?: () => void
  hasPrevious: boolean
  hasNext: boolean
}

export function DashboardWorkflow({
  steps,
  currentStep,
  onStepSelect,
  onPrevious,
  onNext,
  onComplete,
  onExit,
  hasPrevious,
  hasNext,
}: DashboardWorkflowProps) {
  const [isStepNavCollapsed, setIsStepNavCollapsed] = useState(false)

  const currentStepData = steps.find((step) => step.id === currentStep)

  if (!currentStepData) {
    return <div>Step not found</div>
  }

  return (
    <div className="flex h-screen w-full relative">
      <StepNavigation
        steps={steps}
        currentStep={currentStep}
        onStepSelect={onStepSelect}
        isCollapsed={isStepNavCollapsed}
        onToggleCollapse={() => setIsStepNavCollapsed(!isStepNavCollapsed)}
      />
      <div className="flex-1 min-w-0">
        <StepContent
          step={currentStepData}
          onPrevious={onPrevious}
          onNext={onNext}
          onComplete={onComplete}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
      </div>
    </div>
  )
}
