"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  Brain,
  Code2,
  Sparkles,
  Zap,
  Globe2,
  Cpu,
} from "lucide-react"
import { useRouter } from "next/navigation"

const models = [
  {
    name: "GPT-OSS",
    icon: Brain,
    position: "left-[8%] top-[24%]",
    delay: 0,
  },
  {
    name: "Claude",
    icon: Code2,
    position: "right-[9%] top-[25%]",
    delay: 0.8,
  },
  {
    name: "Gemini",
    icon: Globe2,
    position: "left-[15%] bottom-[24%]",
    delay: 1.4,
  },
  {
    name: "Qwen",
    icon: Cpu,
    position: "right-[15%] bottom-[23%]",
    delay: 2,
  },
]

export default function Home() {
  const router = useRouter()

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      {/* ========================================================= */}
      {/* BACKGROUND */}
      {/* ========================================================= */}

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,100,255,0.12),transparent_45%)]" />

        <motion.div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[140px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute left-[15%] top-[10%] h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[120px]"
          animate={{
            x: [0, 80, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-[5%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[130px]"
          animate={{
            x: [0, -70, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* ========================================================= */}
      {/* GRID */}
      {/* ========================================================= */}

      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, transparent 75%)",
        }}
      />

      {/* ========================================================= */}
      {/* NAVBAR */}
      {/* ========================================================= */}

      <motion.nav
        className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10"
            animate={{
              boxShadow: [
                "0 0 10px rgba(34,211,238,0.15)",
                "0 0 30px rgba(34,211,238,0.35)",
                "0 0 10px rgba(34,211,238,0.15)",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
            }}
          >
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </motion.div>

          <span className="text-lg font-semibold tracking-tight">
            PSR <span className="text-cyan-300">AI</span>
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-white/50 md:flex">
          <span className="text-white/80">Intelligent Routing</span>
          <span>Multi-Model AI</span>
          <span>One Interface</span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Systems Online
        </div>
      </motion.nav>

      {/* ========================================================= */}
      {/* FLOATING MODEL CARDS */}
      {/* ========================================================= */}

      {models.map((model) => {
        const Icon = model.icon

        return (
          <motion.div
            key={model.name}
            className={`absolute z-10 hidden ${model.position} lg:block`}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -12, 0],
            }}
            transition={{
              opacity: {
                duration: 0.8,
                delay: model.delay,
              },
              scale: {
                duration: 0.8,
                delay: model.delay,
              },
              y: {
                duration: 4 + model.delay,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 shadow-2xl backdrop-blur-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10">
                <Icon className="h-4 w-4 text-cyan-300" />
              </div>

              <div>
                <p className="text-sm font-medium">{model.name}</p>
                <p className="text-[10px] text-white/40">
                  Available model
                </p>
              </div>

              <span className="ml-2 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>
          </motion.div>
        )
      })}

      {/* ========================================================= */}
      {/* CONNECTION LINES */}
      {/* ========================================================= */}

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <svg
          className="h-full w-full opacity-20"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M150 250 C 400 250, 500 400, 720 450"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            strokeDasharray="6 10"
            animate={{
              strokeDashoffset: [0, -80],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.path
            d="M1290 250 C 1050 250, 940 400, 720 450"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            strokeDasharray="6 10"
            animate={{
              strokeDashoffset: [0, -80],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.path
            d="M220 700 C 450 650, 550 520, 720 450"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            strokeDasharray="6 10"
            animate={{
              strokeDashoffset: [0, -80],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.path
            d="M1220 700 C 990 650, 890 520, 720 450"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            strokeDasharray="6 10"
            animate={{
              strokeDashoffset: [0, -80],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <defs>
            <linearGradient
              id="lineGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ========================================================= */}
      {/* MAIN HERO */}
      {/* ========================================================= */}

      <section className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-6 pb-20 text-center">
        {/* Badge */}

        <motion.div
          className="mb-8 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-xs text-cyan-200 backdrop-blur-xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>AI ROUTING ENGINE</span>
          <span className="text-white/30">•</span>
          <span className="text-white/50">
            Choose nothing. We do it for you.
          </span>
        </motion.div>

        {/* Heading */}

        <div className="relative">
          <motion.div
            className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[100px]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.25, 0.5, 0.25],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />

          <motion.h1
            className="max-w-5xl text-5xl font-bold tracking-[-0.04em] sm:text-6xl md:text-8xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="block text-white">ONE PROMPT.</span>

            <motion.span
              className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              THE PERFECT AI.
            </motion.span>
          </motion.h1>
        </div>

        {/* Description */}

        <motion.p
          className="mt-7 max-w-2xl text-base leading-7 text-white/45 sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.65,
          }}
        >
          PSR AI understands what you need, analyzes your request,
          and intelligently routes it to the model best suited for
          the job.
        </motion.p>

        {/* CTA */}

        <motion.button
          onClick={() => router.push("/chat")}
          className="group mt-10 flex items-center gap-3 rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 px-7 py-4 text-sm font-semibold text-white shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-xl transition-all hover:border-cyan-300/60 hover:bg-cyan-400/20 hover:shadow-[0_0_50px_rgba(34,211,238,0.25)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.9,
          }}
          whileHover={{
            scale: 1.04,
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          <Sparkles className="h-4 w-4 text-cyan-300" />

          <span>ENTER PSR AI</span>

          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>

        {/* Stats */}

        <motion.div
          className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 1.1,
          }}
        >
          <div>
            <p className="text-lg font-semibold text-white">1</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-white/30">
              Prompt
            </p>
          </div>

          <div className="border-x border-white/10 px-8">
            <p className="text-lg font-semibold text-cyan-300">AI</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-white/30">
              Routing
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold text-white">∞</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-white/30">
              Possibilities
            </p>
          </div>
        </motion.div>

        {/* Bottom hint */}

        <motion.div
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1.5,
            duration: 1,
          }}
        >
          <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-400" />
          Intelligent model selection
        </motion.div>
      </section>
    </main>
  )
}