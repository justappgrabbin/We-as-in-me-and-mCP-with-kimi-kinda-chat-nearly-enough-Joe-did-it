export const metadata = {
  title: "Morph Resonance — Unified Intelligence",
  description: "Merged Morph Interface + Resonance Neural Network Orchestrator",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  )
}
