"use client"

import React, { useState } from "react"
import { getPlayerLevel } from "../../utils"
import MultiplayerService from "../game/multiplayer/Multiplayer"
import { createContext, useContext, useEffect } from "react"
import { useLocation } from "react-router-dom"
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  CardContent,
  useTheme,
  alpha,
  Skeleton,
  Fade,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
  Menu,
  MenuItem,
  ListItemIcon,
  AppBar,
  Toolbar,
  Avatar,
  LinearProgress,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import HistoryIcon from "@mui/icons-material/History"
import axios from "axios"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import QuizIcon from "@mui/icons-material/Quiz"
import StarIcon from "@mui/icons-material/Star"
import CloseIcon from "@mui/icons-material/Close"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import PublicIcon from "@mui/icons-material/Public"
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy"
import PersonIcon from "@mui/icons-material/Person"
import ShuffleIcon from "@mui/icons-material/Shuffle"
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import FlightIcon from "@mui/icons-material/Flight"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech"
import LeaderboardIcon from "@mui/icons-material/Leaderboard"
import PeopleIcon from "@mui/icons-material/People"
import "./Home.css"
import WaitingRoom from "../game/multiplayer/WaitingRoom"

const ConfigContext = createContext()

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000"

export const useConfig = () => useContext(ConfigContext)

