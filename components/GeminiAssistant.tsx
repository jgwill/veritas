"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, Loader2 } from "lucide-react"
import { suggestElementsFromTopic } from "@/lib/services/gemini"

type SuggestedElement = {
  nameElement: string
  displayName: string
  description: string
}

interface GeminiAssistantProps {
  onAddElements: (elements: SuggestedElement[]) => void
}

export default function GeminiAssistant({ onAddElements }: GeminiAssistantProps) {
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Enter a topic first")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const elements = await suggestElementsFromTopic(topic.trim())
      if (elements.length === 0) {
        setError("No suggestions found. Try a different topic.")
        return
      }
      onAddElements(elements)
      setOpen(false)
      setTopic("")
    } catch (err) {
      console.error(err)
      setError("Failed to fetch suggestions")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Sparkles className="h-4 w-4" />
        Suggest Elements with AI
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
          <CardDescription>
            Provide a topic and get automatically suggested decision/performance elements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="e.g. Choosing a new car"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={loading} className="gap-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
