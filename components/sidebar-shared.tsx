"use client"

import { memo, useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { WORKSPACES } from "@/constants"
import { Settings, Users, Bot, Bell, User, LogOut, ChevronDown } from "lucide-react"

// ─── Workspace Selector ───
// variant="full"    → full-width bordered dropdown (tree mode)
// variant="inline"  → borderless name+chevron, sits next to logo (top-tabs, card-grid)
// variant="compact" → small button showing first letter, popover on click (category strip)

function WorkspacePopoverItems({
  workspaces,
  currentId,
  onSelect,
}: {
  workspaces: readonly { id: string; name: string }[]
  currentId: string
  onSelect: (id: string) => void
}) {
  return (
    <>
      <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Workspace</p>
      {workspaces.map((ws) => (
        <button
          key={ws.id}
          className={cn(
            "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer",
            ws.id === currentId
              ? "bg-primary/10 text-primary font-medium"
              : "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={() => onSelect(ws.id)}
        >
          <span className="w-6 h-6 rounded-md bg-sidebar-accent/40 flex items-center justify-center text-xs font-semibold">
            {ws.name.charAt(0).toUpperCase()}
          </span>
          <span>{ws.name}</span>
          {ws.id === currentId && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </>
  )
}

export const SidebarWorkspaceSelector = memo(function SidebarWorkspaceSelector({
  variant = "full",
}: {
  variant?: "full" | "inline" | "compact"
}) {
  const [currentWorkspace, setCurrentWorkspace] = useState("business")

  const handleWorkspaceSelect = useCallback((workspaceId: string) => {
    console.log("Switching to workspace:", workspaceId)
    setCurrentWorkspace(workspaceId)
  }, [])

  const workspace = WORKSPACES.find((ws) => ws.id === currentWorkspace) || WORKSPACES[0]

  if (variant === "compact") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-xs font-medium cursor-pointer"
            aria-label={`Workspace: ${workspace.name}`}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-44 p-1.5">
          <WorkspacePopoverItems workspaces={WORKSPACES} currentId={currentWorkspace} onSelect={handleWorkspaceSelect} />
        </PopoverContent>
      </Popover>
    )
  }

  if (variant === "inline") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-1 px-1 py-0.5 -ml-1 rounded-md text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors cursor-pointer"
            aria-label={`Workspace: ${workspace.name}`}
          >
            <span>{workspace.name}</span>
            <ChevronDown className="h-3 w-3 text-sidebar-foreground/40" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-44 p-1.5">
          <WorkspacePopoverItems workspaces={WORKSPACES} currentId={currentWorkspace} onSelect={handleWorkspaceSelect} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Select value={currentWorkspace} onValueChange={handleWorkspaceSelect}>
      <SelectTrigger className="w-full h-9 px-3 cursor-pointer">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="font-medium">{workspace.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {WORKSPACES.map((ws) => (
          <SelectItem key={ws.id} value={ws.id}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{ws.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})

// ─── User Profile ───
// variant="full"    → avatar + name + email, popover opens upward (tree, top-tabs, card-grid)
// variant="compact" → avatar only, popover opens to the right (category strip)

const USER_POPOVER_ITEMS = [
  { type: "label" as const, label: "Organization" },
  { id: "general", label: "General", icon: Settings },
  { id: "members", label: "Members", icon: Users },
  { id: "ai-agent", label: "AI Agent", icon: Bot },
  { type: "separator" as const },
  { type: "label" as const, label: "Account" },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "user-settings", label: "User settings", icon: User },
  { type: "separator" as const },
  { id: "logout", label: "Log out", icon: LogOut },
]

function UserPopoverContent() {
  return (
    <>
      {USER_POPOVER_ITEMS.map((item, idx) => {
        if (item.type === "separator") return <Separator key={`sep-${idx}`} className="my-1" />
        if (item.type === "label") return (
          <p key={item.label} className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{item.label}</p>
        )
        const Icon = item.icon!
        return (
          <button
            key={item.id}
            className={cn(
              "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground",
              item.id === "logout" && "text-destructive hover:text-destructive",
            )}
            onClick={() => console.log("Navigate to:", item.id)}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </>
  )
}

export const SidebarUserProfile = memo(function SidebarUserProfile({
  variant = "full",
}: {
  variant?: "full" | "compact"
}) {
  const isCompact = variant === "compact"
  const popoverSide = isCompact ? "right" as const : "top" as const
  const popoverAlign = isCompact ? "end" as const : "start" as const

  return (
    <div className={cn("border-t border-sidebar-border/50", isCompact ? "p-3" : "p-4")}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-3 w-full rounded-lg p-1.5 -m-1.5 transition-colors hover:bg-sidebar-accent/30 cursor-pointer",
              isCompact && "justify-center",
            )}
            title={isCompact ? "John Doe" : undefined}
          >
            <div className={cn(
              "rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center ring-1 ring-sidebar-border/20",
              isCompact ? "w-8 h-8" : "w-9 h-9",
            )}>
              <span className={cn(
                "font-semibold text-primary-foreground",
                isCompact ? "text-xs" : "text-sm",
              )}>JD</span>
            </div>
            {!isCompact && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">john@example.com</p>
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent side={popoverSide} align={popoverAlign} className="w-56 p-1.5">
          <UserPopoverContent />
        </PopoverContent>
      </Popover>
    </div>
  )
})
