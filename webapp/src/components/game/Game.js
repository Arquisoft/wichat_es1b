import React, { useState, useEffect } from 'react';
import { Container, Paper, AppBar, Toolbar, Button, Grid, Typography, LinearProgress } from '@mui/material';
import { PieChart, Pie, Cell } from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chat from "../chatbot/chat";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
const timeLimit = 30;
const nQuestions = 5;

const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameConfig } = location.state || { gameConfig: { numQuestions: 5, timePerQuestion: 10 } };

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setFinished] = useState(false);

  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionCounter, setQuestionCounter] = useState(0);

  // Configuración de las partidas
  const [numberOfQuestions, setNumberOfQuestions] = useState(gameConfig.numQuestions);
  const [questionsToAnswer, setQuestionsToAnswer] = useState(gameConfig.numQuestions);

  // Estados para el temporizador
  const [timeLeft, setTimeLeft] = useState(gameConfig.timePerQuestion);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const getQuestion = async () => {
    try {
      const response = await axios.get('http://localhost:8004/nextQuestion');
      const { questionObject, questionImage, correctAnswer, answerOptions } = response.data;
      setQuestion(questionObject);
      setImage(questionImage);
      setOptions(answerOptions);
      setCorrectAnswer(correctAnswer);
      setSelectedAnswer(null);
      setIsCorrect(null);

      console.log(questionObject);
      console.log(answerOptions);
      console.log(correctAnswer);
      console.log(questionImage);

      // Reiniciar temporizador y estado de tiempo agotado
      setTimeLeft(gameConfig.timePerQuestion);
      setIsTimeUp(false);

      // Restablecer la respuesta seleccionada y los colores de los botones
      setSelectedAnswer(null);
      setIsCorrect(null);

      setQuestionCounter(qc => qc + 1);
    } catch (error) {
      console.error('Error fetching the next question:', error);
    }
  };

  const handleNewGame = async () => {
    try {
      const response = await axios.post('http://localhost:8004/startGame');
      if (response.data && response.data.firstQuestion) {
        const { firstQuestion } = response.data;
        console.log("First question received:", firstQuestion);

        setQuestions([firstQuestion]);
        setCurrentQuestionIndex(0);
        setQuestion(firstQuestion.questionObject);
        setImage(firstQuestion.questionImage);
        setOptions(firstQuestion.answerOptions);
        setCorrectAnswer(firstQuestion.correctAnswer);
        setSelectedAnswer(null);
        setIsCorrect(false);
        setScore(0);
        setTimeLeft(timeLimit);
        setFinished(false);
        setQuestionsToAnswer(nQuestions);
        setIsTimeUp(false);
        setQuestionCounter(0);
      } else {
        console.error('Invalid response from startGame:', response.data);
      }
    } catch (error) {
      console.error('Error starting a new game:', error);
    }
  };

  const handleOptionClick = (option) => {
    //Primero, parar el temporizador
    stopTimer();

    setSelectedAnswer(option); // Guarda la opción seleccionada

    let updatedScore = score;
    if (option === correctAnswer) {
      setIsCorrect(true);
      updatedScore = score + 1;
      setScore(updatedScore);
    } else {
      setIsCorrect(false);
    }

    // Espera 2 segundos antes de mostrar una nueva pregunta y comprueba si acabo la partida
    setTimeout(async () => {
      if (questionCounter < numberOfQuestions - 1) {
        await getQuestion();
      } else {
        setFinished(true);
      }
    }, 2000);
  };

  // Finalizar partida
  const handleEndGame = (finalScore = score) => {
    console.log("Partida finalizada");

    // Detener el temporizador y marcar la partida como finalizada
    setFinished(true);
    setTimeLeft(0);

    // Resetear las respuestas seleccionadas
    setSelectedAnswer(null);
    setIsCorrect(null);

    let acertadas = finalScore;
    let falladas = numberOfQuestions - finalScore;

    //Hacer una petición para guardar la sesión
    axios.post(`${apiEndpoint}/save-session`, {
      userid: localStorage.getItem('username'),
      score: acertadas,
      wrongAnswers: falladas,
    });
  };

  const handleHome = () => {
    navigate('/Home');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const isGameFinished = () => {
    return questionCounter >= numberOfQuestions;
  };

  // Comprueba cada pregunta si acabo la partida o no
  useEffect(() => {
    if (isGameFinished() && !isFinished) {
      setTimeout(() => {
        handleEndGame();
      }, 1000);
    }
  }, [questionCounter]);

  const handleShowGame = async () => {
    console.log("Initializing game...");
    await handleNewGame();
  };

  useEffect(() => {
    handleShowGame();
  }, []);

  const wrongAnswers = numberOfQuestions - score;
  const data = [
    { name: "Acertadas", value: score, color: 'green' },
    { name: "Falladas", value: wrongAnswers, color: 'red' }
  ];

  const stopTimer = () => {
    setIsTimeUp(true);
  };

  const resetTimer = () => {
    setTimeLeft(timeLimit);
    setIsTimeUp(false);
  };

  // Manejo del temporizador
  useEffect(() => {
    if (!isTimeUp && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if(timeLeft === 0 && !isTimeUp) {
        setIsTimeUp(true);
        setSelectedAnswer(correctAnswer);
        setIsCorrect(false);
        setQuestionsToAnswer(q => q - 1);

        setTimeout(() => {
          if (questionCounter < numberOfQuestions - 1) {
            getQuestion();
          } else {
            setFinished(true);
          }
        }, 2000);
      }
    }
  }, [timeLeft, isTimeUp]);


  return (
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        {!isFinished && (
            <Paper elevation={3} style={{ padding: '2rem', textAlign: 'center' }}>
              {/* Barra de menú */}
              <AppBar position="static" color="primary">
                <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button color="inherit" onClick={handleEndGame}>Finalizar partida</Button>
                  <Button color="inherit" onClick={handleNewGame}>Empezar nueva partida</Button>
                  <Button color="inherit" onClick={handleGoToProfile}>Ir al perfil</Button>
                </Toolbar>
              </AppBar>

              {/* Grid Preguntas Restantes y Puntuación*/}
              <Grid container spacing={2} style={{ marginTop: '10px', marginBottom: '10px' }}>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ color: 'blue' }}>
                    Preguntas restantes: {questionCounter}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ color: 'blue' }}>
                    Puntuación: {score}
                  </Typography>
                </Grid>
              </Grid>

              {/* Linea Regresiva Temporizador */}
              <LinearProgress
                  variant="determinate"
                  value={(timeLeft / timeLimit) * 100}
                  sx={{
                    height: 10,
                    backgroundColor: 'primary',
                    '& .MuiLinearProgress-bar': { backgroundColor: timeLeft <= 5 ? 'red' : 'blue' },
                    marginTop: '10px'
                  }}
              />
              <Typography variant="caption" sx={{ display: 'block', marginBottom: '10px' }}>
                Tiempo restante: {timeLeft}s
              </Typography>

              {/* Pregunta */}
              <Typography variant="h6" sx={{ marginBottom: '10px' }}>
                {question}
              </Typography>

              {/* Imagen */}
              {image && <img src={image} alt="Imagen de la pregunta" width="40%" height="auto" style={{ marginBottom: '20px'}} />}

              {/* Opciones de respuesta */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                alignItems: 'center',
                marginTop: '20px',
                marginBottom: '20px'
              }}>
                {options.map((option, index) => (
                    <Button
                        key={index}
                        variant="contained"
                        onClick={() => handleOptionClick(option)}
                        style={{
                          backgroundColor: selectedAnswer ?
                              (selectedAnswer === option
                                  ? (isCorrect ? 'green' : 'red')
                                  : (option === correctAnswer && selectedAnswer !== null ? 'green' : ''))
                              : '',
                          color: (selectedAnswer === option || (selectedAnswer !== null && option === correctAnswer))
                              ? 'white'
                              : 'black'
                        }}
                        disabled={selectedAnswer !== null} // Deshabilita los botones tras hacer clic
                    >
                      {option}
                    </Button>
                ))}
              </div>
              <Chat correctAnswer={correctAnswer} question={question} />
            </Paper>
        )}

        {isFinished && (
            <Paper elevation={3} style={{ padding: '2rem', textAlign: 'center' }}>
              {/* Mensaje Partida Finalizada */}
              <Typography variant="h4" gutterBottom>
                Partida finalizada. ¡Gracias por jugar!
              </Typography>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Gráfico de respuestas */}
                <PieChart width={300} height={300}>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>

                {/* Leyenda respuestas */}
                <div style={{ marginLeft: '20px', textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ color: 'green' }}>
                    Acertadas: {score}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'red' }}>
                    Falladas: {numberOfQuestions - score}
                  </Typography>
                </div>
              </div>

              {/* Botón Menú principal */}
              <Button onClick={handleHome} variant="contained" sx={{ marginTop: '20px', color: 'white' }}>
                Volver al menú principal
              </Button>
            </Paper>
        )}
      </Container>
  );
};

export default Game;