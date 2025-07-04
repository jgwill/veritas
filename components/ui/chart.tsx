"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent"

import { cn } from "@/lib/utils"

// Chart container component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, any>
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className,
      )}
      {...props}
    >
      <ChartStyle id={chartId} config={config} />
      <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: Record<string, any> }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: [
          `[data-chart=${id}] {`,
          ...colorConfig
            .map(([key, itemConfig]) => {
              const color = itemConfig.theme?.light ?? itemConfig.color
              return color ? `  --color-${key}: ${color};` : null
            })
            .filter(Boolean),
          `}`,
          `.dark [data-chart=${id}] {`,
          ...colorConfig
            .map(([key, itemConfig]) => {
              const color = itemConfig.theme?.dark ?? itemConfig.color
              return color ? `  --color-${key}: ${color};` : null
            })
            .filter(Boolean),
          `}`,
        ].join("\n"),
      }}
    />
  )
}

// Chart tooltip component
interface ChartTooltipContentProps {
  active?: boolean
  payload?: Payload<ValueType, NameType>[]
  label?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps & React.ComponentProps<"div">>(
  (
    { active, payload, label, hideLabel = false, hideIndicator = false, indicator = "dot", className, ...props },
    ref,
  ) => {
    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
        {...props}
      >
        {!hideLabel && label && <div className="font-medium text-foreground">{label}</div>}
        <div className="grid gap-1.5">
          {payload.map((item: any, index: number) => (
            <div
              key={`item-${index}`}
              className="flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
            >
              {!hideIndicator && (
                <div
                  className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
                    "h-2.5 w-2.5": indicator === "dot",
                    "w-1": indicator === "line",
                    "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                    "my-0.5": indicator === "line" || indicator === "dashed",
                  })}
                  style={
                    {
                      "--color-bg": item.color,
                      "--color-border": item.color,
                    } as React.CSSProperties
                  }
                />
              )}
              <div className="flex flex-1 justify-between leading-none">
                <div className="grid gap-1.5">
                  <span className="text-muted-foreground">{item.name || item.dataKey}</span>
                </div>
                <span className="font-mono font-medium tabular-nums text-foreground">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart legend component
interface ChartLegendContentProps {
  payload?: Array<{
    value: string
    type: string
    color: string
  }>
  verticalAlign?: "top" | "bottom"
}

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps & React.ComponentProps<"div">>(
  ({ className, payload, verticalAlign = "bottom", ...props }, ref) => {
    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center gap-4", verticalAlign === "top" && "pb-3", className)}
        {...props}
      >
        {payload.map((item: any, index: number) => (
          <div
            key={`item-${index}`}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: item.color,
              }}
            />
            <span className="text-muted-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    )
  },
)
ChartLegendContent.displayName = "ChartLegendContent"

// Export all components
export { ChartContainer, ChartTooltipContent, ChartLegendContent, ChartStyle }
