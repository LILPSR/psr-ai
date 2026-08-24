"use client"

import { motion } from "framer-motion"
import { Sparkles, Zap, Brain, Code2, Palette, Search } from "lucide-react"
import Link from "next/link"

const models = [
  { name: "GPT-5", color: "from-emerald-400 to-teal-500", icon: Brain },
  { name: "Claude Sonnet", color: "from-orange-400 to-amber-500", icon: Sparkles },
  { name: "Gemini Pro", color: "from-blue-400 to-indigo-500", icon: Search },
  { name: "DeepSeek", color: "from-cyan-400 to-sky-500", icon: Code2 },
  { name: "Llama", color: "from-pink-400 to-rose-500", icon: Palette },
]

const floatingAnimation = (delay: number, duration: number) => ({
  y: [-10, 10, -10],
  x: [-5, 5, -5],
  rotate: [-2, 2, -2],
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut",
    delay,
  },
})

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Floating Model Chips */}
      <div className="absolute inset-0 pointer-events-none">
        {models.map((model, index) => {
          const positions = [
            { top: "15%", left: "10%" },
            { top: "20%", right: "15%" },
            { top: "60%", left: "8%" },
            { top: "70%", right: "10%" },
            { bottom: "20%", left: "20%" },
          ]
          const pos = positions[index]
          return (
            <motion.div
              key={model.name}
              className="absolute hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass glow-border"
              style={pos}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.6, 0.9, 0.6],
                scale: [0.95, 1.05, 0.95],
                ...floatingAnimation(index * 0.5, 6 + index).y && { y: floatingAnimation(index * 0.5, 6 + index).y },
              }}
              transition={{
                opacity: { duration: 4, repeat: Infinity, delay: index * 0.3 },
                scale: { duration: 5, repeat: Infinity, delay: index * 0.2 },
                y: { duration: 6 + index, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 },
              }}
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                <model.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground/80">{model.name}</span>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 text-center max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Intelligent Model Routing</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-foreground">One Prompt.</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent glow-text">
            The Perfect AI.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          PSR AI intelligently routes your request to the best model for coding, reasoning, creativity, research, and more.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/chat">
            <motion.button
              className="group relative px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              <span className="relative flex items-center gap-2 text-background">
                <Sparkles className="w-5 h-5" />
                Start Routing
              </span>
            </motion.button>
          </Link>
          <Link href="/analytics">
            <motion.button
              className="px-8 py-4 rounded-2xl font-semibold text-lg glass border border-border/50 hover:border-primary/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Analytics
            </motion.button>
          </Link>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { label: "Models", value: "5" },
            { label: "Accuracy", value: "98.7%" },
            { label: "Latency", value: "<50ms" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <motion.div
                className="text-2xl sm:text-3xl font-bold text-foreground"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1, y: { duration: 2, repeat: Infinity } }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
