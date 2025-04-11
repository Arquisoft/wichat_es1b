import React, { useEffect, useState } from 'react';
import { getPlayerLevel } from '../../utils';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Fade,
  Skeleton,
  alpha,
  useTheme,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Collapse,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import QuizIcon from "@mui/icons-material/Quiz"
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import StarIcon from "@mui/icons-material/Star"
import CloseIcon from "@mui/icons-material/Close"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import './Profile.css';
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

const Profile = () => {
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const theme = useTheme();

  const [sessionData, setSessionData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Constante para ordenar las sesiones
  const [sortBy, setSortBy] = useState('date');

  // Constantes para la visualización de sesiónes paginadas
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [sessionsPerPage] = useState(5); // Número de sesiones por página

  // Constantes para gestionar el estado de las sesiones 
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Colors for the pie chart - más vibrantes y con mejor contraste
  const COLORS = ["#4CAF50", "#FF5252"]

  // Constante para el control del menú
  const [anchorEl, setAnchorEl] = useState(null); 

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8005";

  // Gradientes para fondos
  const primaryGradient = "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)"
  const secondaryGradient = "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"

  // Recuperar las sesiones del usuario
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`${apiEndpoint}/get-user-sessions/${username}`);
        let sortedSessions = response.data.sessions;

        if (sortBy === 'date') {
          sortedSessions = sortedSessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        else if (sortBy === 'score') {
          sortedSessions = sortedSessions.sort((a, b) => {
            if (b.score == a.score) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            else {
              return b.score - a.score;
            }
          });
        }

        setSessionData(sortedSessions);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener las sesiones:", error);
        setLoading(false);
      }
    };

    if (username) {
      fetchSessionData();
    }
  }, [username, sortBy]);

  // Calcular estadísticas generales
  const getTotalStats = () => {
    let totalGames = sessionData.length;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let successRate = 0;

    sessionData.forEach(session => {
      totalQuestions += session.score + session.wrongAnswers;
      totalCorrect += session.score;
      totalWrong += session.wrongAnswers;
    });

    successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalGames,
      totalQuestions,
      totalCorrect,
      totalWrong,
      successRate,
    };
  };
  const stats = getTotalStats();

    const playerLevel = getPlayerLevel(stats.totalQuestions)

  // Formatear Fecha
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

    // Calcular la tasa de acierto
    const getSuccessRate = () => {
        if (sessionData.length === 0) return 0

        const totalCorrect = sessionData.reduce((sum, session) => sum + session.score, 0)
        const totalQuestions = sessionData.reduce((sum, session) => sum + session.score + session.wrongAnswers, 0)

        return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
    }

    const successRate = getSuccessRate();

    // Paginación de las sesiones
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = sessionData.slice(indexOfFirstSession, indexOfLastSession);

  // Moverse a la siguiente página de la paginación
  const handleNextPage = () => {
    if (currentPage * sessionsPerPage < sessionData.length) {
      setCurrentPage(currentPage + 1);
    }
  }

  // Moverse a la anterior página de la paginación
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Abrir el menú de selección
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Cerrar el menú de selección
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Cerrar el menú después de seleccionar
  const handleSortChange = (value) => {
    setSortBy(value);
    setAnchorEl(null);
  };

  // Función para cerrar sesión y redirigir al login
  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate('/');
  };

  // Función para volver a la página principal
  const handleHome = () => {
    navigate('/Home');
  };

  const [showMessage, setShowMessage] = useState("");

  // Mostrar los detalles de la sesión
  const handleToggleQuestionDetails = (sessionIndex) => {
    setExpandedQuestion(expandedQuestion === sessionIndex ? null : sessionIndex);
  };

  // Calculate total questions answered
  const totalQuestions = sessionData.reduce((sum, session) => sum + session.score + session.wrongAnswers, 0)

  // Función para abrir detalles de la sesión
  const handleOpenSessionDetails = (session) => {
    setSelectedSession(session);
    setOpenSessionDialog(true);
  };

  // Función para cerrar el dialogo
  const handleCloseSessionDialog = () => {
    setOpenSessionDialog(false);
    setSelectedSession(null);
    setExpandedQuestion(null);
  };

    const getGreetingMessage = () => {
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) {
            return "¡Buenos días";
        } else if (currentHour >= 12 && currentHour < 20) {
            return "¡Buenas tardes";
        } else {
            return "¡Buenas noches";
        }
    };

    const getChartData = () => {
        const stats = getTotalStats();
        return [
            { name: "Correctas", value: stats.totalCorrect },
            { name: "Incorrectas", value: stats.totalWrong }
        ];
    };
  
  return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
          pt: 4,
          pb: 10
        }}
      >

        <Container maxWidth="lg">
          {/* Menú Superior */}
          <AppBar
            position="sticky"
            sx={{
              background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
              marginBottom: '20px',
              borderRadius: 4,
              boxShadow: 'none',
            }}
          >
            <Toolbar
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                WiChat - Perfil
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <MenuItem
                  onClick={handleHome}
                  onMouseEnter={() => setShowMessage("Ir a la página Principal")}
                  onMouseLeave={() => setShowMessage("")}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <HomeIcon sx={{ mr: 1 }} />
                </MenuItem>

                <MenuItem
                  onClick={handleLogout}
                  onMouseEnter={() => setShowMessage("Cerrar sesión")}
                  onMouseLeave={() => setShowMessage("")}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <ExitToAppIcon sx={{ mr: 1 }} />
                </MenuItem>

                {showMessage && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '90%',
                      left: '0%',
                      transform: 'translateX(10px)',
                      bgcolor: 'rgba(25,118,210,0.7)',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      opacity: 1,
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  >
                    {showMessage}
                  </Box>
                )}
              </Box>
            </Toolbar>
          </AppBar>

          {/* Cabecera */}
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
                  {getGreetingMessage()}, {username}!
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
                Estas son las estadísticas de tu perfil
              </Typography>

              {/* Nivel del jugador */}
              {!loading && stats.totalGames > 0 && (
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

          {/* Panel Estadísticas */}
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
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
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


                <Box
                    sx={{
                        p: 4,
                        display: "flex", // Use flexbox for centering
                        flexDirection: "column", // Stack children vertically
                        alignItems: "center", // Center horizontally
                        justifyContent: "center", // Center vertically
                    }}
                >
                    <Grid container spacing={4} justifyContent="center" alignItems="center">
                        {/* Chart - con diseño mejorado */}
                        <Grid
                            item
                            xs={12}
                            md={8}
                            sx={{
                                display: "flex", // Use flexbox for centering
                                flexDirection: "column", // Stack children vertically
                                alignItems: "center", // Center horizontally
                                justifyContent: "center", // Center vertically
                            }}
                        >
                            {loading ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 3,
                                        height: 300,
                                        p: 3,
                                        alignItems: "center", // Center horizontally
                                        justifyContent: "center", // Center vertically
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
                                                {stats.totalCorrect}
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
                                                {stats.totalWrong}
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
                                                    data={getChartData()}
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
                                                    {getChartData().map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                            stroke="none"
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
                    </Grid>
                </Box>
            </Paper>
          </Fade>

          {/* Panel Sesiones */}
          <Fade in={true} timeout={1000}>
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
                  <AccessTimeIcon /> Tus Sesiones
                </Typography>

                {!loading && stats.totalGames > 0 && (
                  /* Menú desplegable */
                  <Box sx={{ p: 4 }}>
                    <IconButton
                      onClick={handleMenuClick}
                      sx={{
                      width: 190,
                      height: 40,
                      borderRadius: 2,
                      padding: 2,
                      minWidth: 0,
                    }}
                    >
                      <Typography variant="body2" color="primary">Ordenar por: {sortBy === 'date' ? 'Fecha' : 'Puntuación'}</Typography>
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      PaperProps={{
                        sx: {
                          width: 180,
                          borderRadius: 2,
                          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                          '& .MuiMenuItem-root': {
                            padding: '10px 15px',
                            fontSize: '0.875rem',
                            color: "primary",
                          },
                          '& .MuiMenuItem-root:hover': {
                            backgroundColor: alpha(theme.palette.primary.light, 0.1),
                          },
                        },
                      }}
                    >
                      <MenuItem onClick={() => handleSortChange('date')}>Fecha</MenuItem>
                      <MenuItem onClick={() => handleSortChange('score')}>Puntuación</MenuItem>
                    </Menu>

                    <Chip
                      label={`Total: ${stats.totalGames} sesiones`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                )}
              </Box>

              {/* Mostrar sesiones */}
              <Box sx={{ p: 4 }}>
                {loading ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} variant="rounded" height={100} />
                    ))}
                  </Box>
                ) : stats.totalGames > 0 ? (
                  <Box sx={{ p: 4 }}>
                    <Grid container spacing={2}>
                      {currentSessions.map((session, index) => (
                        <Grid item xs={12} key={session._id}>
                          <Paper 
                            elevation={1}
                            className="session-card"
                            onClick={() => handleOpenSessionDetails(session)}
                            sx={{
                              p: 0,
                              mb: 1,
                              borderRadius: 3,
                              overflow: "hidden",
                              border: "1px solid rgba(0, 0, 0, 0.05)",
                              transition: "all 0.3s",
                              cursor: "pointer",
                              "&:hover": {
                                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.05)",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            <Grid container>
                              {/* Número de sesión */}
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
                                {indexOfFirstSession + index + 1}
                              </Grid>

                              {/* Contenido de la sesión */}
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

                    {/* Paginación */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                      <Button variant="outlined" onClick={handlePrevPage} disabled={currentPage === 1}>Anterior</Button>
                      <Typography variant="body2">{`Página ${currentPage} de ${Math.ceil(stats.totalGames/ sessionsPerPage)}`}</Typography>
                      <Button variant="outlined" onClick={handleNextPage} disabled={currentPage * sessionsPerPage >= stats.totalGames}>Siguiente</Button>
                    </Box>

                  </Box>
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
                    <QuizIcon sx={{ fontSize: 60, color: alpha(theme.palette.info.main, 0.3), mb: 2 }} />
                    <Typography>No hay sesiones de juego registradas</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ¡Comienza una nueva partida para ver tus estadísticas aquí!
                    </Typography>
                  </Box>
                )}
               </Box>
            </Paper>
          </Fade>
        </Container>

        <Dialog
          open={openSessionDialog}
          onClose={handleCloseSessionDialog}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadows: "0 10px 40px rgba(0, 0, 0, 0.1)",
            }
          }}
        >
          {selectedSession && (
            <>
              {/* Cabecera de la sesión */}
              <DialogTitle 
                sx={{
                  display: "flex",
                  justifyContent: "spcae-between",
                  alignItems: "center",
                  p: 3,
                  background: primaryGradient,
                  color: "white",
                }}
              >
                <Typography variant="h6" component="div" fontWeight="bold">
                    Detalles de la sesión del {formatDate(selectedSession.createdAt).split(" ")[0]} con dificultad {selectedSession.difficulty}
                </Typography>
                <IconButton edge="end" color="inherit" onClick={handleCloseSessionDialog} aria-label="close">
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              {/* Contenido de la sesión */}
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
                        <CheckCircleOutlineIcon color="error" sx={{ mr: 1 }} />
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
                          onClick={() => handleToggleQuestionDetails(index)}
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
              <DialogActions>
                <Button onClick={handleCloseSessionDialog} color="primary">Cerrar</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
  );
};

export default Profile;