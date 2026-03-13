"use client"

import { useState, useCallback, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import {
  Database,
  Globe,
  Mail,
  ShoppingCart,
  Smartphone,
  Users,
  Search,
  CheckCircle,
  ChevronRight,
  Plus
} from "lucide-react"
import { TreeItem } from "@/components/shared/tree-item"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Connection, DataSourceConnection, Account } from "@/types/step-interfaces"
import type { SetupSourcesStepProps, SelectedSourceData, SelectedConnectionData } from "@/types/setup-interfaces"

interface AccountItemProps {
  account: Account
  isSelected: boolean
  onToggle: (accountId: string) => void
}

const AccountItem = memo(
  ({ account, isSelected, onToggle }: AccountItemProps) => {
    const handleToggle = useCallback(() => {
      onToggle(account.id)
    }, [account.id, onToggle])

    return (
      <div
        className={`flex items-center gap-3 p-2 pr-4 rounded-md transition-colors cursor-pointer ${
          isSelected ? "" : "hover:bg-[#f5f5f0]"
        } w-full`}
        onClick={(e) => {
          // Only trigger if not clicking on checkbox elements
          const target = e.target as HTMLElement
          if (!target.matches('input') &&
              !target.closest('input') &&
              !target.matches('button') &&
              !target.closest('button')) {
            handleToggle()
          }
        }}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleToggle}
          className="h-4 w-4 data-[state=checked]:bg-purple-900 data-[state=checked]:border-purple-900 border-gray-400 data-[state=checked]:text-white cursor-pointer relative z-10"
        />
        <Users className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center justify-between flex-1 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-medium truncate">{account.name}</span>
            <span className="text-xs text-muted-foreground truncate">ID: {account.accountId}</span>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={account.status} />
          </div>
        </div>
      </div>
    )
  },
)

AccountItem.displayName = "AccountItem"

interface DataConnectionItemProps {
  connection: Connection
  dataConnection: DataSourceConnection
  selectedAccounts: string[]
  isExpanded: boolean
  onToggleDataConnection: (id: string) => void
  onSelectAllInDataConnection: (connectionId: string, dataConnectionId: string) => void
  onToggleAccount: (accountId: string) => void
}

