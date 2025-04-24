import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  alpha,
  Tooltip,
  Divider,
} from "@mui/material"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CloseIcon from "@mui/icons-material/Close"
import PersonIcon from "@mui/icons-material/Person"
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import GroupIcon from "@mui/icons-material/Group"

export default function WaitingRoom({
  roomId,
  roomName,
  username,
  multiplayerService,
  onClose,
  onGameStart,
}) {
  const [players, setPlayers] = useState([])
  const [isReady, setIsReady] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [copied, setCopied] = useState(false)
  const [allReady, setAllReady] = useState(false)
  const [error, setError] = useState(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // Gradientes para fondos (manteniendo la estética del archivo original)
  const primaryGradient = "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)"
  const multiplayerGradient = "linear-gradient(135deg, #81c784 0%, #388e3c 100%)"

  useEffect(() => {
    if (!multiplayerService) return

    // Simular la carga inicial de jugadores (el host)
    const currentPlayer = {
      id: "user-" + Date.now(),
      username: username || "Anónimo",
      isReady: false,
      isHost: true,
    }

    setPlayers([currentPlayer])
    setIsHost(true)

    // Configurar listeners para eventos del servicio multiplayer
    multiplayerService
      .on("playerJoined", (data) => {
        setPlayers((prev) => [
          ...prev,
          {
            id: data.playerId,
            username: data.username || "Jugador",
            isReady: false,
            isHost: false,
          },
        ])
      })
      .on("playerLeft", (data) => {
        setPlayers((prev) => prev.filter((p) => p.id !== data.playerId))
      })
      .on("playerReady", (data) => {
        setPlayers((prev) => prev.map((p) => (p.id === data.playerId ? { ...p, isReady: true } : p)))
      })
      .on("gameStart", () => {
        onGameStart()
      })
      .on("error", (data) => {
        setError(data.message || "Error en la sala")
      })

    // Cleanup
    return () => {
      multiplayerService.off("playerJoined").off("playerLeft").off("playerReady").off("gameStart").off("error")
    }
  }, [multiplayerService, username, onGameStart])

  // Verificar si todos los jugadores están listos
  useEffect(() => {
    if (players.length > 0) {
      const ready = players.every((player) => player.isReady)
      setAllReady(ready)
    }
  }, [players])

  const handleReady = () => {
    setIsReady(true)

    // Actualizar el estado local primero
    setPlayers((prev) => prev.map((p) => (p.username === username ? { ...p, isReady: true } : p)))

    // Enviar al servicio
    if (multiplayerService) {
      multiplayerService.sendReady(roomId)
    }
  }

  const handleStartGame = () => {
    if (multiplayerService && isHost && allReady) {
      multiplayerService.startGame(roomId)
    }
  }

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeaveRoom = () => {
    if (multiplayerService) {
      multiplayerService.leaveRoom(roomId)
    }
    onClose()
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1300,
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Círculos decorativos (manteniendo la estética) */}
        <Box
          sx={{
            position: "absolute",
            top: -25,
            left: -25,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            zIndex: 0,
          }}
        />

        {/* Cabecera */}
        <Box
          sx={{
            p: 3,
            background: multiplayerGradient,
            color: "white",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" fontWeight="bold">
              Sala de Espera
            </Typography>
            <IconButton size="small" onClick={handleLeaveRoom} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="subtitle1">{roomName}</Typography>
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 3 }}>
          {/* Código de sala */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Box sx={{ mb: isMobile ? 2 : 0 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Código de sala:
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  letterSpacing: 1,
                  color: theme.palette.primary.main,
                }}
              >
                {roomId}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={copied ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
              onClick={handleCopyRoomId}
              size={isMobile ? "small" : "medium"}
            >
              {copied ? "¡Copiado!" : "Copiar código"}
            </Button>
          </Box>

          {/* Lista de jugadores */}
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <GroupIcon color="primary" />
            Jugadores ({players.length})
          </Typography>

          <Box
            sx={{
              mb: 3,
              maxHeight: 200,
              overflowY: "auto",
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: "4px",
              },
            }}
          >
            {players.map((player, index) => (
              <Box key={player.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: player.isHost ? theme.palette.warning.main : theme.palette.primary.main,
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {player.username}
                        {player.isHost && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              ml: 1,
                              color: theme.palette.warning.main,
                              fontWeight: "bold",
                            }}
                          >
                            (Anfitrión)
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    icon={player.isReady ? <CheckCircleIcon /> : <SportsEsportsIcon />}
                    label={player.isReady ? "Listo" : "Esperando"}
                    color={player.isReady ? "success" : "default"}
                    variant={player.isReady ? "filled" : "outlined"}
                    size="small"
                  />
                </Box>
                {index < players.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>

          {/* Botones de acción */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button fullWidth variant="outlined" color="error" onClick={handleLeaveRoom} sx={{ borderRadius: 50 }}>
                Abandonar sala
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              {isHost ? (
                <Tooltip title={!allReady ? "Todos los jugadores deben estar listos" : ""}>
                  <span>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      disabled={!allReady}
                      onClick={handleStartGame}
                      sx={{
                        borderRadius: 50,
                        background: multiplayerGradient,
                        "&:hover": {
                          background: "linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)",
                        },
                      }}
                    >
                      Iniciar partida
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  disabled={isReady}
                  onClick={handleReady}
                  sx={{
                    borderRadius: 50,
                    background: multiplayerGradient,
                    "&:hover": {
                      background: "linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)",
                    },
                  }}
                >
                  {isReady ? "Listo" : "Estoy listo"}
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Snackbar para errores */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  )
}