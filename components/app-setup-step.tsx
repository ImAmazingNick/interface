"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronDown, Folder, FolderOpen, Type, Hash, Calendar, ToggleLeft } from "lucide-react"
import { MOCK_DATA_FIELDS, VALIDATION_RULES } from "@/constants"
import { validateRequired } from "@/lib/utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface AppSetupStepProps {
  onDataChange?: (data: { appName: string; dataTable: string; isValid: boolean }) => void
}

const getFieldIcon = (type: string) => {
  const iconMap = {
    string: <Type className="h-4 w-4 text-gray-500" />,
    number: <Hash className="h-4 w-4 text-gray-500" />,
    datetime: <Calendar className="h-4 w-4 text-gray-500" />,
    boolean: <ToggleLeft className="h-4 w-4 text-gray-500" />,
  }
  return iconMap[type as keyof typeof iconMap] || <Type className="h-4 w-4 text-gray-500" />
}

export function AppSetupStep({ onDataChange }: AppSetupStepProps) {
  const [appName, setAppName] = useLocalStorage("app-setup-name", "Cross-channel performance")
  const [dataTable, setDataTable] = useLocalStorage("app-setup-table", "cross_channel_model")
  const [showFields, setShowFields] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const debouncedAppName = useDebouncedValue(appName, 300)
  const debouncedDataTable = useDebouncedValue(dataTable, 300)

  const validation = useMemo(() => {
    const isAppNameValid =
      validateRequired(debouncedAppName) &&
      debouncedAppName.length >= VALIDATION_RULES.MIN_APP_NAME_LENGTH &&
      debouncedAppName.length <= VALIDATION_RULES.MAX_APP_NAME_LENGTH

    const isDataTableValid =
      validateRequired(debouncedDataTable) &&
      debouncedDataTable.length >= VALIDATION_RULES.MIN_TABLE_NAME_LENGTH &&
      debouncedDataTable.length <= VALIDATION_RULES.MAX_TABLE_NAME_LENGTH

    return {
      appName: {
        isValid: isAppNameValid,
        error:
          !isAppNameValid && debouncedAppName.length > 0
            ? `App name must be between ${VALIDATION_RULES.MIN_APP_NAME_LENGTH} and ${VALIDATION_RULES.MAX_APP_NAME_LENGTH} characters`
            : null,
      },
      dataTable: {
        isValid: isDataTableValid,
        error:
          !isDataTableValid && debouncedDataTable.length > 0
            ? `Table name must be between ${VALIDATION_RULES.MIN_TABLE_NAME_LENGTH} and ${VALIDATION_RULES.MAX_TABLE_NAME_LENGTH} characters`
            : null,
      },
      isFormValid: isAppNameValid && isDataTableValid,
    }
  }, [debouncedAppName, debouncedDataTable])

  const handleAppNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAppName(e.target.value)
    },
    [setAppName],
  )

  const handleDataTableChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDataTable(e.target.value)
    },
    [setDataTable],
  )

  const handleDataTableSet = useCallback(() => {
    if (validation.dataTable.isValid) {
      setShowFields(true)
      onDataChange?.({
        appName: debouncedAppName,
        dataTable: debouncedDataTable,
        isValid: validation.isFormValid,
      })
    }
  }, [validation.dataTable.isValid, validation.isFormValid, debouncedAppName, debouncedDataTable, onDataChange])

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <Label htmlFor="app-name">Application Name</Label>
          <Input
            id="app-name"
            placeholder="Enter your app name (e.g., Cross-channel performance)"
            value={appName}
            onChange={handleAppNameChange}
            className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
              validation.appName.error ? "border-destructive focus:ring-destructive/20" : ""
            }`}
            aria-invalid={!!validation.appName.error}
            aria-describedby={validation.appName.error ? "app-name-error" : undefined}
          />
          {validation.appName.error && (
            <p id="app-name-error" className="text-sm text-destructive">
              {validation.appName.error}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data-table">Data Table</Label>
          <div className="flex gap-2">
            <Input
              id="data-table"
              placeholder="Enter table name (e.g., cross_channel_model)"
              value={dataTable}
              onChange={handleDataTableChange}
              className={`flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                validation.dataTable.error ? "border-destructive focus:ring-destructive/20" : ""
              }`}
              aria-invalid={!!validation.dataTable.error}
              aria-describedby={validation.dataTable.error ? "data-table-error" : undefined}
            />
            <Button
              onClick={handleDataTableSet}
              disabled={!validation.dataTable.isValid}
              className="transition-all duration-200"
            >
              Set Table
            </Button>
          </div>
          {validation.dataTable.error && (
            <p id="data-table-error" className="text-sm text-destructive">
              {validation.dataTable.error}
            </p>
          )}
        </div>

        {showFields && (
          <div className="border rounded-lg">
            <div
              className="flex items-center gap-2 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={toggleExpanded}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggleExpanded()
                }
              }}
              aria-expanded={isExpanded}
              aria-controls="data-fields-list"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-primary" />
              ) : (
                <Folder className="h-4 w-4 text-primary" />
              )}
              <span className="font-medium">{dataTable}</span>
              <Badge variant="secondary" className="ml-auto">
                {MOCK_DATA_FIELDS.length} fields
              </Badge>
            </div>

            {isExpanded && (
              <div id="data-fields-list" className="border-t">
                {MOCK_DATA_FIELDS.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 p-3 pl-8 hover:bg-muted/30 transition-colors border-b last:border-b-0"
                  >
                    {getFieldIcon(field.type)}
                    <span className="font-medium text-sm">{field.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {field.type}
                    </Badge>
                    <div className="ml-auto">
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