const DataConnectionItem = memo(
  ({
    connection,
    dataConnection,
    selectedAccounts,
    isExpanded,
    onToggleDataConnection,
    onSelectAllInDataConnection,
    onToggleAccount,
  }: DataConnectionItemProps) => {
    const { allDataConnectionSelected, someDataConnectionSelected } = useMemo(() => {
      const dataConnectionAccountIds = dataConnection.accounts.map((a) => a.id)
      const allSelected =
        dataConnectionAccountIds.length > 0 &&
        dataConnectionAccountIds.every((id) => selectedAccounts.includes(id))
      const someSelected = dataConnectionAccountIds.some((id) => selectedAccounts.includes(id))

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
      <div className="w-full overflow-hidden">
        <TreeItem
          id={dataConnection.id}
          isExpanded={isExpanded}
          onToggle={() => onToggleDataConnection(dataConnection.id)}
          isSelected={allDataConnectionSelected}
          isIndeterminate={someDataConnectionSelected && !allDataConnectionSelected}
          onSelect={() => onSelectAllInDataConnection(connection.id, dataConnection.id)}
          level={1}
        >
          <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-medium truncate">{dataConnection.name}</span>
              <span className="text-muted-foreground truncate">({dataConnection.email})</span>
              <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                {dataConnection.accounts.length}
              </Badge>
            </div>
          </div>
        </TreeItem>

        {isExpanded && (
          <div
            className="ml-16 space-y-0 divide-y divide-[#f0f0e8] w-full"
            role="group"
            aria-label={`${dataConnection.name} accounts`}
          >
            {dataConnection.accounts.map((account, index) => (
              <div
                key={account.id}
                className={`${index > 0 ? "pt-1" : ""} w-full overflow-hidden`}
              >
                <div
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
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

DataConnectionItem.displayName = "DataConnectionItem"

interface ConnectionItemProps {
  connection: Connection
  selectedAccounts: string[]
  expandedConnections: string[]
  expandedDataConnections: string[]
  onToggleAccount: (accountId: string) => void
  onSelectAllInConnection: (connectionId: string) => void
  onSelectAllInDataConnection: (connectionId: string, dataConnectionId: string) => void
  onToggleConnection: (connectionId: string) => void
  onToggleDataConnection: (dataConnectionId: string) => void
  onConnectSource: (connectionId: string) => void
}

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
    onConnectSource,
  }: ConnectionItemProps) => {
    const isExpanded = expandedConnections.includes(connection.id)
    const isConnected = connection.status === "connected"
    const hasAccounts = connection.connections.length > 0

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

    const handleConnect = useCallback(() => {
      onConnectSource(connection.id)
    }, [connection.id, onConnectSource])

    // For unconnected sources, show them in the tree but without drilldown
    if (!isConnected) {
      return (
        <div className="mb-1 w-full overflow-hidden">
          <div className="flex items-center gap-2 p-2 hover:bg-[#f5f5f0] rounded-md group w-full cursor-pointer">
            {/* Invisible placeholders for expansion control and checkbox to maintain alignment */}
            <div className="w-6 h-6 opacity-0 pointer-events-none" aria-hidden="true"></div>
            <div className="w-4 h-4 opacity-0 pointer-events-none" aria-hidden="true"></div>

            {/* Icon */}
            {typeof connection.icon === 'string' ? (
              <div className="h-10 w-10 rounded-md border border-[#e8e5e0] bg-white/90 flex items-center justify-center p-1.5">
                <img src={connection.icon} alt={connection.name} className="h-6 w-6" />
              </div>
            ) : (
              connection.icon
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm truncate">{connection.name}</span>
            </div>

            {/* Badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleConnect}
                size="sm"
                className="h-6 px-3 text-xs bg-purple-900 hover:bg-purple-800 text-white  cursor-pointer"
              >
                <Plus className="h-3 w-3 mr-1" />
                Connect
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // For connected sources, show the tree structure
    return (
      <div className="mb-1 w-full overflow-hidden">
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
              <div className="h-10 w-10 rounded-md border border-[#e8e5e0] bg-white/90 flex items-center justify-center p-1.5">
                <img src={connection.icon} alt={connection.name} className="h-6 w-6" />
              </div>
            ) : (
              connection.icon
            )
          }
          badge={
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex-shrink-0">
              Connected
            </Badge>
          }
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-medium text-sm truncate">{connection.name}</span>
            {connection.connections.length > 1 && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {connection.connections.reduce((acc, conn) => acc + conn.accounts.length, 0)}
              </Badge>
            )}
          </div>
        </TreeItem>

        {isExpanded && hasAccounts && (
          <div
            className="ml-8 space-y-0 divide-y divide-[#f0f0e8] w-full"
            role="group"
            aria-label={`${connection.name} data connections`}
          >
            {connection.connections.map((dataConnection, index) => (
              <div key={dataConnection.id} className={`${index > 0 ? "pt-1" : ""} w-full overflow-hidden`}>
                <DataConnectionItem
                  connection={connection}
                  dataConnection={dataConnection}
                  selectedAccounts={selectedAccounts}
                  isExpanded={expandedDataConnections.includes(dataConnection.id)}
                  onToggleDataConnection={onToggleDataConnection}
                  onSelectAllInDataConnection={onSelectAllInDataConnection}
                  onToggleAccount={onToggleAccount}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

ConnectionItem.displayName = "ConnectionItem"

const mockConnections: Connection[] = [
  {
    id: "google-analytics",
    name: "Google Analytics",
    icon: "/static/sources/40x40_analyticsdata.png",
    status: "connected",
    connections: [
      {
        id: "ga-conn-1",
        name: "Main Business Account",
        email: "analytics@company.com",
        accounts: [
          {
            id: "ga-1",
            name: "Website Analytics",
            accountId: "GA4-123456789",
            type: "GA4 Property",
            status: "active",
          },
          {
            id: "ga-2",
            name: "Mobile App Analytics",
            accountId: "GA4-987654321",
            type: "App Property",
            status: "active",
          },
        ],
      },
      {
        id: "ga-conn-2",
        name: "Secondary Business Account",
        email: "analytics2@company.com",
        accounts: [
          {
            id: "ga-3",
            name: "Secondary Website",
            accountId: "GA4-555666777",
            type: "GA4 Property",
            status: "active",
          },
        ],
      },
    ],
  },
  {
    id: "facebook-business",
    name: "Facebook Business",
    icon: "/static/sources/40x40_facebook_business.png",
    status: "connected",
    connections: [
      {
        id: "fb-conn-1",
        name: "Business Manager",
        email: "social@company.com",
        accounts: [
          {
            id: "fb-1",
            name: "Main Ad Account",
            accountId: "FB-987654321",
            type: "Ad Account",
            status: "active",
          },
          {
            id: "fb-2",
            name: "Instagram Business",
            accountId: "IG-123456789",
            type: "Instagram Account",
            status: "active",
          },
        ],
      },
      {
        id: "fb-conn-2",
        name: "Secondary Business Manager",
        email: "social2@company.com",
        accounts: [
          {
            id: "fb-3",
            name: "Secondary Ad Account",
            accountId: "FB-111222333",
            type: "Ad Account",
            status: "active",
          },
        ],
      },
    ],
  },
  {
    id: "google-ads",
    name: "Google Ads",
    icon: "/static/sources/40x40_google_bigquery.png",
    status: "connected",
    connections: [
      {
        id: "gads-conn-1",
        name: "Primary Ad Account",
        email: "ads@company.com",
        accounts: [
          {
            id: "gads-1",
            name: "Search Campaigns",
            accountId: "GADS-123456789",
            type: "Search Account",
            status: "active",
          },
          {
            id: "gads-2",
            name: "Display Network",
            accountId: "GADS-987654321",
            type: "Display Account",
            status: "active",
          },
        ],
      },
      {
        id: "gads-conn-2",
        name: "Secondary Ad Account",
        email: "ads2@company.com",
        accounts: [
          {
            id: "gads-3",
            name: "Secondary Search",
            accountId: "GADS-444555666",
            type: "Search Account",
            status: "active",
          },
        ],
      },
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    icon: "/static/sources/40x40_shopify_graphql.png",
    status: "connected",
    connections: [
      {
        id: "shopify-conn-1",
        name: "Main Store",
        email: "admin@store.com",
        accounts: [
          {
            id: "shopify-1",
            name: "E-commerce Store",
            accountId: "SHOPIFY-123456789",
            type: "Online Store",
            status: "active",
          },
        ],
      },
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    icon: "/static/sources/40x40_hubspot.png",
    status: "connected",
    connections: [
      {
        id: "hubspot-conn-1",
        name: "Marketing Hub",
        email: "marketing@company.com",
        accounts: [
          {
            id: "hubspot-1",
            name: "Marketing Portal",
            accountId: "HUBSPOT-123456789",
            type: "Marketing Hub",
            status: "active",
          },
        ],
      },
    ],
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    icon: "/static/sources/40x40_klaviyo.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "tiktok-business",
    name: "TikTok Business",
    icon: "/static/sources/40x40_tiktok_business.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    icon: "/static/sources/40x40_linkedin_ads.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "snapchat-ads",
    name: "Snapchat Ads",
    icon: "/static/sources/40x40_snapchat_ads.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "pinterest-ads",
    name: "Pinterest Ads",
    icon: "/static/sources/40x40_pinterest_ads.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "instagram-organic",
    name: "Instagram Organic",
    icon: "/static/sources/40x40_instagram_organic.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "twitter-organic",
    name: "Twitter Organic",
    icon: "/static/sources/40x40_twitter.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "youtube-organic",
    name: "YouTube Organic",
    icon: "/static/sources/40x40_youtube_organic.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "spotify-organic",
    name: "Spotify Organic",
    icon: "/static/sources/40x40_spotify_organic.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "tiktok-organic",
    name: "TikTok Organic",
    icon: "/static/sources/40x40_tiktok_organic.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    icon: "/static/sources/40x40_salesforce_apex.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "zendesk",
    name: "Zendesk",
    icon: "/static/sources/40x40_zendesk.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "jira",
    name: "Jira",
    icon: "/static/sources/40x40_jira.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: "/static/sources/40x40_stripe.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "recharge",
    name: "Recharge",
    icon: "/static/sources/40x40_recharge.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "iterable",
    name: "Iterable",
    icon: "/static/sources/40x40_iterable.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "campaign-monitor",
    name: "Campaign Monitor",
    icon: "/static/sources/40x40_campaign_monitor.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "dot-digital",
    name: "DotDigital",
    icon: "/static/sources/40x40_dot_digital.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    icon: "/static/sources/40x40_postgresql.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "mysql",
    name: "MySQL",
    icon: "/static/sources/40x40_mysql.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "bigquery",
    name: "BigQuery",
    icon: "/static/sources/40x40_google_bigquery.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "snowflake",
    name: "Snowflake",
    icon: "/static/sources/40x40_snowflake.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "amazon-s3",
    name: "Amazon S3",
    icon: "/static/sources/40x40_amazon_s3.png",
    status: "disconnected",
    connections: [],
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    icon: "/static/sources/40x40_google_sheets.png",
    status: "disconnected",
    connections: [],
  },
]

function SetupSourcesStepContent({ onExit, onContinue }: SetupSourcesStepProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [expandedConnections, setExpandedConnections] = useState<string[]>([mockConnections[0]?.id || ""])
  const [expandedDataConnections, setExpandedDataConnections] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "connected" | "disconnected">("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [autoAddNewAccounts, setAutoAddNewAccounts] = useState(false)

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId],
    )
  }

  const selectAllInConnection = (connectionId: string) => {
    const connection = mockConnections.find((c) => c.id === connectionId)
    if (!connection) return

    const allAccountIds = connection.connections.flatMap((dc) => dc.accounts.map((a) => a.id))
    const allSelected = allAccountIds.every((id) => selectedAccounts.includes(id))

    if (allSelected) {
      setSelectedAccounts((prev) => prev.filter((id) => !allAccountIds.includes(id)))
    } else {
      setSelectedAccounts((prev) => [...new Set([...prev, ...allAccountIds])])
    }
  }

  const selectAllInDataConnection = (connectionId: string, dataConnectionId: string) => {
    const connection = mockConnections.find((c) => c.id === connectionId)
    const dataConnection = connection?.connections.find((dc) => dc.id === dataConnectionId)
    if (!dataConnection) return

    const accountIds = dataConnection.accounts.map((a) => a.id)
    const allSelected = accountIds.every((id) => selectedAccounts.includes(id))

    if (allSelected) {
      setSelectedAccounts((prev) => prev.filter((id) => !accountIds.includes(id)))
    } else {
      setSelectedAccounts((prev) => [...new Set([...prev, ...accountIds])])
    }
  }

  const toggleConnection = (connectionId: string) => {
    setExpandedConnections((prev) =>
      prev.includes(connectionId) ? prev.filter((id) => id !== connectionId) : [...prev, connectionId],
    )
  }

  const toggleDataConnection = (dataConnectionId: string) => {
    setExpandedDataConnections((prev) =>
      prev.includes(dataConnectionId) ? prev.filter((id) => id !== dataConnectionId) : [...prev, dataConnectionId],
    )
  }

  const handleConnectSource = (connectionId: string) => {
    // TODO: Implement connection logic
    console.log(`Connecting to ${connectionId}`)
    // Here you would typically:
    // 1. Open a connection modal/form
    // 2. Handle OAuth or API key input
    // 3. Update the connection status
    // 4. Refresh the data
  }

  const filteredConnections = mockConnections
    .map((connection) => {
      // Apply status filter first
      if (statusFilter !== "all" && connection.status !== statusFilter) {
        return null
      }

      // For disconnected sources, check if name matches search
      if (connection.status === "disconnected") {
        const matchesSearch = searchQuery === "" ||
          connection.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch ? connection : null
      }

      // For connected sources, filter accounts and connections
      const filteredDataConnections = connection.connections
        .map((dataConn) => ({
          ...dataConn,
          accounts: dataConn.accounts.filter(
            (account) =>
              searchQuery === "" ||
              account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              account.accountId.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((dataConn) => dataConn.accounts.length > 0)

      return filteredDataConnections.length > 0 ? { ...connection, connections: filteredDataConnections } : null
    })
    .filter((connection): connection is Connection => connection !== null)

  return (
    <div className="h-full flex flex-col bg-[#fafaf9]">
      {/* Header */}
      <div className="flex-shrink-0 pt-6 pb-3 px-3">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Setup sources and select accounts
          </h1>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex-shrink-0 p-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search sources, connections, accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex-shrink-0">
              <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "connected" | "disconnected")}>
                <TabsList className="grid grid-cols-3 h-12 border border-[#e8e5e0] rounded-lg">
                  <TabsTrigger value="all" className="text-sm px-4 py-2 cursor-pointer">
                    All ({mockConnections.length})
                  </TabsTrigger>
                  <TabsTrigger value="connected" className="text-sm px-4 py-2 cursor-pointer">
                    Connected ({mockConnections.filter(c => c.status === "connected").length})
                  </TabsTrigger>
                  <TabsTrigger value="disconnected" className="text-sm px-4 py-2 cursor-pointer">
                    Available ({mockConnections.filter(c => c.status === "disconnected").length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div
        className="flex-1 overflow-y-auto p-4"
        role="tree"
        aria-label="Data source connections and accounts"
      >
        <div className="max-w-6xl mx-auto">
          <div className="w-full space-y-0 divide-y divide-[#f0f0e8]">
            {filteredConnections.map((connection, index) => (
              <div key={connection.id} className={`${index > 0 ? "pt-1" : ""} w-full overflow-hidden`}>
                <ConnectionItem
                  connection={connection}
                  selectedAccounts={selectedAccounts}
                  expandedConnections={expandedConnections}
                  expandedDataConnections={expandedDataConnections}
                  onToggleAccount={toggleAccount}
                  onSelectAllInConnection={selectAllInConnection}
                  onSelectAllInDataConnection={selectAllInDataConnection}
                  onToggleConnection={toggleConnection}
                  onToggleDataConnection={toggleDataConnection}
                  onConnectSource={handleConnectSource}
                />
              </div>
            ))}
          </div>

          {filteredConnections.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              No items found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Selection Count */}
            <div className="text-sm text-muted-foreground">
              {selectedAccounts.length > 0 ? (
                <span>{selectedAccounts.length} account{selectedAccounts.length === 1 ? '' : 's'} selected</span>
              ) : (
                <span>Select accounts to continue</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="text-sm border border-[#e8e5e0] rounded px-3 py-1.5 bg-white hover:bg-gray-50 cursor-pointer flex items-center gap-2 min-w-[220px] text-left"
                  >
                    <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {dateRange.from && dateRange.to ? (
                      <span className="truncate">{format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}</span>
                    ) : (
                      <span className="text-muted-foreground truncate">Select data fetching period</span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange.from && dateRange.to ? dateRange as any : undefined}
                    onSelect={(range) => {
                      if (range?.from) {
                        setDateRange({
                          from: range.from,
                          to: range.to || range.from
                        })
                      }
                    }}
                    initialFocus
                    numberOfMonths={2}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>

              {/* Auto Add New Accounts Switch */}
              <div className="text-sm border border-[#e8e5e0] rounded px-3 py-1.5 bg-white hover:bg-gray-50 cursor-pointer flex items-center gap-2 min-w-[200px]">
                <label htmlFor="auto-add" className="text-sm text-muted-foreground cursor-pointer select-none flex-1">
                  Auto add new accounts
                </label>
                <Switch
                  id="auto-add"
                  checked={autoAddNewAccounts}
                  onCheckedChange={setAutoAddNewAccounts}
                  className="data-[state=checked]:bg-purple-600 cursor-pointer h-4 scale-90"
                />
              </div>

              <Button
                onClick={() => {
                  // Build properly typed selected sources data
                  const selectedSourcesData: SelectedSourceData[] = mockConnections
                    .filter(connection => {
                      return connection.connections.some(conn => 
                        conn.accounts.some(account => selectedAccounts.includes(account.id))
                      )
                    })
                    .map(source => ({
                      source: source,
                      connections: source.connections
                        .filter(conn => 
                          conn.accounts.some(account => selectedAccounts.includes(account.id))
                        )
                        .map(conn => ({
                          connection: conn,
                          accounts: conn.accounts.filter(account => 
                            selectedAccounts.includes(account.id)
                          )
                        }))
                    }))
                  
                  onContinue?.(selectedSourcesData, selectedAccounts)
                }}
                size="lg"
                className="px-8 py-3 h-auto text-base font-semibold cursor-pointer bg-purple-900 hover:bg-purple-800 text-white"
                disabled={selectedAccounts.length === 0}
              >
                Continue
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SetupSourcesStep(props: SetupSourcesStepProps) {
  return <SetupSourcesStepContent {...props} />
}
