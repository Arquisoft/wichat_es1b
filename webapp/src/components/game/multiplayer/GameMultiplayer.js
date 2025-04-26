"use client"

import { useState, useEffect, useRef } from "react"
import {
    Container,
    Paper,
    AppBar,
    Toolbar,
    Typography,
    LinearProgress,
    Box,
    alpha,
    Fade,
    useTheme,
    Grid,
    Button,
} from "@mui/material"
import { useNavigate, useLocation } from "react-router-dom";
import MultiplayerService from "./Multiplayer"

// Iconos
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import QuizIcon from "@mui/icons-material/Quiz"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000"

const GameMultiplayer = () => {
    const location = useLocation()
    const theme = useTheme()
    const {gameConfig} = location.state || {gameConfig: {questions: []}}
    const multiplayerService = MultiplayerService.getInstance()
    const navigate = useNavigate();

    // Estado del juego
    const [questions, setQuestions] = useState(gameConfig?.questions || [])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [isCorrect, setIsCorrect] = useState(null)
    const [score, setScore] = useState(0)
    const [isFinished, setIsFinished] = useState(false)
    const [loading, setLoading] = useState(false)
    const [answeredQuestions, setAnsweredQuestions] = useState([])
    const [gameStartTime] = useState(Date.now())
    const [waitingForResults, setWaitingForResults] = useState(false);

    // Add a ref to track the current score value
    const currentScoreRef = useRef(0)

    // Update the ref whenever score changes
    useEffect(() => {
        currentScoreRef.current = score
    }, [score])

    // Temporizador
    const [timeLeft, setTimeLeft] = useState(60) // TEMPORIZADOR
    const timerRef = useRef(null)

    const currentQuestion = questions[currentQuestionIndex]

    // Gradientes para fondos
    const primaryGradient = "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)"
    const secondaryGradient = "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"

    // Iniciar temporizador
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                    handleEndGame()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (!multiplayerService.socket) return;

        const handleAllPlayersFinished = ({winner, results}) => {
            setWaitingForResults(false);
            navigate("/resultsMultiplayer", {state: {winner, results}});
        };

        multiplayerService.socket.on("allPlayersFinished", handleAllPlayersFinished);

        return () => {
            multiplayerService.socket.off("allPlayersFinished", handleAllPlayersFinished);
        };
    }, [navigate, multiplayerService.socket]);

    const handleOptionClick = (option) => {
        setSelectedAnswer(option)
        const isAnswerCorrect = option === currentQuestion.correctAnswer

        // Calculate new score
        const newScore = isAnswerCorrect ? score + 1 : score

        if (isAnswerCorrect) {
            setIsCorrect(true)
            setScore(newScore)  // Update state with new score
        } else {
            setIsCorrect(false)
        }

        // Store current question data
        setAnsweredQuestions(prev => [...prev, {
            question: currentQuestion.question,
            correctAnswer: currentQuestion.correctAnswer,
            userAnswer: option,
            isCorrect: isAnswerCorrect
        }])

        // Esperar 1 segundo antes de mostrar la siguiente pregunta
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1)
                setSelectedAnswer(null)
                setIsCorrect(null)
            } else {
                // Pass the updated score explicitly
                handleEndGame(newScore)
            }
        }, 1000)
    }

    const handleEndGame = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
        setIsFinished(true)
        setTimeLeft(0)
        setWaitingForResults(true)

        // Always use the ref value which is synchronized with the latest score
        //const scoreToSend = finalScore !== undefined ? finalScore : currentScoreRef.current
        console.log("Sending score:", currentScoreRef.current)

        if (multiplayerService && multiplayerService.socket) {
            multiplayerService.socket.emit("sendCorrect", currentScoreRef.current)

            multiplayerService.socket.once("resultsReceived", (response) => {
                if (response.success) {
                    console.log("Resultados enviados correctamente al servidor")
                } else {
                    console.error("Error al enviar resultados:", response.message)
                }
            })
        } else {
            console.error("No hay conexión con el servidor para enviar resultados")
        }
    }

    return (
        <>
            {waitingForResults ? (
                <Box sx={{textAlign: "center", mt: 4}}>
                    <img src="/loading.gif" alt="Calculando resultados..." style={{width: "33vw"}}/>
                    <Typography variant="h5" sx={{mt: 2, textAlign: "center"}}>¡Calculando resultados!</Typography>
                </Box>
            ) : (

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
                                        <Toolbar sx={{display: "flex", justifyContent: "center"}}>
                                            <Typography variant="h6" sx={{color: "white", fontWeight: "bold"}}>
                                                WiChat - Juego Multijugador
                                            </Typography>
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
                                                style={{width: "150px", marginBottom: "1.5rem"}}
                                            />
                                            <Typography variant="h6" color="primary">
                                                Cargando preguntas...
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{p: 4}}>
                                            {/* Tarjetas de información del juego */}
                                            <Grid container spacing={3} sx={{mb: 4}}>
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
                                                        <QuizIcon color="primary" sx={{fontSize: 28}}/>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Preguntas restantes
                                                            </Typography>
                                                            <Typography variant="h5" color="primary" fontWeight="bold">
                                                                {questions.length - currentQuestionIndex - 1}
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
                                                        <EmojiEventsIcon color="success" sx={{fontSize: 28}}/>
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Puntuación
                                                            </Typography>
                                                            <Typography variant="h5" color="success.main"
                                                                        fontWeight="bold">
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
                                                        <AccessTimeIcon color={timeLeft <= 5 ? "error" : "warning"}
                                                                        sx={{fontSize: 28}}/>
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
                                                value={(timeLeft / 60) * 100}
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
                                                <Typography variant="h5" fontWeight="medium" color="primary.dark"
                                                            sx={{mb: 3}}>
                                                    {currentQuestion?.question}
                                                </Typography>

                                                {/* Imagen de la pregunta */}
                                                {currentQuestion?.image && (
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
                                                            src={currentQuestion.image || "/placeholder.svg"}
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
                                                    {currentQuestion?.options?.map((option, index) => (
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
                                                                            : option === currentQuestion.correctAnswer && selectedAnswer !== null
                                                                                ? alpha(theme.palette.success.main, 0.1)
                                                                                : "transparent"
                                                                        : "transparent",
                                                                    borderColor: selectedAnswer
                                                                        ? selectedAnswer === option
                                                                            ? isCorrect
                                                                                ? theme.palette.success.main
                                                                                : theme.palette.error.main
                                                                            : option === currentQuestion.correctAnswer && selectedAnswer !== null
                                                                                ? theme.palette.success.main
                                                                                : theme.palette.divider
                                                                        : theme.palette.divider,
                                                                    color: selectedAnswer
                                                                        ? selectedAnswer === option
                                                                            ? isCorrect
                                                                                ? theme.palette.success.main
                                                                                : theme.palette.error.main
                                                                            : option === currentQuestion.correctAnswer && selectedAnswer !== null
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
                                                                    <CheckCircleOutlineIcon color="success"
                                                                                            sx={{ml: "auto"}}/>
                                                                )}
                                                                {selectedAnswer === option && isCorrect === false && (
                                                                    <CancelOutlinedIcon color="error"
                                                                                        sx={{ml: "auto"}}/>
                                                                )}
                                                                {option === currentQuestion.correctAnswer &&
                                                                    selectedAnswer !== null &&
                                                                    selectedAnswer !== option && (
                                                                        <CheckCircleOutlineIcon color="success"
                                                                                                sx={{ml: "auto"}}/>
                                                                    )}
                                                            </Button>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Paper>
                                        </Box>
                                    )}
                                </Paper>
                            </Fade>
                        )}

                        {isFinished && !waitingForResults && (
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

                                    <Box sx={{p: 4}}>
                                        <Grid container spacing={4} sx={{mb: 3}}>
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
                                                    <Typography variant="h6" color="primary" fontWeight="bold"
                                                                sx={{mb: 2, textAlign: "center"}}>
                                                        Resultados
                                                    </Typography>

                                                    <Box sx={{height: 300}}>
                                                        {score > 0 || questions.length - score > 0 ? (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie
                                                                        data={[
                                                                            {name: "Correctas", value: score || 0},
                                                                            {
                                                                                name: "Incorrectas",
                                                                                value: questions.length - score || 0
                                                                            },
                                                                        ]}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        labelLine={false}
                                                                        outerRadius={100}
                                                                        innerRadius={60}
                                                                        fill="#8884d8"
                                                                        dataKey="value"
                                                                        label={({
                                                                                    name,
                                                                                    percent
                                                                                }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                        paddingAngle={5}
                                                                    >
                                                                        <Cell fill="#4CAF50" stroke="none"/>
                                                                        <Cell fill="#F44336" stroke="none"/>
                                                                    </Pie>
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary"
                                                                        sx={{textAlign: "center", mt: 5}}>
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
                                                    <Typography variant="h6" color="primary" fontWeight="bold"
                                                                sx={{mb: 3, textAlign: "center"}}>
                                                        Detalles
                                                    </Typography>

                                                    <Box sx={{mb: 3}}>
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
                                                            <CheckCircleOutlineIcon color="success"
                                                                                    sx={{mr: 2, fontSize: 28}}/>
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Respuestas correctas
                                                                </Typography>
                                                                <Typography variant="h5" color="success.main"
                                                                            fontWeight="bold">
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
                                                            <CancelOutlinedIcon color="error"
                                                                                sx={{mr: 2, fontSize: 28}}/>
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Respuestas incorrectas
                                                                </Typography>
                                                                <Typography variant="h5" color="error.main"
                                                                            fontWeight="bold">
                                                                    {questions.length - score}
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
                                                            <QuizIcon color="info" sx={{mr: 2, fontSize: 28}}/>
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Total de preguntas
                                                                </Typography>
                                                                <Typography variant="h5" color="info.main"
                                                                            fontWeight="bold">
                                                                    {questions.length}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
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
            )}
        </>
    );
}

export default GameMultiplayer