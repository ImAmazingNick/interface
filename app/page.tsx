"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels"
import { MainNavigation } from "@/components/main-navigation"
import { CategoryNavigation } from "@/components/category-navigation"
import { TopCategoryNavigation } from "@/components/top-category-navigation"
import { CardCategoryNavigation } from "@/components/card-category-navigation"
import type { NavMode } from "@/components/nav-mode-switcher"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { DashboardWorkflow } from "@/components/dashboard-workflow"
import { AppSetupStep } from "@/components/app-setup-step"
import { DataSourceSelection } from "@/components/data-source-selection"
import { AccountSelectionStep } from "@/components/account-selection-step"
import { ModelCreationStep } from "@/components/model-creation-step"
import { WelcomePage, WelcomePage6Cards } from "@/components/welcome-page"
import { TemplatesPage } from "@/components/templates-page"
import { ItemPage } from "@/components/item-page"
import { ArtifactPanel } from "@/components/artifact-panel"
import { SetupSourcesStep } from "@/components/setup-sources-step"
import { SetupProcessingStep } from "@/components/setup-processing-step"
import { CenterViewTabs } from "@/components/center-view-tabs"
import { SessionsList } from "@/components/sessions/sessions-list"
import { SessionContent } from "@/components/sessions/session-content"
import { ChainOfThoughtsPanel } from "@/components/sessions/chain-of-thoughts-panel"
import { SessionPropertiesPanel } from "@/components/sessions/session-properties-panel"
import { useSessionState } from "@/hooks/use-session-state"
import { STEP_IDS } from "@/constants"
import { cn } from "@/lib/utils"
import { isNavFolder, getNavItem, getNavChildren, getAncestorIds, getAllDescendantIds, getArtifactTypesInFolder, getSessionsInScope } from "@/lib/navigation"
import { useNavigationTree } from "@/hooks/use-navigation-tree"
import type { TabConfig } from "@/components/center-view-tabs"
import { MessageSquare } from "lucide-react"
import type { Step, ArtifactPanelContent } from "@/types"
import type { SelectedSourceData } from "@/types/setup-interfaces"

