import { useState, useEffect, useRef } from "react"
import {
  Container,
  Paper,
  AppBar,
  Toolbar,
  Button,
  Grid,
  Typography,
  LinearProgress,
  Box,
  alpha,
  Fade,
  useTheme,
} from "@mui/material"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import Chat from "../chatbot/chat"

// Iconos
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import QuizIcon from "@mui/icons-material/Quiz"
import HomeIcon from "@mui/icons-material/Home"
import RefreshIcon from "@mui/icons-material/Refresh"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000"

const Game = () => {
  console.log(apiEndpoint);
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const { gameConfig } = location.state || { gameConfig: { numQuestions: 10, timePerQuestion: 30, difficulty:"Normal", category: "All" } }

  // Estado del juego
  const [question, setQuestion] = useState("")
  const questionRef = useRef("");
  const [image, setImage] = useState("")
  const [options, setOptions] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [score, setScore] = useState(0)
  const [isFinished, setFinished] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState("")
  const correctAnswerRef = useRef("");
  const [questionCounter, setQuestionCounter] = useState(1)
  const [loading, setLoading] = useState(true)

  // Configuración de las partidas
  const [numberOfQuestions, setNumberOfQuestions] = useState(gameConfig.numQuestions)
  const [questionsToAnswer, setQuestionsToAnswer] = useState(gameConfig.numQuestions)

  // Estados para el temporizador - Implementación mejorada
  const [timeLeft, setTimeLeft] = useState(gameConfig.timePerQuestion || 30)
  const timerRef = useRef(null)
  const [timeLimit, setTimeLimit] = useState(gameConfig.timePerQuestion || 30)

  // Guardar las preguntas de la sesión
  const [sessionQuestions, setSessionQuestions] = useState([])

  const [difficulty, setDifficulty] = useState(gameConfig.difficulty || "Normal")

  // Gradientes para fondos
  const primaryGradient = "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)"
  const secondaryGradient = "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"

  // Funciones del temporizador - Implementación mejorada
  const startTimer = () => {
    // Limpiar cualquier temporizador existente
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Establecer el tiempo restante al límite actual
    setTimeLeft(timeLimit)

    // Iniciar un nuevo temporizador
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Tiempo agotado
          clearInterval(timerRef.current)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleTimeUp = () => {
    // Detener el temporizador
    stopTimer()

    // Marcar la respuesta como incorrecta
    setSelectedAnswer("Tiempo agotado")
    setIsCorrect(false)
    setQuestionsToAnswer((q) => q - 1)

    // Guardar la pregunta en la sesión
    setSessionQuestions((prev) => [
      ...prev,
      {
        question: questionRef.current,
        correctAnswer: correctAnswerRef.current,
        userAnswer: "Tiempo agotado",
        difficulty: difficulty,
        category: localStorage.getItem("gameCategory") || "All",
      },
    ])

    setTimeout(async () => {
      if (questionCounter < numberOfQuestions) {
        await getQuestion()
      } else {
        handleEndGame()
      }
    }, 2000)
  }

  useEffect(() => {
    correctAnswerRef.current = correctAnswer;
  }, [correctAnswer]);
  
  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  // Limpiar el temporizador cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const getQuestion = async () => {
    try {
      const category = localStorage.getItem("gameCategory") || "All"
      const response = await axios.get(`${apiEndpoint}/nextQuestion?category=${encodeURIComponent(category)}`)
      const { questionObject, questionImage, correctAnswer, answerOptions } = response.data
      setQuestion(questionObject)
      setImage(questionImage)
      setOptions(answerOptions)
      setCorrectAnswer(correctAnswer)
      setSelectedAnswer(null)
      setIsCorrect(null)

      // Iniciar el temporizador para la nueva pregunta
      startTimer()

      setQuestionCounter((qc) => qc + 1)
    } catch (error) {
      console.error("Error fetching the next question:", error)
    }
  }

  const handleNewGame = async (category) => {
    setLoading(true)
    try {
      localStorage.setItem("gameCategory", category || "All")

      setFinished(false)
      setScore(0)
      setQuestionCounter(1)
      setSelectedAnswer(null)
      setIsCorrect(null)

      setSessionQuestions([])

      // Send the category to the backend
      const response = await axios.post(`${apiEndpoint}/startGame`, {
        category: category || null, // Pass the category or null for all categories
      })

      if (response.data.firstQuestion) {
        const question = response.data.firstQuestion
        setQuestion(question.questionObject)
        setImage(question.questionImage)
        setCorrectAnswer(question.correctAnswer)
        setOptions(question.answerOptions)

        // Iniciar el temporizador para la primera pregunta
        startTimer()
      } else {
        console.error("No question received")
      }
    } catch (error) {
      console.error("Error starting new game:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOptionClick = (option) => {
    // Primero, parar el temporizador
    stopTimer()

    setSelectedAnswer(option) // Guarda la opción seleccionada

    let updatedScore = score
    if (option === correctAnswer) {
      setIsCorrect(true)
      updatedScore = score + 1
      setScore(updatedScore)
    } else {
      setIsCorrect(false)
    }

    // Guardar la pregunta en la sesión
    setSessionQuestions((prev) => [
      ...prev,
      {
        question: question,
        correctAnswer: correctAnswer,
        userAnswer: option,
        difficulty: difficulty,
        category: localStorage.getItem("gameCategory") || "All",
      },
    ])

    // Espera 2 segundos antes de mostrar una nueva pregunta y comprueba si acabo la partida
    setTimeout(async () => {
      if (questionCounter < numberOfQuestions) {
        await getQuestion()
      } else {
        handleEndGame()
      }
    }, 2000)
  }

  // Finalizar partida
  const handleEndGame = () => {
    // Detener el temporizador y marcar la partida como finalizada
    stopTimer()
    setFinished(true)
    setTimeLeft(0)

    // Resetear las respuestas seleccionadas
    setSelectedAnswer(null)
    setIsCorrect(null)
  }

  useEffect(() => {
    if (isFinished) {
      const falladas = numberOfQuestions - score

      // Asegurarse de que sessionQuestions tenga datos válidos
      if (sessionQuestions.length > 0) {
        axios
          .post(`${apiEndpoint}/save-session`, {
            questions: sessionQuestions,
            userid: localStorage.getItem("username"),
            score: score,
            wrongAnswers: falladas,
            difficulty: difficulty,
            category: localStorage.getItem("gameCategory") || "All",
          })
          .then((response) => {
            console.log("Sesión guardada exitosamente:", response.data)
          })
          .catch((error) => {
            console.error("Error al guardar la sesión:", error)
          })
      } else {
        console.warn("No hay preguntas en la sesión para guardar")
      }
    }
  }, [isFinished, numberOfQuestions, score, sessionQuestions, difficulty])

  const handleGoToProfile = () => {
    navigate("/Profile")
  }

  const handleHome = () => {
    navigate("/Home")
  }

  const isGameFinished = () => {
    return questionCounter > numberOfQuestions
  }

  // Comprueba cada pregunta si acabo la partida o no
  useEffect(() => {
    if (isGameFinished() && !isFinished) {
      setTimeout(() => {
        handleEndGame()
      }, 1000)
    }
  }, [questionCounter, numberOfQuestions, isFinished])

  const handleShowGame = async (categoryN = "All") => {
    await handleNewGame(categoryN)
  }

  useEffect(() => {
      const fetchGameData = async () => {
          await handleShowGame(location.state?.gameConfig?.category);
      };  
      fetchGameData();
  }, [location.state]);

  const wrongAnswers = numberOfQuestions - score

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
        pt: 4,
        pb: 10,
      }}
    >
      <Container maxWidth="lg">
        {!isFinished && (
          <Fade in={true} timeout={800}>
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
              {/* Barra de menú */}
              <AppBar
                position="static"
                sx={{
                  background: primaryGradient,
                  borderRadius: "4px 4px 0 0",
                  boxShadow: "none",
                }}
              >
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button color="inherit" onClick={handleHome} startIcon={<HomeIcon />} sx={{ fontWeight: "bold" }}>
                    Abandonar
                  </Button>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                    WiChat - Juego
                  </Typography>
                  <Button
                    color="inherit"
                    onClick={() => handleNewGame(location.state?.gameConfig?.category || "All")}
                    startIcon={<RefreshIcon />}
                    sx={{ fontWeight: "bold" }}
                  >
                    Reiniciar
                  </Button>
                </Toolbar>
              </AppBar>

              {loading ? (
                <Box
                  sx={{
                    padding: "3rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "300px",
                  }}
                >
                  <img
                    src="https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca_w200.gif"
                    alt="Cargando preguntas..."
                    style={{ width: "150px", marginBottom: "1.5rem" }}
                  />
                  <Typography variant="h6" color="primary">
                    Cargando preguntas...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 4 }}>
                  {/* Tarjetas de información del juego */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: alpha(theme.palette.primary.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <QuizIcon color="primary" sx={{ fontSize: 28 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Preguntas restantes
                          </Typography>
                          <Typography variant="h5" color="primary" fontWeight="bold">
                            {numberOfQuestions - questionCounter}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: alpha(theme.palette.success.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <EmojiEventsIcon color="success" sx={{ fontSize: 28 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Puntuación
                          </Typography>
                          <Typography variant="h5" color="success.main" fontWeight="bold">
                            {score}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: alpha(theme.palette.warning.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <AccessTimeIcon color={timeLeft <= 5 ? "error" : "warning"} sx={{ fontSize: 28 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Tiempo restante
                          </Typography>
                          <Typography
                            variant="h5"
                            color={timeLeft <= 5 ? "error.main" : "warning.main"}
                            fontWeight="bold"
                          >
                            {timeLeft}s
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Barra de progreso del temporizador */}
                  <LinearProgress
                    variant="determinate"
                    value={(timeLeft / timeLimit) * 100}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      mb: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: timeLeft <= 5 ? theme.palette.error.main : theme.palette.primary.main,
                        borderRadius: 5,
                      },
                    }}
                  />

                  {/* Tarjeta de pregunta */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      mb: 4,
                      background: "white",
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      data-testid="question"
                      variant="h5"
                      fontWeight="medium"
                      color="primary.dark"
                      sx={{ mb: 3 }}
                    >
                      {question}
                    </Typography>

                    {/* Imagen de la pregunta */}
                    {image && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 3,
                          borderRadius: 3,
                          overflow: "hidden",
                          border: "1px solid rgba(0, 0, 0, 0.05)",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt="Imagen de la pregunta"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "300px",
                            objectFit: "contain",
                            pointerEvents: "none",
                            userSelect: "none",
                          }}
                        />
                      </Box>
                    )}

                    {/* Opciones de respuesta */}
                    <Grid container spacing={2}>
                      {options.map((option, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            onClick={() => handleOptionClick(option)}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              borderWidth: 2,
                              fontSize: "1rem",
                              fontWeight: "medium",
                              textTransform: "none",
                              height: "100%",
                              justifyContent: "flex-start",
                              backgroundColor: selectedAnswer
                                ? selectedAnswer === option
                                  ? isCorrect
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : alpha(theme.palette.error.main, 0.1)
                                  : option === correctAnswer && selectedAnswer !== null
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : "transparent"
                                : "transparent",
                              borderColor: selectedAnswer
                                ? selectedAnswer === option
                                  ? isCorrect
                                    ? theme.palette.success.main
                                    : theme.palette.error.main
                                  : option === correctAnswer && selectedAnswer !== null
                                    ? theme.palette.success.main
                                    : theme.palette.divider
                                : theme.palette.divider,
                              color: selectedAnswer
                                ? selectedAnswer === option
                                  ? isCorrect
                                    ? theme.palette.success.main
                                    : theme.palette.error.main
                                  : option === correctAnswer && selectedAnswer !== null
                                    ? theme.palette.success.main
                                    : theme.palette.text.primary
                                : theme.palette.text.primary,
                              "&:hover": {
                                backgroundColor: selectedAnswer ? "inherit" : alpha(theme.palette.primary.main, 0.05),
                                borderColor: selectedAnswer ? "inherit" : theme.palette.primary.main,
                              },
                              transition: "all 0.3s ease",
                            }}
                            disabled={selectedAnswer !== null}
                          >
                            {option}
                            {selectedAnswer === option && isCorrect && (
                              <CheckCircleOutlineIcon color="success" sx={{ ml: "auto" }} />
                            )}
                            {selectedAnswer === option && isCorrect === false && (
                              <CancelOutlinedIcon color="error" sx={{ ml: "auto" }} />
                            )}
                            {option === correctAnswer && selectedAnswer !== null && selectedAnswer !== option && (
                              <CheckCircleOutlineIcon color="success" sx={{ ml: "auto" }} />
                            )}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* Componente Chat */}
                  
                  <Chat correctAnswer={correctAnswer} question={question} username={localStorage.getItem("username")} />
                  
                </Box>
              )}
            </Paper>
          </Fade>
        )}

        {isFinished && (
          <Fade in={true} timeout={800}>
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
                  background: primaryGradient,
                  color: "white",
                  textAlign: "center",
                }}
              >
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  ¡Partida finalizada!
                </Typography>
                <Typography variant="h6">Gracias por jugar</Typography>
              </Box>

              <Box sx={{ p: 4 }}>
                <Grid container spacing={4} sx={{ mb: 3 }}>
                  {/* Gráfico de resultados */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: "white",
                        border: "1px solid rgba(0, 0, 0, 0.05)",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="primary"
                        fontWeight="bold"
                        sx={{ mb: 2, textAlign: "center" }}
                      >
                        Resultados
                      </Typography>

                      <Box sx={{ height: 300 }}>
                        {score > 0 || wrongAnswers > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Correctas", value: score || 0 },
                                  { name: "Incorrectas", value: wrongAnswers || 0 },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                innerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                paddingAngle={5}
                              >
                                <Cell fill="#4CAF50" stroke="none" />
                                <Cell fill="#F44336" stroke="none" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: "center", mt: 5 }}
                          >
                            No hay datos disponibles
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Detalles de puntuación */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: "white",
                        border: "1px solid rgba(0, 0, 0, 0.05)",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 3, textAlign: "center" }}>
                        Detalles
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            mb: 2,
                          }}
                        >
                          <CheckCircleOutlineIcon color="success" sx={{ mr: 2, fontSize: 28 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Respuestas correctas
                            </Typography>
                            <Typography variant="h5" color="success.main" fontWeight="bold">
                              {score}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            mb: 2,
                          }}
                        >
                          <CancelOutlinedIcon color="error" sx={{ mr: 2, fontSize: 28 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Respuestas incorrectas
                            </Typography>
                            <Typography variant="h5" color="error.main" fontWeight="bold">
                              {wrongAnswers}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                          }}
                        >
                          <QuizIcon color="info" sx={{ mr: 2, fontSize: 28 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Total de preguntas
                            </Typography>
                            <Typography variant="h5" color="info.main" fontWeight="bold">
                              {numberOfQuestions}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Botones de acción */}
                      <Box sx={{ mt: "auto" }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={handleHome}
                              startIcon={<HomeIcon />}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                textTransform: "none",
                                background: primaryGradient,
                                boxShadow: "0 4px 10px rgba(25, 118, 210, 0.3)",
                                "&:hover": {
                                  boxShadow: "0 6px 15px rgba(25, 118, 210, 0.4)",
                                },
                              }}
                            >
                              Menú principal
                            </Button>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={handleGoToProfile}
                              startIcon={<AccountCircleIcon />}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                textTransform: "none",
                                background: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
                                boxShadow: "0 4px 10px rgba(156, 39, 176, 0.3)",
                                "&:hover": {
                                  boxShadow: "0 6px 15px rgba(156, 39, 176, 0.4)",
                                },
                              }}
                            >
                              Perfil
                            </Button>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => handleNewGame(location.state?.gameConfig?.category || "All")}
                              startIcon={<RefreshIcon />}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                textTransform: "none",
                                background: secondaryGradient,
                                boxShadow: "0 4px 10px rgba(245, 124, 0, 0.3)",
                                "&:hover": {
                                  boxShadow: "0 6px 15px rgba(245, 124, 0, 0.4)",
                                },
                              }}
                            >
                              Jugar de nuevo
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  )
}

export default Game
