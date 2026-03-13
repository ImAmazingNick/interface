import type { Connection, DataSourceConnection, Account } from "./step-interfaces"

/**
 * Represents a selected source with its connections and accounts
 */
export interface SelectedSourceData {
  source: Connection
  connections: SelectedConnectionData[]
}

/**
 * Represents a selected connection with its accounts
 */
export interface SelectedConnectionData {
  connection: DataSourceConnection
  accounts: Account[]
}

/**
 * Props for SetupSourcesStep component
 */
export interface SetupSourcesStepProps {
  onExit?: () => void
  onContinue?: (selectedSources: SelectedSourceData[], selectedAccountIds: string[]) => void
}

/**
 * Props for SetupProcessingStep component
 */
export interface SetupProcessingStepProps {
  selectedSources: SelectedSourceData[]
  selectedAccountsCount: number
  onComplete?: () => void
}

/**
 * Settings for data fetching
 */
export interface DataFetchingSettings {
  dateRange: {
    from?: Date
    to?: Date
  }
  autoAddNewAccounts: boolean
}


















