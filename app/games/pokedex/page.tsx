"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

interface Pokemon {
  id: number
  name: string
  sprites: {
    front_default: string
    other: {
      "official-artwork": {
        front_default: string
      }
    }
  }
  types: Array<{
    type: {
      name: string
    }
  }>
  height: number
  weight: number
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
  abilities: Array<{
    ability: {
      name: string
    }
    is_hidden: boolean
  }>
  species: {
    flavor_text_entries: Array<{
      flavor_text: string
      language: {
        name: string
      }
    }>
  }
}

interface PokemonListItem {
  name: string
  url: string
}

const typeColors: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-200",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-green-400",
  rock: "bg-yellow-800",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
}

export default function PokedexApp() {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([])
  const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>([])
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRegion, setSelectedRegion] = useState("kanto")
  const [activeTab, setActiveTab] = useState("info")
  const pokemonPerPage = 12

  const regions = {
    kanto: { offset: 0, limit: 151 },
    johto: { offset: 151, limit: 100 },
    hoenn: { offset: 251, limit: 135 },
    sinnoh: { offset: 386, limit: 107 },
  }

  useEffect(() => {
    fetchPokemonList()
  }, [selectedRegion])

  useEffect(() => {
    if (pokemonList.length > 0) {
      loadPokemonData()
    }
  }, [pokemonList, currentPage, searchTerm])

  const fetchPokemonList = async () => {
    setLoading(true)
    const region = regions[selectedRegion as keyof typeof regions]
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${region.limit}&offset=${region.offset}`)
      const data = await response.json()
      setPokemonList(data.results)
      setCurrentPage(1)
    } catch (error) {
      console.error("Error fetching Pokemon list:", error)
    }
    setLoading(false)
  }

  const loadPokemonData = async () => {
    const filteredPokemon = pokemonList.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const startIndex = (currentPage - 1) * pokemonPerPage
    const endIndex = startIndex + pokemonPerPage
    const pokemonToLoad = filteredPokemon.slice(startIndex, endIndex)

    const pokemonData = await Promise.all(
      pokemonToLoad.map(async (pokemon) => {
        try {
          const response = await fetch(pokemon.url)
          return await response.json()
        } catch (error) {
          console.error("Error fetching Pokemon data:", error)
          return null
        }
      }),
    )

    setDisplayedPokemon(pokemonData.filter(Boolean))
  }

  const fetchPokemonDetails = async (pokemon: Pokemon) => {
    try {
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
      const speciesData = await speciesResponse.json()

      setSelectedPokemon({
        ...pokemon,
        species: speciesData,
      })
    } catch (error) {
      console.error("Error fetching Pokemon species data:", error)
      setSelectedPokemon(pokemon)
    }
  }

  const getFlavorText = (pokemon: Pokemon) => {
    if (!pokemon.species?.flavor_text_entries) return "No description available."

    const englishEntry = pokemon.species.flavor_text_entries.find((entry) => entry.language.name === "en")

    return englishEntry?.flavor_text.replace(/\f/g, " ") || "No description available."
  }

  const navigatePokemon = (direction: "prev" | "next") => {
    if (!selectedPokemon) return

    const currentIndex = displayedPokemon.findIndex((p) => p.id === selectedPokemon.id)
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : displayedPokemon.length - 1
    } else {
      newIndex = currentIndex < displayedPokemon.length - 1 ? currentIndex + 1 : 0
    }

    fetchPokemonDetails(displayedPokemon[newIndex])
  }

  const totalPages = Math.ceil(
    pokemonList.filter((pokemon) => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())).length /
      pokemonPerPage,
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading Pokédex...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Pokedex Device Frame */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-red-600 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-400 to-red-800"></div>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Top Section with Lights */}
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <motion.div
              className="w-16 h-16 bg-blue-400 rounded-full border-4 border-white shadow-inner relative overflow-hidden"
              animate={{
                boxShadow: [
                  "inset 0 0 20px rgba(59, 130, 246, 0.5)",
                  "inset 0 0 30px rgba(59, 130, 246, 0.8)",
                  "inset 0 0 20px rgba(59, 130, 246, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <motion.div
                className="absolute inset-2 bg-blue-300 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </motion.div>
            <div className="flex gap-2">
              {[
                { color: "bg-red-500", delay: 0 },
                { color: "bg-yellow-400", delay: 0.2 },
                { color: "bg-green-500", delay: 0.4 },
              ].map((light, index) => (
                <motion.div
                  key={index}
                  className={`w-4 h-4 ${light.color} rounded-full`}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: light.delay,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {/* Left Screen */}
            <motion.div
              layout
              className="bg-slate-700 border-slate-600 p-6 min-h-[500px] rounded-lg relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
                boxShadow: "inset 0 0 50px rgba(0,0,0,0.5)",
              }}
            >
              {/* Screen scanlines effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-full h-px bg-green-400 opacity-10"
                    style={{ top: `${i * 2}%` }}
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.02,
                    }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {selectedPokemon ? (
                  <motion.div
                    key="pokemon-detail"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-white relative z-10"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigatePokemon("prev")}
                        className="p-2 rounded-full bg-slate-600 hover:bg-slate-500 transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedPokemon(null)}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigatePokemon("next")}
                        className="p-2 rounded-full bg-slate-600 hover:bg-slate-500 transition-colors"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </motion.button>
                    </div>

                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.2,
                      }}
                      className="relative mb-4"
                    >
                      <motion.img
                        src={
                          selectedPokemon.sprites.other["official-artwork"].front_default ||
                          selectedPokemon.sprites.front_default
                        }
                        alt={selectedPokemon.name}
                        className="w-48 h-48 mx-auto"
                        whileHover={{
                          scale: 1.1,
                          rotate: [0, -5, 5, 0],
                          transition: { duration: 0.5 },
                        }}
                      />
                      {/* Glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-radial from-blue-400/20 to-transparent rounded-full"
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl font-bold capitalize mb-2"
                    >
                      {selectedPokemon.name}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-slate-300 mb-4"
                    >
                      #{selectedPokemon.id.toString().padStart(3, "0")}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex justify-center gap-2"
                    >
                      {selectedPokemon.types.map((type, index) => (
                        <motion.div
                          key={type.type.name}
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: 0.7 + index * 0.1,
                            type: "spring",
                            stiffness: 300,
                          }}
                          whileHover={{ scale: 1.1 }}
                          className={`px-3 py-1 rounded-full ${typeColors[type.type.name]} text-white capitalize font-semibold`}
                        >
                          {type.type.name}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pokemon-home"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-white flex flex-col items-center justify-center h-full relative z-10"
                  >
                    <motion.h1
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl font-bold mb-4"
                    >
                      Pokédex
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-slate-300 mb-8"
                    >
                      Select a Pokémon from the list
                    </motion.p>
                    <motion.div
                      className="w-32 h-32 bg-white rounded-full flex items-center justify-center relative"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <motion.div
                        className="w-28 h-28 bg-red-500 rounded-full flex items-center justify-center relative"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <motion.div
                          className="w-12 h-12 bg-white rounded-full border-4 border-slate-800"
                          animate={{
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              "0 0 0 0 rgba(255,255,255,0.7)",
                              "0 0 0 10px rgba(255,255,255,0)",
                              "0 0 0 0 rgba(255,255,255,0)",
                            ],
                          }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right Screen */}
            <motion.div
              layout
              className="bg-slate-700 border-slate-600 p-6 min-h-[500px] rounded-lg relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
                boxShadow: "inset 0 0 50px rgba(0,0,0,0.5)",
              }}
            >
              {/* Screen scanlines effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-full h-px bg-green-400 opacity-10"
                    style={{ top: `${i * 2}%` }}
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.02 + 1,
                    }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {selectedPokemon ? (
                  <motion.div
                    key="pokemon-info"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.5 }}
                    className="text-white relative z-10"
                  >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <TabsList className="grid w-full grid-cols-4 bg-slate-600">
                          {["info", "stats", "abilities", "moves"].map((tab, index) => (
                            <TabsTrigger key={tab} value={tab} className="text-xs relative overflow-hidden">
                              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                              </motion.span>
                              {activeTab === tab && (
                                <motion.div
                                  layoutId="activeTab"
                                  className="absolute inset-0 bg-blue-500 rounded-md -z-10"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </motion.div>

                      <TabsContent value="info" className="mt-4">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-4"
                        >
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-300 text-sm leading-relaxed"
                          >
                            {getFlavorText(selectedPokemon)}
                          </motion.p>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-2 gap-4"
                          >
                            {[
                              { label: "Height", value: `${(selectedPokemon.height / 10).toFixed(1)} m` },
                              { label: "Weight", value: `${(selectedPokemon.weight / 10).toFixed(1)} kg` },
                            ].map((stat, index) => (
                              <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="bg-slate-600 p-3 rounded cursor-pointer"
                              >
                                <p className="text-slate-400 text-sm">{stat.label}</p>
                                <p className="text-white font-semibold">{stat.value}</p>
                              </motion.div>
                            ))}
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.02 }}
                            className="bg-slate-600 p-3 rounded cursor-pointer"
                          >
                            <p className="text-slate-400 text-sm">Category</p>
                            <p className="text-white font-semibold capitalize">Seed Pokémon</p>
                          </motion.div>
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="stats" className="mt-4">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-3"
                        >
                          {selectedPokemon.stats.map((stat, index) => (
                            <motion.div
                              key={stat.stat.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className="space-y-1"
                            >
                              <div className="flex justify-between">
                                <span className="text-slate-300 capitalize text-sm">
                                  {stat.stat.name.replace("-", " ")}
                                </span>
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.6 + index * 0.1 }}
                                  className="text-white font-semibold"
                                >
                                  {stat.base_stat}
                                </motion.span>
                              </div>
                              <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(stat.base_stat / 255) * 100}%` }}
                                  transition={{
                                    delay: 0.7 + index * 0.1,
                                    duration: 1,
                                    ease: "easeOut",
                                  }}
                                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full relative"
                                >
                                  <motion.div
                                    className="absolute inset-0 bg-white opacity-30"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{
                                      duration: 2,
                                      repeat: Number.POSITIVE_INFINITY,
                                      delay: 1 + index * 0.1,
                                    }}
                                  />
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="abilities" className="mt-4">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-2"
                        >
                          {selectedPokemon.abilities.map((ability, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className="bg-slate-600 p-3 rounded cursor-pointer"
                            >
                              <p className="text-white capitalize font-semibold">
                                {ability.ability.name.replace("-", " ")}
                                {ability.is_hidden && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    className="ml-2 px-2 py-1 bg-purple-600 text-xs rounded"
                                  >
                                    Hidden
                                  </motion.span>
                                )}
                              </p>
                            </motion.div>
                          ))}
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="moves" className="mt-4">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-slate-300 text-sm"
                        >
                          <p>
                            Move data would be displayed here. This would require additional API calls to fetch move
                            details.
                          </p>
                        </motion.div>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pokemon-list"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="text-white relative z-10"
                  >
                    {/* Controls */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex gap-2 mb-4"
                    >
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="w-32 bg-slate-600 border-slate-500 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kanto">Kanto</SelectItem>
                          <SelectItem value="johto">Johto</SelectItem>
                          <SelectItem value="hoenn">Hoenn</SelectItem>
                          <SelectItem value="sinnoh">Sinnoh</SelectItem>
                        </SelectContent>
                      </Select>

                      {["Random", "Discovery"].map((label, index) => (
                        <motion.button
                          key={label}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 bg-slate-600 border border-slate-500 text-white hover:bg-slate-500 rounded transition-colors"
                        >
                          {label}
                        </motion.button>
                      ))}
                    </motion.div>

                    {/* Search */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-2 mb-4"
                    >
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          placeholder="Search Pokémon..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-slate-600 border-slate-500 text-white placeholder-slate-400"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 bg-slate-600 border border-slate-500 text-white hover:bg-slate-500 rounded transition-colors flex items-center gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        Filter Types
                      </motion.button>
                    </motion.div>

                    {/* Pokemon Grid */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"
                    >
                      <AnimatePresence>
                        {displayedPokemon.map((pokemon, index) => (
                          <motion.div
                            key={pokemon.id}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                            transition={{
                              delay: index * 0.05,
                              type: "spring",
                              stiffness: 300,
                              damping: 25,
                            }}
                            whileHover={{
                              scale: 1.05,
                              y: -5,
                              transition: { duration: 0.2 },
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-slate-600 border-slate-500 p-3 cursor-pointer hover:bg-slate-500 transition-colors rounded-lg relative overflow-hidden group"
                            onClick={() => fetchPokemonDetails(pokemon)}
                          >
                            {/* Hover glow effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={false}
                            />

                            <motion.img
                              src={pokemon.sprites.front_default || "/placeholder.svg"}
                              alt={pokemon.name}
                              className="w-16 h-16 mx-auto mb-2 relative z-10"
                              whileHover={{
                                rotate: [0, -10, 10, 0],
                                transition: { duration: 0.5 },
                              }}
                            />
                            <p className="text-white text-xs text-center font-semibold relative z-10">
                              #{pokemon.id.toString().padStart(3, "0")}
                            </p>
                            <p className="text-white text-xs text-center capitalize relative z-10">{pokemon.name}</p>
                            <div className="flex justify-center gap-1 mt-2 relative z-10">
                              {pokemon.types.map((type, typeIndex) => (
                                <motion.div
                                  key={type.type.name}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: index * 0.05 + typeIndex * 0.1 + 0.3 }}
                                  className={`w-3 h-3 rounded-full ${typeColors[type.type.name]}`}
                                />
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {/* Pagination */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex justify-between items-center"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-slate-600 border border-slate-500 text-white hover:bg-slate-500 rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </motion.button>

                      <motion.span
                        key={currentPage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white text-sm"
                      >
                        {Math.min((currentPage - 1) * pokemonPerPage + 1, pokemonList.length)} -{" "}
                        {Math.min(currentPage * pokemonPerPage, pokemonList.length)} of {pokemonList.length}
                      </motion.span>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-slate-600 border border-slate-500 text-white hover:bg-slate-500 rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Bottom Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-between items-center mt-6 relative z-10"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center relative overflow-hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className="w-8 h-8 bg-slate-600 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
              </motion.div>
              <motion.div
                className="w-20 h-8 bg-slate-700 rounded-full relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>
            </div>

            <div className="flex gap-2">
              {[0, 1].map((index) => (
                <motion.div
                  key={index}
                  className="w-8 h-8 bg-slate-700 rounded cursor-pointer"
                  whileHover={{ scale: 1.1, backgroundColor: "#475569" }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: index * 0.5,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
