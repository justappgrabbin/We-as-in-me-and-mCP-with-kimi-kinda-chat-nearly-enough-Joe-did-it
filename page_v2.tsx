"use client"

import UnifiedInterface from "./components/UnifiedInterface"
import { useEffect } from "react"
import { useMorphStore } from "./lib/useMorphStore"

export default function Home() {
  const initOrchestrator = useMorphStore(s => s.initOrchestrator)
  const startOrchestrator = useMorphStore(s => s.startOrchestrator)
  const orchestrator = useMorphStore(s => s.orchestrator)
  const synthiaApiBase = useMorphStore(s => s.synthiaApiBase)

  useEffect(() => {
    // Set Synthia server URL
    useMorphStore.getState().setSynthiaApiBase('https://synthia-server.onrender.com')

    // Re-initialize orchestrator after page load
    if (!orchestrator) {
      initOrchestrator('https://synthia-server.onrender.com')
      startOrchestrator()
    }
  }, [orchestrator, initOrchestrator, startOrchestrator])

  return <UnifiedInterface />
}
