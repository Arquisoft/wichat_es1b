"use client"

import { createContext, useContext, useState, useEffect } from "react"
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  Divider,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import AccessTimeIcon from "@mui/icons-material/AccessTime"

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

  // Colors for the pie chart
  const COLORS = ["#4caf50", "#f44336"]

  // Fetch session data on component mount
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`${apiEndpoint}/get-sessions/${username}`)
        setSessionData(response.data)
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

  const handleShowGame = () => {
    const path = "/Game"

    // Configuración del juego
    const gameConfig = {
      numQuestions: numQuestions,
      timePerQuestion: timePerQuestion,
    }

    navigate(path, { state: { gameConfig } })
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

  // Get the last 5 sessions
  const getLastFiveSessions = () => {
    return sessionData.slice(0, 5)
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
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: theme.shadows[2],
          }}
        >
          <Typography variant="body2" color="textPrimary">
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

  return (
    <ConfigContext.Provider value={configValue}>
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
        {/* Welcome Message */}
        <Box
          sx={{
            mb: 4,
            textAlign: "center",
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            ¡Bienvenido a WiChat, {username}!
          </Typography>
          <Typography variant="subtitle1">Revisa tus estadísticas y comienza una nueva partida</Typography>
        </Box>

        {/* Statistics and New Game Button in the same container */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                Estadísticas Totales
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            {/* Chart */}
            <Grid item xs={12} md={8}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                  <Typography>Cargando estadísticas...</Typography>
                </Box>
              ) : sessionData.length > 0 ? (
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        mr: 2,
                      }}
                    >
                      <Typography variant="h6" color="success.main">
                        {getTotalStats()[0]?.value || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Correctas
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                      }}
                    >
                      <Typography variant="h6" color="error.main">
                        {getTotalStats()[1]?.value || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Incorrectas
                      </Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getTotalStats()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getTotalStats().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    Total de preguntas respondidas: {totalQuestions}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                  <Typography>No hay datos de sesiones disponibles</Typography>
                </Box>
              )}
            </Grid>

            {/* New Game Button */}
            <Grid item xs={12} md={4} sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="h6" gutterBottom align="center" fontWeight="medium">
                  ¿Listo para poner a prueba tus conocimientos?
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleShowGame}
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    mt: 2,
                    borderRadius: 8,
                    fontWeight: "bold",
                    textTransform: "none",
                    fontSize: "1.1rem",
                    boxShadow: theme.shadows[4],
                    "&:hover": {
                      boxShadow: theme.shadows[8],
                      transform: "translateY(-2px)",
                      transition: "all 0.3s",
                    },
                  }}
                >
                  Nueva partida
                </Button>
                <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {timePerQuestion} segundos por pregunta
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      {numQuestions} preguntas por partida
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Last 5 Sessions with improved aesthetics */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            Últimas 5 sesiones de juego
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {loading ? (
            <Typography>Cargando sesiones...</Typography>
          ) : sessionData.length > 0 ? (
            <Grid container spacing={2}>
              {getLastFiveSessions().map((session, index) => (
                <Grid item xs={12} key={session._id}>
                  <Card
                    variant="outlined"
                    sx={{
                      mb: 1,
                      transition: "all 0.3s",
                      "&:hover": {
                        boxShadow: theme.shadows[3],
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                      },
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 40,
                                height: 40,
                                mr: 2,
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" color="text.primary">
                                Sesión {index + 1}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(session.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              <strong>{session.score}</strong> correctas
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CancelOutlinedIcon color="error" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              <strong>{session.wrongAnswers}</strong> incorrectas
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: alpha(theme.palette.info.main, 0.05),
                borderRadius: 2,
              }}
            >
              <Typography>No hay sesiones de juego registradas</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ¡Comienza una nueva partida para ver tus estadísticas aquí!
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </ConfigContext.Provider>
  )
}

export default HomePage

