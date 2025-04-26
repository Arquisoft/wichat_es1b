import { Box, Container, Paper, Typography, Grid, Button, alpha } from "@mui/material"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import HomeIcon from "@mui/icons-material/Home"
import { useNavigate, useLocation } from "react-router-dom"

const primaryGradient = "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)"

const MultiplayerResults = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { winner, results = [] } = location.state || {}
    const sortedResults = [...results].sort((a, b) => b.score - a.score);

    const getMedalStyle = (idx) => {
        switch (idx) {
            case 0:
                return { bg: alpha("#FFD700", 0.2), border: "2px solid #FFD700" }; // Gold
            case 1:
                return { bg: alpha("#C0C0C0", 0.2), border: "2px solid #C0C0C0" }; // Silver
            case 2:
                return { bg: alpha("#CD7F32", 0.2), border: "2px solid #CD7F32" }; // Bronze
            default:
                return { bg: "white", border: "1px solid rgba(0,0,0,0.05)" };
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
                pt: 4,
                pb: 10,
            }}
        >
            <Container maxWidth="sm">
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
                            ¡Se acabó el tiempo!
                        </Typography>
                        <Typography variant="h6">
                            Y el ganador es... ¡<b>{winner}</b>! <EmojiEventsIcon sx={{ verticalAlign: "middle", color: "#FFD700" }} />
                        </Typography>
                    </Box>
                    <Box sx={{ p: 4 }}>
                        <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 3, textAlign: "center" }}>
                            Puntuaciones finales
                        </Typography>
                        <Grid container spacing={2}>
                            {sortedResults.map((player, idx) => {
                                const { bg, border } = getMedalStyle(idx);
                                return (
                                    <Grid item xs={12} key={player.username}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: bg,
                                                border: border,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                            }}
                                        >
                                            <AccountCircleIcon color="primary" sx={{ fontSize: 28 }} />
                                            <Typography variant="body1" fontWeight={idx === 0 ? "bold" : "normal"}>
                                                {player.username}
                                            </Typography>
                                            <Box sx={{ flexGrow: 1 }} />
                                            <Typography variant="h6" color="success.main" fontWeight="bold">
                                                {player.score}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => navigate("/Home")}
                                startIcon={<HomeIcon />}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    background: primaryGradient,
                                }}
                            >
                                Menú principal
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => navigate("/Profile")}
                                startIcon={<AccountCircleIcon />}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    background: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
                                }}
                            >
                                Perfil y estadísticas
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}

export default MultiplayerResults