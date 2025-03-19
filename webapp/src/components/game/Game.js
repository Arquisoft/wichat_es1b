import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Typography, Button, AppBar, Toolbar, Paper, LinearProgress, Grid} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

import './Game.css';

import './../chatbot/chat.jsx';
import Chat from "../chatbot/chat";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
const timeLimit = 30;


const Game = () => {
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [image, setImage] = useState('');
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionCounter, setQuestionCounter] = useState(0);
  const [isFinished, setFinished] = useState(false);

  // Estados para manejar la respuesta seleccionada y su corrección
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Estado para manejar contador de preguntas respondidas correctamente
  const [score, setScore] = useState(0);

  // Configuración de las partidas
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [questionsToAnswer, setQuestionsToAnswer] = useState(5);

  // Estados para el temporizador
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const stopTimer = () => {
    setIsTimeUp(true);
  };

  const resetTimer = () => {
    setTimeLeft(timeLimit);
    setIsTimeUp(false);
  };



  const getQuestion = async () => {
    try {
      const response = await axios.get(`${apiEndpoint}/generateQuestion`, { // una vez funcione
        // params: {
        //   category: "Geografia",
        // }
      });

      setQuestion(response.data.responseQuestion);
      setOptions(response.data.responseAnswerOptions);
      setCorrectAnswer(response.data.responseCorrectAnswer);
      setImage(response.data.responseQuestionImage);

      console.log(response.data.responseQuestion);
      console.log(response.data.responseAnswerOptions);
      console.log(response.data.responseCorrectAnswer);
      console.log(response.data.responseQuestionImage);

      // Reiniciar temporizador y estado de tiempo agotado
      setTimeLeft(timeLimit);
      setIsTimeUp(false);

      // Restablecer la respuesta seleccionada y los colores de los botones
      setSelectedAnswer(null);
      setIsCorrect(null);
      setQuestionCounter(qc => qc + 1);

    } catch (error) {
      console.log("Error en la generación de la pregunta");
    }
  }

  useEffect(() => {
    getQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          if (!isGameFinished()) {
            getQuestion();
          }
        }, 2000);
      }
    }
  }, [timeLeft, isTimeUp]);

  const handleOptionClick = (option) => {
    //Primero, parar el temporizador
    stopTimer();

    setSelectedAnswer(option); // Guarda la opción seleccionada
    const correct = option === correctAnswer; // Verifica si es correcta
    setIsCorrect(correct);

    if (correct) {
      setScore(prevScore => prevScore + 1); // Incrementa el puntaje si es correcto
    }

    setQuestionsToAnswer(q => q - 1); // Disminuye el número de preguntas restantes

    // Espera 2 segundos antes de cargar una nueva pregunta y comprueba si acabo la partida
    if (!isGameFinished()) {
      setTimeout(() => {
        getQuestion();
      }, 2000);
    }
  };

  // Finalizar partida
  const handleEndGame = () => {
    console.log("Partida finalizada");

    // Detener el temporizador y marcar la partida como finalizada
    setFinished(true);
    setTimeLeft(0);

    // Resetear las respuestas seleccionadas
    setSelectedAnswer(null);
    setIsCorrect(null);
    
    let acertadas = score;
    let falladas = numberOfQuestions - score;

    //Hacer una petición para guardar la sesión
    axios.post('http://localhost:8005/api/save-session', {
    
      userId: "67db18a0984b55cb62e5a1b4",
      score: acertadas,
      wrongAnswers: falladas,
    
    });
  }

  const isGameFinished = () => {
    return questionCounter >= numberOfQuestions;
  }

  // Comprueba cada pregunta si acabo la partida o no
  useEffect(() => {
    if (isGameFinished() && !isFinished) {
      setTimeout(() => {
        handleEndGame();
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsToAnswer]);

  const handleHome = () => {
    let path= '/Home';
    navigate(path);
  };

  // Iniciar nueva partida
  const handleNewGame = () => {
    console.log("Nueva partida iniciada");
    setQuestionsToAnswer(numberOfQuestions);
    setScore(0);  // Reiniciar puntuación
    getQuestion(); // Cargar nueva pregunta
  };

  // Redirigir al perfil del usuario
  const handleGoToProfile = () => {
    //navigate('/profile');
  };

  const wrongAnswers = numberOfQuestions - score;
  const data = [
    { name: "Acertadas", value: score, color: 'green'},
    { name: "Falladas", value: wrongAnswers, color: 'red'}
  ];

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
              <Grid container spacing={2} style={{ marginTop: '10px', margingBottom: '10px' }}>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ color: 'blue' }}>
                    Preguntas restantes: {questionsToAnswer}
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
                  sx ={{
                    height: 10,
                    backgroundColor: 'primary',
                    '& .MuiLinearProgress-bar': { backgroundColor: timeLeft <= 5 ? 'red' : 'blue' },
                    marginTop: '10px' }}
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
                        
                        // Añadir !important para asegurar la prioridad
                        backgroundColor: selectedAnswer === option
                          ? (isCorrect ? 'green !important' : 'red !important')
                          : (selectedAnswer !== null && option === correctAnswer ? 'green !important' : ''),
                        color: selectedAnswer === option || (selectedAnswer !== null && option === correctAnswer) ? 'white !important' : 'black !important',
                        // Sin prioridad
                        backgroundColor: selectedAnswer === option
                          ? (isCorrect ? 'green' : 'red')
                          : (selectedAnswer !== null && option === correctAnswer ? 'green' : ''), // Si se falla, también se muestra cual era la correcta
                        color: selectedAnswer === option || (selectedAnswer !== null && option === correctAnswer) ? 'white' : 'black'
                      }}
                      disabled={selectedAnswer !== null} // Deshabilita los botones tras hacer clic
                    >
                      {option}
                  </Button>
                ))}
              </div>
              <Chat>{correctAnswer}</Chat>
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
                  <Typography variant="h6" sx={{ color: '#green' }}>
                    Acertadas: {score}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#red' }}>
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


/**
 * Cada segundo (1000 ms) se disminuye en una unidad el tiempo restante. Al llegar a 0, se deshabilitan los botones y se
 * reinicia el tiempo.
 */
//useEffect(() => {
//    const id = setInterval(() => {
//        setTime(prev => {
//            if (prev > 0) {
//                return prev - 1;
//            } else {
//                setTimedOut(true);
//                const buttons = document.querySelectorAll('button[title="btnsPreg"]');
//                buttons.forEach(button => {
//                    button.disabled = true;
//                    button.onmouse = null;
//                });
//                clearInterval(id); // Clear the interval when the time runs out
//            }
//        });
//    }, 1000);
//
//    return () => clearInterval(id); // Clear the interval on component unmount
//}, [isTimerActive, isTimedOut]);