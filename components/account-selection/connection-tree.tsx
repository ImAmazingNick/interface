"use client"

import { memo, useCallback, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Users } from "lucide-react"
import { TreeItem } from "@/components/shared/tree-item"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Connection, StatusType } from "@/types/step-interfaces"

interface ConnectionTreeProps {
  connections: Connection[]
  selectedAccounts: string[]
  expandedConnections: string[]
  expandedDataConnections: string[]
  onToggleAccount: (accountId: string) => void
  onSelectAllInConnection: (connectionId: string) => void
  onSelectAllInDataConnection: (connectionId: string, dataConnectionId: string) => void
  onToggleConnection: (connectionId: string) => void
  onToggleDataConnection: (dataConnectionId: string) => void
}

const AccountItem = memo(
  ({
    account,
    isSelected,
    onToggle,
  }: {
    account: { id: string; name: string; accountId: string; status: string }
    isSelected: boolean
    onToggle: (accountId: string) => void
  }) => {
    const handleToggle = useCallback(() => {
      onToggle(account.id)
    }, [account.id, onToggle])

    return (
      <div
        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
          isSelected ? "bg-primary/10" : "hover:bg-muted/50"
        } w-full`}
        onClick={handleToggle}
      >
        <Checkbox checked={isSelected} onCheckedChange={handleToggle} className="h-4 w-4" />
        <Users className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center justify-between flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{account.name}</span>
            <span className="text-xs text-muted-foreground">ID: {account.accountId}</span>
          </div>
          <StatusBadge status={account.status as StatusType} />
        </div>
      </div>
    )
  },
)

AccountItem.displayName = "AccountItem"

// DataConnection component to handle its own hooks
const DataConnectionItem = memo(
  ({
    connection,
    dataConnection,
    selectedAccounts,
    isExpanded,
    onToggleDataConnection,
    onSelectAllInDataConnection,
    onToggleAccount,
  }: {
    connection: Connection
    dataConnection: any
    selectedAccounts: string[]
    isExpanded: boolean
    onToggleDataConnection: (id: string) => void
    onSelectAllInDataConnection: (connectionId: string, dataConnectionId: string) => void
    onToggleAccount: (accountId: string) => void
  }) => {
    const { allDataConnectionSelected, someDataConnectionSelected } = useMemo(() => {
      const dataConnectionAccountIds = dataConnection.accounts.map((a: any) => a.id)
      const allSelected =
        dataConnectionAccountIds.length > 0 &&
        dataConnectionAccountIds.every((id: string) => selectedAccounts.includes(id))
      const someSelected = dataConnectionAccountIds.some((id: string) => selectedAccounts.includes(id))

      return {
        allDataConnectionSelected: allSelected,
        someDataConnectionSelected: someSelected,
      }
    }, [dataConnection.accounts, selectedAccounts])

    const handleToggleAccount = useCallback(
      (accountId: string) => {
        onToggleAccount(accountId)
      },
      [onToggleAccount]
    )

    return (
      <div className="w-full">
        <TreeItem
          id={dataConnection.id}
          isExpanded={isExpanded}
          onToggle={() => onToggleDataConnection(dataConnection.id)}
          isSelected={allDataConnectionSelected}
          isIndeterminate={someDataConnectionSelected && !allDataConnectionSelected}
          onSelect={() => onSelectAllInDataConnection(connection.id, dataConnection.id)}
          level={1}
          badge={
            <Badge variant="outline" className="text-xs">
              {dataConnection.accounts.length}
            </Badge>
          }
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{dataConnection.name}</span>
            <span className="text-muted-foreground">({dataConnection.email})</span>
          </div>
        </TreeItem>

        {isExpanded && (
          <div
            className="ml-8 space-y-1 w-full"
            role="group"
            aria-label={`${dataConnection.name} accounts`}
          >
            {dataConnection.accounts.map((account: any) => (
              <div
                key={account.id}
                role="treeitem"
                aria-level={3}
                aria-selected={selectedAccounts.includes(account.id)}
                aria-label={`Account: ${account.name}, ID: ${account.accountId}, Status: ${account.status}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleToggleAccount(account.id)
                  }
                }}
              >
                <AccountItem
                  account={account}
                  isSelected={selectedAccounts.includes(account.id)}
                  onToggle={handleToggleAccount}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

DataConnectionItem.displayName = "DataConnectionItem"

