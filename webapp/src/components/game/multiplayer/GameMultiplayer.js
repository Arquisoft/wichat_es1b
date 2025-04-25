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
    Avatar,
    Chip,
    Divider,
    Card,
    CardMedia,
} from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import MultiplayerService from "./Multiplayer"

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000"

const GameMultiplayer = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const theme = useTheme()
    const { gameConfig } = location.state
    const multiplayerService = MultiplayerService.getInstance()

    const [players, setPlayers] = useState(gameConfig?.players || [])
    const [Questions, setQuestions] = useState(gameConfig?.questions || [])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [playerScores, setPlayerScores] = useState({})
    const [allPlayersFinished, setAllPlayersFinished] = useState(false)

    const [timeLeft, setTimeLeft] = useState(60)
    const timerRef = useRef(null)

    const currentQuestion = Questions[currentQuestionIndex]

    const handleNextQuestion = () => {
        if (currentQuestionIndex < Questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }
    console.log("Ha llegado a GameMultiplayer")
    console.log(Questions)

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Pregunta {currentQuestionIndex + 1}
            </Typography>

            {currentQuestion ? (
                <Card sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6">{currentQuestion.question}</Typography>
                    {/* Si hay opciones, las mostramos también */}
                    {currentQuestion.answerOptions?.map((answer, index) => (
                        <Button
                            key={index}
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 1 }}
                            onClick={() => console.log(`Seleccionó: ${answer}`)}
                        >
                            {answer}
                        </Button>
                    ))}
                </Card>
            ) : (
                <Typography>No hay más preguntas.</Typography>
            )}

            <Button
                variant="contained"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex >= Questions.length - 1}
            >
                Siguiente
            </Button>
        </Container>
    )
}

export default GameMultiplayer
