"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    let connections: Connection[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.radius = Math.random() * 1.5 + 0.5
        this.opacity = Math.random() * 0.5 + 0.2
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1
      }

      draw() {
        ctx!.beginPath()
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(100, 200, 255, ${this.opacity})`
        ctx!.fill()
      }
    }

    interface Connection {
      from: Particle
      to: Particle
    }

    function initParticles() {
      particles = []
      const count = Math.floor((canvas!.width * canvas!.height) / 15000)
      for (let i = 0; i < count; i++) {
        particles.push(new Particle())
      }
    }

    function updateConnections() {
      connections = []
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distanceSq = dx * dx + dy * dy
          if (distanceSq < 22500) {
            connections.push({ from: particles[i], to: particles[j] })
          }
        }
      }
    }

    function drawConnections() {
      connections.forEach((conn) => {
        const dx = conn.from.x - conn.to.x
        const dy = conn.from.y - conn.to.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const opacity = (1 - distance / 150) * 0.15

        ctx!.beginPath()
        ctx!.moveTo(conn.from.x, conn.from.y)
        ctx!.lineTo(conn.to.x, conn.to.y)
        ctx!.strokeStyle = `rgba(100, 200, 255, ${opacity})`
        ctx!.lineWidth = 0.5
        ctx!.stroke()
      })
    }

    function animate() {
      ctx!.fillStyle = "rgba(8, 8, 18, 0.1)"
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

      particles.forEach((p) => {
        p.update()
        p.draw()
      })

      updateConnections()
      drawConnections()

      animationFrameId = requestAnimationFrame(animate)
    }

    resize()
    animate()
    window.addEventListener("resize", resize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="fixed inset-0 gradient-mesh pointer-events-none" style={{ zIndex: 1 }} />
      <motion.div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(100, 200, 255, 0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 1,
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(80, 220, 200, 0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 1,
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  )
}
