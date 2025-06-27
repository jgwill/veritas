"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { type DecisionMakingElement } from "@/lib/types"

interface ComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  comparingElement: DecisionMakingElement | null
  otherElements: DecisionMakingElement[]
  onComplete: (baseElement: DecisionMakingElement, results: Record<string, number>) => void
}

export default function ComparisonModal({
  isOpen,
  onClose,
  comparingElement,
  otherElements,
  onComplete,
}: ComparisonModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<Record<string, number>>({})

  useEffect(() => {
    // Reset state when the modal is reopened for a new comparison
    if (isOpen) {
      setCurrentIndex(0)
      setResults({})
    }
  }, [isOpen, comparingElement])

  const otherElement = useMemo(() => otherElements[currentIndex], [otherElements, currentIndex])

  const handleDecision = (decision: "yes" | "no") => {
    if (!otherElement || !comparingElement) return

    // YES means comparingElement dominates otherElement
    // NO means otherElement dominates comparingElement
    const newResults = { ...results, [otherElement.idug]: decision === "yes" ? 1 : -1 }
    setResults(newResults)

    if (currentIndex + 1 >= otherElements.length) {
      onComplete(comparingElement, newResults)
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (!isOpen || !comparingElement) {
    return null
  }

  const progress = otherElements.length > 0 ? ((currentIndex + 1) / otherElements.length) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Build Dominance Hierarchy</DialogTitle>
          <DialogDescription>
            For the element: <span className="font-semibold text-primary">{comparingElement.displayName}</span>, answer the
            following:
          </DialogDescription>
        </DialogHeader>

        {otherElement ? (
          <div className="py-6">
            <Progress value={progress} className="mb-2" />
            <p className="text-right text-sm text-muted-foreground mb-8">
              Progress: {currentIndex + 1} / {otherElements.length}
            </p>

            <div className="text-center mb-8 p-4 bg-muted rounded-lg">
              <p className="text-xl font-medium">
                "If you have <strong className="text-blue-600 font-semibold">'{comparingElement.displayName}'</strong> but
                you don't have <strong className="text-yellow-600 font-semibold">'{otherElement.displayName}'</strong>,
                is the decision still YES?"
              </p>
            </div>

            <div className="flex justify-center space-x-8">
              <Button onClick={() => handleDecision("yes")} size="lg" className="bg-green-600 hover:bg-green-700 w-28">
                YES
              </Button>
              <Button onClick={() => handleDecision("no")} size="lg" variant="destructive" className="w-28">
                NO
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">No other elements to compare against.</div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
