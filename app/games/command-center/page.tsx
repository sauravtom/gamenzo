"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Zap, Wind, AlertTriangle, Play, Pause, SkipForward } from "lucide-react"

export default function Component() {
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [globalPopulation, setGlobalPopulation] = useState(7975105239)
  const [births, setBirths] = useState(286)
  const [deaths, setDeaths] = useState(71)
  const [growth, setGrowth] = useState(215)
  const [solarActivity, setSolarActivity] = useState(37.390479396026905)
  const [nearEarthObjects, setNearEarthObjects] = useState(141)
  const [activeEvents, setActiveEvents] = useState(4)
  const loadingTexts = useRef([
    "INITIALIZING CELESTIAL SYSTEMS",
    "ESTABLISHING SECURE CONNECTION",
    "LOADING EARTH MONITORING PROTOCOLS",
    "CALIBRATING DISASTER RESPONSE SYSTEMS",
    "SYNCHRONIZING POPULATION ANALYTICS",
    "ACCESSING COSMIC EVENT DATABASE",
    "VERIFYING SECURITY CLEARANCE",
    "ACTIVATING COMMAND INTERFACE",
  ])
  const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts.current[0])

  // Handle loading sequence
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + Math.random() * 2 + 0.5

          // Update loading text based on progress
          const textIndex = Math.min(
            Math.floor((newProgress / 100) * loadingTexts.current.length),
            loadingTexts.current.length - 1,
          )
          setCurrentLoadingText(loadingTexts.current[textIndex])

          if (newProgress >= 100) {
            clearInterval(interval)
            setTimeout(() => setLoading(false), 500)
            return 100
          }
          return newProgress
        })
      }, 150)

      return () => clearInterval(interval)
    }
  }, [loading])

  // Rest of your existing useEffect and functions...

  // Animate counters
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      setGlobalPopulation((prev) => prev + Math.floor(Math.random() * 3))
      setBirths((prev) => prev + Math.floor(Math.random() * 2))
      setDeaths((prev) => prev + Math.floor(Math.random() * 1))
      setGrowth((prev) => prev + Math.floor(Math.random() * 2))
      setSolarActivity((prev) => prev + (Math.random() - 0.5) * 0.1)

      if (Math.random() < 0.1) {
        setNearEarthObjects((prev) => prev + (Math.random() > 0.5 ? 1 : -1))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date
      .toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, "$3/$1/$2, $4:$5:$6")
  }

  // Add the loading screen JSX before the main interface
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-cyan-400 flex flex-col items-center justify-center p-4 font-mono">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
          <motion.h1
            className="text-2xl font-bold tracking-wider text-cyan-300 text-center mb-8"
            animate={{ textShadow: ["0 0 10px #00ffff", "0 0 20px #00ffff", "0 0 10px #00ffff"] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            CELESTIAL COMMAND CENTER
          </motion.h1>

          <div className="relative mb-8">
            <motion.div
              className="w-32 h-32 border-4 border-cyan-500/30 rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <motion.div
                className="w-full h-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                animate={{ rotate: -720 }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </motion.div>

            <motion.div
              className="absolute top-[40.5%] right-[45.5%] transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {Math.round(loadingProgress)}%
            </motion.div>
          </div>

          <motion.div
            key={currentLoadingText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm mb-4"
          >
            {currentLoadingText}
          </motion.div>

          <div className="w-full bg-slate-800/50 rounded-full h-2 mb-8">
            <motion.div
              className="bg-cyan-400 h-2 rounded-full"
              style={{ width: `${loadingProgress}%` }}
              animate={{
                boxShadow: ["0 0 5px #00ffff", "0 0 10px #00ffff", "0 0 5px #00ffff"],
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="h-1 bg-cyan-500/30 rounded"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  width: ["100%", "60%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // The rest of your existing return statement for the main interface
  return (
    <div className="min-h-screen bg-slate-900 text-cyan-400 p-4 font-mono">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <motion.h1
          className="text-3xl font-bold tracking-wider text-cyan-300"
          animate={{ textShadow: ["0 0 10px #00ffff", "0 0 20px #00ffff", "0 0 10px #00ffff"] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          CELESTIAL COMMAND CENTER
        </motion.h1>

        <div className="flex items-center gap-4">
          <div className="text-sm">TIME: {formatTime(currentTime)}</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20">
              <Pause className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20">
              <Play className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm">SPEED: 1x</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Natural Disaster Management */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4 text-cyan-300">NATURAL DISASTER MANAGEMENT</h2>

          <div className="mb-6">
            <h3 className="text-sm mb-2">GLOBAL SEISMIC ACTIVITY</h3>
            <div className="h-32 bg-slate-700/50 rounded border border-cyan-500/20 p-2">
              <motion.div
                className="w-full h-full flex items-end justify-around"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-cyan-400 w-2"
                    style={{ height: `${Math.random() * 80 + 10}%` }}
                    animate={{ height: [`${Math.random() * 80 + 10}%`, `${Math.random() * 80 + 10}%`] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.1 }}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">ACTIVE DISASTER EVENTS</span>
              <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                3 DETECTED
              </Badge>
            </div>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded border border-red-500/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="font-semibold">EARTHQUAKE</div>
                    <div className="text-xs text-slate-400">Pacific Ring of Fire</div>
                    <div className="text-xs">INTENSITY: 6.2</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500">DEVELOPING</Badge>
                  <div className="text-xs mt-1 text-red-400">RISK: 84.84620089472577%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded border border-red-500/30">
                <div className="flex items-center gap-3">
                  <Wind className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-semibold">HURRICANE</div>
                    <div className="text-xs text-slate-400">Atlantic Ocean</div>
                    <div className="text-xs">INTENSITY: 4.8</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500">ACTIVE</Badge>
                  <div className="text-xs mt-1 text-red-400">RISK: 72.88432521049178%</div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button className="flex-1 bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/30">
              MONITOR EVENT
            </Button>
            <Button className="flex-1 bg-slate-700/50 border border-slate-600 text-slate-400 hover:bg-slate-600/50">
              INITIATE INTERVENTION
            </Button>
          </div>
        </motion.div>

        {/* Earth Command Console */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4 text-cyan-300">EARTH COMMAND CONSOLE</h2>

          <div className="text-xs mb-2 space-y-1">
            <div>SECURITY LEVEL: ALPHA</div>
            <div>SIMULATION: ACTIVE</div>
            <div>TIMELINE: PRESENT</div>
          </div>

          <div className="flex justify-center mb-6">
            <motion.div
              className="relative w-48 h-48"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30"></div>
              <div className="absolute inset-2 rounded-full border border-cyan-500/20"></div>
              <motion.div
                className="absolute inset-4 rounded-full overflow-hidden"
                animate={{
                  boxShadow: ["0 0 20px #00ffff40", "0 0 40px #00ffff60", "0 0 20px #00ffff40"],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <img
                  src="/placeholder.svg?height=160&width=160"
                  alt="Earth"
                  className="w-full h-full object-cover rounded-full"
                />
              </motion.div>
            </motion.div>
          </div>

          <div className="text-xs space-y-1 mb-4">
            <div>LAT: 34.052° N</div>
            <div>LONG: 118.243° W</div>
            <div>ALT: 1024 KM</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">GEOMAGNETIC FIELD</span>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <Progress value={100} className="h-2 bg-slate-700" />
              <div className="text-xs mt-1">100%</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">ATMOSPHERIC SHIELD</span>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <Progress value={99} className="h-2 bg-slate-700" />
              <div className="text-xs mt-1">99%</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">TIMELINE STABILITY</span>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <Progress value={100} className="h-2 bg-slate-700" />
              <div className="text-xs mt-1">100%</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">COSMIC HARMONY</span>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <Progress value={96} className="h-2 bg-slate-700" />
              <div className="text-xs mt-1">96%</div>
            </div>
          </div>
        </motion.div>

        {/* Population Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4 text-cyan-300">POPULATION ANALYTICS</h2>

          <div className="mb-6">
            <div className="text-sm mb-2">GLOBAL POPULATION</div>
            <motion.div
              className="text-3xl font-bold text-cyan-300"
              key={globalPopulation}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {globalPopulation.toLocaleString()}
            </motion.div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-xs text-slate-400">BIRTHS</div>
              <motion.div
                className="text-lg font-bold text-green-400"
                key={births}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                +{births}
              </motion.div>
            </div>
            <div>
              <div className="text-xs text-slate-400">DEATHS</div>
              <motion.div
                className="text-lg font-bold text-red-400"
                key={deaths}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                -{deaths}
              </motion.div>
            </div>
            <div>
              <div className="text-xs text-slate-400">GROWTH</div>
              <motion.div
                className="text-lg font-bold text-cyan-400"
                key={growth}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                +{growth}
              </motion.div>
            </div>
            <div>
              <div className="text-xs text-slate-400">GROWTH RATE</div>
              <div className="text-lg font-bold text-yellow-400">0.003%</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs mb-2">POPULATION BY REGION</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400 text-xs">
                DEMOGRAPHIC DETAILS
              </Button>
              <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400 text-xs">
                PROSPERITY INDEX
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-cyan-300">COSMIC EVENTS</h3>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">SOLAR ACTIVITY</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <motion.div
                className="text-lg font-mono"
                key={solarActivity}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
              >
                {solarActivity.toFixed(12)}% NORMAL
              </motion.div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">NEAR-EARTH OBJECTS</span>
              </div>
              <motion.div
                className="text-3xl font-bold text-cyan-300"
                key={nearEarthObjects}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {nearEarthObjects}
              </motion.div>
              <div className="text-xs text-slate-400">OBJECTS TRACKED</div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">ACTIVE COSMIC PHENOMENA</span>
                <motion.div
                  className="text-cyan-400"
                  key={activeEvents}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {activeEvents} EVENTS
                </motion.div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">SOLAR FLARE X9.3</span>
                <Badge className="bg-red-500/20 text-red-400 border-red-500 ml-auto">ACTIVE</Badge>
              </div>
            </div>

            <Button className="w-full bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/30">
              DEEP SPACE SCAN
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
