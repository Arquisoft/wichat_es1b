import { useState, useEffect } from "react"
import AddUser from "./components/register/AddUser"
import Login from "./components/login/Login"
import AnimatedCharacter from "./components/animated/AnimatedCharacter"
import AnimatedWelcome from "./components/animated/AnimatedWelcome"
import CssBaseline from "@mui/material/CssBaseline"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { motion, AnimatePresence } from "framer-motion"
import "./wichat-styles.css" // Importar los estilos personalizados

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
})

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
      <div className="wichat-animated-container">
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
                <div className="wichat-form-container">
                  <AnimatedCharacter />
                  <Paper className="wichat-form-paper" elevation={3}>
                    <div className="wichat-form-top-curve" />
                    <Typography
                      component="h1"
                      variant="h5"
                      align="center"
                      sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
                    >
                      {showLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                    </Typography>
                    {showLogin ? <Login /> : <AddUser />}
                    <div className="wichat-toggle-link">
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
                    </div>
                  </Paper>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </div>
    </ThemeProvider>
  )
}

export default App

