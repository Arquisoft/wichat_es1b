"use client"

import { useState, useEffect } from "react"
import AddUser from "./components/register/AddUser"
import Login from "./components/login/Login"
import AnimatedCharacter from "./components/animated/AnimatedCharacter"
import AnimatedWelcome from "./components/animated/AnimatedWelcome"
import { CssBaseline, Container, Typography, Link, Box, Paper } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { motion, AnimatePresence } from "framer-motion"

// Crear un tema personalizado con colores que coincidan con nuestro diseño
const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#7e57c2",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
})

// Estilos CSS personalizados
const styles = {
  mainContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "24px",
    background: "linear-gradient(to bottom, #e8eaf6, #c5cae9)",
  },
  formContainer: {
    position: "relative",
    marginTop: "40px",
    borderRadius: "16px",
    overflow: "visible",
  },
  formPaper: {
    padding: "24px",
    paddingTop: "32px",
    marginTop: "40px",
    position: "relative",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  },
  formTopCurve: {
    position: "absolute",
    top: "-10px",
    left: 0,
    right: 0,
    height: "20px",
    backgroundColor: "white",
    borderTopLeftRadius: "40px",
    borderTopRightRadius: "40px",
    zIndex: 1,
  },
  toggleLink: {
    marginTop: "16px",
    textAlign: "center",
  },
}

function App() {
  const [showLogin, setShowLogin] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    // Mostrar la pantalla de bienvenida por 2 segundos
    const timer = setTimeout(() => {
      setShowWelcome(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleToggleView = () => {
    setShowLogin(!showLogin)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={styles.mainContainer}>
        <Container component="main" maxWidth="xs">
          <AnimatePresence mode="wait">
            {showWelcome ? (
              <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnimatedWelcome />
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={styles.formContainer}>
                  <AnimatedCharacter />
                  <Paper sx={styles.formPaper} elevation={3}>
                    <Box sx={styles.formTopCurve} />
                    <Typography
                      component="h1"
                      variant="h5"
                      align="center"
                      sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
                    >
                      {showLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                    </Typography>
                    {showLogin ? <Login /> : <AddUser />}
                    <Box sx={styles.toggleLink}>
                      {showLogin ? (
                        <Link
                          name="gotoregister"
                          component="button"
                          variant="body2"
                          onClick={handleToggleView}
                          color="primary"
                        >
                          ¿No tienes una cuenta? Regístrate aquí.
                        </Link>
                      ) : (
                        <Link component="button" variant="body2" onClick={handleToggleView} color="primary">
                          ¿Ya tienes una cuenta? Inicia sesión aquí.
                        </Link>
                      )}
                    </Box>
                  </Paper>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App