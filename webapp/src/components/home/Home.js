import React, { useState } from "react"
import { getPlayerLevel } from '../../utils';
import { createContext, useContext, useEffect } from "react"
import { useLocation } from "react-router-dom";
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
import "./Home.css"

const ConfigContext = createContext()

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000"

export const useConfig = () => useContext(ConfigContext)

const HomePage = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem("username")
  const theme = useTheme()

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

  // Estado para el menú desplegable
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  const [difficulty, setDifficulty] = useState("Normal")
  const [anchorElDifficulty, setAnchorElDifficulty] = useState(null)
  const openDifficultyMenu = Boolean(anchorElDifficulty)

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

        // Get top 3 users
        setLeaderboardData(sortedUsers.slice(0, 3))
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
    const location = useLocation();
    useEffect(() => {
        if (location.state?.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [location]);

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
                    onClick={() => document.getElementById("topPlayers").scrollIntoView({ behavior: "smooth" })} //Not a typo, the anchor is the same for 'play'
                    onMouseEnter={() => setShowMessage("Jugar")}
                    onMouseLeave={() => setShowMessage("")}
                    sx={{ display: "flex", alignItems: "center" }}
                >
                    <PlayArrowIcon sx={{ mr: 1 }} />Jugar
                </MenuItem>

                <MenuItem
                    onClick={() => document.getElementById("recentGames").scrollIntoView({ behavior: "smooth" })}
                    onMouseEnter={() => setShowMessage("Ver las partidas recientes")}
                  onMouseLeave={() => setShowMessage("")}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                    <HistoryIcon sx={{ mr: 1 }} />Historial
                </MenuItem>

                <MenuItem
                    onClick={() => document.getElementById("topPlayers").scrollIntoView({ behavior: "smooth" })}
                    onMouseEnter={() => setShowMessage("Ver ranking de jugadores")}
                    onMouseLeave={() => setShowMessage("")}
                    sx={{ display: "flex", alignItems: "center" }}
                >
                    <ExitToAppIcon sx={{ mr: 1 }} />Ranking
                </MenuItem>

                <MenuItem
                  onClick = {handleGoToProfile}
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
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
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
                  id = "topPlayers"
                  variant="h5"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <EmojiEventsIcon /> ¡Prepárate para jugar!
                </Typography>
              </Box>

              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  {/* Leaderboard - replacing chart */}
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
                    ) : (
                      <Box>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color="primary"
                          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <EmojiEventsIcon /> Top 3 Jugadores
                        </Typography>
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
                          {leaderboardData.length > 0 ? (
                            <Box>
                              {leaderboardData.map((user, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 3,
                                    bgcolor:
                                      index === 0
                                        ? alpha("#FFD700", 0.1)
                                        : index === 1
                                          ? alpha("#C0C0C0", 0.1)
                                          : alpha("#CD7F32", 0.1),
                                    border: `1px solid ${
                                      index === 0
                                        ? alpha("#FFD700", 0.3)
                                        : index === 1
                                          ? alpha("#C0C0C0", 0.3)
                                          : alpha("#CD7F32", 0.3)
                                    }`,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: "bold",
                                      fontSize: "1.2rem",
                                      mr: 2,
                                      bgcolor: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32",
                                      color: index === 0 ? "#000" : "#fff",
                                    }}
                                  >
                                    {index + 1}
                                  </Box>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                      {user.username}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                      <Typography variant="body2" color="text.secondary">
                                          <strong>Precisión:</strong> {Math.round(user.AccuracyRate)}%
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        <strong>Correctas:</strong> {user.TotalWellAnswers}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        <strong>Incorrectas:</strong> {user.TotalWrongAnswers}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: 60,
                                      height: 60,
                                      borderRadius: "50%",
                                      bgcolor: "white",
                                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                    }}
                                  >
                                    <Typography
                                      variant="h5"
                                      fontWeight="bold"
                                      sx={{
                                        color:
                                          user.AccuracyRate >= 70
                                            ? "success.main"
                                            : user.AccuracyRate >= 40
                                              ? "warning.main"
                                              : "error.main",
                                      }}
                                    >
                                      {Math.round(user.AccuracyRate)}%
                                    </Typography>
                                  </Box>
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
                                sx={{ fontSize: 60, color: alpha(theme.palette.info.main, 0.3), mb: 2 }}
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

                  {/* Keep the New Game Button section unchanged */}
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

                      <Box sx={{ mt: 0.5 }}></Box>

                      <Typography
                        variant="h6"
                        gutterBottom
                        align="center"
                        sx={{
                          mb: 1,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        Seleccionar dificultad
                      </Typography>

                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleOpenDifficultyMenu}
                        endIcon={<KeyboardArrowDownIcon />}
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
                        {difficulty}
                      </Button>

                      <Menu
                        id="difficulty-menu"
                        anchorEl={anchorElDifficulty}
                        open={openDifficultyMenu}
                        onClose={handleCloseDifficultyMenu}
                        MenuListProps={{
                          "aria-labelledby": "difficulty-button",
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

                      <Box sx={{ mt: 2.5 }}></Box>

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
                        sx={{ mt: 2 }}
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
                        <MenuItem onClick={() => handleShowGame("Geografia", difficulty)} sx={{ py: 1.5 }}>
                          <ListItemIcon>
                            <PublicIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText>Geografía</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleShowGame("Cultura", difficulty)} sx={{ py: 1.5 }}>
                          <ListItemIcon>
                            <TheaterComedyIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText>Cultura</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleShowGame("Personajes", difficulty)} sx={{ py: 1.5 }}>
                          <ListItemIcon>
                            <PersonIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText>Personajes</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleShowGame("Videojuegos", difficulty)} sx={{ py: 1.5 }}>
                          <ListItemIcon>
                            <SportsEsportsIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText>Videojuegos</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleShowGame("Aviones", difficulty)} sx={{ py: 1.5 }}>
                          <ListItemIcon>
                            <FlightIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText>Aviones</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => handleShowGame("All", difficulty)} sx={{ py: 1.5 }}>
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
                  id = "recentGames"
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
