"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { MOCK_SESSIONS } from "@/constants/sessions"
import { getNavItem } from "@/lib/navigation"
import type { Session, SessionStatus } from "@/types/sessions"

const SIMULATED_RESPONSES = [
  "I've analyzed the data and found some interesting patterns. Let me break it down:\n\n**Key findings:**\n- The primary metric shows a 15% improvement over the previous period\n- There's a notable correlation between the two variables you mentioned\n- I'd recommend investigating the outliers in the third quarter\n\nWould you like me to dig deeper into any of these areas?",
  "Great question. Based on the information available, here's what I found:\n\n- The trend is consistent with industry benchmarks\n- There are 3 actionable items I'd suggest prioritizing\n- The data supports the hypothesis you outlined\n\nI can create a visualization or run additional queries if that would help.",
  "I've looked into this and have some insights to share.\n\nThe main takeaway is that performance has been **steadily improving** since the changes were implemented. The numbers suggest we're on the right track, though there's room for optimization in a few areas.\n\nShall I prepare a more detailed breakdown?",
]

export interface UseSessionStateReturn {
  readonly sessions: Session[]
  readonly activeSessionId: string | null
  readonly activeSession: Session | null
  readonly showProperties: boolean
  readonly handleSelectSession: (id: string) => void
  readonly handleBackToList: () => void
  readonly handleSendMessage: (content: string) => void
  readonly handleCreateSession: (context?: { navItemId?: string }) => void
  readonly handleToggleProperties: () => void
  readonly handleDeleteSession: (id: string) => void
  readonly handleDuplicateSession: (id: string) => void
  readonly handleRenameSession: (id: string, newTitle: string) => void
  readonly handleChangeStatus: (id: string, status: SessionStatus) => void
}

export function useSessionState(): UseSessionStateReturn {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [showProperties, setShowProperties] = useState(false)
  const responseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (responseTimerRef.current) clearTimeout(responseTimerRef.current)
    }
  }, [])

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  )

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id)
  }, [])

  const handleBackToList = useCallback(() => {
    setActiveSessionId(null)
    setShowProperties(false)
  }, [])

  const handleToggleProperties = useCallback(() => {
    setShowProperties((prev) => !prev)
  }, [])

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!activeSessionId || !content.trim()) return

      // Add user message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s
          return {
            ...s,
            messages: [
              ...s.messages,
              {
                id: `msg-${Date.now()}`,
                role: "user" as const,
                content,
                timestamp: new Date(),
              },
            ],
            updatedAt: new Date(),
          }
        }),
      )

      // Simulate agent response after delay
      if (responseTimerRef.current) clearTimeout(responseTimerRef.current)
      const sessionId = activeSessionId
      responseTimerRef.current = setTimeout(() => {
        const response = SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)]
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== sessionId) return s
            return {
              ...s,
              messages: [
                ...s.messages,
                {
                  id: `msg-${Date.now()}`,
                  role: "assistant" as const,
                  content: response,
                  timestamp: new Date(),
                },
              ],
              updatedAt: new Date(),
            }
          }),
        )
      }, 2000)
    },
    [activeSessionId],
  )

  const handleCreateSession = useCallback((context?: { navItemId?: string }) => {
    let relatedItems: { id: string; title: string; type?: string }[] = []
    let relatedArtifacts: string[] = []
    if (context?.navItemId) {
      const navItem = getNavItem(context.navItemId)
      if (navItem && navItem.type === "file") {
        relatedItems = [{ id: navItem.id, title: navItem.title, type: navItem.artifactType }]
        relatedArtifacts = [navItem.id]
      }
    }
    const newSession: Session = {
      id: `session-${Date.now()}`,
      title: "New Session",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      thoughtSteps: [],
      relatedArtifacts,
      relatedItems,
      agentModel: "think",
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
  }, [])

  const handleDeleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id))
      setActiveSessionId((prev) => (prev === id ? null : prev))
    },
    [],
  )

  const handleDuplicateSession = useCallback((id: string) => {
    setSessions((prev) => {
      const index = prev.findIndex((s) => s.id === id)
      if (index === -1) return prev
      const original = prev[index]
      const copy: Session = {
        ...original,
        id: `session-${Date.now()}`,
        title: `Copy of ${original.title}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
  }, [])

  const handleRenameSession = useCallback((id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: new Date() } : s)),
    )
  }, [])

  const handleChangeStatus = useCallback((id: string, status: SessionStatus) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, updatedAt: new Date() } : s)),
    )
  }, [])

  return {
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
  } as const
}
