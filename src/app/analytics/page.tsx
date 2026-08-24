"use client"

import { motion } from "framer-motion"
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from "recharts"
import { 
  Brain, Zap, DollarSign, TrendingUp, Clock, 
  Activity, ArrowUpRight, ArrowDownRight, Sparkles
} from "lucide-react"
import Link from "next/link"

const modelUsageData = [
  { name: "Claude Sonnet", value: 420, color: "#f59e0b" },
  { name: "GPT-5", value: 320, color: "#10b981" },
  { name: "DeepSeek", value: 280, color: "#06b6d4" },
  { name: "Gemini Pro", value: 180, color: "#6366f1" },
  { name: "Llama", value: 120, color: "#ec4899" },
]

const weeklyData = [
  { day: "Mon", requests: 145, cost: 12.5, accuracy: 96 },
  { day: "Tue", requests: 178, cost: 15.2, accuracy: 97 },
  { day: "Wed", requests: 203, cost: 17.8, accuracy: 95 },
  { day: "Thu", requests: 167, cost: 14.3, accuracy: 98 },
  { day: "Fri", requests: 234, cost: 20.1, accuracy: 97 },
  { day: "Sat", requests: 89, cost: 7.6, accuracy: 99 },
  { day: "Sun", requests: 112, cost: 9.5, accuracy: 98 },
]

const responseTimeData = [
  { time: "00:00", latency: 45 },
  { time: "04:00", latency: 38 },
  { time: "08:00", latency: 52 },
  { time: "12:00", latency: 68 },
  { time: "16:00", latency: 55 },
  { time: "20:00", latency: 48 },
]

const stats = [
  { label: "Total Requests", value: "1,328", change: "+12.5%", positive: true, icon: Activity },
  { label: "Avg Response Time", value: "47ms", change: "-8.2%", positive: true, icon: Clock },
  { label: "Routing Accuracy", value: "98.7%", change: "+2.1%", positive: true, icon: TrendingUp },
  { label: "Cost Savings", value: "$127.40", change: "+18.3%", positive: true, icon: DollarSign },
]

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold text-foreground">PSR AI</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Chat
            </Link>
            <Link href="/analytics" className="text-sm text-foreground font-medium">
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your AI routing performance and usage metrics
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.positive ? "text-accent" : "text-destructive"}`}>
                  {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Model Usage Pie Chart */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Model Usage Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {modelUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 30, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {modelUsageData.map((model) => (
                <div key={model.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: model.color }} />
                  <span className="text-xs text-muted-foreground">{model.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Requests Bar Chart */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Weekly Requests</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 30, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="requests" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Full Width Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Response Time Line Chart */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Response Time (24h)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={responseTimeData}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 12 }}
                    unit="ms"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 30, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#60a5fa" 
                    strokeWidth={2}
                    fill="url(#areaGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Routing Accuracy Line Chart */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Routing Accuracy</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "#888", fontSize: 12 }}
                    domain={[90, 100]}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 30, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#50dcc8" 
                    strokeWidth={2}
                    dot={{ fill: "#50dcc8", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#50dcc8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Model Performance Table */}
        <motion.div
          className="glass rounded-2xl p-6 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Model Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Model</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Requests</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg Latency</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Success Rate</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tokens Used</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { model: "Claude Sonnet", requests: "420", latency: "45ms", success: "99.2%", tokens: "1.2M" },
                  { model: "GPT-5", requests: "320", latency: "52ms", success: "98.8%", tokens: "980K" },
                  { model: "DeepSeek", requests: "280", latency: "38ms", success: "99.5%", tokens: "750K" },
                  { model: "Gemini Pro", requests: "180", latency: "41ms", success: "98.9%", tokens: "520K" },
                  { model: "Llama", requests: "120", latency: "35ms", success: "97.5%", tokens: "380K" },
                ].map((row, index) => (
                  <motion.tr
                    key={row.model}
                    className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: modelUsageData.find(m => m.name === row.model)?.color + "30" }}
                        >
                          <Brain 
                            className="w-4 h-4" 
                            style={{ color: modelUsageData.find(m => m.name === row.model)?.color }}
                          />
                        </div>
                        <span className="font-medium text-foreground">{row.model}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-foreground">{row.requests}</td>
                    <td className="py-4 px-4 text-foreground">{row.latency}</td>
                    <td className="py-4 px-4">
                      <span className="text-accent font-medium">{row.success}</span>
                    </td>
                    <td className="py-4 px-4 text-foreground">{row.tokens}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
