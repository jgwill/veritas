"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { type DigitalModel, AppMode } from "../types"
import ElementCard from "./ElementCard"
import { generateAnalysisSummary } from "../services/geminiService"
import { useAppStore } from "../store"

interface AnalyzingViewProps {
  model: DigitalModel
}

const AnalyzingView: React.FC<AnalyzingViewProps> = ({ model }) => {
  const isDecisionModel = model.DigitalThinkingModelType === 1
  const updateElement = useAppStore((state) => state.updateElement)

  // State for AI summary
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const hasAnalysisData = useMemo(() => model.Model.some((el) => el.TwoFlagAnswered), [model])

  const handleGetSummary = async () => {
    setIsSummaryLoading(true)
    setSummaryError(null)
    setAiSummary(null)
    try {
      const summary = await generateAnalysisSummary(model)
      setAiSummary(summary)
    } catch (error: any) {
      setSummaryError(error.message || "An unknown error occurred.")
    } finally {
      setIsSummaryLoading(false)
    }
  }

  const decision = useMemo(() => {
    if (!isDecisionModel) return null

    const sortedElements = [...model.Model].sort((a, b) => b.DominanceFactor - a.DominanceFactor)
    for (const element of sortedElements) {
      if (element.TwoFlagAnswered && !element.TwoFlag) {
        return {
          isYes: false,
          reason: `Decision is NO because '${element.DisplayName}' (a dominant factor) was evaluated as unacceptable.`,
        }
      }
    }
    return { isYes: true, reason: "All evaluated dominant criteria are acceptable." }
  }, [model, isDecisionModel])

  const AnalysisHeader = () => {
    const AiButton = ({ subtle = false }) => (
      <button
        onClick={handleGetSummary}
        disabled={isSummaryLoading}
        title="Get AI Summary"
        className={`inline-flex items-center justify-center ml-auto px-4 py-2 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait ${hasAnalysisData ? "opacity-100" : "opacity-0 pointer-events-none"} ${subtle ? "bg-white/60 dark:bg-black/20" : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"}`}
      >
        {isSummaryLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        ) : (
          <SparklesIcon />
        )}
        <span className="ml-2 hidden sm:inline">{isSummaryLoading ? "Analyzing..." : "AI Summary"}</span>
      </button>
    )

    if (isDecisionModel && decision) {
      return (
        <div
          className={`p-4 rounded-lg shadow-md mb-6 flex justify-between items-center ${decision.isYes ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"}`}
        >
          <div className="flex-grow text-center">
            <h2 className="text-2xl font-bold">DECISION IS: {decision.isYes ? "->YES<-" : "->NO<-"}</h2>
            <p className="text-sm">{decision.reason}</p>
          </div>
          <div className="w-40 flex-shrink-0 text-right">
            <AiButton subtle={true} />
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-tandt-dark dark:text-gray-100">Analysis Summary</h2>
          <p className="text-sm text-tandt-secondary dark:text-gray-400">
            Evaluate the current state and trend for each performance element.
          </p>
        </div>
        <div className="w-40 flex-shrink-0 text-right">
          <AiButton />
        </div>
      </div>
    )
  }

  const AiSummaryCard = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-dashed border-purple-400 dark:border-purple-600">
      <div className="flex items-center mb-4">
        <SparklesIcon />
        <h3 className="ml-3 text-lg font-bold text-tandt-dark dark:text-gray-100">AI Analysis Insight</h3>
      </div>
      {isSummaryLoading && (
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
          <span className="ml-3">The AI is analyzing the data...</span>
        </div>
      )}
      {summaryError && <p className="text-red-600 dark:text-red-400">{summaryError}</p>}
      {aiSummary && <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{aiSummary}</p>}
    </div>
  )

  return (
    <div>
      <AnalysisHeader />

      {(aiSummary || isSummaryLoading || summaryError) && <AiSummaryCard />}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {model.Model.map((element) => (
          <ElementCard
            key={element.Idug}
            element={element}
            mode={AppMode.Analyzing}
            onUpdate={updateElement}
            modelType={model.DigitalThinkingModelType}
          />
        ))}
      </div>
    </div>
  )
}

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M9.401 2.628a.75.75 0 011.198 0l.233.29a.75.75 0 00.95.421l.34-.14a.75.75 0 01.93.93l-.14.34a.75.75 0 00.422.95l.29.233a.75.75 0 010 1.198l-.29.233a.75.75 0 00-.422.95l.14.34a.75.75 0 01-.93.93l-.34-.14a.75.75 0 00-.95.422l-.233.29a.75.75 0 01-1.198 0l-.233-.29a.75.75 0 00-.95-.422l-.34.14a.75.75 0 01-.93-.93l.14-.34a.75.75 0 00-.422-.95l-.29-.233a.75.75 0 010-1.198l.29-.233a.75.75 0 00.422-.95l-.14-.34a.75.75 0 01.93-.93l.34.14a.75.75 0 00.95-.422l.233-.29zM4.11 7.11a.75.75 0 011.06 0l.69.69a.75.75 0 01-1.06 1.06l-.69-.69a.75.75 0 010-1.06zM14.11 7.11a.75.75 0 011.06 0l.69.69a.75.75 0 11-1.06 1.06l-.69-.69a.75.75 0 010-1.06zM4.11 12.11a.75.75 0 011.06 0l.69.69a.75.75 0 11-1.06 1.06l-.69-.69a.75.75 0 010-1.06zM14.8 12.8a.75.75 0 010-1.06l.69-.69a.75.75 0 011.06 1.06l-.69.69a.75.75 0 01-1.06 0z"
      clipRule="evenodd"
    />
  </svg>
)

export default AnalyzingView
