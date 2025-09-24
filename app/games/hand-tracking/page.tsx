"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    Hands: any
    Camera: any
    drawConnectors: any
    HAND_CONNECTIONS: any
  }
}

export default function HandTrackingPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentExperiment, setCurrentExperiment] = useState("aura-glow")
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  
  // State for experiments
  const animationFrameRef = useRef(0)
  const bubblesRef = useRef<any[]>([])
  const particlesRef = useRef<any[]>([])

  // Art direction and effects configuration
  const ART = {
    waveDirection: -1, waveCount: 4, waveCrestWidth: 0.2, loopDuration: 200,
    peakOpacity: 0.9, valleyOpacity: 0.05,
    fingerRadius: 6, strokeWidth: 2,
    orbitSpeed: 0.03, circleRadius: 5, orbitingCircles: 30,
    magnetoBallRadius: 8, magnetoOrbitRadius: 60, magnetoSpeed: 0.07, magnetoPitch: Math.PI / 3,
    auraBaseRadius: 20, auraScale: 200,
    bubbleMaxRadius: 15, bubbleRiseSpeed: 2,
    lightningDisplacement: 15, lightningDetail: 5,
    particleLife: 100, particlePushForce: 50, particleCount: 200,
  }

  const experiments = [
    { id: "dashed", label: "EXP1" },
    { id: "dashed-sine", label: "EXP2" },
    { id: "tangent-art", label: "EXP3" },
    { id: "rectangle-art", label: "EXP4" },
    { id: "orbiting-circles", label: "EXP5" },
    { id: "magneto-balls", label: "EXP6" },
    { id: "aura-glow", label: "EXP7" },
    { id: "bubbles", label: "EXP8" },
    { id: "lightning", label: "EXP9" },
    { id: "particles", label: "EXP10" },
  ]

  // Load MediaPipe scripts
  useEffect(() => {
    const loadScripts = async () => {
      const scripts = [
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
      ]

      for (const src of scripts) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script")
          script.src = src
          script.crossOrigin = "anonymous"
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }
      setScriptsLoaded(true)
    }

    loadScripts().catch(console.error)
  }, [])

  // Helper functions
  const getAveragePosition = (hand: any[], indices: number[]) => {
    let sumX = 0, sumY = 0, count = 0
    for (const index of indices) {
      if (hand && hand[index]) {
        sumX += hand[index].x
        sumY += hand[index].y
        count++
      }
    }
    if (count === 0) return null
    return { x: sumX / count, y: sumY / count }
  }

  const normalizePosition = (pos: number) => ((pos % 1) + 1) % 1

  // Drawing functions for each experiment
  const drawDashedLines = (canvasCtx: CanvasRenderingContext2D, hand1: any[], hand2: any[], fingerTips: number[]) => {
    canvasCtx.strokeStyle = '#ffffff'
    canvasCtx.lineWidth = 2
    canvasCtx.setLineDash([5, 5])
    canvasCtx.lineDashOffset = -animationFrameRef.current

    for (const tipIndex of fingerTips) {
      const p1 = hand1[tipIndex]
      const p2 = hand2[tipIndex]
      if (!p1 || !p2) continue
      canvasCtx.beginPath()
      canvasCtx.moveTo(p1.x * canvasRef.current!.width, p1.y * canvasRef.current!.height)
      canvasCtx.lineTo(p2.x * canvasRef.current!.width, p2.y * canvasRef.current!.height)
      canvasCtx.stroke()
    }
    canvasCtx.setLineDash([])
  }

  const drawDynamicSineWaves = (canvasCtx: CanvasRenderingContext2D, hand1: any[], hand2: any[], fingerTips: number[]) => {
    const phase = animationFrameRef.current * 0.05
    canvasCtx.strokeStyle = '#ffffff'
    canvasCtx.lineWidth = 2
    canvasCtx.setLineDash([])

    for (const tipIndex of fingerTips) {
      const p1_norm = hand1[tipIndex]
      const p2_norm = hand2[tipIndex]
      if (!p1_norm || !p2_norm) continue

      const distance_norm = Math.hypot(p2_norm.x - p1_norm.x, p2_norm.y - p1_norm.y)
      const normalized_distance = Math.min(distance_norm / 0.7, 1)
      const amplitude = 40 - (normalized_distance * 38)
      const wavelength = 50 + (normalized_distance * 250)
      const frequency = (2 * Math.PI) / wavelength
      const p1 = {x: p1_norm.x * canvasRef.current!.width, y: p1_norm.y * canvasRef.current!.height}
      const p2 = {x: p2_norm.x * canvasRef.current!.width, y: p2_norm.y * canvasRef.current!.height}
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const distance_px = Math.hypot(dx, dy)
      if (distance_px < 1) continue

      const angle = Math.atan2(dy, dx)
      const segments = 50
      
      canvasCtx.beginPath()
      canvasCtx.moveTo(p1.x, p1.y)
      for (let i = 0; i <= segments; i++) {
        const progress = i / segments
        const distAlongLine = progress * distance_px
        const linearX = p1.x + progress * dx
        const linearY = p1.y + progress * dy
        const waveOffset = amplitude * Math.sin(distAlongLine * frequency + phase)
        const waveX = linearX + waveOffset * Math.cos(angle + Math.PI / 2)
        const waveY = linearY + waveOffset * Math.sin(angle + Math.PI / 2)
        canvasCtx.lineTo(waveX, waveY)
      }
      canvasCtx.lineTo(p2.x, p2.y)
      canvasCtx.stroke()
    }
  }

  const drawTangentShape = (canvasCtx: CanvasRenderingContext2D, p1_norm: any, p2_norm: any) => {
    if (!p1_norm || !p2_norm) return
    const radius = ART.fingerRadius
    const p1 = { x: p1_norm.x * canvasRef.current!.width, y: p1_norm.y * canvasRef.current!.height }
    const p2 = { x: p2_norm.x * canvasRef.current!.width, y: p2_norm.y * canvasRef.current!.height }
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const distance = Math.hypot(dx, dy)
    if (distance < radius * 2) return
    
    const perpDx = -dy / distance
    const perpDy = dx / distance
    const t1_p1 = { x: p1.x + radius * perpDx, y: p1.y + radius * perpDy }
    const t1_p2 = { x: p2.x + radius * perpDx, y: p2.y + radius * perpDy }
    const t2_p1 = { x: p1.x - radius * perpDx, y: p1.y - radius * perpDy }
    const t2_p2 = { x: p2.x - radius * perpDx, y: p2.y - radius * perpDy }
    
    const gradient = canvasCtx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
    let loopProgress = (animationFrameRef.current % ART.loopDuration) / ART.loopDuration
    if (ART.waveDirection === -1) { loopProgress = 1 - loopProgress }
    
    const waveSpacing = 1.0 / ART.waveCount
    const peakC = `rgba(255, 255, 255, ${ART.peakOpacity})`
    const valleyC = `rgba(255, 255, 255, ${ART.valleyOpacity})`
    const stops = new Map()
    let initialColor = valleyC
    
    for (let i = 0; i < ART.waveCount; i++) {
      const p = normalizePosition(loopProgress + i * waveSpacing)
      if (p + ART.waveCrestWidth > 1.0) { initialColor = peakC; break }
    }
    stops.set(0, initialColor)
    
    for (let i = 0; i < ART.waveCount; i++) {
      const p = normalizePosition(loopProgress + i * waveSpacing)
      const e = p + ART.waveCrestWidth
      stops.set(p, peakC)
      if (e <= 1.0) { stops.set(e, valleyC) } 
      else { stops.set(1, peakC); stops.set(normalizePosition(e), valleyC) }
    }
    
    Array.from(stops.entries()).sort((a,b) => a[0] - b[0]).forEach(([pos, color]) => gradient.addColorStop(pos, color))
    canvasCtx.fillStyle = gradient
    canvasCtx.beginPath()
    canvasCtx.moveTo(t1_p1.x, t1_p1.y)
    canvasCtx.lineTo(t1_p2.x, t1_p2.y)
    canvasCtx.lineTo(t2_p2.x, t2_p2.y)
    canvasCtx.lineTo(t2_p1.x, t2_p1.y)
    canvasCtx.closePath()
    canvasCtx.fill()
    canvasCtx.stroke()
  }

  const drawStringArt = (canvasCtx: CanvasRenderingContext2D, hand1: any[], hand2: any[], fingerTips: number[]) => {
    canvasCtx.strokeStyle = '#ffffff'
    canvasCtx.lineWidth = ART.strokeWidth
    canvasCtx.setLineDash([])
    for (const tipIndex of fingerTips) {
      drawTangentShape(canvasCtx, hand1[tipIndex], hand2[tipIndex])
    }
  }

  const drawRectangleArt = (canvasCtx: CanvasRenderingContext2D, hand1: any[], hand2: any[]) => {
    canvasCtx.strokeStyle = '#ffffff'
    canvasCtx.lineWidth = ART.strokeWidth
    canvasCtx.setLineDash([])
    const thumbTip = 4, littleTip = 20
    drawTangentShape(canvasCtx, hand1[thumbTip], hand2[thumbTip])
    drawTangentShape(canvasCtx, hand1[littleTip], hand2[littleTip])
    drawTangentShape(canvasCtx, hand1[thumbTip], hand1[littleTip])
    drawTangentShape(canvasCtx, hand2[thumbTip], hand2[littleTip])
  }

  const drawOrbitingCircles = (canvasCtx: CanvasRenderingContext2D, hand1: any[], hand2: any[], fingerTips: number[]) => {
    canvasCtx.fillStyle = '#ffffff'
    if (fingerTips.length === 0) return
    
    const midpoints = []
    let sumX = 0, sumY = 0
    for (const tipIndex of fingerTips) {
      const p1 = hand1[tipIndex], p2 = hand2[tipIndex]
      if (!p1 || !p2) continue
      const midX = ((p1.x + p2.x) / 2) * canvasRef.current!.width
      const midY = ((p1.y + p2.y) / 2) * canvasRef.current!.height
      midpoints.push({ x: midX, y: midY })
      sumX += midX
      sumY += midY
    }
    
    if (midpoints.length === 0) return
    const centroidX = sumX / midpoints.length
    const centroidY = sumY / midpoints.length
    
    if (midpoints.length < 2) { 
      canvasCtx.beginPath()
      canvasCtx.arc(centroidX, centroidY, ART.circleRadius, 0, 2 * Math.PI)
      canvasCtx.fill()
      return
    }
    
    let avgHandDist = 0
    let validPairs = 0
    for (const tipIndex of fingerTips) {
      const p1 = hand1[tipIndex], p2 = hand2[tipIndex]
      if (!p1 || !p2) continue
      avgHandDist += Math.hypot(p1.x - p2.x, p1.y - p2.y)
      validPairs++
    }
    if (validPairs === 0) return
    avgHandDist /= validPairs
    
    let radiusScale = 0.4 + ((avgHandDist - 0.15) / (0.8 - 0.15)) * (1.6 - 0.4)
    radiusScale = Math.max(0.4, Math.min(1.6, radiusScale))
    
    let varX = 0, varY = 0, covXY = 0
    for (const p of midpoints) { 
      const dx = p.x - centroidX, dy = p.y - centroidY
      varX += dx * dx
      varY += dy * dy
      covXY += dx * dy
    }
    varX /= midpoints.length
    varY /= midpoints.length
    covXY /= midpoints.length
    
    const ellipseAngle = 0.5 * Math.atan2(2 * covXY, varX - varY)
    let maxProjectedDistSq = 0, minProjectedDistSq = 0
    const cosA = Math.cos(ellipseAngle), sinA = Math.sin(ellipseAngle)
    
    for (const p of midpoints) { 
      const dx = p.x - centroidX, dy = p.y - centroidY
      const projMajor = dx * cosA + dy * sinA, projMinor = -dx * sinA + dy * cosA
      maxProjectedDistSq = Math.max(maxProjectedDistSq, projMajor * projMajor)
      minProjectedDistSq = Math.max(minProjectedDistSq, projMinor * projMinor)
    }
    
    const majorRadius = Math.sqrt(maxProjectedDistSq) * radiusScale
    const minorRadius = Math.sqrt(minProjectedDistSq) * radiusScale
    const numPoints = ART.orbitingCircles
    const rotationOffset = animationFrameRef.current * -ART.orbitSpeed
    
    for (let i = 0; i < numPoints; i++) {
      const theta = rotationOffset + (2 * Math.PI * i) / numPoints
      const unrotatedX = majorRadius * Math.cos(theta)
      const unrotatedY = minorRadius * Math.sin(theta)
      const finalX = centroidX + unrotatedX * cosA - unrotatedY * sinA
      const finalY = centroidY + unrotatedX * sinA + unrotatedY * cosA
      canvasCtx.beginPath()
      canvasCtx.arc(finalX, finalY, ART.circleRadius, 0, 2 * Math.PI)
      canvasCtx.fill()
    }
  }

  const drawMagnetoBalls = (canvasCtx: CanvasRenderingContext2D, hand1: any[], hand2: any[]) => {
    const palmIndices = [0, 5, 9, 13, 17]
    const palmCenter1 = getAveragePosition(hand1, palmIndices)
    const palmCenter2 = getAveragePosition(hand2, palmIndices)
    if (!palmCenter1 || !palmCenter2) return
    
    const cx = ((palmCenter1.x + palmCenter2.x) / 2) * canvasRef.current!.width
    const cy = ((palmCenter1.y + palmCenter2.y) / 2) * canvasRef.current!.height
    const dx = (palmCenter2.x - palmCenter1.x) * canvasRef.current!.width
    const dy = (palmCenter2.y - palmCenter1.y) * canvasRef.current!.height
    const planeAngle = Math.atan2(dy, dx)
    
    const balls = []
    const numBalls = 3
    const cosPitch = Math.cos(ART.magnetoPitch), sinPitch = Math.sin(ART.magnetoPitch)
    const cosPlane = Math.cos(planeAngle), sinPlane = Math.sin(planeAngle)
    
    for (let i = 0; i < numBalls; i++) {
      const angle = animationFrameRef.current * ART.magnetoSpeed
      const phase = (i * 2 * Math.PI) / numBalls
      const angleX = angle * 1.1 + phase, angleY = angle * 0.9 + phase, angleZ = angle * 1.2 + phase
      const localX = ART.magnetoOrbitRadius * Math.cos(angleX)
      const localY = ART.magnetoOrbitRadius * Math.sin(angleY)
      const localZ = ART.magnetoOrbitRadius * Math.sin(angleZ) * 0.5
      const pitchedY = localY * cosPitch - localZ * sinPitch
      const pitchedZ = localY * sinPitch + localZ * cosPitch
      const finalX = cx + (localX * cosPlane - pitchedY * sinPlane)
      const finalY = cy + (localX * sinPlane + pitchedY * cosPlane)
      balls.push({ x: finalX, y: finalY, z: pitchedZ })
    }
    
    canvasCtx.fillStyle = '#ffffff'
    balls.sort((a, b) => a.z - b.z).forEach(ball => { 
      canvasCtx.beginPath()
      canvasCtx.arc(ball.x, ball.y, ART.magnetoBallRadius, 0, 2 * Math.PI)
      canvasCtx.fill()
    })
  }

  const drawAuraGlow = (canvasCtx: CanvasRenderingContext2D, hand1: any[], hand2: any[]) => {
    const palmIndices = [0, 5, 9, 13, 17]
    const p1 = getAveragePosition(hand1, palmIndices)
    const p2 = getAveragePosition(hand2, palmIndices)
    if (!p1 || !p2) return
    
    const handDist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
    const intensity = Math.max(0, 1 - (handDist / 0.7))
    const centerX = ((p1.x + p2.x) / 2) * canvasRef.current!.width
    const centerY = ((p1.y + p2.y) / 2) * canvasRef.current!.height
    
    if (intensity > 0) {
      const glowRadius = intensity * 300
      const glowOpacity = Math.min(1.0, intensity * 3)
      const grad = canvasCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius)
      grad.addColorStop(0, `rgba(255, 255, 255, ${glowOpacity})`)
      grad.addColorStop(0.3, `rgba(255, 255, 255, ${glowOpacity * 0.7})`)
      grad.addColorStop(0.6, `rgba(255, 255, 255, ${glowOpacity * 0.3})`)
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      canvasCtx.fillStyle = grad
      canvasCtx.beginPath()
      canvasCtx.arc(centerX, centerY, glowRadius, 0, 2 * Math.PI)
      canvasCtx.fill()
    }
    
    if (intensity > 0) {
      const strokeRadius = intensity * 40
      if (strokeRadius > 0.5) { 
        canvasCtx.strokeStyle = '#ffffff'
        canvasCtx.lineWidth = 2
        canvasCtx.beginPath()
        canvasCtx.arc(centerX, centerY, strokeRadius, 0, 2 * Math.PI)
        canvasCtx.stroke()
      }
    }
  }

  const drawBubbles = (canvasCtx: CanvasRenderingContext2D, hand1: any[], hand2: any[], fingerTips: number[]) => {
    const handDist = Math.hypot(hand1[0].x - hand2[0].x, hand1[0].y - hand2[0].y)
    const spawnRate = Math.max(0.1, 1 - (handDist / 0.8))

    if (Math.random() < spawnRate) {
      for (const hand of [hand1, hand2]) {
        for (const tipIndex of fingerTips) {
          const tip = hand[tipIndex]
          if (tip && Math.random() < 0.2) {
            bubblesRef.current.push({
              x: tip.x * canvasRef.current!.width,
              y: tip.y * canvasRef.current!.height,
              radius: Math.random() * ART.bubbleMaxRadius + 2,
              opacity: 1,
              speedY: -(Math.random() * ART.bubbleRiseSpeed + 1),
              speedX: (Math.random() - 0.5) * 2
            })
          }
        }
      }
    }

    canvasCtx.strokeStyle = '#ffffff'
    canvasCtx.lineWidth = 1
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i]
      b.y += b.speedY
      b.x += b.speedX
      b.opacity -= 0.01

      if (b.opacity <= 0) {
        bubblesRef.current.splice(i, 1)
      } else {
        canvasCtx.globalAlpha = b.opacity
        canvasCtx.beginPath()
        canvasCtx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI)
        canvasCtx.stroke()
      }
    }
    canvasCtx.globalAlpha = 1
  }

  const generateLightning = (p1: any, p2: any, displacement: number, detail: number) => {
    let segments = [{x: p1.x, y: p1.y}, {x: p2.x, y: p2.y}]
    
    for (let i = 0; i < detail; i++) {
      for (let j = segments.length - 2; j >= 0; j--) {
        const start = segments[j]
        const end = segments[j+1]
        const midX = (start.x + end.x) / 2
        const midY = (start.y + end.y) / 2
        const offsetX = (Math.random() - 0.5) * displacement
        const offsetY = (Math.random() - 0.5) * displacement
        segments.splice(j + 1, 0, {x: midX + offsetX, y: midY + offsetY})
      }
      displacement /= 2
    }
    return segments
  }
  
  const drawLightning = (canvasCtx: CanvasRenderingContext2D, hand1: any[], hand2: any[]) => {
    const indexTip1 = hand1[8]
    const indexTip2 = hand2[8]
    if (!indexTip1 || !indexTip2) return

    const p1 = { x: indexTip1.x * canvasRef.current!.width, y: indexTip1.y * canvasRef.current!.height }
    const p2 = { x: indexTip2.x * canvasRef.current!.width, y: indexTip2.y * canvasRef.current!.height }
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
    const displacement = Math.min(dist / 4, ART.lightningDisplacement)

    const bolt = generateLightning(p1, p2, displacement, ART.lightningDetail)

    canvasCtx.strokeStyle = '#ffffff'
    canvasCtx.lineWidth = 2
    canvasCtx.shadowColor = '#ffffff'
    canvasCtx.shadowBlur = 10
    canvasCtx.beginPath()
    canvasCtx.moveTo(bolt[0].x, bolt[0].y)
    for(let i = 1; i < bolt.length; i++) {
      canvasCtx.lineTo(bolt[i].x, bolt[i].y)
    }
    canvasCtx.stroke()
    canvasCtx.shadowBlur = 0
  }

  const drawParticles = (canvasCtx: CanvasRenderingContext2D, hand1: any[], hand2: any[]) => {
    while (particlesRef.current.length < ART.particleCount) {
      particlesRef.current.push({
        x: canvasRef.current!.width / 2,
        y: canvasRef.current!.height / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: ART.particleLife
      })
    }

    canvasCtx.fillStyle = '#ffffff'
    const handPoints = [...hand1, ...hand2].filter(p => p)

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i]
      p.x += p.vx
      p.y += p.vy
      p.life--

      for (const landmark of handPoints) {
        const hx = landmark.x * canvasRef.current!.width
        const hy = landmark.y * canvasRef.current!.height
        const dx = p.x - hx
        const dy = p.y - hy
        const distSq = dx * dx + dy * dy
        if (distSq < ART.particlePushForce * ART.particlePushForce) {
          const force = 1 - (Math.sqrt(distSq) / ART.particlePushForce)
          p.vx += (dx / Math.sqrt(distSq)) * force * 0.5
          p.vy += (dy / Math.sqrt(distSq)) * force * 0.5
        }
      }
      
      p.vx *= 0.98
      p.vy *= 0.98

      if (p.life <= 0 || p.x < 0 || p.x > canvasRef.current!.width || p.y < 0 || p.y > canvasRef.current!.height) {
        p.x = canvasRef.current!.width / 2
        p.y = canvasRef.current!.height / 2
        p.vx = (Math.random() - 0.5) * 4
        p.vy = (Math.random() - 0.5) * 4
        p.life = ART.particleLife
      } else {
        const opacity = p.life / ART.particleLife
        canvasCtx.globalAlpha = opacity
        canvasCtx.fillRect(p.x, p.y, 2, 2)
      }
    }
    canvasCtx.globalAlpha = 1
  }

  // Main results handler
  const onResults = (results: any) => {
    animationFrameRef.current++
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const canvasCtx = canvas.getContext('2d')!
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {color: '#ffffff', lineWidth: 2})
        canvasCtx.strokeStyle = '#ffffff'
        canvasCtx.lineWidth = 2
        for (const landmark of landmarks) {
          if (landmark) { 
            const x = landmark.x * canvas.width
            const y = landmark.y * canvas.height
            canvasCtx.beginPath()
            canvasCtx.arc(x, y, 6, 0, 2 * Math.PI)
            canvasCtx.stroke()
          }
        }
      }
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length === 2) {
      const [hand1, hand2] = results.multiHandLandmarks
      const fingerTips = [4, 8, 12, 16, 20]

      switch (currentExperiment) {
        case 'dashed':
          drawDashedLines(canvasCtx, hand1, hand2, fingerTips)
          break
        case 'dashed-sine':
          drawDynamicSineWaves(canvasCtx, hand1, hand2, fingerTips)
          break
        case 'tangent-art':
          drawStringArt(canvasCtx, hand1, hand2, fingerTips)
          break
        case 'rectangle-art':
          drawRectangleArt(canvasCtx, hand1, hand2)
          break
        case 'orbiting-circles':
          drawOrbitingCircles(canvasCtx, hand1, hand2, fingerTips)
          break
        case 'magneto-balls':
          drawMagnetoBalls(canvasCtx, hand1, hand2)
          break
        case 'aura-glow':
          drawAuraGlow(canvasCtx, hand1, hand2)
          break
        case 'bubbles':
          drawBubbles(canvasCtx, hand1, hand2, fingerTips)
          break
        case 'lightning':
          drawLightning(canvasCtx, hand1, hand2)
          break
        case 'particles':
          drawParticles(canvasCtx, hand1, hand2)
          break
      }
    }
  }

  // Initialize hand tracking
  useEffect(() => {
    if (!scriptsLoaded || !videoRef.current || !canvasRef.current) return

    const hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    })
    
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    
    hands.onResults(onResults)

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => await hands.send({image: videoRef.current}),
      width: 640,
      height: 480
    })

    camera.start().then(() => {
      setIsLoading(false)
    }).catch((err: any) => {
      console.error("Error starting camera:", err)
      setIsLoading(false)
    })

    return () => {
      camera?.stop?.()
    }
  }, [scriptsLoaded, currentExperiment])

  return (
    <div className="bg-white text-black flex items-center justify-center min-h-screen p-4" 
         style={{ fontFamily: "'Xanh Mono', monospace" }}>
      <div className="max-w-3xl w-full mx-auto p-4 md:p-8">
        {/* Experiment buttons */}
        <div className={`text-center mb-4 ${isLoading ? 'hidden' : ''}`}>
          {experiments.map((exp) => (
            <button
              key={exp.id}
              className={`bg-white border border-gray-800 px-2 py-1 mx-1 my-1 text-sm cursor-pointer tracking-wide hover:bg-gray-200 ${
                currentExperiment === exp.id ? 'bg-gray-800 text-white' : ''
              }`}
              onClick={() => setCurrentExperiment(exp.id)}
            >
              {exp.label}
            </button>
          ))}
        </div>
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="w-15 h-15 border-8 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="ml-4 text-lg">Starting camera...</p>
          </div>
        )}

        {/* Video container */}
        <div className={`relative w-full max-w-2xl mx-auto border border-gray-800 ${isLoading ? 'hidden' : ''}`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto block"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>
      </div>
    </div>
  )
} 