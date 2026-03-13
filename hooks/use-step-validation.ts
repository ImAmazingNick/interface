"use client"

import { useState, useCallback } from "react"

interface ValidationRule {
  field: string
  validator: (value: any) => boolean
  message: string
}

interface UseStepValidationProps {
  rules: ValidationRule[]
  onValidationChange?: (isValid: boolean) => void
}

export function useStepValidation({ rules, onValidationChange }: UseStepValidationProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValid, setIsValid] = useState(false)

  const validate = useCallback(
    (data: Record<string, any>) => {
      const newErrors: Record<string, string> = {}

      rules.forEach((rule) => {
        if (!rule.validator(data[rule.field])) {
          newErrors[rule.field] = rule.message
        }
      })

      const valid = Object.keys(newErrors).length === 0
      setErrors(newErrors)
      setIsValid(valid)
      onValidationChange?.(valid)

      return valid
    },
    [rules, onValidationChange],
  )

  const clearErrors = useCallback(() => {
    setErrors({})
    setIsValid(false)
  }, [])

  return {
    errors,
    isValid,
    validate,
    clearErrors,
  }
}
