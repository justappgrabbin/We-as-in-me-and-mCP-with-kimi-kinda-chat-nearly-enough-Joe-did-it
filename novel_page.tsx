"use client"

import UnifiedInterface from "./components/UnifiedInterface"
import { useEffect } from "react"
import { useMorphStore } from "./lib/useMorphStore"

export default function Home() {
  const initOrchestrator = useMorphStore(s => s.initOrchestrator)
  const startOrchestrator = useMorphStore(s => s.startOrchestrator)
  const orchestrator = useMorphStore(s => s.orchestrator)

  useEffect(() => {
    if (!orchestrator) {
      initOrchestrator()
      startOrchestrator()
    }
  }, [orchestrator, initOrchestrator, startOrchestrator])

  return <UnifiedInterface />
}
