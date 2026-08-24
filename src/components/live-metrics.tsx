"use client"

import { motion } from "framer-motion"
import { Activity, Zap, Brain, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"

export function LiveMetrics() {
  const [metrics, setMetrics] = useState({
    requestsPerSec: 12.4,
    avgLatency: 47,
    activeModels: 5,
    costSaved: 127.40,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        requestsPerSec: Math.max(5, prev.requestsPerSec + (Math.random() - 0.5) * 2),
        avgLatency: Math.max(30, Math.min(80, prev.avgLatency + (Math.random() - 0.5) * 10)),
        activeModels: 5,
        costSaved: prev.costSaved + Math.random() * 0.5,
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const items = [
    { 
      label: "Requests/sec", 
      value: metrics.requestsPerSec.toFixed(1), 
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/20"
    },
    { 
      label: "Avg Latency", 
      value: `${Math.round(metrics.avgLatency)}ms`, 
      icon: Zap,
      color: "text-accent",
      bgColor: "bg-accent/20"
    },
    { 
      label: "Active Models", 
      value: metrics.activeModels.toString(), 
      icon: Brain,
      color: "text-chart-3",
      bgColor: "bg-chart-3/20"
    },
    { 
      label: "Cost Saved", 
      value: `$${metrics.costSaved.toFixed(2)}`, 
      icon: DollarSign,
      color: "text-chart-4",
      bgColor: "bg-chart-4/20"
    },
  ]

  return (
    <div className="flex items-center gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
          </div>
          <div>
            <motion.p
              className="text-sm font-semibold text-foreground"
              key={item.value}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
            >
              {item.value}
            </motion.p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
