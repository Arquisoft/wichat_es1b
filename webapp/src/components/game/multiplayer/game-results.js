"use client"

import { useState, useEffect, useRef } from "react"
import { arc, pie } from "d3-shape"
import { scaleOrdinal } from "d3-scale"
import { select } from "d3-selection"

// Función de utilidad para combinar nombres de clase condicionales
function cn(...classes) {
    return classes.filter(Boolean).join(" ")
}

// Componente Card básico
function Card({ className, children, ...props }) {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className || ""}`} {...props}>
            {children}
        </div>
    )
}

// Componente Button básico
function Button({ className, variant, children, ...props }) {
    const baseClasses =
        "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
    const variantClasses =
        variant === "outline"
            ? "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
            : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"

    return (
        <button className={`${baseClasses} ${variantClasses} ${className || ""}`} {...props}>
            {children}
        </button>
    )
}

// Iconos básicos (puedes reemplazarlos con los iconos que estés usando)
const Icons = {
    Trophy: ({ className }) => (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M9 2v7.5"></path>
            <path d="M15 2v7.5"></path>
            <path d="M12 2v10"></path>
            <path d="M6 4c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2"></path>
        </svg>
    ),
    Medal: ({ className }) => (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"></path>
            <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"></path>
        </svg>
    ),
    Award: ({ className }) => (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="8" r="6"></circle>
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
        </svg>
    ),
    Clock: ({ className }) => (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    ),
    Users: ({ className }) => (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    ),
    Hash: ({ className }) => (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="4" x2="20" y1="9" y2="9"></line>
            <line x1="4" x2="20" y1="15" y2="15"></line>
            <line x1="10" x2="8" y1="3" y2="21"></line>
            <line x1="16" x2="14" y1="3" y2="21"></line>
        </svg>
    ),
    Home: ({ className }) => (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    ),
    RotateCcw: ({ className }) => (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
        </svg>
    ),
}

// Componente PlayerCard
function PlayerCard({ player, position, isWinner }) {
    // Determinar el color y el icono según la posición
    const getPositionDetails = () => {
        switch (position) {
            case 1:
                return {
                    bgColor: "bg-gradient-to-r from-yellow-400 to-yellow-500",
                    textColor: "text-yellow-700",
                    borderColor: "border-yellow-300",
                    icon: <Icons.Trophy className="h-6 w-6 text-yellow-700" />,
                }
            case 2:
                return {
                    bgColor: "bg-gradient-to-r from-slate-300 to-slate-400",
                    textColor: "text-slate-700",
                    borderColor: "border-slate-300",
                    icon: <Icons.Medal className="h-6 w-6 text-slate-700" />,
                }
            case 3:
                return {
                    bgColor: "bg-gradient-to-r from-amber-600 to-amber-700",
                    textColor: "text-amber-800",
                    borderColor: "border-amber-500",
                    icon: <Icons.Award className="h-6 w-6 text-amber-800" />,
                }
            default:
                return {
                    bgColor: "bg-white",
                    textColor: "text-slate-700",
                    borderColor: "border-slate-200",
                    icon: null,
                }
        }
    }

    const { bgColor, textColor, borderColor, icon } = getPositionDetails()

    return (
        <div
            className={cn(
                "rounded-lg border shadow-sm overflow-hidden transition-all",
                isWinner ? "transform scale-105" : "",
                borderColor,
            )}
        >
            <div className={cn("p-4 flex items-center justify-between", bgColor)}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 font-bold text-slate-700">
                        {position}
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{player.username}</h3>
                        <p className="text-sm text-white/80">ID: {player.id.substring(0, 8)}...</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white/90 rounded-full px-3 py-1 font-bold text-lg shadow-sm">
                        <span className={textColor}>{player.score} pts</span>
                    </div>
                    {icon}
                </div>
            </div>
        </div>
    )
}

// Componente GameStats
function GameStats({ duration, roomId, totalPlayers }) {
    return (
        <Card className="p-4 shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-center">Estadísticas de la Partida</h2>

            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Icons.Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-700 font-medium">Duración</p>
                        <p className="text-lg font-bold text-blue-800">{duration}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                    <div className="bg-green-100 p-2 rounded-full">
                        <Icons.Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-green-700 font-medium">Jugadores</p>
                        <p className="text-lg font-bold text-green-800">{totalPlayers}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="bg-purple-100 p-2 rounded-full">
                        <Icons.Hash className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-purple-700 font-medium">Sala</p>
                        <p className="text-lg font-bold text-purple-800">{roomId}</p>
                    </div>
                </div>
            </div>
        </Card>
    )
}

// Componente PieChart
function PieChart({ data }) {
    const svgRef = useRef(null)

    useEffect(() => {
        if (!svgRef.current || data.length === 0) return

        // Limpiar SVG
        select(svgRef.current).selectAll("*").remove()

        // Configuración
        const width = svgRef.current.clientWidth
        const height = svgRef.current.clientHeight
        const radius = (Math.min(width, height) / 2) * 0.8

        // Crear el SVG
        const svg = select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`)

        // Escala de colores
        const color = scaleOrdinal()
            .domain(data.map((d) => d.name))
            .range(data.map((d) => d.color))

        // Generador de pie
        const pieGenerator = pie()
            .value((d) => d.value)
            .sort(null)

        // Generador de arco
        const arcGenerator = arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius)
            .cornerRadius(4)
            .padAngle(0.02)

        // Crear los arcos
        const arcs = svg.selectAll(".arc").data(pieGenerator(data)).enter().append("g").attr("class", "arc")

        // Dibujar los arcos
        arcs
            .append("path")
            .attr("d", arcGenerator)
            .attr("fill", (d) => color(d.data.name))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .style("opacity", 0.9)
            .style("transition", "opacity 0.3s")
            .on("mouseover", function () {
                select(this).style("opacity", 1)
            })
            .on("mouseout", function () {
                select(this).style("opacity", 0.9)
            })

        // Añadir etiquetas
        arcs
            .append("text")
            .attr("transform", (d) => {
                const [x, y] = arcGenerator.centroid(d)
                return `translate(${x}, ${y})`
            })
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .text((d) => (d.data.value > 0 ? d.data.value.toString() : ""))

        // Añadir leyenda
        const legend = svg
            .selectAll(".legend")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${radius + 20}, ${-radius + 20 + i * 20})`)

        legend
            .append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", (d) => d.color)
            .attr("rx", 2)

        legend
            .append("text")
            .attr("x", 20)
            .attr("y", 9)
            .attr("font-size", "12px")
            .attr("fill", "#666")
            .text((d) => `${d.name} (${d.value})`)
    }, [data])

    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg ref={svgRef} className="w-full h-full" />
        </div>
    )
}

// Componente principal GameResultsScreen
export function GameResultsScreen({ gameData, onPlayAgain, onHome }) {
    const [sortedPlayers, setSortedPlayers] = useState(gameData.players)
    const [winner, setWinner] = useState(null)
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        // Ordenar jugadores por puntuación (de mayor a menor)
        const sorted = [...gameData.players].sort((a, b) => b.score - a.score)
        setSortedPlayers(sorted)

        // Establecer el ganador
        if (sorted.length > 0) {
            setWinner(sorted[0])
        }

        // Preparar datos para el gráfico
        const data = sorted.map((player, index) => ({
            name: player.username,
            value: player.score,
            color: index === 0 ? "#22c55e" : index === 1 ? "#3b82f6" : "#6366f1",
        }))

        setChartData(data)
    }, [gameData])

    // Convertir duración de milisegundos a formato mm:ss
    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Encabezado */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-6 text-white text-center shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Partida Finalizada!</h1>
                    <p className="text-blue-100">Resultados de la partida multijugador</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna izquierda - Estadísticas del juego */}
                    <div className="lg:col-span-1 space-y-6">
                        <GameStats
                            duration={formatDuration(gameData.gameStats.duration)}
                            roomId={gameData.gameStats.roomId}
                            totalPlayers={gameData.gameStats.totalPlayers}
                        />

                        {/* Gráfico de resultados */}
                        <Card className="p-4 shadow-md">
                            <h2 className="text-lg font-semibold mb-4 text-center">Distribución de Puntuaciones</h2>
                            <div className="h-[250px] w-full">
                                <PieChart data={chartData} />
                            </div>
                        </Card>
                    </div>

                    {/* Columna derecha - Clasificación de jugadores */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-blue-700">Clasificación Final</h2>
                                <Icons.Trophy className="h-6 w-6 text-yellow-500" />
                            </div>

                            <div className="space-y-4">
                                {sortedPlayers.map((player, index) => (
                                    <PlayerCard key={player.id} player={player} position={index + 1} isWinner={index === 0} />
                                ))}
                            </div>
                        </Card>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onHome}>
                                <Icons.Home className="mr-2 h-4 w-4" />
                                Volver al Inicio
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={onPlayAgain}>
                                <Icons.RotateCcw className="mr-2 h-4 w-4" />
                                Nueva Partida
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Función de ayuda para integrar en el componente multiplayer
export function showGameResults(container, results, callbacks = {}) {
    const { onPlayAgain, onHome } = callbacks

    // Formatear los datos si es necesario
    const gameData = {
        finalScores: results.finalScores || {},
        gameStats: {
            duration: results.gameStats?.duration || 0,
            roomId: results.gameStats?.roomId || "sin-sala",
            totalPlayers: results.gameStats?.totalPlayers || 0,
        },
        players: results.players || [],
    }

    // Devolver los datos formateados y una función para renderizar
    return {
        gameData,
        render: (renderFunction) => {
            if (typeof renderFunction === "function") {
                renderFunction(
                    <GameResultsScreen
                        gameData={gameData}
                        onPlayAgain={onPlayAgain || (() => console.log("Play Again"))}
                        onHome={onHome || (() => console.log("Home"))}
                    />,
                    container,
                )
            }
        },
    }
}
