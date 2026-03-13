"use client"

import { memo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Settings } from "lucide-react"

interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

interface AccountSettingsProps {
  autoAddNewAccounts: boolean
  onAutoAddChange: (value: boolean) => void
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

export const AccountSettings = memo(
  ({ autoAddNewAccounts, onAutoAddChange, dateRange, onDateRangeChange }: AccountSettingsProps) => {
    const handleAutoAddChange = useCallback(
      (value: boolean) => {
        onAutoAddChange(value)
      },
      [onAutoAddChange],
    )

    const handleDateRangeChange = useCallback(
      (range: DateRange | undefined) => {
        if (range) {
          onDateRangeChange(range)
        }
      },
      [onDateRangeChange],
    )

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <div className="w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-10 justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Select data fetching period</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal bg-transparent h-10 px-3"
            asChild
          >
            <div className="flex items-center justify-between cursor-default">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Auto add new accounts</span>
              </div>
              <Switch
                checked={autoAddNewAccounts}
                onCheckedChange={handleAutoAddChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </Button>
        </div>
      </div>
    )
  },
)

AccountSettings.displayName = "AccountSettings"
