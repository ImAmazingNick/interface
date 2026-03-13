"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels"
import { MainNavigation } from "@/components/main-navigation"
import { CategoryNavigation } from "@/components/category-navigation"
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
import { STEP_IDS } from "@/constants"
import { cn } from "@/lib/utils"
import { isNavFolder, getNavItem, getAncestorIds } from "@/lib/navigation"
import { LayoutGrid } from "lucide-react"
import type { Step, ArtifactPanelContent } from "@/types"
import type { SelectedSourceData } from "@/types/setup-interfaces"

export default function Home() {
  const [activeNavItem, setActiveNavItem] = useState("ai-agent")
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [navMode, setNavMode] = useLocalStorage<'tree' | 'category'>('nav-mode', 'tree')

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-width")
    if (saved) {
      const w = Number(saved)
      if (w >= 180 && w <= 480) setSidebarWidth(w)
    }
  }, [])

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
    const navItem = getNavItem(itemId)
    if (navItem?.type === "more") {
      const ancestors = getAncestorIds(itemId)
      const parentId = ancestors[ancestors.length - 1]
      if (parentId) targetId = parentId
    }

    // Set the active item to the resolved target
    setActiveNavItem(targetId)

    // Close artifact panel when navigating via sidebar
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
    if (isNavFolder(itemId)) {
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
    if (isNavFolder(activeNavItem)) {
      return <TemplatesPage
        folderType={activeNavItem}
        onAddNew={handlePlusClick}
        onItemNavigate={handleNavItemSelect}
      />
    }

    // Chat items → render chat interface with artifact support
    const ancestors = getAncestorIds(activeNavItem)
    if (ancestors.includes("chats")) {
      return <WelcomePage6Cards onArtifactGenerated={handleOpenArtifactPanel} />
    }

    // For leaf items and "more" items, show the item detail page
    const navItem = getNavItem(activeNavItem)
    if (navItem) {
      return <ItemPage
        title={navItem.title}
        itemId={activeNavItem}
        onBreadcrumbClick={handleNavItemSelect}
      />
    }

    // Fallback for items with no parent folder
    return <WelcomePage6Cards onArtifactGenerated={handleOpenArtifactPanel} />
  }

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
          />
        ) : (
          <CategoryNavigation
            activeItem={activeNavItem}
            onItemSelect={handleNavItemSelect}
            onPlusClick={handlePlusClick}
            isCollapsed={isNavCollapsed}
            onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
            sidebarWidth={sidebarWidth}
            onWidthChange={handleSidebarWidthChange}
            onModeToggle={() => setNavMode('tree')}
          />
        )}
        {/* Nav mode toggle — only in tree mode (category mode has its own toggle in the strip) */}
        {navMode === 'tree' && (
          <button
            className="absolute top-4 right-7 z-20 w-7 h-7 flex items-center justify-center rounded-md bg-sidebar hover:bg-sidebar-accent/40 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors duration-200 cursor-pointer"
            onClick={() => setNavMode('category')}
            title="Switch to category view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={100} minSize={35}>
            <div className="h-full overflow-auto overscroll-contain">
              {renderContent()}
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
