"use client"

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

export default function WaitingRoom({ roomId, roomName, username, multiplayerService, onClose, onGameStart }) {
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

        // Configurar listeners para eventos del servicio multiplayer
        multiplayerService
            .on("onRoomJoined", (data) => {
                console.log("Room joined data:", data)
                // Actualizar la lista de jugadores con todos los jugadores de la sala
                if (data.players && Array.isArray(data.players)) {
                    console.log("Procesando lista de jugadores inicial:", data.players)

                    // Mapear los jugadores con una estructura consistente
                    const mappedPlayers = data.players.map((player) => ({
                        id: player.id || player.playerId,
                        username: player.username || "Jugador",
                        isReady: player.isReady || false,
                        isHost: player.isHost || player.id === data.hostId,
                    }))

                    setPlayers(mappedPlayers)

                    // Determinar si el usuario actual es el anfitrión
                    const currentPlayer = data.players.find((p) => p.username === username)
                    if (currentPlayer) {
                        setIsHost(currentPlayer.isHost || currentPlayer.id === data.hostId)
                        setIsReady(currentPlayer.isReady || currentPlayer.isHost || false)
                    }
                } else {
                    // Fallback si no hay datos de jugadores
                    console.log("No hay datos de jugadores, creando jugador inicial")
                    const currentPlayer = {
                        id: "user-" + Date.now(),
                        username: username || "Anónimo",
                        isReady: data.isHost || false,
                        isHost: data.isHost || false,
                    }
                    setPlayers([currentPlayer])
                    setIsHost(data.isHost || false)
                }
            })
            .on("onPlayerJoined", (data) => {
                console.log("Jugador unido:", data)
                // Verificar si el jugador ya existe en la lista para evitar duplicados
                setPlayers((prev) => {
                    // Asegurarnos de que tenemos un ID válido, ya sea playerId o id
                    const playerId = data.playerId || data.id

                    // Verificar si ya existe este jugador
                    const playerExists = prev.some((p) => p.id === playerId)
                    if (playerExists) return prev

                    // Añadir el nuevo jugador
                    return [
                        ...prev,
                        {
                            id: playerId,
                            username: data.username || "Jugador",
                            isReady: data.isHost || false,
                            isHost: data.isHost || false,
                        },
                    ]
                })
            })
            .on("onPlayerLeft", (data) => {
                console.log("Jugador abandonó:", data)
                const playerId = data.playerId || data.id
                setPlayers((prev) => prev.filter((p) => p.id !== playerId))
            })
            .on("onPlayerReady", (data) => {
                console.log("Jugador listo:", data)
                const playerId = data.playerId || data.id
                setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, isReady: true } : p)))

                // Si el jugador actual es el que está listo, actualizar estado local
                if (playerId === multiplayerService.socket?.id) {
                    setIsReady(true)
                }
            })
            .on("onAllPlayersReady", () => {
                console.log("Todos los jugadores están listos")
                setAllReady(true)
            })
            .on("onGameStart", (data) => {
                console.log("Juego iniciado:", data)
                onGameStart()
            })
            .on("onError", (data) => {
                setError(data.message || "Error en la sala")
            })
            .on("onHostChanged", (data) => {
                console.log("Host cambiado:", data)
                const newHostId = data.playerId || data.id

                // Actualizar el estado del host en la lista de jugadores
                setPlayers(prev =>
                    prev.map(p => ({
                        ...p,
                        isHost: p.id === newHostId
                    }))
                )

                // Actualizar estado local si el usuario actual es el nuevo host
                if (newHostId === multiplayerService.socket?.id) {
                    setIsHost(true)
                }
            })

        // Cleanup
        return () => {
            multiplayerService
                .off("onRoomJoined")
                .off("onPlayerJoined")
                .off("onPlayerLeft")
                .off("onPlayerReady")
                .off("onAllPlayersReady")
                .off("onGameStart")
                .off("onError")
                .off("onHostChanged")
        }
    }, [multiplayerService, username, onGameStart])

    // Verificar si todos los jugadores están listos
    useEffect(() => {
        if (players.length > 0) {
            const ready = players.every((player) => player.isReady)
            setAllReady(ready && players.length > 1) // Al menos 2 jugadores
        }
    }, [players])

    // Añade este useEffect para depuración
    useEffect(() => {
        console.log("Lista de jugadores actualizada:", players)
    }, [players])

    const handleReady = () => {
        // Enviar al servicio primero (para evitar actualizaciones prematuras del estado)
        if (multiplayerService) {
            multiplayerService.sendReady(roomId)
        }

        // El estado se actualizará cuando recibamos la confirmación mediante el evento onPlayerReady
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
                        {players.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography>Esperando jugadores...</Typography>
                            </Box>
                        ) : (
                            players.map((player, index) => (
                                <Box key={player.id || index}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            p: 2,
                                            bgcolor: player.id === multiplayerService?.socket?.id ?
                                                alpha(theme.palette.primary.main, 0.05) : 'transparent'
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
                                                    {player.id === multiplayerService?.socket?.id && (
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            sx={{
                                                                ml: 1,
                                                                color: theme.palette.info.main,
                                                            }}
                                                        >
                                                            (Tú)
                                                        </Typography>
                                                    )}
                                                    {player.isHost && (
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            sx={{
                                                                ml: player.id === multiplayerService?.socket?.id ? 0 : 1,
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
                            ))
                        )}
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
                                <Tooltip title={!allReady ? "Todos los jugadores deben estar listos y debe haber al menos 2 jugadores" : ""}>
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