"use client"

import { motion } from "framer-motion"

interface LoadingSkeletonProps {
  className?: string
  variant?: "text" | "circle" | "card" | "chat"
}

export function LoadingSkeleton({ className, variant = "text" }: LoadingSkeletonProps) {
  const baseClasses = "bg-secondary/50 rounded animate-pulse"
  
  if (variant === "circle") {
    return <div className={`${baseClasses} rounded-full ${className}`} />
  }
  
  if (variant === "card") {
    return (
      <div className={`glass rounded-2xl p-6 ${className}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`${baseClasses} w-12 h-12 rounded-xl`} />
          <div className="flex-1 space-y-2">
            <div className={`${baseClasses} h-4 w-1/3`} />
            <div className={`${baseClasses} h-3 w-1/4`} />
          </div>
        </div>
        <div className="space-y-2">
          <div className={`${baseClasses} h-3 w-full`} />
          <div className={`${baseClasses} h-3 w-4/5`} />
          <div className={`${baseClasses} h-3 w-2/3`} />
        </div>
      </div>
    )
  }
  
  if (variant === "chat") {
    return (
      <div className={`flex gap-4 ${className}`}>
        <div className={`${baseClasses} w-9 h-9 rounded-xl shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className={`${baseClasses} h-3 w-1/4`} />
          <div className="glass rounded-2xl p-4 space-y-2">
            <div className={`${baseClasses} h-3 w-full`} />
            <div className={`${baseClasses} h-3 w-4/5`} />
            <div className={`${baseClasses} h-3 w-3/5`} />
          </div>
        </div>
      </div>
    )
  }
  
  return <div className={`${baseClasses} h-4 ${className}`} />
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({ 
  children, 
  delay = 0,
  duration = 0.5,
  className = ""
}: { 
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({ 
  children, 
  delay = 0,
  className = ""
}: { 
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideIn({ 
  children, 
  direction = "left",
  delay = 0,
  className = ""
}: { 
  children: React.ReactNode
  direction?: "left" | "right" | "up" | "down"
  delay?: number
  className?: string
}) {
  const variants = {
    left: { x: -30, y: 0 },
    right: { x: 30, y: 0 },
    up: { x: 0, y: -30 },
    down: { x: 0, y: 30 },
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, ...variants[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Pulse({ 
  children,
  className = ""
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.02, 1],
        opacity: [1, 0.8, 1]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Glow({ 
  children,
  color = "primary",
  className = ""
}: { 
  children: React.ReactNode
  color?: "primary" | "accent"
  className?: string
}) {
  const colors = {
    primary: "rgba(100, 200, 255, 0.5)",
    accent: "rgba(80, 220, 200, 0.5)",
  }
  
  return (
    <motion.div
      animate={{ 
        boxShadow: [
          `0 0 0px ${colors[color]}`,
          `0 0 20px ${colors[color]}`,
          `0 0 0px ${colors[color]}`,
        ]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
