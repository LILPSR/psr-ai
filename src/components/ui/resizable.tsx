"use client"

import * as React from "react"
import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      className={cn(
        "flex h-full w-full data-[group-orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  )
}

function ResizablePanel(
  props: React.ComponentProps<typeof Panel>,
) {
  return <Panel {...props} />
}

function ResizableHandle({
  className,
  withHandle,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) {
  return (
    <Separator
      className={cn(
        "relative flex w-px items-center justify-center bg-border",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "data-[separator=horizontal]:h-px data-[separator=horizontal]:w-full",
        "data-[separator=horizontal]:after:left-0",
        "data-[separator=horizontal]:after:inset-x-0",
        "data-[separator=horizontal]:after:h-1",
        "data-[separator=horizontal]:after:w-full",
        "data-[separator=horizontal]:after:-translate-y-1/2",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 h-4 w-1 rounded-full bg-border" />
      )}
    </Separator>
  )
}

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
}