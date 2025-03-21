import React, { useState, useEffect } from 'react';
import { Container, Paper, AppBar, Toolbar, Button, Grid, Typography, LinearProgress } from '@mui/material';
import { PieChart, Pie, Cell } from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chat from "../chatbot/chat";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8004';
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

  const [loading, setLoading] = useState(true);

  // Configuración de las partidas
  const [numberOfQuestions, setNumberOfQuestions] = useState(gameConfig.numQuestions);
  const [questionsToAnswer, setQuestionsToAnswer] = useState(gameConfig.numQuestions);

  // Estados para el temporizador
  const [timeLeft, setTimeLeft] = useState(gameConfig.timePerQuestion);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Guardar las preguntas de la sesión
  const [sessionCuestions, setSessionQuestions] = useState([]);

  const getQuestion = async () => {

    try {
      const response = await axios.get(apiEndpoint + '/nextQuestion');
      const { questionObject, questionImage, correctAnswer, answerOptions } = response.data;
      setQuestion(questionObject);
      setImage(questionImage);
      setOptions(answerOptions);
      setCorrectAnswer(correctAnswer);
      setSelectedAnswer(null);
      setIsCorrect(null);

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

  const handleNewGame = async (category = null) => {
    setLoading(true);
    try {
      setLoading(true);
      setFinished(false);
      setScore(0);
      setQuestionCounter(0);
      setSelectedAnswer(null);
      setIsCorrect(null);

      console.log("Starting game with category:", category);

        setSessionQuestions([]);

      // Send the category to the backend
      const response = await axios.post(`${apiEndpoint}/startGame`, {
        category: category || null // Pass the category or null for all categories
      });

      if (response.data.firstQuestion) {
        const question = response.data.firstQuestion;
        setQuestion(question.questionObject);
        setImage(question.questionImage);
        setCorrectAnswer(question.correctAnswer);
        setOptions(question.answerOptions);
        resetTimer();
      } else {
        console.error("No question received");
      }
    } catch (error) {
      console.error("Error starting new game:", error);
    } finally {
      setLoading(false);
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
  
    // Guardar la pregunta en la sesión
    setSessionQuestions(prev => [
      ...prev,
      {
        question: question,
        correctAnswer: correctAnswer,
        userAnswer: option,
      }
    ]);

    // Espera 2 segundos antes de mostrar una nueva pregunta y comprueba si acabo la partida
    setTimeout(async () => {
      if (questionCounter < numberOfQuestions - 1) {
        await getQuestion();
      } else {
        handleEndGame();
      }
    }, 2000);
  };
  
  // Finalizar partida
  const handleEndGame = () => {
  
    // Detener el temporizador y marcar la partida como finalizada
    setFinished(true);
    setTimeLeft(0);
  
    // Resetear las respuestas seleccionadas
    setSelectedAnswer(null);
    setIsCorrect(null);
  };
  
  useEffect(() => {
    if (isFinished) {
      let falladas = numberOfQuestions - score;  

      axios.post(`${apiEndpoint}/save-session`, {
        questions: sessionCuestions,
        userid: localStorage.getItem('username'),
        score: score,
        wrongAnswers: falladas,
      })
      .then(response => {
        console.log("Sesión guardada exitosamente:", response.data);
      })
      .catch(error => {
        console.error("Error al guardar la sesión:", error);
      });
    }
  }, [isFinished]);



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

  const handleShowGame = async (category = null) => {
    // Get category from URL params OR from navigation state
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    const stateCategory = location.state?.gameConfig?.category;

    // Use category from either source
    //const category = urlCategory || stateCategory || null;

    console.log("Using category:", category);
    await handleNewGame(category);
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
  // Loading effect (for the questions at the start, in this version
  useEffect(() => {
    if(!loading && !isTimeUp && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    else if(!loading && timeLeft === 0 && !isTimeUp) {
      setIsTimeUp(true);
      setSelectedAnswer(correctAnswer);
      setIsCorrect(false);
      setQuestionsToAnswer(q => q - 1);

      setTimeout(() => {
        if (questionCounter < numberOfQuestions - 1) {
          getQuestion();
        } else {
          handleEndGame();
        }
      }, 2000);
    }
  }, [timeLeft, isTimeUp, loading]);


  return (
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        {!isFinished && (
            <Paper elevation={3} style={{ padding: '2rem', textAlign: 'center' }}>
              {/* Barra de menú */}
              <AppBar position="static" color="primary">
                <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button color="inherit" onClick={handleHome}>Abandonar</Button>
                  <Button color="inherit" onClick={() => handleNewGame()}>Empezar nueva partida</Button>
                  <Button color="inherit" onClick={handleGoToProfile}>Ir al perfil</Button>
                </Toolbar>
              </AppBar>

              {loading ? (
                  <div style={{
                    padding: '3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '300px'
                  }}>
                    <img
                        src="https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca_w200.gif"
                        alt="Cargando preguntas..."
                        style={{ width: '150px', marginBottom: '1.5rem' }}
                    />
                    <Typography variant="h6" color="primary">
                      Cargando preguntas...
                    </Typography>
                  </div>
              ) : (
                  <>

              {/* Grid Preguntas Restantes y Puntuación*/}
              <Grid container spacing={2} style={{ marginTop: '10px', marginBottom: '10px' }}>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ color: 'blue' }}>
                    Preguntas restantes: {numberOfQuestions - questionCounter}
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
            </>
          )}
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