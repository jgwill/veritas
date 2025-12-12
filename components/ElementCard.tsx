"use client"

import type React from "react"
import { type DigitalElement, AppMode } from "../types"

interface ElementCardProps {
  element: DigitalElement
  mode: AppMode
  modelType: number
  onUpdate?: (element: DigitalElement, description: string) => void
  onCompare?: (element: DigitalElement) => void
  onEdit?: (element: DigitalElement) => void
  isComparing?: boolean
}

const ElementCard: React.FC<ElementCardProps> = ({
  element,
  mode,
  modelType,
  onUpdate,
  onCompare,
  onEdit,
  isComparing,
}) => {
  const handleEvaluation = (evaluation: "accepted" | "rejected") => {
    console.log("[v0] Evaluation clicked:", {
      elementName: element.DisplayName,
      elementId: element.Idug,
      evaluation,
      currentTwoFlag: element.TwoFlag,
      currentTwoFlagAnswered: element.TwoFlagAnswered,
    })

    if (onUpdate) {
      const description = `Set status of '${element.DisplayName}' to '${evaluation}'`
      const updatedElement = {
        ...element,
        TwoFlag: evaluation === "accepted",
        TwoFlagAnswered: true,
      }

      console.log("[v0] Calling onUpdate with:", {
        elementName: updatedElement.DisplayName,
        elementId: updatedElement.Idug,
        newTwoFlag: updatedElement.TwoFlag,
        newTwoFlagAnswered: updatedElement.TwoFlagAnswered,
      })

      onUpdate(updatedElement, description)
    }
  }

  const handleTrend = (trend: -1 | 0 | 1) => {
    console.log("[v0] Trend clicked:", {
      elementName: element.DisplayName,
      elementId: element.Idug,
      trend,
      currentThreeFlag: element.ThreeFlag,
      currentThreeFlagAnswered: element.ThreeFlagAnswered,
    })

    if (onUpdate) {
      const trendText = trend === 1 ? "improving" : trend === -1 ? "declining" : "stable"
      const description = `Set trend of '${element.DisplayName}' to '${trendText}'`
      const updatedElement = {
        ...element,
        ThreeFlag: trend,
        ThreeFlagAnswered: true,
      }

      console.log("[v0] Calling onUpdate with:", {
        elementName: updatedElement.DisplayName,
        elementId: updatedElement.Idug,
        newThreeFlag: updatedElement.ThreeFlag,
        newThreeFlagAnswered: updatedElement.ThreeFlagAnswered,
      })

      onUpdate(updatedElement, description)
    }
  }

  const cardBg = element.Question ? "tandt-card-alt-bg" : "tandt-card-bg"
  const borderColor = isComparing ? "border-blue-500" : "tandt-border"

  const hasEvaluation = element.TwoFlagAnswered
  const evaluationBorderColor = hasEvaluation ? (element.TwoFlag ? "border-green-400" : "border-red-400") : borderColor

  return (
    <div
      className={`border-2 ${evaluationBorderColor} rounded-lg shadow-sm transition-all duration-200 ${cardBg} flex flex-col`}
    >
      <div className="tandt-card-header p-3 border-b tandt-border flex justify-between items-center">
        <h3 className="font-semibold text-sm tandt-dark truncate flex-grow">{element.DisplayName}</h3>
        {mode === AppMode.Modeling && onEdit && (
          <button onClick={() => onEdit(element)} className="ml-2 text-gray-400 hover:text-blue-600 transition-colors">
            <PencilIcon />
          </button>
        )}
      </div>
      <div className="p-3 text-xs tandt-secondary flex-grow">
        <p className="h-16 overflow-y-auto">{element.Description || "No description provided."}</p>
      </div>
      <div className="p-2 border-t tandt-border tandt-light rounded-b-lg">
        {mode === AppMode.Modeling && modelType === 1 && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tandt-secondary">Dominance:</span>
            <span className="text-sm font-bold text-blue-600 bg-blue-100 rounded-full px-2.5 py-0.5">
              {element.DominanceFactor}
            </span>
            <button
              onClick={() => onCompare && onCompare(element)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                isComparing ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              disabled={isComparing}
            >
              {isComparing ? "Comparing..." : "Compare"}
            </button>
          </div>
        )}
        {mode === AppMode.Modeling && modelType !== 1 && (
          <div className="text-center text-xs text-gray-400 py-1">Define elements for review.</div>
        )}
        {mode === AppMode.Analyzing && (
          <div className="flex items-center justify-around">
            <IconButton
              active={element.TwoFlagAnswered && element.TwoFlag}
              onClick={() => handleEvaluation("accepted")}
              color="green"
              icon={<CheckIcon />}
            />
            <IconButton
              active={element.TwoFlagAnswered && !element.TwoFlag}
              onClick={() => handleEvaluation("rejected")}
              color="red"
              icon={<XIcon />}
            />

            {modelType === 2 && (
              <>
                <div className="border-l border-gray-300 h-6 mx-2"></div>
                <IconButton
                  active={element.ThreeFlagAnswered && element.ThreeFlag === 1}
                  onClick={() => handleTrend(1)}
                  color="green"
                  icon={<TrendingUpIcon />}
                />
                <IconButton
                  active={element.ThreeFlagAnswered && element.ThreeFlag === 0}
                  onClick={() => handleTrend(0)}
                  color="yellow"
                  icon={<MinusIcon />}
                />
                <IconButton
                  active={element.ThreeFlagAnswered && element.ThreeFlag === -1}
                  onClick={() => handleTrend(-1)}
                  color="red"
                  icon={<TrendingDownIcon />}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const IconButton: React.FC<{ active: boolean; onClick: () => void; color: string; icon: React.ReactNode }> = ({
  active,
  onClick,
  color,
  icon,
}) => {
  const getButtonStyles = () => {
    const baseStyles = "p-2 rounded-full transition-all duration-200 transform hover:scale-110 cursor-pointer"

    if (active) {
      switch (color) {
        case "green":
          return `${baseStyles} bg-green-500 text-white shadow-md hover:bg-green-600`
        case "red":
          return `${baseStyles} bg-red-500 text-white shadow-md hover:bg-red-600`
        case "yellow":
          return `${baseStyles} bg-yellow-500 text-white shadow-md hover:bg-yellow-600`
        default:
          return `${baseStyles} bg-gray-500 text-white shadow-md hover:bg-gray-600`
      }
    } else {
      switch (color) {
        case "green":
          return `${baseStyles} bg-gray-200 text-gray-500 hover:bg-green-100 hover:text-green-600`
        case "red":
          return `${baseStyles} bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600`
        case "yellow":
          return `${baseStyles} bg-gray-200 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600`
        default:
          return `${baseStyles} bg-gray-200 text-gray-500 hover:bg-gray-300`
      }
    }
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={getButtonStyles()}
      aria-label={`${color} button ${active ? "active" : "inactive"}`}
    >
      {icon}
    </button>
  )
}

// Icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
)
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)
const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
  </svg>
)
const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
)

export default ElementCard
