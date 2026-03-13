"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Users } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Account } from "@/types/step-interfaces"

interface SelectedAccountsPanelProps {
  selectedAccounts: string[]
  showSelectedAccounts: boolean
  onToggleShow: () => void
  onRemoveAccount: (accountId: string) => void
  getSelectedAccountDetails: () => Array<{ connection: string; account: Account }>
}

export function SelectedAccountsPanel({
  selectedAccounts,
  showSelectedAccounts,
  onToggleShow,
  onRemoveAccount,
  getSelectedAccountDetails,
}: SelectedAccountsPanelProps) {
  if (selectedAccounts.length === 0) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background border-t shadow-lg w-full">
      <div className="p-4 w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleShow}
          className="flex items-center gap-2 text-sm font-medium w-full"
        >
          {showSelectedAccounts ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          Selected Accounts ({selectedAccounts.length})
        </Button>

        {showSelectedAccounts && (
          <div className="mt-3 max-h-40 overflow-y-auto space-y-2 w-full">
            {getSelectedAccountDetails().map(({ connection, account }) => (
              <div key={account.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-md text-sm w-full">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{account.name}</span>
                <span className="text-muted-foreground">({connection})</span>
                <StatusBadge status={account.status} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveAccount(account.id)}
                  className="ml-auto h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
