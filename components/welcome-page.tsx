"use client"

import { ChatInterface } from "@/components/chat-interface"
import { ChatInterface6Cards } from "@/components/chat-interface-6-cards"
import type { ArtifactPanelContent } from "@/types"

export function WelcomePage() {
  return (
    <div className="h-full w-full bg-sidebar/90">
      <ChatInterface />
    </div>
  )
}

export function WelcomePage6Cards({ onArtifactGenerated }: { onArtifactGenerated?: (content: ArtifactPanelContent) => void }) {
  return (
    <div className="h-full w-full bg-sidebar/90">
      <ChatInterface6Cards onArtifactGenerated={onArtifactGenerated} />
    </div>
  )
}