// Connection component to handle its own hooks
const ConnectionItem = memo(
  ({
    connection,
    selectedAccounts,
    expandedConnections,
    expandedDataConnections,
    onToggleAccount,
    onSelectAllInConnection,
    onSelectAllInDataConnection,
    onToggleConnection,
    onToggleDataConnection,
  }: {
    connection: Connection
    selectedAccounts: string[]
    expandedConnections: string[]
    expandedDataConnections: string[]
    onToggleAccount: (accountId: string) => void
    onSelectAllInConnection: (connectionId: string) => void
    onSelectAllInDataConnection: (connectionId: string, dataConnectionId: string) => void
    onToggleConnection: (connectionId: string) => void
    onToggleDataConnection: (dataConnectionId: string) => void
  }) => {
    const isExpanded = expandedConnections.includes(connection.id)

    const { allConnectionAccounts, allConnectionSelected, someConnectionSelected } = useMemo(() => {
      const allAccounts = connection.connections.flatMap((dc) => dc.accounts.map((a) => a.id))
      const allSelected = allAccounts.length > 0 && allAccounts.every((id) => selectedAccounts.includes(id))
      const someSelected = allAccounts.some((id) => selectedAccounts.includes(id))

      return {
        allConnectionAccounts: allAccounts,
        allConnectionSelected: allSelected,
        someConnectionSelected: someSelected,
      }
    }, [connection.connections, selectedAccounts])

    return (
      <div className="mb-1">
        <TreeItem
          id={connection.id}
          isExpanded={isExpanded}
          onToggle={() => onToggleConnection(connection.id)}
          isSelected={allConnectionSelected}
          isIndeterminate={someConnectionSelected && !allConnectionSelected}
          onSelect={() => onSelectAllInConnection(connection.id)}
          level={0}
          icon={
            typeof connection.icon === 'string' ? (
              <img src={connection.icon} alt={connection.name} className="h-5 w-5" />
            ) : (
              connection.icon
            )
          }
          badge={
            <>
              <CheckCircle className="h-3 w-3 text-green-600" />
              <Badge variant="outline" className="text-xs">
                {connection.connections.reduce((acc, conn) => acc + conn.accounts.length, 0)}
              </Badge>
            </>
          }
        >
          <span className="font-medium text-sm flex-1">{connection.name}</span>
        </TreeItem>

        {isExpanded && (
          <div
            className="ml-6 space-y-1 w-full"
            role="group"
            aria-label={`${connection.name} data connections`}
          >
            {connection.connections.map((dataConnection) => (
              <DataConnectionItem
                key={dataConnection.id}
                connection={connection}
                dataConnection={dataConnection}
                selectedAccounts={selectedAccounts}
                isExpanded={expandedDataConnections.includes(dataConnection.id)}
                onToggleDataConnection={onToggleDataConnection}
                onSelectAllInDataConnection={onSelectAllInDataConnection}
                onToggleAccount={onToggleAccount}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
)

ConnectionItem.displayName = "ConnectionItem"

export const ConnectionTree = memo(
  ({
    connections,
    selectedAccounts,
    expandedConnections,
    expandedDataConnections,
    onToggleAccount,
    onSelectAllInConnection,
    onSelectAllInDataConnection,
    onToggleConnection,
    onToggleDataConnection,
  }: ConnectionTreeProps) => {
    const handleToggleAccount = useCallback(
      (accountId: string) => {
        onToggleAccount(accountId)
      },
      [onToggleAccount],
    )

    const handleSelectAllInConnection = useCallback(
      (connectionId: string) => {
        onSelectAllInConnection(connectionId)
      },
      [onSelectAllInConnection],
    )

    const handleSelectAllInDataConnection = useCallback(
      (connectionId: string, dataConnectionId: string) => {
        onSelectAllInDataConnection(connectionId, dataConnectionId)
      },
      [onSelectAllInDataConnection],
    )

    const handleToggleConnection = useCallback(
      (connectionId: string) => {
        onToggleConnection(connectionId)
      },
      [onToggleConnection],
    )

    const handleToggleDataConnection = useCallback(
      (dataConnectionId: string) => {
        onToggleDataConnection(dataConnectionId)
      },
      [onToggleDataConnection],
    )

    return (
      <div
        className="bg-background border rounded-lg w-full"
        role="tree"
        aria-label="Data source connections and accounts"
      >
        <div className="p-2">
          {connections.map((connection) => (
            <ConnectionItem
              key={connection.id}
              connection={connection}
              selectedAccounts={selectedAccounts}
              expandedConnections={expandedConnections}
              expandedDataConnections={expandedDataConnections}
              onToggleAccount={handleToggleAccount}
              onSelectAllInConnection={handleSelectAllInConnection}
              onSelectAllInDataConnection={handleSelectAllInDataConnection}
              onToggleConnection={handleToggleConnection}
              onToggleDataConnection={handleToggleDataConnection}
            />
          ))}
        </div>
      </div>
    )
  },
)

ConnectionTree.displayName = "ConnectionTree"
