"use client"

import { useState } from "react"
import { AccountSettings } from "./account-selection/account-settings"
import { AccountSearch } from "./account-selection/account-search"
import { ConnectionTree } from "./account-selection/connection-tree"
import { SelectedAccountsPanel } from "./account-selection/selected-accounts-panel"
import type { Connection, Account } from "@/types/step-interfaces"

const mockConnections: Connection[] = [
  {
    id: "google-ads",
    name: "Google Ads",
    icon: "/static/sources/40x40_google_ads_ql.png",
    status: "connected",
    connections: [
      {
        id: "ga-conn-1",
        name: "Main Business Account",
        email: "ads@company.com",
        accounts: [
          {
            id: "ga-1",
            name: "E-commerce Store Campaign",
            accountId: "GA-123456789",
            type: "Campaign Account",
            status: "active",
          },
          {
            id: "ga-2",
            name: "Brand Awareness Account",
            accountId: "GA-987654321",
            type: "Display Account",
            status: "active",
          },
          {
            id: "ga-3",
            name: "Local Business Ads",
            accountId: "GA-456789123",
            type: "Local Account",
            status: "inactive",
          },
        ],
      },
      {
        id: "ga-conn-2",
        name: "Agency Account",
        email: "agency@marketing.com",
        accounts: [
          {
            id: "ga-4",
            name: "Client Campaign A",
            accountId: "GA-111222333",
            type: "Campaign Account",
            status: "active",
          },
          {
            id: "ga-5",
            name: "Client Campaign B",
            accountId: "GA-444555666",
            type: "Campaign Account",
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
    status: "connected",
    connections: [
      {
        id: "kl-conn-1",
        name: "Main Store Connection",
        email: "email@store.com",
        accounts: [
          {
            id: "kl-1",
            name: "Main Store Email List",
            accountId: "KL-ABC123",
            type: "Email List",
            status: "active",
          },
          {
            id: "kl-2",
            name: "VIP Customer Segment",
            accountId: "KL-DEF456",
            type: "Segment",
            status: "active",
          },
          {
            id: "kl-3",
            name: "Newsletter Subscribers",
            accountId: "KL-GHI789",
            type: "Email List",
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
        id: "sh-conn-1",
        name: "Primary Store",
        email: "admin@store.com",
        accounts: [
          {
            id: "sh-1",
            name: "Main Store",
            accountId: "SH-STORE001",
            type: "Store",
            status: "active",
          },
          {
            id: "sh-2",
            name: "Wholesale Portal",
            accountId: "SH-B2B002",
            type: "B2B Store",
            status: "active",
          },
        ],
      },
    ],
  },
  {
    id: "facebook",
    name: "Facebook Ads",
    icon: "/static/sources/40x40_facebook.png",
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
            name: "Instagram Campaigns",
            accountId: "FB-123456789",
            type: "Instagram",
            status: "active",
          },
        ],
      },
    ],
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    icon: "/static/sources/40x40_analyticsdata.png",
    status: "connected",
    connections: [
      {
        id: "ga4-conn-1",
        name: "Website Properties",
        email: "analytics@company.com",
        accounts: [
          {
            id: "ga4-1",
            name: "Main Website",
            accountId: "GA4-PROP001",
            type: "Property",
            status: "active",
          },
          {
            id: "ga4-2",
            name: "Mobile App",
            accountId: "GA4-PROP002",
            type: "App Property",
            status: "active",
          },
        ],
      },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn Ads",
    icon: "/static/sources/40x40_linkedin_ads.png",
    status: "connected",
    connections: [
      {
        id: "li-conn-1",
        name: "Company Page",
        email: "linkedin@company.com",
        accounts: [
          {
            id: "li-1",
            name: "B2B Campaigns",
            accountId: "LI-CAMP001",
            type: "Campaign Manager",
            status: "active",
          },
        ],
      },
    ],
  },
]

export function AccountSelectionStep() {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [expandedConnections, setExpandedConnections] = useState<string[]>([mockConnections[0]?.id || ""])
  const [expandedDataConnections, setExpandedDataConnections] = useState<string[]>([])
  const [autoAddNewAccounts, setAutoAddNewAccounts] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [showSelectedAccounts, setShowSelectedAccounts] = useState(false)

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

  const filteredConnections = mockConnections
    .map((connection) => ({
      ...connection,
      connections: connection.connections
        .map((dataConn) => ({
          ...dataConn,
          accounts: dataConn.accounts.filter(
            (account) =>
              searchQuery === "" ||
              account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              account.accountId.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((dataConn) => dataConn.accounts.length > 0),
    }))
    .filter((connection) => connection.connections.length > 0)

  const getSelectedAccountDetails = () => {
    const selected: Array<{ connection: string; account: Account }> = []
    mockConnections.forEach((connection) => {
      connection.connections.forEach((dataConn) => {
        dataConn.accounts.forEach((account) => {
          if (selectedAccounts.includes(account.id)) {
            selected.push({ connection: connection.name, account })
          }
        })
      })
    })
    return selected
  }

  return (
    <div className="flex flex-col h-full relative w-full">
      <div className="flex-1 space-y-4 md:space-y-6 pb-32 w-full">
        <AccountSettings
          autoAddNewAccounts={autoAddNewAccounts}
          onAutoAddChange={setAutoAddNewAccounts}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <AccountSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <ConnectionTree
          connections={filteredConnections}
          selectedAccounts={selectedAccounts}
          expandedConnections={expandedConnections}
          expandedDataConnections={expandedDataConnections}
          onToggleAccount={toggleAccount}
          onSelectAllInConnection={selectAllInConnection}
          onSelectAllInDataConnection={selectAllInDataConnection}
          onToggleConnection={toggleConnection}
          onToggleDataConnection={toggleDataConnection}
        />
      </div>

      <SelectedAccountsPanel
        selectedAccounts={selectedAccounts}
        showSelectedAccounts={showSelectedAccounts}
        onToggleShow={() => setShowSelectedAccounts(!showSelectedAccounts)}
        onRemoveAccount={toggleAccount}
        getSelectedAccountDetails={getSelectedAccountDetails}
      />
    </div>
  )
}
