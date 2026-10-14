"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import * as React from "react"
import { useSearchParams } from "next/navigation"

export interface TabsProps extends TabsPrimitive.Root.Props {
  urlParam?: string
}

function UrlTabsInner({
  urlParam,
  value: controlledValue,
  defaultValue,
  onValueChange,
  ...props
}: TabsProps & { urlParam: string }) {
  const searchParams = useSearchParams()

  const getUrlTab = React.useCallback(() => {
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get(urlParam)
      if (param) return param
    }
    const param = searchParams?.get(urlParam)
    return param || undefined
  }, [searchParams, urlParam])

  const [activeTab, setActiveTab] = React.useState<TabsPrimitive.Root.Props["value"]>(() => {
    if (controlledValue !== undefined) return controlledValue
    return getUrlTab() ?? defaultValue
  })

  // Sync if controlledValue changes
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setActiveTab(controlledValue)
    }
  }, [controlledValue])

  // Sync if browser back/forward buttons are pressed (popstate)
  React.useEffect(() => {
    if (controlledValue !== undefined) return

    const handlePopState = () => {
      const urlTab = new URLSearchParams(window.location.search).get(urlParam)
      setActiveTab(urlTab ?? defaultValue)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [urlParam, defaultValue, controlledValue])

  // Also sync if searchParams explicitly specifies a tab from Next.js router navigation
  React.useEffect(() => {
    if (controlledValue !== undefined) return
    const param = searchParams?.get(urlParam)
    if (param) {
      setActiveTab(param)
    }
  }, [searchParams, urlParam, controlledValue])

  const handleValueChange = React.useCallback(
    (newVal: any, eventDetails: any) => {
      setActiveTab(newVal)
      onValueChange?.(newVal, eventDetails)

      if (typeof window !== "undefined" && urlParam) {
        const url = new URL(window.location.href)
        const strVal = String(newVal)
        if (defaultValue !== undefined && strVal === String(defaultValue)) {
          url.searchParams.delete(urlParam)
        } else {
          url.searchParams.set(urlParam, strVal)
        }
        const newUrl = url.pathname + (url.search ? url.search : "") + (url.hash || "")
        window.history.replaceState(null, "", newUrl)
      }
    },
    [defaultValue, onValueChange, urlParam]
  )

  return (
    <TabsPrimitive.Root
      value={activeTab}
      onValueChange={handleValueChange}
      {...props}
    />
  )
}

function UrlTabs(props: TabsProps & { urlParam: string }) {
  return (
    <React.Suspense fallback={<TabsPrimitive.Root {...props} />}>
      <UrlTabsInner {...props} />
    </React.Suspense>
  )
}

function Tabs({
  className,
  orientation = "horizontal",
  urlParam,
  ...props
}: TabsProps) {
  if (urlParam) {
    return (
      <UrlTabs
        urlParam={urlParam}
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          "group/tabs flex gap-2 data-horizontal:flex-col",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-4xl p-[3px] text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:rounded-2xl data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:px-2.5 group-data-vertical/tabs:py-1.5 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
