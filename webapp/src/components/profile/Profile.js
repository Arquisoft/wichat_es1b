import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Grid, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const [sessionData, setSessionData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Constantes para la visualización de sesiónes paginadas
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [sessionsPerPage] = useState(5); // Número de sesiones por página

  // Constante para ordenar las sesiones
  const [sortBy, setSortBy] = useState('date');

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8005";

  // Recuperar las sesiones del usuario
  // Posible mejora: Añadir las imagenes para incluir a la vista de las sesiones
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`${apiEndpoint}/get-sessions/${username}`);
        let sortedSessions = response.data;

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
    let totalAnswered = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    sessionData.forEach(session => {
      totalAnswered += session.score + session.wrongAnswers;
      totalCorrect += session.score;
      totalWrong += session.wrongAnswers;
    });

    return {
      totalGames,
      totalAnswered,
      totalCorrect,
      totalWrong,
    };
  };

  const stats = getTotalStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const handleHome = () => {
    navigate('/Home');
  };

  const handleNextPage = () => {
    if (currentPage * sessionsPerPage < sessionData.length) {
      setCurrentPage(currentPage + 1);
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Paginación de las sesiones
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = sessionData.slice(indexOfFirstSession, indexOfLastSession);

  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '2rem' }}>
      <Box
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
          color: 'white',
          borderRadius: 3,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          Hola {username}!
        </Typography>
        <Typography variant="h6" sx={{ marginTop: '1rem' }}>
          Estas son las estadísticas de tu perfil
        </Typography>
      </Box>

      <Button onClick={handleHome} variant="contained" sx={{marginBottom: "30px", color: "white" }}>
        Volver al menú principal
      </Button>

      {/* Estadísticas Generales */}
      <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, boxShadow: 2, backgroundColor: "#e3f2fd", marginBottom: "2rem", }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          Estadísticas Generales
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {/* Preguntas acertadas*/}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                color: "white",
                background: "linear-gradient(135deg, #6bcf70 0%, #4CAF50 100%)",
                borderRadius: 2,
              }}
            >
              <Typography variant="h3">{stats.totalCorrect}</Typography>
              <Typography variant="body1">Preguntas acertadas</Typography>
            </Box>
          </Grid>

          {/* Preguntas falladas */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                color: "white",
                background: "linear-gradient(135deg, #FF5252 0%, #e62a2a 100%)",
                borderRadius: 2,
              }}
            >
              <Typography variant="h3">{stats.totalWrong}</Typography>
              <Typography variant="body1">Preguntas falladas</Typography>
            </Box>
          </Grid>

          {/* Total partidas */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                color: "white",
                background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
                borderRadius: 2,
              }}
            >
              <Typography variant="h3">{stats.totalGames}</Typography>
              <Typography variant="body1">Partidas Jugadas</Typography>
            </Box>
          </Grid>

          {/* Porcentaje aciertos */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                color: "white",
                background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
                borderRadius: 2,
              }}
            >
              <Typography variant="h3">{((stats.totalCorrect / stats.totalAnswered) * 100).toFixed(0)}%</Typography>
              <Typography variant="body1">Porcentaje de acierto</Typography>
            </Box>
          </Grid>

        </Grid>
      </Paper>

      {/* Resgistro partidas */}
      <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, boxShadow: 2, backgroundColor: "#e3f2fd", marginBottom: "2rem", }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          Registro de tus partidas
        </Typography>

        {/* Criterio de ordenación */}
        <FormControl sx={{ marginBottom: 2 }}>
          <InputLabel id="sort-label">Ordenar por</InputLabel>
          <Select
            labelId="sort-label"
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Ordenar por"
          >
            <MenuItem value="date">Fecha</MenuItem>
            <MenuItem value="score">Puntuación</MenuItem>
          </Select>
        </FormControl>

        {/* Mostrar las partidas */}
        <Grid container spacing={3} justifyContent="center">
          {currentSessions.map((session, index) => (
            <Grid item xs={12} key={index}>
              <Paper
                elevation={2}
                sx={{
                  padding: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0'
                }}
              >
                {/* Parte izquierda - Información de la sesión */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {`Sesión ${index + (currentPage - 1) * sessionsPerPage + 1}`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" marginLeft="2rem">
                    {formatDate(session.createdAt)}
                  </Typography>
                </Box>

                {/* Parte derecha - Resultados de la sesión */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#e8f5e9',
                      padding: '8px 16px',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="#4CAF50">
                      {session.score} acertadas
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#ffebee',
                      padding: '8px 16px',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="#e62a2a">
                      {session.wrongAnswers} falladas
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Paginación */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem'}}>
          <Button 
            onClick={handlePrevPage}
            variant="contained"
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button 
            onClick={handleNextPage}
            variant="contained"
            disabled={currentPage * sessionsPerPage >= sessionData.length}
          >
            Siguiente
          </Button>
        </Box>

      </Paper>

    </Container>
  );
};

export default Profile;