const HomePage = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem("username")
  const theme = useTheme()

  const [navigatingToGame, setNavigatingToGame] = useState(false)

  // Configuración de la partida
  const [numQuestions, setNumQuestions] = useState(10)
  const [timePerQuestion, setTimePerQuestion] = useState(30)
  const [sessionData, setSessionData] = useState([])
  const [userData, setUserData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState([])
  const [showLeaderboardDetails, setShowLeaderboardDetails] = useState(false)
  const [extendedLeaderboardData, setExtendedLeaderboardData] = useState([])

  // Estado para el menú desplegable
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  const [difficulty, setDifficulty] = useState("Normal")
  const [anchorElDifficulty, setAnchorElDifficulty] = useState(null)
  const openDifficultyMenu = Boolean(anchorElDifficulty)

  let [multiplayerService, setMultiplayerService] = useState(null)
  const [roomInfo, setRoomInfo] = useState(null)
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)

  const handleOpenDifficultyMenu = (event) => {
    setAnchorElDifficulty(event.currentTarget)
  }

  const handleCloseDifficultyMenu = () => {
    setAnchorElDifficulty(null)
  }

  const handleSelectDifficulty = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty)
    setNewTimePerQuestion(selectedDifficulty)
    handleCloseDifficultyMenu()
  }

  // Colors for the pie chart - más vibrantes y con mejor contraste
  const COLORS = ["#4CAF50", "#FF5252"]

  // Gradientes para fondos
  const primaryGradient = "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)"
  const secondaryGradient = "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"
  const multiplayerGradient = "linear-gradient(135deg, #81c784 0%, #388e3c 100%)"

  // Fetch session data on component mount
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`${apiEndpoint}/get-user-sessions/${username}`)
        const usuario = response.data
        setUserData(usuario)
        const sesiones = response.data.sessions
        // Ordenar las sesiones por fecha (más reciente primero)
        const sortedSessions = sesiones.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setSessionData(sortedSessions)
        setLoading(false)
      } catch (error) {
        console.error("Error al obtener sesiones:", error)
        setLoading(false)
      }
    }

    if (username) {
      fetchSessionData()
    }
  }, [username])

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await axios.get(`${apiEndpoint}/get-users-totaldatas`)

        // Filter out users who don't have AccuracyRate data (haven't played yet)
        const activeUsers = response.data.filter(
          (user) =>
            user.AccuracyRate !== undefined &&
            user.AccuracyRate !== null &&
            user.TotalWellAnswers !== undefined &&
            user.TotalWellAnswers !== null,
        )

        // Sort users by AccuracyRate (highest first), then by TotalWellAnswers if tied
        const sortedUsers = activeUsers.sort((a, b) => {
          if (a.AccuracyRate === b.AccuracyRate) {
            return b.TotalWellAnswers - a.TotalWellAnswers
          }
          return b.AccuracyRate - a.AccuracyRate
        })

        // Get top 3 users for main display
        setLeaderboardData(sortedUsers.slice(0, 3))

        // Get top 10 users for extended leaderboard
        setExtendedLeaderboardData(sortedUsers.slice(0, 10))
      } catch (error) {
        console.error("Error al obtener datos del leaderboard:", error)
      }
    }

    fetchLeaderboardData()
  }, [])

  const handleShowGame = (category = "All", difficultyN = "Normal") => {
    navigate("/Game", {
      state: {
        gameConfig: {
          numQuestions: numQuestions,
          timePerQuestion: timePerQuestion,
          difficulty: difficultyN,
          category: category,
        },
      },
    })

    // Cerrar el menú después de seleccionar
    setAnchorEl(null)
  }

  // Funciones para manejar el menú desplegable
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  // Calculate total statistics across all sessions
  const getTotalStats = () => {
    if (userData.length === 0) return []

    return [
      { name: "Correctas", value: userData.TotalWellAnswers },
      { name: "Incorrectas", value: userData.TotalWrongAnswers },
    ]
  }

  // Get the last 3 sessions - Corregido para obtener las últimas 5 sesiones
  const getLastSessions = () => {
    // Ya están ordenadas por fecha en el useEffect, así que simplemente tomamos las primeras 5
    return sessionData.slice(0, 3)
  }

  // Obtener la tase de acierto
  const getSuccessRate = () => {
    if (sessionData.length === 0) return 0

    return userData.AccuracyRate
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 2,
            border: "none",
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            backdropFilter: "blur(10px)",
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            {`${payload[0].name}: ${payload[0].value}`}
          </Typography>
        </Box>
      )
    }
    return null
  }

  // Valor del contexto para la configuración del juego
  const configValue = {
    numQuestions,
    timePerQuestion,
    updateNumQuestions: setNumQuestions,
    updateTimePerQuestion: setTimePerQuestion,
  }

  // Calculate total questions answered
  const totalQuestions = sessionData.reduce((sum, session) => sum + session.score + session.wrongAnswers, 0)

  const playerLevel = getPlayerLevel(totalQuestions)
  const successRate = getSuccessRate()

  const handleOpenSessionDetails = (session) => {
    setSelectedSession(session)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedSession(null)
    setExpandedQuestion(null)
  }

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index)
  }

  // Función para cerrar sesión y redirigir al login
  const handleLogout = () => {
    localStorage.removeItem("username")
    navigate("/")
  }

  const handleGoToProfile = () => {
    navigate("/Profile")
  }

  const [showMessage, setShowMessage] = useState("")

  /**
   * This function is used only to adapt the label that informs about the time per question to the user
   * @param difficulty Difficulty selected by the user
   */
  function setNewTimePerQuestion(difficulty) {
    switch (difficulty) {
      case "Principiante":
        setTimePerQuestion(60)
        break
      case "Normal":
        setTimePerQuestion(30)
        break
      case "Difícil":
        setTimePerQuestion(15)
        break
      case "Experto":
        setTimePerQuestion(5)
        break
      default:
        setTimePerQuestion(30)
    }
  }

  /**
   * Used to allow scrolling when coming from the Profile
   * @type {Location}
   */
  const location = useLocation()
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [location])

  useEffect(() => {
    // Create a singleton instance of MultiplayerService
    const service = MultiplayerService.getInstance()

    // Conectar el servicio si no está conectado
    if (!service.socket || !service.socket.connected) {
      service.connect()
    }

    // Configurar los eventos
    service
      .on("onConnect", () => {
        console.log("Conectado al servidor ")
      })
      .on("onRoomJoined", (data) => {
        setRoomInfo({
          roomId: data.roomId,
          roomName: data.roomName || `Sala ${data.roomId}`,
        })
        // Asegurarse de que la sala de espera se muestre
        setShowWaitingRoom(true)
      })
      .on("onPlayerJoined", (data) => {
        console.log(`Jugador unido: ${data.username}`)
      })
      .on("onPlayerReady", (data) => {
        console.log(`Jugador listo: ${data.playerId}`)
      })
      .on("onGameStart", (data) => {
        setShowWaitingRoom(false)
        // Navegar a la pantalla de juego
        navigate("/Game", {
          state: {
            gameConfig: {
              numQuestions: numQuestions,
              timePerQuestion: timePerQuestion,
              difficulty: difficulty,
              category: "All",
              multiplayer: true,
              roomId: data.roomId,
              players: data.players,
            },
          },
        })
      })
      .on("onError", (data) => {
        console.error("Error:", data.message)
        alert(`Error: ${data.message}`)
      })

    // Save instance to state
    setMultiplayerService(service)

    // Cleanup on unmount
    /*
    return () => {
        if (service) {
            service.disconnect()
        }
    }*/
  }, [])

  // Implementar los métodos que necesita el componente WaitingRoom
  if (multiplayerService) {
    // Añadir métodos si no existen
    if (!multiplayerService.sendReady) {
      multiplayerService.sendReady = function (roomId) {
        console.log(`Enviando ready para sala ${roomId}`)
        // Implementar según tu API
        return this.socket.emit("player_ready", { roomId, userId: this.userId })
      }
    }

    if (!multiplayerService.startGame) {
      multiplayerService.startGame = function (roomId) {
        // Implementar según tu API
        return this.socket.emit("start_game", { roomId })
      }
    }

    if (!multiplayerService.leaveRoom) {
      multiplayerService.leaveRoom = function (roomId) {
        console.log(`Abandonando sala ${roomId}`)
        // Implementar según tu API
        return this.socket.emit("leave_room", { roomId, userId: this.userId })
      }
    }
  }

  // Modificar la función crearSala para asegurar que se pasa correctamente el nombre de usuario
  function crearSala() {
    if (!multiplayerService) {
      multiplayerService = MultiplayerService.getInstance()
      setMultiplayerService(multiplayerService)
    }

    // Connect if not already connected
    if (!multiplayerService.socket || !multiplayerService.socket.connected) {
      multiplayerService.connect()
    }

    // Generate a unique 6-digit random room ID
    const roomId = `room-${Math.floor(100000 + Math.random() * 900000).toString()}`
    const roomName = `Sala de ${username || "Anónimo"}`
    const currentUsername = username || "Anónimo"

    // Mostrar la sala de espera inmediatamente con un mensaje de "Creando sala..."
    setRoomInfo({
      roomId,
      roomName: "Creando sala...",
    })
    setShowWaitingRoom(true)

    // Usar el méthodo createRoom del servicio
    multiplayerService
      .createRoom(roomId, roomName)
      .then((data) => {
        if (data.success) {
          return multiplayerService.joinRoom(roomId, currentUsername)
        }
        // Si hay un error, ocultar la sala de espera y mostrar un mensaje
        setShowWaitingRoom(false)
        throw new Error(data.message || "Error al crear sala")
      })
      .then((response) => {
        if (response && response.success) {
          console.log(`Sala creada y unido: ${roomId}`, response)
          // Actualizar la información de la sala
          setRoomInfo({
            roomId,
            roomName,
          })
        } else {
          // Si hay un error, ocultar la sala de espera y mostrar un mensaje
          setShowWaitingRoom(false)
          alert(`Error al unirse: ${response?.message || "Error desconocido"}`)
        }
      })
      .catch((err) => {
        console.error("Error al crear sala:", err)
        setShowWaitingRoom(false)
        alert(`Error: ${err.message || "No se pudo crear la sala"}`)
      })
  }

  // Modificar la función unirSala para asegurar que se pasa correctamente el nombre de usuario
  function unirSala() {
    const roomId = prompt("Introduce el ID de la sala:")
    if (!roomId) return

    if (!multiplayerService) {
      multiplayerService = MultiplayerService.getInstance()
      setMultiplayerService(multiplayerService)
    }

    // Connect if not already connected
    if (!multiplayerService.socket || !multiplayerService.socket.connected) {
      multiplayerService.connect()
    }

    const currentUsername = username || "Anónimo"

    // Mostrar la sala de espera inmediatamente con un mensaje de "Conectando..."
    setRoomInfo({
      roomId,
      roomName: "Conectando...",
    })
    setShowWaitingRoom(true)

    // Usar el méthodo joinRoom del servicio
    multiplayerService
      .joinRoom(roomId, currentUsername)
      .then((response) => {
        if (response.success) {
          // Actualizar la información de la sala
          setRoomInfo({
            roomId,
            roomName: response.roomName || `Sala ${roomId}`,
          })
        } else {
          // Si hay un error, ocultar la sala de espera y mostrar un mensaje
          setShowWaitingRoom(false)
          alert(`Error al unirse: ${response.message || "Sala no encontrada"}`)
        }
      })
      .catch((err) => {
        console.error("Error al unirse a sala:", err)
        setShowWaitingRoom(false)
        alert(`Error al unirse: ${err.message || "No se pudo conectar al servidor"}`)
      })
  }

  // Función para generar un color de avatar basado en el nombre de usuario
  const generateAvatarColor = (username) => {
    const colors = [
      "#1976d2",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#8bc34a",
      "#cddc39",
      "#ffeb3b",
      "#ffc107",
      "#ff9800",
      "#ff5722",
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
    ]

    // Generar un índice basado en la suma de los códigos ASCII de los caracteres del nombre
    let sum = 0
    for (let i = 0; i < username.length; i++) {
      sum += username.charCodeAt(i)
    }

    return colors[sum % colors.length]
  }

  // Función para obtener las iniciales del nombre de usuario
  const getInitials = (name) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Función para determinar el color de la barra de progreso según el porcentaje
  const getProgressColor = (percentage) => {
    if (percentage >= 70) return "success"
    if (percentage >= 40) return "warning"
    return "error"
  }

  // Función para obtener el ícono de medalla según la posición
  const getMedalIcon = (position) => {
    switch (position) {
      case 0:
        return <MilitaryTechIcon sx={{ color: "#FFD700" }} />
      case 1:
        return <MilitaryTechIcon sx={{ color: "#C0C0C0" }} />
      case 2:
        return <MilitaryTechIcon sx={{ color: "#CD7F32" }} />
      default:
        return null
    }
  }

  return (
    <ConfigContext.Provider value={configValue}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
          pt: 4,
          pb: 16, // Aumentar padding inferior
        }}
      >
        <Container maxWidth="lg">
          {/* Menú Superior */}
          <AppBar
            position="sticky"
            sx={{
              background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
              marginBottom: "20px",
              borderRadius: 4,
              boxShadow: "none",
            }}
          >
            <Toolbar
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                WiChat - Home
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
                <MenuItem
                  onClick={() => document.getElementById("play").scrollIntoView({ behavior: "smooth" })}
                  onMouseEnter={() => setShowMessage("Jugar")}
                  onMouseLeave={() => setShowMessage("")}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <PlayArrowIcon sx={{ mr: 1 }} />
                  Jugar
                </MenuItem>

                <MenuItem
                  onClick={() => document.getElementById("recentGames").scrollIntoView({ behavior: "smooth" })}
                  onMouseEnter={() => setShowMessage("Ver las partidas recientes")}
                  onMouseLeave={() => setShowMessage("")}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <HistoryIcon sx={{ mr: 1 }} />
                  Historial
                </MenuItem>

                <MenuItem
                  onClick={() => document.getElementById("topPlayers").scrollIntoView({ behavior: "smooth" })}
                  onMouseEnter={() => setShowMessage("Ver ranking de jugadores")}
                  onMouseLeave={() => setShowMessage("")}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <LeaderboardIcon sx={{ mr: 1 }} />
                  Ranking
                </MenuItem>

                <MenuItem
                  onClick={handleGoToProfile}
                  onMouseEnter={() => setShowMessage("Ir al perfil")}
                  onMouseLeave={() => setShowMessage("")}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <AccountCircleIcon sx={{ mr: 1 }} />
                </MenuItem>

                <MenuItem
                  onClick={handleLogout}
                  onMouseEnter={() => setShowMessage("Cerrar sesión")}
                  onMouseLeave={() => setShowMessage("")}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <ExitToAppIcon sx={{ mr: 1 }} />
                </MenuItem>

                {showMessage && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "90%",
                      left: "0%",
                      transform: "translateX(10px)",
                      bgcolor: "rgba(25,118,210,0.7)",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                      opacity: 1,
                      pointerEvents: "none",
                      zIndex: 10,
                    }}
                  >
                    {showMessage}
                  </Box>
                )}
              </Box>
            </Toolbar>
          </AppBar>

          {/* Welcome Message - con diseño mejorado */}
          <Fade in={true} timeout={800}>
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                textAlign: "center",
                p: 4,
                borderRadius: 4,
                background: primaryGradient,
                color: "white",
                boxShadow: "0 10px 30px rgba(25, 118, 210, 0.3)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Elementos decorativos de fondo */}
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  left: -20,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -30,
                  right: -30,
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                }}
              />

              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                fontWeight="bold"
                sx={{
                  textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                ¡Hola, {username}! WiChat te espera
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  position: "relative",
                  zIndex: 1,
                  mb: 2,
                }}
              >
                Revisa tus estadísticas y comienza una nueva partida
              </Typography>

              {/* Nivel del jugador */}
              {!loading && sessionData.length > 0 && (
                <Chip
                  icon={<StarIcon />}
                  label={`Nivel: ${playerLevel.level}`}
                  sx={{
                    bgcolor: alpha(playerLevel.color, 0.2),
                    color: "white",
                    border: `1px solid ${alpha(playerLevel.color, 0.5)}`,
                    fontWeight: "bold",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              )}
            </Paper>
          </Fade>

          {/* Statistics and New Game Button in the same container - con diseño mejorado */}
          <Fade in={true} timeout={1000}>
            <Paper
              elevation={0}
              sx={{
                p: 0,
                mb: 4,
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  background: "linear-gradient(90deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                }}
              >
                <Typography
                  id="topPlayers"
                  variant="h5"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <EmojiEventsIcon /> Ranking de Jugadores
                </Typography>
              </Box>

              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  {/* Leaderboard - NUEVA IMPLEMENTACIÓN */}
                  <Grid item xs={12}>
                    {loading ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                          height: 300,
                          p: 3,
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
                          <Skeleton variant="rounded" width={120} height={80} />
                          <Skeleton variant="rounded" width={120} height={80} />
                        </Box>
                        <Skeleton variant="rounded" width="100%" height={300} />
                      </Box>
                    ) : (
                      <Box>
                        {/* Podio de ganadores */}
                        {leaderboardData.length > 0 && (
                          <Box
                            sx={{
                              mb: 4,
                              position: "relative",
                              height: 280,
                              display: "flex",
                              alignItems: "flex-end",
                              justifyContent: "center",
                              background:
                                "linear-gradient(180deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)",
                              borderRadius: "16px",
                              padding: "20px",
                              overflow: "hidden",
                            }}
                          >
                            {/* Decoración de fondo */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                opacity: 0.5,
                                zIndex: 0,
                                backgroundImage:
                                  "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%231976d2' fillOpacity='0.1' fillRule='evenodd'/%3E%3C/svg%3E\")",
                              }}
                            />

                            {/* Podio - Segundo lugar */}
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                left: "20%",
                                width: "20%",
                                height: "160px",
                                bgcolor: "#C0C0C0",
                                borderTopLeftRadius: "8px",
                                borderTopRightRadius: "8px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                pt: 2,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                zIndex: 1,
                              }}
                            >
                              <Typography variant="h4" fontWeight="bold" color="black" sx={{ mb: 1 }}>
                                2
                              </Typography>
                              {leaderboardData[1] && (
                                <>
                                  <Avatar
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      bgcolor: generateAvatarColor(leaderboardData[1].username),
                                      border: "3px solid white",
                                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                                      mb: 1,
                                    }}
                                  >
                                    {getInitials(leaderboardData[1].username)}
                                  </Avatar>
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color="black"
                                    sx={{ textAlign: "center" }}
                                  >
                                    {leaderboardData[1].username}
                                  </Typography>
                                  <Typography variant="body2" color="black" sx={{ textAlign: "center" }}>
                                    {Math.round(leaderboardData[1].AccuracyRate)}%
                                  </Typography>
                                </>
                              )}
                            </Box>

                            {/* Podio - Primer lugar */}
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                left: "40%",
                                width: "20%",
                                height: "200px",
                                bgcolor: "#FFD700",
                                borderTopLeftRadius: "8px",
                                borderTopRightRadius: "8px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                pt: 2,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                zIndex: 2,
                              }}
                            >
                              <Typography variant="h3" fontWeight="bold" color="black" sx={{ mb: 1 }}>
                                1
                              </Typography>
                              {leaderboardData[0] && (
                                <>
                                  <Avatar
                                    sx={{
                                      width: 80,
                                      height: 80,
                                      bgcolor: generateAvatarColor(leaderboardData[0].username),
                                      border: "4px solid white",
                                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                                      mb: 1,
                                    }}
                                  >
                                    {getInitials(leaderboardData[0].username)}
                                  </Avatar>
                                  <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    color="black"
                                    sx={{ textAlign: "center" }}
                                  >
                                    {leaderboardData[0].username}
                                  </Typography>
                                  <Typography variant="body2" color="black" sx={{ textAlign: "center" }}>
                                    {Math.round(leaderboardData[0].AccuracyRate)}%
                                  </Typography>
                                </>
                              )}
                            </Box>

                            {/* Podio - Tercer lugar */}
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                left: "60%",
                                width: "20%",
                                height: "120px",
                                bgcolor: "#CD7F32",
                                borderTopLeftRadius: "8px",
                                borderTopRightRadius: "8px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                pt: 2,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                zIndex: 1,
                              }}
                            >
                              <Typography variant="h4" fontWeight="bold" color="black" sx={{ mb: 1 }}>
                                3
                              </Typography>
                              {leaderboardData[2] && (
                                <>
                                  <Avatar
                                    sx={{
                                      width: 50,
                                      height: 50,
                                      bgcolor: generateAvatarColor(leaderboardData[2].username),
                                      border: "3px solid white",
                                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                                      mb: 1,
                                    }}
                                  >
                                    {getInitials(leaderboardData[2].username)}
                                  </Avatar>
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color="black"
                                    sx={{ textAlign: "center" }}
                                  >
                                    {leaderboardData[2].username}
                                  </Typography>
                                  <Typography variant="body2" color="black" sx={{ textAlign: "center" }}>
                                    {Math.round(leaderboardData[2].AccuracyRate)}%
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Box>
                        )}

                        {/* Tabla de clasificación detallada */}
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: "white",
                            border: "1px solid rgba(0, 0, 0, 0.05)",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="primary"
                              sx={{ display: "flex", alignItems: "center", gap: 1 }}
                            >
                              <PeopleIcon /> Tabla de Clasificación
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setShowLeaderboardDetails(!showLeaderboardDetails)}
                              endIcon={showLeaderboardDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            >
                              {showLeaderboardDetails ? "Ver menos" : "Ver más"}
                            </Button>
                          </Box>

                          {extendedLeaderboardData.length > 0 ? (
                            <Box>
                              {/* Encabezados de la tabla */}
                              <Grid container sx={{ mb: 2, px: 2 }}>
                                <Grid item xs={1}>
                                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                    #
                                  </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                    Jugador
                                  </Typography>
                                </Grid>
                                <Grid item xs={5}>
                                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                    Precisión
                                  </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                  <Typography variant="body2" color="text.secondary" fontWeight="medium" align="right">
                                    Respuestas
                                  </Typography>
                                </Grid>
                              </Grid>

                              {/* Filas de jugadores */}
                              {extendedLeaderboardData.slice(0, showLeaderboardDetails ? 10 : 5).map((user, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    p: 2,
                                    mb: 1,
                                    borderRadius: 2,
                                    bgcolor:
                                      index < 3
                                        ? alpha(index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32", 0.1)
                                        : "transparent",
                                    border:
                                      index < 3
                                        ? `1px solid ${alpha(
                                            index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32",
                                            0.3,
                                          )}`
                                        : "1px solid rgba(0, 0, 0, 0.05)",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                                      transform: "translateY(-2px)",
                                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
                                    },
                                  }}
                                >
                                  {/* Posición */}
                                  <Grid container alignItems="center">
                                    <Grid item xs={1} sx={{ display: "flex", alignItems: "center" }}>
                                      {index < 3 ? (
                                        getMedalIcon(index)
                                      ) : (
                                        <Typography
                                          variant="body1"
                                          fontWeight="bold"
                                          color="text.secondary"
                                          sx={{ ml: 1 }}
                                        >
                                          {index + 1}
                                        </Typography>
                                      )}
                                    </Grid>

                                    {/* Jugador */}
                                    <Grid item xs={3} sx={{ display: "flex", alignItems: "center" }}>
                                      <Avatar
                                        sx={{
                                          width: 36,
                                          height: 36,
                                          bgcolor: generateAvatarColor(user.username),
                                          mr: 1.5,
                                        }}
                                      >
                                        {getInitials(user.username)}
                                      </Avatar>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        sx={{
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {user.username}
                                      </Typography>
                                    </Grid>

                                    {/* Barra de precisión */}
                                    <Grid item xs={5}>
                                      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                          <Typography variant="caption" fontWeight="medium">
                                            Precisión
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                            color={
                                              user.AccuracyRate >= 70
                                                ? "success.main"
                                                : user.AccuracyRate >= 40
                                                  ? "warning.main"
                                                  : "error.main"
                                            }
                                          >
                                            {Math.round(user.AccuracyRate)}%
                                          </Typography>
                                        </Box>
                                        <LinearProgress
                                          variant="determinate"
                                          value={Math.round(user.AccuracyRate)}
                                          color={getProgressColor(user.AccuracyRate)}
                                          sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: alpha(theme.palette.grey[300], 0.5),
                                          }}
                                        />
                                      </Box>
                                    </Grid>

                                    {/* Respuestas */}
                                    <Grid item xs={3} sx={{ textAlign: "right" }}>
                                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                        <Typography variant="body2" fontWeight="bold">
                                          {user.TotalWellAnswers + user.TotalWrongAnswers}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {user.TotalWellAnswers} correctas
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  </Grid>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                height: 300,
                                p: 4,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.info.main, 0.05),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                              }}
                            >
                              <EmojiEventsIcon
                                sx={{
                                  fontSize: 60,
                                  color: alpha(theme.palette.info.main, 0.3),
                                  mb: 2,
                                }}
                              />
                              <Typography>No hay datos de usuarios disponibles</Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Comienza a jugar para aparecer en el ranking
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    )}
                  </Grid>

                  {/* Contenedor para los modos de juego (un jugador y multijugador) */}
                  <Grid item xs={12} sx={{ mt: 2 }} id="play">
                    <Grid container spacing={4}>
                      {/* Un jugador */}
                      <Grid item xs={12} md={6}>
                        {/* NUEVA IMPLEMENTACIÓN DEL BLOQUE UN JUGADOR */}
                        <Box
                          sx={{
                            height: "auto",
                            minHeight: 490,
                            bgcolor: "#ff9800",
                            color: "white",
                            borderRadius: 4,
                            position: "relative",
                            boxShadow: "0 10px 30px rgba(255, 152, 0, 0.3)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            py: 6,
                            px: 4,
                          }}
                        >
                          {/* Círculos decorativos */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: -25,
                              left: -25,
                              width: 100,
                              height: 100,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.1)",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: -20,
                              right: -20,
                              width: 120,
                              height: 120,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.1)",
                            }}
                          />

                          {/* Título */}
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{
                              mb: 5,
                              textAlign: "center",
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            Un jugador
                          </Typography>

                          {/* Selección dificultad */}
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 1,
                              textAlign: "center",
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            Seleccionar dificultad
                          </Typography>

                          <Button
                            variant="contained"
                            onClick={handleOpenDifficultyMenu}
                            endIcon={<KeyboardArrowDownIcon />}
                            sx={{
                              bgcolor: "white",
                              color: "#e65100",
                              fontWeight: "bold",
                              fontSize: "1rem",
                              py: 1.5,
                              px: 4,
                              borderRadius: 50,
                              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                              "&:hover": {
                                bgcolor: "white",
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                              },
                              zIndex: 2,
                              mb: 3,
                            }}
                          >
                            {difficulty}
                          </Button>

                          {/* Menú de dificultad */}
                          <Menu
                            id="difficulty-menu"
                            anchorEl={anchorElDifficulty}
                            open={openDifficultyMenu}
                            onClose={handleCloseDifficultyMenu}
                            PaperProps={{
                              elevation: 3,
                              sx: {
                                borderRadius: 2,
                                minWidth: 180,
                              },
                            }}
                          >
                            <MenuItem onClick={() => handleSelectDifficulty("Principiante")}>
                              <ListItemIcon>
                                <SportsEsportsIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Principiante</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleSelectDifficulty("Normal")}>
                              <ListItemIcon>
                                <SportsEsportsIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Normal</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleSelectDifficulty("Difícil")}>
                              <ListItemIcon>
                                <SportsEsportsIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Difícil</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleSelectDifficulty("Experto")}>
                              <ListItemIcon>
                                <SportsEsportsIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Experto</ListItemText>
                            </MenuItem>
                          </Menu>

                          {/* Botón Comenzar partida */}
                          <Button
                            variant="contained"
                            startIcon={<PlayArrowIcon />}
                            endIcon={<KeyboardArrowDownIcon />}
                            onClick={handleOpenMenu}
                            sx={{
                              bgcolor: "white",
                              color: "#e65100",
                              fontWeight: "bold",
                              fontSize: "1rem",
                              py: 1.5,
                              px: 4,
                              borderRadius: 50,
                              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                              "&:hover": {
                                bgcolor: "white",
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                              },
                              zIndex: 2,
                              mb: 4,
                            }}
                          >
                            Comenzar partida
                          </Button>

                          {/* Menú de categorías de juego */}
                          <Menu
                            id="game-menu"
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleCloseMenu}
                            PaperProps={{
                              elevation: 3,
                              sx: {
                                borderRadius: 2,
                                minWidth: 180,
                              },
                            }}
                          >
                            <MenuItem onClick={() => handleShowGame("Geografia", difficulty)}>
                              <ListItemIcon>
                                <PublicIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Geografía</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleShowGame("Cultura", difficulty)}>
                              <ListItemIcon>
                                <TheaterComedyIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Cultura</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleShowGame("Personajes", difficulty)}>
                              <ListItemIcon>
                                <PersonIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Personajes</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleShowGame("Videojuegos", difficulty)}>
                              <ListItemIcon>
                                <SportsEsportsIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Videojuegos</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleShowGame("Aviones", difficulty)}>
                              <ListItemIcon>
                                <FlightIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Aviones</ListItemText>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => handleShowGame("All", difficulty)}>
                              <ListItemIcon>
                                <ShuffleIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Aleatorio</ListItemText>
                            </MenuItem>
                          </Menu>

                          {/* Información de configuración */}
                          <Box sx={{ mt: 1, width: "100%", maxWidth: 280, zIndex: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 1.5,
                                bgcolor: "rgba(255,255,255,0.2)",
                                borderRadius: 2,
                                mb: 2,
                              }}
                            >
                              <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                <strong>{timePerQuestion}</strong> segundos por pregunta
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 1.5,
                                bgcolor: "rgba(255,255,255,0.2)",
                                borderRadius: 2,
                              }}
                            >
                              <QuizIcon fontSize="small" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                <strong>{numQuestions}</strong> preguntas por partida
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Multijugador */}
                      <Grid item xs={12} md={6}>
                        {/* NUEVA IMPLEMENTACIÓN DEL BLOQUE MULTIJUGADOR */}
                        <Box
                          sx={{
                            height: "auto",
                            minHeight: 490,
                            bgcolor: "#4caf50",
                            color: "white",
                            borderRadius: 4,
                            position: "relative",
                            boxShadow: "0 10px 30px rgba(76, 175, 80, 0.3)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            py: 6,
                            px: 4,
                          }}
                        >
                          {/* Círculos decorativos */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: -25,
                              left: -25,
                              width: 100,
                              height: 100,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.1)",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: -20,
                              right: -20,
                              width: 120,
                              height: 120,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.1)",
                            }}
                          />

                          {/* Título */}
                          <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{
                              mb: 6,
                              textAlign: "center",
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            Multijugador
                          </Typography>

                          {/* Botones */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                              width: "100%",
                              maxWidth: 280,
                              zIndex: 2,
                              mb: 5,
                            }}
                          >
                            <Button
                              variant="contained"
                              onClick={crearSala}
                              sx={{
                                bgcolor: "white",
                                color: "#2e7d32",
                                fontWeight: "bold",
                                fontSize: "1rem",
                                py: 2,
                                borderRadius: 50,
                                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                "&:hover": {
                                  bgcolor: "white",
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                                },
                              }}
                            >
                              Crear sala
                            </Button>

                            <Button
                              variant="contained"
                              onClick={unirSala}
                              sx={{
                                bgcolor: "white",
                                color: "#2e7d32",
                                fontWeight: "bold",
                                fontSize: "1rem",
                                py: 2,
                                borderRadius: 50,
                                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                "&:hover": {
                                  bgcolor: "white",
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                                },
                              }}
                            >
                              Unirse a sala
                            </Button>
                          </Box>

                          {/* Texto informativo */}
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "rgba(255,255,255,0.2)",
                              borderRadius: 2,
                              width: "100%",
                              maxWidth: 280,
                              textAlign: "center",
                              zIndex: 2,
                            }}
                          >
                            <Typography variant="body2">
                              Juega con amigos en tiempo real y compite por el mejor puntaje
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Fade>

          {/* Last 3 Sessions */}
          <Fade in={true} timeout={1200}>
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  background: "linear-gradient(90deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  id="recentGames"
                  variant="h5"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AccessTimeIcon /> Tus últimas partidas
                </Typography>
                {!loading && sessionData.length > 0 && (
                  <Chip
                    label={`Total: ${sessionData.length} sesiones`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>

              <Box sx={{ p: 4 }}>
                {loading ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} variant="rounded" height={100} />
                    ))}
                  </Box>
                ) : sessionData.length > 0 ? (
                  <Grid container spacing={2}>
                    {getLastSessions().map((session, index) => (
                      <Grid item xs={12} key={session._id}>
                        <Paper
                          elevation={0}
                          className="session-card"
                          onClick={() => handleOpenSessionDetails(session)}
                          sx={{
                            p: 0,
                            mb: 1,
                            borderRadius: 3,
                            overflow: "hidden",
                            border: "1px solid rgba(0, 0, 0, 0.05)",
                            transition: "all 0.3s",
                            cursor: "pointer", // Añadir cursor pointer para indicar que se puede pulsar
                            "&:hover": {
                              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.05)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Grid container>
                            {/* Barra lateral con número de sesión */}
                            <Grid
                              item
                              xs={1}
                              sm={1}
                              sx={{
                                background: primaryGradient,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "1.2rem",
                              }}
                            >
                              {index + 1}
                            </Grid>

                            {/* Contenido principal */}
                            <Grid item xs={11} sm={11}>
                              <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={2} alignItems="center">
                                  <Grid item xs={12} sm={4}>
                                    <Box>
                                      <Typography variant="subtitle1" color="primary" fontWeight="medium">
                                        Sesión del {formatDate(session.createdAt).split(" ")[0]}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                        }}
                                      >
                                        <AccessTimeIcon fontSize="inherit" />
                                        {formatDate(session.createdAt).split(" ")[1]}
                                      </Typography>

                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                        }}
                                      >
                                        <QuizIcon fontSize="inherit" />
                                        {session.difficulty}
                                      </Typography>

                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                        }}
                                      >
                                        <SportsEsportsIcon fontSize="inherit" />
                                        {session.category}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={6} sm={4}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: alpha("#4CAF50", 0.1),
                                      }}
                                    >
                                      <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                                      <Typography variant="body2">
                                        <strong>{session.score}</strong> correctas
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={6} sm={4}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: alpha("#FF5252", 0.1),
                                      }}
                                    >
                                      <CancelOutlinedIcon color="error" sx={{ mr: 1 }} />
                                      <Typography variant="body2">
                                        <strong>{session.wrongAnswers}</strong> incorrectas
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      p: 5,
                      textAlign: "center",
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <QuizIcon sx={{ fontSize: 60, color: alpha(theme.palette.info.main, 0.3) }} />
                    <Typography variant="h6">No hay sesiones de juego registradas</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ¡Comienza una nueva partida para ver tus estadísticas aquí!
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
      {/* Dialog para mostrar detalles de la sesión */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        {selectedSession && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 3,
                background: primaryGradient,
                color: "white",
              }}
            >
              <Typography variant="h6" component="div" fontWeight="bold">
                Detalles de la sesión del {formatDate(selectedSession.createdAt).split(" ")[0]} con dificultad{" "}
                {selectedSession.difficulty}
              </Typography>
              <IconButton edge="end" color="inherit" onClick={handleCloseDialog} aria-label="close">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha("#4CAF50", 0.1),
                      }}
                    >
                      <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        <strong>{selectedSession.score}</strong> respuestas correctas
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha("#FF5252", 0.1),
                      }}
                    >
                      <CancelOutlinedIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        <strong>{selectedSession.wrongAnswers}</strong> respuestas incorrectas
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="h6" sx={{ px: 3, pt: 3, pb: 2 }}>
                Preguntas de esta sesión
              </Typography>

              {selectedSession.questions && selectedSession.questions.length > 0 ? (
                <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
                  {selectedSession.questions.map((q, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        component="div"
                        alignItems="flex-start"
                        button
                        onClick={() => toggleQuestion(index)}
                        sx={{
                          px: 3,
                          py: 2,
                          bgcolor: expandedQuestion === index ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight="medium">
                                Pregunta {index + 1}
                              </Typography>
                              {q.userAnswer === q.correctAnswer ? (
                                <Chip
                                  icon={<CheckCircleOutlineIcon />}
                                  label="Correcta"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip
                                  icon={<CancelOutlinedIcon />}
                                  label="Incorrecta"
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: "flex", alignItems: "center", mt: 1 }}
                            >
                              {q.question}
                              {expandedQuestion === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Collapse in={expandedQuestion === index} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: alpha("#4CAF50", 0.1),
                                  border: `1px solid ${alpha("#4CAF50", 0.2)}`,
                                }}
                              >
                                <Typography variant="subtitle2" color="success.main" gutterBottom>
                                  Respuesta correcta:
                                </Typography>
                                <Typography variant="body2">{q.correctAnswer}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor:
                                    q.userAnswer === q.correctAnswer ? alpha("#4CAF50", 0.1) : alpha("#FF5252", 0.1),
                                  border: `1px solid ${
                                    q.userAnswer === q.correctAnswer ? alpha("#4CAF50", 0.2) : alpha("#FF5252", 0.2)
                                  }`,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  color={q.userAnswer === q.correctAnswer ? "success.main" : "error.main"}
                                  gutterBottom
                                >
                                  Tu respuesta:
                                </Typography>
                                <Typography variant="body2">{q.userAnswer}</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No hay información detallada de preguntas para esta sesión.
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog} variant="outlined">
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      {/* Sala de espera */}
      {showWaitingRoom && roomInfo && (
        <WaitingRoom
          roomId={roomInfo.roomId}
          roomName={roomInfo.roomName}
          username={username || "Anónimo"}
          multiplayerService={multiplayerService}
          onClose={() => {
            if (!navigatingToGame && multiplayerService && roomInfo) {
              multiplayerService.leaveRoom(roomInfo.roomId)
            }
            setShowWaitingRoom(false)
          }}
          onGameStart={() => {
            setNavigatingToGame(true) // 👈 evita leaveRoom
            setShowWaitingRoom(false)
            multiplayerService
              .requestQuestions(
                roomInfo.roomId,
                60, //Numero de preguntas multijugador
                "All",
              )
              .then((data) => {
                navigate("/GameMultiplayer", {
                  state: {
                    gameConfig: {
                      roomId: roomInfo.roomId,
                      players: roomInfo.players,
                      questions: data,
                    },
                  },
                })
                //setShowWaitingRoom(false) // ahora sí, sin activar leaveRoom
              })
          }}
        />
      )}
    </ConfigContext.Provider>
  )
}

export default HomePage
