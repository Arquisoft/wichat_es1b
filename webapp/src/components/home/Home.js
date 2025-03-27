"use client"

import React, { useState } from "react"

import { createContext, useContext, useEffect } from "react"
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
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import QuizIcon from "@mui/icons-material/Quiz"
import StarIcon from "@mui/icons-material/Star"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
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
import "./Home.css"

const ConfigContext = createContext()

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000"

export const useConfig = () => useContext(ConfigContext)

const HomePage = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem("username")
  const theme = useTheme()

  // Configuración de la partida
  const [numQuestions, setNumQuestions] = useState(5)
  const [timePerQuestion, setTimePerQuestion] = useState(30)
  const [sessionData, setSessionData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState(null)

  // Estado para el menú desplegable
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  // Colors for the pie chart - más vibrantes y con mejor contraste
  const COLORS = ["#4CAF50", "#FF5252"]

  // Gradientes para fondos
  const primaryGradient = "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)"
  const secondaryGradient = "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"

  // Fetch session data on component mount
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`${apiEndpoint}/get-sessions/${username}`)
        // Ordenar las sesiones por fecha (más reciente primero)
        const sortedSessions = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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

  const handleShowGame = (category = "All") => {
    // Log the selected category before navigation
    console.log("Starting game with category:", category)

    navigate("/Game", {
      state: {
        gameConfig: {
          numQuestions: numQuestions,
          timePerQuestion: timePerQuestion,
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
    if (sessionData.length === 0) return []

    const totalCorrect = sessionData.reduce((sum, session) => sum + session.score, 0)
    const totalWrong = sessionData.reduce((sum, session) => sum + session.wrongAnswers, 0)

    return [
      { name: "Correctas", value: totalCorrect },
      { name: "Incorrectas", value: totalWrong },
    ]
  }

  // Get the last 5 sessions - Corregido para obtener las últimas 5 sesiones
  const getLastFiveSessions = () => {
    // Ya están ordenadas por fecha en el useEffect, así que simplemente tomamos las primeras 5
    return sessionData.slice(0, 5)
  }

  // Calcular la tasa de acierto
  const getSuccessRate = () => {
    if (sessionData.length === 0) return 0

    const totalCorrect = sessionData.reduce((sum, session) => sum + session.score, 0)
    const totalQuestions = sessionData.reduce((sum, session) => sum + session.score + session.wrongAnswers, 0)

    return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
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

  // Determinar el nivel del jugador basado en preguntas respondidas
  const getPlayerLevel = () => {
    if (totalQuestions < 10) return { level: "Principiante", color: "#9E9E9E" }
    if (totalQuestions < 30) return { level: "Aprendiz", color: "#8BC34A" }
    if (totalQuestions < 60) return { level: "Intermedio", color: "#03A9F4" }
    if (totalQuestions < 100) return { level: "Avanzado", color: "#FF9800" }
    return { level: "Experto", color: "#F44336" }
  }

  const playerLevel = getPlayerLevel()
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

  return (
    <ConfigContext.Provider value={configValue}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
          pt: 4,
          pb: 10,
        }}
      >
        <Container maxWidth="lg">
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
                  variant="h5"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <EmojiEventsIcon /> Estadísticas Totales
                </Typography>
              </Box>

              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  {/* Chart - con diseño mejorado */}
                  <Grid item xs={12} md={8}>
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
                    ) : sessionData.length > 0 ? (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 3,
                            gap: 3,
                          }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              p: 2,
                              borderRadius: 3,
                              bgcolor: alpha("#4CAF50", 0.1),
                              border: `1px solid ${alpha("#4CAF50", 0.2)}`,
                              minWidth: 120,
                              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.1)",
                            }}
                          >
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                              {getTotalStats()[0]?.value || 0}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 1,
                              }}
                            >
                              <CheckCircleOutlineIcon fontSize="small" color="success" />
                              Correctas
                            </Typography>
                          </Paper>
                          <Paper
                            elevation={0}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              p: 2,
                              borderRadius: 3,
                              bgcolor: alpha("#FF5252", 0.1),
                              border: `1px solid ${alpha("#FF5252", 0.2)}`,
                              minWidth: 120,
                              boxShadow: "0 4px 12px rgba(255, 82, 82, 0.1)",
                            }}
                          >
                            <Typography variant="h4" color="error.main" fontWeight="bold">
                              {getTotalStats()[1]?.value || 0}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 1,
                              }}
                            >
                              <CancelOutlinedIcon fontSize="small" color="error" />
                              Incorrectas
                            </Typography>
                          </Paper>
                          <Paper
                            elevation={0}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              p: 2,
                              borderRadius: 3,
                              bgcolor: alpha("#2196F3", 0.1),
                              border: `1px solid ${alpha("#2196F3", 0.2)}`,
                              minWidth: 120,
                              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
                            }}
                          >
                            <Typography
                              variant="h4"
                              sx={{
                                color:
                                  successRate >= 70
                                    ? "success.main"
                                    : successRate >= 40
                                      ? "warning.main"
                                      : "error.main",
                              }}
                              fontWeight="bold"
                            >
                              {successRate}%
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 1,
                              }}
                            >
                              <TrendingUpIcon fontSize="small" color="info" />
                              Tasa de acierto
                            </Typography>
                          </Paper>
                        </Box>
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
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={getTotalStats()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                innerRadius={60} // Convertido a donut chart
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                paddingAngle={5} // Añade espacio entre segmentos
                              >
                                {getTotalStats().map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="none" // Elimina el borde
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle" // Cambia el tipo de icono
                                iconSize={10} // Tamaño del icono
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <Box
                            sx={{
                              mt: 2,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.info.main, 0.05),
                              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <QuizIcon color="info" fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              Total de preguntas respondidas: <strong>{totalQuestions}</strong>
                            </Typography>
                          </Box>
                        </Paper>
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
                        <QuizIcon sx={{ fontSize: 60, color: alpha(theme.palette.info.main, 0.3), mb: 2 }} />
                        <Typography>No hay datos de sesiones disponibles</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Comienza tu primera partida para ver estadísticas
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  {/* New Game Button - con diseño mejorado y menú desplegable */}
                  <Grid item xs={12} md={4} sx={{ display: "flex", alignItems: "center" }}>
                    <Paper
                      elevation={0}
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 4,
                        borderRadius: 3,
                        background: secondaryGradient,
                        color: "white",
                        boxShadow: "0 10px 30px rgba(245, 124, 0, 0.2)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Elementos decorativos */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: -15,
                          right: -15,
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.1)",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -20,
                          left: -20,
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.1)",
                        }}
                      />

                      <Typography
                        variant="h5"
                        gutterBottom
                        align="center"
                        fontWeight="bold"
                        sx={{
                          mb: 3,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        Jugar ahora
                      </Typography>

                      {/* Botón principal con menú desplegable */}
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleOpenMenu}
                        endIcon={<KeyboardArrowDownIcon />}
                        startIcon={<PlayArrowIcon />}
                        className="pulse-button"
                        aria-controls={openMenu ? "game-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={openMenu ? "true" : undefined}
                        sx={{
                          py: 1.5,
                          px: 4,
                          borderRadius: 8,
                          fontWeight: "bold",
                          textTransform: "none",
                          fontSize: "1.1rem",
                          bgcolor: "white",
                          color: theme.palette.warning.dark,
                          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                          position: "relative",
                          zIndex: 1,
                          "&:hover": {
                            bgcolor: "white",
                            boxShadow: "0 15px 25px rgba(0, 0, 0, 0.15)",
                            transform: "translateY(-3px)",
                            transition: "all 0.3s",
                          },
                        }}
                      >
                        Comenzar partida
                      </Button>

                      {/* Menú desplegable con opciones de juego */}
                      <Menu
                        id="game-menu"
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleCloseMenu}
                        MenuListProps={{
                          "aria-labelledby": "game-button",
                        }}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            mt: 1,
                            borderRadius: 2,
                            minWidth: 200,
                            overflow: "visible",
                            "&:before": {
                              content: '""',
                              display: "block",
                              position: "absolute",
                              top: 0,
                              right: 14,
                              width: 10,
                              height: 10,
                              bgcolor: "background.paper",
                              transform: "translateY(-50%) rotate(45deg)",
                              zIndex: 0,
                            },
                          },
                        }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                      >
                        <MenuItem onClick={() => handleShowGame("Geografia")} sx={{ py: 1.5 }}>
                          <ListItemIcon>
                            <PublicIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText>Geografía</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleShowGame("Cultura")} sx={{ py: 1.5 }}>
                          <ListItemIcon>
                            <TheaterComedyIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText>Cultura</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleShowGame("Personajes")} sx={{ py: 1.5 }}>
                          <ListItemIcon>
                            <PersonIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText>Personajes</ListItemText>
                        </MenuItem>
                          <MenuItem onClick={() => handleShowGame("Videojuegos")} sx={{ py: 1.5 }}>
                              <ListItemIcon>
                                  <SportsEsportsIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Videojuegos</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => handleShowGame("Aviones")} sx={{ py: 1.5 }}>
                              <ListItemIcon>
                                  <FlightIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText>Aviones</ListItemText>
                          </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => handleShowGame("All")} sx={{ py: 1.5 }}>
                          <ListItemIcon>
                            <ShuffleIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText>Aleatorio</ListItemText>
                        </MenuItem>
                      </Menu>

                      <Box
                        sx={{
                          mt: 4,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: "white" }} />
                          <Typography variant="body2" sx={{ color: "white" }}>
                            <strong>{timePerQuestion}</strong> segundos por pregunta
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <QuizIcon fontSize="small" sx={{ mr: 1, color: "white" }} />
                          <Typography variant="body2" sx={{ color: "white" }}>
                            <strong>{numQuestions}</strong> preguntas por partida
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Fade>

          {/* Last 5 Sessions - con diseño mejorado */}
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
                  variant="h5"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AccessTimeIcon /> Últimas 5 sesiones de juego
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
                    {getLastFiveSessions().map((session, index) => (
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
                            cursor: "pointer", // Añadir cursor pointer para indicar que es clickeable
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
                Detalles de la sesión del {formatDate(selectedSession.createdAt).split(" ")[0]}
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
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
    </ConfigContext.Provider>
  )
}

export default HomePage