export default function Home() {
  const [activeNavItem, setActiveNavItem] = useState("ai-agent")
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [navMode, setNavMode] = useLocalStorage<NavMode>('nav-mode', 'tree')
  const [centerTab, setCenterTab] = useLocalStorage<string>('center-tab', 'all')
  const [folderTabStates, setFolderTabStates] = useLocalStorage<Record<string, string>>('folder-tab-states', {})
  const {
    tree: navTree,
    createFolder,
    renameItem,
    deleteItem,
    getDeletedItem,
    restoreDeletedItem,
  } = useNavigationTree()

  const {
    sessions,
    activeSessionId,
    activeSession,
    showProperties,
    handleSelectSession,
    handleBackToList,
    handleSendMessage,
    handleCreateSession,
    handleToggleProperties,
    handleDeleteSession,
    handleDuplicateSession,
    handleRenameSession,
    handleChangeStatus,
  } = useSessionState()

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-width")
    if (saved) {
      const w = Number(saved)
      if (w >= 180 && w <= 480) setSidebarWidth(w)
    }
    // Migrate old tab values
    if (centerTab === "artifacts" || centerTab === "recents") setCenterTab("all")
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sessions scoped to the currently selected nav item
  const scopedSessions = useMemo(
    () => getSessionsInScope(sessions, activeNavItem, navTree),
    [sessions, activeNavItem, navTree],
  )

  const handleSidebarWidthChange = useCallback((width: number) => {
    setSidebarWidth(width)
    localStorage.setItem("sidebar-width", String(width))
  }, [])

  // Artifact panel state
  const [artifactContent, setArtifactContent] = useState<ArtifactPanelContent | null>(null)
  const [isArtifactPanelCollapsed, setIsArtifactPanelCollapsed] = useState(true)
  const artifactPanelRef = useRef<ImperativePanelHandle>(null)

  const handleOpenArtifactPanel = useCallback((content: ArtifactPanelContent) => {
    setArtifactContent(content)
    // Expand the panel after a tick so PanelGroup registers the content
    requestAnimationFrame(() => {
      artifactPanelRef.current?.expand()
    })
  }, [])

  const handleCloseArtifactPanel = useCallback(() => {
    artifactPanelRef.current?.collapse()
    setArtifactContent(null)
  }, [])

  const [currentStepId, setCurrentStepId] = useState<string>(STEP_IDS.SOURCES)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [showConversionsDashboard, setShowConversionsDashboard] = useState(false)
  const [showProcessingStep, setShowProcessingStep] = useState(false)
  const [selectedSourcesData, setSelectedSourcesData] = useState<SelectedSourceData[]>([])
  const [selectedAccountsCount, setSelectedAccountsCount] = useState(0)
  
  // Handle navigation item selection
  const handleNavItemSelect = (itemId: string) => {
    // "Show all" items navigate to their parent folder instead
    let targetId = itemId
    const navItem = getNavItem(itemId, navTree)
    if (navItem?.type === "more") {
      const ancestors = getAncestorIds(itemId, navTree)
      const parentId = ancestors[ancestors.length - 1]
      if (parentId) targetId = parentId
    }

    // Set the active item to the resolved target
    setActiveNavItem(targetId)

    // Always show content (not sessions) when navigating via sidebar
    if (isNavFolder(targetId, navTree)) {
      const types = getArtifactTypesInFolder(targetId, navTree)
      const validKeys = new Set(["all", "sessions", ...types.map((t) => t.type)])
      // Restore per-folder tab state if available
      const savedTab = folderTabStates[targetId]
      if (savedTab && validKeys.has(savedTab) && savedTab !== "sessions") {
        setCenterTab(savedTab)
      } else if (!validKeys.has(centerTab) || centerTab === "sessions") {
        setCenterTab("all")
      }
    } else {
      // Non-folder items: show content, not sessions
      if (centerTab === "sessions") {
        setCenterTab("all")
      }
    }
    handleCloseArtifactPanel()

    // Exit workflow, conversions dashboard, and processing step when navigating to a different page
    if (showWorkflow) {
      setShowWorkflow(false)
      setCurrentStepId(STEP_IDS.SOURCES)
    }
    if (showConversionsDashboard) {
      setShowConversionsDashboard(false)
    }
    if (showProcessingStep) {
      setShowProcessingStep(false)
    }

    // Expand navigation when going to folder navigation
    if (isNavFolder(itemId, navTree)) {
      setIsNavCollapsed(false)
    }
  }
  const [steps, setSteps] = useState<Step[]>([
    {
      id: STEP_IDS.SOURCES,
      title: "Select Data Sources",
      description: "Connect your data sources",
      completed: false,
      content: <DataSourceSelection />,
    },
    {
      id: STEP_IDS.ACCOUNTS,
      title: "Select Accounts",
      description: "Choose which accounts to include",
      completed: false,
      content: <AccountSelectionStep />,
    },
    {
      id: STEP_IDS.SETUP,
      title: "Name Model",
      description: "Name your app and configure basic settings",
      completed: false,
      content: <AppSetupStep />,
    },
    {
      id: STEP_IDS.MODEL,
      title: "Create Model",
      description: "Define your data model",
      completed: false,
      content: <ModelCreationStep />,
    },
  ])

  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId)
  const hasPrevious = currentStepIndex > 0
  const hasNext = currentStepIndex < steps.length - 1

  const handleStepComplete = useCallback((stepId: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    )
  }, [])

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentStepId(steps[currentStepIndex - 1].id)
    }
  }, [hasPrevious, currentStepIndex, steps])

  const handleNext = useCallback(() => {
    if (hasNext) {
      handleStepComplete(currentStepId)
      const nextStepId = steps[currentStepIndex + 1].id
      setCurrentStepId(nextStepId)
      
      // Auto-trigger model creation when moving from Setup App to Model step
      if (currentStepId === STEP_IDS.SETUP && nextStepId === STEP_IDS.MODEL) {
        // The ModelCreationStep component will automatically start processing
        // when it mounts, so we don't need to do anything else here
        console.log("Auto-launching model creation process...")
      }
    }
  }, [hasNext, currentStepIndex, steps, currentStepId, handleStepComplete])

  const handleComplete = useCallback(() => {
    handleStepComplete(currentStepId)
    // Handle final completion
    console.log("Workflow completed!")
    setShowWorkflow(false)
    setCurrentStepId(STEP_IDS.SOURCES)
    // Return to dashboards page after completion
    setActiveNavItem("dashboards")
  }, [currentStepId, handleStepComplete])
  
  const handleExitWorkflow = useCallback(() => {
    setShowWorkflow(false)
    setCurrentStepId(STEP_IDS.SOURCES)
    // Reset steps to initial state
    setSteps(prevSteps => prevSteps.map(step => ({ ...step, completed: false })))
  }, [])

  const handleTemplateSelect = useCallback((templateId: string) => {
    console.log("Template selected:", templateId)

    // Special handling for conversions dashboard
    if (templateId === "conversions") {
      setShowConversionsDashboard(true)
      setShowWorkflow(false)
      setIsNavCollapsed(true)
      return
    }

    // For all other templates, show the workflow
    setShowWorkflow(true)
    setShowConversionsDashboard(false)
    setCurrentStepId(STEP_IDS.SOURCES)
    // Reset steps to initial state
    setSteps(prevSteps => prevSteps.map(step => ({ ...step, completed: false })))
    // Collapse the main navigation when workflow starts
    setIsNavCollapsed(true)
  }, [])

  const handlePlusClick = useCallback((itemId: string) => {
    console.log("+ icon clicked for:", itemId)

    // Special handling for recipes folder - open the same step as conversions dashboard
    if (itemId === "recipes") {
      setShowConversionsDashboard(true)
      setShowWorkflow(false)
      setIsNavCollapsed(true)
      return
    }

    // For other folders, start the workflow to create new items
    setShowWorkflow(true)
    setShowConversionsDashboard(false)
    setCurrentStepId(STEP_IDS.SOURCES)
    // Reset steps to initial state
    setSteps(prevSteps => prevSteps.map(step => ({ ...step, completed: false })))
    // Collapse the main navigation when workflow starts
    setIsNavCollapsed(true)
  }, [])

  // Centralized delete handler — removes item and navigates if the active item was deleted
  const handleDeleteItem = useCallback((itemId: string) => {
    // Calculate navigation target before deleting
    const ancestors = getAncestorIds(itemId, navTree)
    const parentId = ancestors[ancestors.length - 1]

    // Check if active item is the deleted item or a descendant
    const needsNavigate = activeNavItem === itemId || getAllDescendantIds(itemId, navTree).has(activeNavItem)

    deleteItem(itemId)

    if (needsNavigate) {
      setActiveNavItem(parentId || "ai-agent")
    }
  }, [deleteItem, activeNavItem, navTree])

  const handleExitConversionsDashboard = useCallback(() => {
    setShowConversionsDashboard(false)
    setActiveNavItem("dashboards")
    setIsNavCollapsed(false)
  }, [])

  const handleContinueFromSetup = useCallback((selectedSources: SelectedSourceData[], selectedAccountIds: string[]) => {
    console.log("Continuing from setup...")
    console.log("Selected sources:", selectedSources)
    console.log("Selected account IDs:", selectedAccountIds)
    console.log("Selected sources length:", selectedSources.length)
    console.log("Selected sources data:", selectedSources.map(s => ({ 
      id: s.source.id, 
      name: s.source.name, 
      connections: s.connections.length 
    })))

    setSelectedSourcesData(selectedSources)
    setSelectedAccountsCount(selectedAccountIds.length)
    setShowConversionsDashboard(false)
    setShowProcessingStep(true)
    setIsNavCollapsed(true)
  }, [])

  const handleCompleteProcessing = useCallback(() => {
    console.log("Processing complete, navigating to dashboard...")
    setShowProcessingStep(false)
    setActiveNavItem("dashboards")
    setIsNavCollapsed(false)
  }, [])

  // Compute the type filter to pass to TemplatesPage
  const activeTypeFilter = useMemo(() => {
    if (centerTab === "sessions") return undefined
    if (centerTab === "all") return undefined
    return centerTab  // artifact type slug
  }, [centerTab])

  const renderContent = () => {
    // If processing step is active, show it
    if (showProcessingStep) {
      return (
        <SetupProcessingStep
          selectedSources={selectedSourcesData}
          selectedAccountsCount={selectedAccountsCount}
          onComplete={handleCompleteProcessing}
        />
      )
    }

    // If conversions dashboard is active, show it
    if (showConversionsDashboard) {
      return <SetupSourcesStep onExit={handleExitConversionsDashboard} onContinue={handleContinueFromSetup} />
    }

    // If workflow is active, show it regardless of navigation
    if (showWorkflow) {
      return (
        <DashboardWorkflow
          steps={steps}
          currentStep={currentStepId}
          onStepSelect={setCurrentStepId}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onComplete={handleComplete}
          onExit={handleExitWorkflow}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
      )
    }

    // Otherwise show content based on navigation
    if (activeNavItem === "welcome") {
      return <WelcomePage />
    }

    if (activeNavItem === "welcome-6-cards") {
      return <WelcomePage6Cards />
    }

    if (activeNavItem === "ai-agent") {
      return <WelcomePage6Cards onArtifactGenerated={handleOpenArtifactPanel} />
    }

    // Show folder page for any folder in the nav tree
    if (isNavFolder(activeNavItem, navTree)) {
      return <TemplatesPage
        folderType={activeNavItem}
        typeFilter={activeTypeFilter}
        onAddNew={handlePlusClick}
        onItemNavigate={handleNavItemSelect}
        onSwitchToAllTab={() => setCenterTab("all")}
        tree={navTree}
        onRenameItem={renameItem}
        onDeleteItem={handleDeleteItem}
      />
    }

    // Chat items → render chat interface with artifact support
    const ancestors = getAncestorIds(activeNavItem, navTree)
    if (ancestors.includes("chats")) {
      return <WelcomePage6Cards onArtifactGenerated={handleOpenArtifactPanel} />
    }

    // For leaf items and "more" items, show the item detail page
    const navItem = getNavItem(activeNavItem, navTree)
    if (navItem) {
      return <ItemPage
        title={navItem.title}
        itemId={activeNavItem}
        onBreadcrumbClick={handleNavItemSelect}
        tree={navTree}
      />
    }

    // Fallback for items with no parent folder
    return <WelcomePage6Cards onArtifactGenerated={handleOpenArtifactPanel} />
  }

  const resizeHandleClasses = "w-2 bg-transparent relative group hover:bg-muted/60 data-[resize-handle-active]:bg-muted/80"
  const resizeHandleLine = "absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border group-hover:bg-foreground/20 data-[resize-handle-active]:bg-foreground/25 transition-colors duration-150"

  const sessionListProps = useMemo(() => {
    const navItem = getNavItem(activeNavItem, navTree)
    return {
      sessions: scopedSessions,
      activeSessionId: activeSessionId ?? undefined,
      onSelectSession: handleSelectSession,
      onCreateSession: () => handleCreateSession({ navItemId: activeNavItem }),
      onDeleteSession: handleDeleteSession,
      onDuplicateSession: handleDuplicateSession,
      onRenameSession: handleRenameSession,
      // Scoped empty state props (Upgrade 8)
      scopeName: navItem?.title,
      totalSessionCount: sessions.length,
      onShowAllSessions: () => handleNavItemSelect("ai-agent"),
    }
  }, [scopedSessions, sessions.length, activeSessionId, activeNavItem, navTree, handleSelectSession, handleCreateSession, handleDeleteSession, handleDuplicateSession, handleRenameSession, handleNavItemSelect])

  const compactSessionListProps = useMemo(() => ({
    ...sessionListProps,
    isCompact: true,
  }), [sessionListProps])

  const renderSessionsView = () => {
    if (!activeSession) {
      return (
        <SessionsList {...sessionListProps} />
      )
    }

    if (showProperties) {
      return (
        <PanelGroup direction="horizontal" id="session-full-props">
          <Panel defaultSize={20} minSize={15} collapsible collapsedSize={0}>
            <SessionsList {...compactSessionListProps} />
          </Panel>
          <PanelResizeHandle className={resizeHandleClasses}>
            <div className={resizeHandleLine} />
          </PanelResizeHandle>
          <Panel defaultSize={30} minSize={20}>
            <SessionContent
              session={activeSession}
              onBack={handleBackToList}
              onSendMessage={handleSendMessage}
              showProperties={showProperties}
              onToggleProperties={handleToggleProperties}
            />
          </Panel>
          <PanelResizeHandle className={resizeHandleClasses}>
            <div className={resizeHandleLine} />
          </PanelResizeHandle>
          <Panel defaultSize={25} minSize={15}>
            <ChainOfThoughtsPanel
              steps={activeSession.thoughtSteps}
              isLive={activeSession.status === "active"}
              onClose={handleBackToList}
            />
          </Panel>
          <PanelResizeHandle className={resizeHandleClasses}>
            <div className={resizeHandleLine} />
          </PanelResizeHandle>
          <Panel defaultSize={25} minSize={15}>
            <SessionPropertiesPanel
              session={activeSession}
              onClose={handleToggleProperties}
              onChangeStatus={handleChangeStatus}
              onNavigateToItem={handleNavItemSelect}
            />
          </Panel>
        </PanelGroup>
      )
    }

    return (
      <PanelGroup direction="horizontal" id="session-full">
        <Panel defaultSize={25} minSize={15} collapsible collapsedSize={0}>
          <SessionsList {...compactSessionListProps} />
        </Panel>
        <PanelResizeHandle className={resizeHandleClasses}>
          <div className={resizeHandleLine} />
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={25}>
          <SessionContent
            session={activeSession}
            onBack={handleBackToList}
            onSendMessage={handleSendMessage}
            showProperties={showProperties}
            onToggleProperties={handleToggleProperties}
          />
        </Panel>
        <PanelResizeHandle className={resizeHandleClasses}>
          <div className={resizeHandleLine} />
        </PanelResizeHandle>
        <Panel defaultSize={35} minSize={20}>
          <ChainOfThoughtsPanel
            steps={activeSession.thoughtSteps}
            isLive={activeSession.status === "active"}
            onClose={handleBackToList}
          />
        </Panel>
      </PanelGroup>
    )
  }

  const handleCenterTabChange = useCallback((tab: string) => {
    setCenterTab(tab)
    // Persist tab selection per folder
    if (isNavFolder(activeNavItem, navTree)) {
      setFolderTabStates(prev => {
        const next = { ...prev, [activeNavItem]: tab }
        // LRU eviction: keep at most 50 entries
        const keys = Object.keys(next)
        if (keys.length > 50) {
          delete next[keys[0]]
        }
        return next
      })
    }
    if (tab === "sessions") {
      handleCloseArtifactPanel()
    }
  }, [setCenterTab, handleCloseArtifactPanel, activeNavItem, setFolderTabStates])

  const showTabs = !showWorkflow && !showConversionsDashboard && !showProcessingStep

  // Build dynamic tab list based on current context
  const availableTabs = useMemo((): TabConfig[] => {
    if (!showTabs) return []

    const isFolder = isNavFolder(activeNavItem, navTree)

    if (isFolder) {
      const types = getArtifactTypesInFolder(activeNavItem, navTree)
      const children = getNavChildren(activeNavItem, navTree).filter(c => c.type !== "section" && c.type !== "more")

      const contentTabs: TabConfig[] = [
        { key: "all", label: "All", count: children.length },
      ]

      // Add all type tabs (no cap)
      contentTabs.push(...types.map((t) => ({ key: t.type, label: t.label, count: t.count })))

      return [
        ...contentTabs,
        { key: "sessions", label: "Sessions", count: scopedSessions.length, icon: MessageSquare, separated: true },
      ]
    }

    // Item or welcome — no tabs
    return []
  }, [activeNavItem, navTree, scopedSessions.length, showTabs])

  // Ensure the active tab is valid for the current context
  useEffect(() => {
    if (!showTabs || availableTabs.length === 0) return
    const validKeys = new Set(availableTabs.map((t) => t.key))
    if (!validKeys.has(centerTab)) {
      // Pick the first content tab (not sessions) as default
      const defaultTab = availableTabs.find((t) => t.key !== "sessions")
      if (defaultTab) {
        setCenterTab(defaultTab.key)
      }
      // If only sessions tab exists (non-folder views), don't force to it —
      // content renders by default when centerTab !== "sessions"
    }
  }, [availableTabs, centerTab, showTabs, setCenterTab])

  return (
    <div className="h-screen flex bg-background">
      <div className="relative flex-shrink-0">
        {navMode === 'tree' ? (
          <MainNavigation
            activeItem={activeNavItem}
            onItemSelect={handleNavItemSelect}
            onPlusClick={handlePlusClick}
            isCollapsed={isNavCollapsed}
            onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
            sidebarWidth={sidebarWidth}
            onWidthChange={handleSidebarWidthChange}
            tree={navTree}
            onCreateFolder={createFolder}
            onRenameItem={renameItem}
            onDeleteItem={handleDeleteItem}
            onRestoreDeletedItem={restoreDeletedItem}
            getDeletedItem={getDeletedItem}
            navMode={navMode}
            onModeChange={setNavMode}
          />
        ) : navMode === 'category' ? (
          <CategoryNavigation
            activeItem={activeNavItem}
            onItemSelect={handleNavItemSelect}
            onPlusClick={handlePlusClick}
            isCollapsed={isNavCollapsed}
            onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
            sidebarWidth={sidebarWidth}
            onWidthChange={handleSidebarWidthChange}
            navMode={navMode}
            onModeChange={setNavMode}
          />
        ) : navMode === 'topCategory' ? (
          <TopCategoryNavigation
            activeItem={activeNavItem}
            onItemSelect={handleNavItemSelect}
            onPlusClick={handlePlusClick}
            isCollapsed={isNavCollapsed}
            onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
            sidebarWidth={sidebarWidth}
            onWidthChange={handleSidebarWidthChange}
            navMode={navMode}
            onModeChange={setNavMode}
          />
        ) : (
          <CardCategoryNavigation
            activeItem={activeNavItem}
            onItemSelect={handleNavItemSelect}
            onPlusClick={handlePlusClick}
            isCollapsed={isNavCollapsed}
            onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
            sidebarWidth={sidebarWidth}
            onWidthChange={handleSidebarWidthChange}
            navMode={navMode}
            onModeChange={setNavMode}
          />
        )}
      </div>
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" id="main-layout">
          <Panel defaultSize={100} minSize={35}>
            <div className="h-full flex flex-col overflow-hidden">
              {showTabs && availableTabs.length > 0 && (
                <CenterViewTabs
                  tabs={availableTabs}
                  activeTab={centerTab}
                  onTabChange={handleCenterTabChange}
                />
              )}
              <div
                {...(showTabs && availableTabs.length > 0 ? {
                  role: "tabpanel" as const,
                  id: `tabpanel-${centerTab}`,
                  "aria-labelledby": `tab-${centerTab}`,
                } : {})}
                className={cn(
                  "flex-1",
                  centerTab === "sessions" && showTabs && activeSession
                    ? "overflow-hidden"
                    : "overflow-auto overscroll-contain"
                )}
              >
                {centerTab === "sessions" && showTabs
                  ? renderSessionsView()
                  : renderContent()}
              </div>
            </div>
          </Panel>
          <PanelResizeHandle className={cn(
            "bg-transparent relative group transition-[width,opacity] duration-150",
            isArtifactPanelCollapsed
              ? "w-0 pointer-events-none opacity-0"
              : "w-2 hover:bg-muted/60 data-[resize-handle-active]:bg-muted/80"
          )}>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border group-hover:bg-foreground/20 data-[resize-handle-active]:bg-foreground/25 transition-colors duration-150" />
          </PanelResizeHandle>
          <Panel
            ref={artifactPanelRef}
            defaultSize={0}
            minSize={20}
            collapsible
            collapsedSize={0}
            onCollapse={() => setIsArtifactPanelCollapsed(true)}
            onExpand={() => setIsArtifactPanelCollapsed(false)}
          >
            <ArtifactPanel
              content={artifactContent}
              onClose={handleCloseArtifactPanel}
            />
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}
