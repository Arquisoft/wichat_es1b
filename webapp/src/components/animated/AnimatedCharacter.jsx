"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function AnimatedCharacter() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [eyesClosed, setEyesClosed] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Función para actualizar los event listeners en los campos de contraseña
    const setupPasswordListeners = () => {
      // Eliminar listeners anteriores para evitar duplicados
      const allInputs = document.querySelectorAll("input")
      allInputs.forEach((input) => {
        input.removeEventListener("focus", handleFocus)
        input.removeEventListener("blur", handleBlur)
      })

      // Buscar todos los campos de contraseña por tipo y por atributo name que contenga "password"
      const passwordFields = [
        ...document.querySelectorAll('input[type="password"]'),
        ...document.querySelectorAll('input[name*="password" i]'), // 'i' hace que sea case-insensitive
        ...document.querySelectorAll('input[placeholder*="contraseña" i]'),
      ]

      // Eliminar duplicados
      const uniquePasswordFields = [...new Set(passwordFields)]

      uniquePasswordFields.forEach((field) => {
        field.addEventListener("focus", handleFocus)
        field.addEventListener("blur", handleBlur)
      })

      console.log("Campos de contraseña detectados:", uniquePasswordFields.length)
    }

    const handleFocus = () => setEyesClosed(true)
    const handleBlur = () => setEyesClosed(false)

    // Configurar los listeners inicialmente
    setupPasswordListeners()

    // Configurar un MutationObserver para detectar cambios en el DOM
    // Esto ayudará a detectar cuando se cambia entre Login y AddUser
    const observer = new MutationObserver(() => {
      setTimeout(setupPasswordListeners, 100) // Pequeño retraso para asegurar que el DOM se ha actualizado
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      const allInputs = document.querySelectorAll("input")
      allInputs.forEach((input) => {
        input.removeEventListener("focus", handleFocus)
        input.removeEventListener("blur", handleBlur)
      })
      observer.disconnect()
    }
  }, [])

  // Calcular la posición de los ojos basada en la posición del ratón
  const calculateEyePosition = (eye) => {
    if (!eye) return { x: 0, y: 0 }

    const eyeRect = eye?.getBoundingClientRect()
    if (!eyeRect) return { x: 0, y: 0 }

    const eyeCenterX = eyeRect.left + eyeRect.width / 2
    const eyeCenterY = eyeRect.top + eyeRect.height / 2

    // Limitar el movimiento del ojo
    const maxMovement = 2
    const deltaX = (mousePosition.x - eyeCenterX) / 25
    const deltaY = (mousePosition.y - eyeCenterY) / 25

    const x = Math.min(Math.max(deltaX, -maxMovement), maxMovement)
    const y = Math.min(Math.max(deltaY, -maxMovement), maxMovement)

    return { x, y }
  }

  return (
    <div className="wichat-character-container">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ position: "relative", height: "100%", width: "100%" }}
      >
        {/* SVG para un personaje más humano */}
        <svg viewBox="0 0 100 120" style={{ height: "100%", width: "100%" }}>
          {/* Sombra suave debajo del personaje */}
          <ellipse cx="50" cy="115" rx="25" ry="5" fill="rgba(0,0,0,0.1)" />

          {/* Cuello */}
          <path d="M 40 95 C 40 110 60 110 60 95" fill="#f0d0b0" />

          {/* Hombros */}
          <path d="M 25 100 C 25 110 40 105 40 95" fill="#3f51b5" />
          <path d="M 75 100 C 75 110 60 105 60 95" fill="#3f51b5" />

          {/* Cabeza - forma más humana */}
          <ellipse cx="50" cy="60" rx="30" ry="35" fill="#f0d0b0" />

          {/* Pelo */}
          <path d="M 20 60 C 20 40 30 25 50 25 C 70 25 80 40 80 60" fill="#5b3c11" />
          <path d="M 20 60 C 25 55 30 50 50 50 C 70 50 75 55 80 60" fill="#5b3c11" />

          {/* Detalles del pelo */}
          <path d="M 30 35 C 35 30 45 28 50 30" stroke="#4a3009" strokeWidth="0.5" fill="none" />
          <path d="M 70 35 C 65 30 55 28 50 30" stroke="#4a3009" strokeWidth="0.5" fill="none" />

          {/* Orejas */}
          <ellipse cx="20" cy="60" rx="5" ry="10" fill="#f0d0b0" />
          <ellipse cx="80" cy="60" rx="5" ry="10" fill="#f0d0b0" />

          {/* Cejas */}
          <path d="M 35 50 C 38 48 42 48 45 50" stroke="#5b3c11" strokeWidth="1.5" fill="none" />
          <path d="M 55 50 C 58 48 62 48 65 50" stroke="#5b3c11" strokeWidth="1.5" fill="none" />

          {/* Ojos - área blanca */}
          <g id="leftEye">
            <ellipse cx="40" cy="60" rx="5" ry="6" fill="white" stroke="#000" strokeWidth="0.5" />
            {!eyesClosed ? (
              <>
                <motion.ellipse
                  cx="40"
                  cy="60"
                  rx="2.5"
                  ry="3"
                  fill="#4b5563"
                  animate={{
                    cx: 40 + calculateEyePosition(document.getElementById("leftEye")).x,
                    cy: 60 + calculateEyePosition(document.getElementById("leftEye")).y,
                  }}
                />
                <motion.ellipse
                  cx="40"
                  cy="60"
                  rx="1"
                  ry="1"
                  fill="white"
                  animate={{
                    cx: 40 + calculateEyePosition(document.getElementById("leftEye")).x + 0.5,
                    cy: 60 + calculateEyePosition(document.getElementById("leftEye")).y - 0.5,
                  }}
                />
              </>
            ) : (
              <path d="M 35 60 C 38 58 42 58 45 60" stroke="#000" strokeWidth="1" fill="none" />
            )}
          </g>

          <g id="rightEye">
            <ellipse cx="60" cy="60" rx="5" ry="6" fill="white" stroke="#000" strokeWidth="0.5" />
            {!eyesClosed ? (
              <>
                <motion.ellipse
                  cx="60"
                  cy="60"
                  rx="2.5"
                  ry="3"
                  fill="#4b5563"
                  animate={{
                    cx: 60 + calculateEyePosition(document.getElementById("rightEye")).x,
                    cy: 60 + calculateEyePosition(document.getElementById("rightEye")).y,
                  }}
                />
                <motion.ellipse
                  cx="60"
                  cy="60"
                  rx="1"
                  ry="1"
                  fill="white"
                  animate={{
                    cx: 60 + calculateEyePosition(document.getElementById("rightEye")).x + 0.5,
                    cy: 60 + calculateEyePosition(document.getElementById("rightEye")).y - 0.5,
                  }}
                />
              </>
            ) : (
              <path d="M 55 60 C 58 58 62 58 65 60" stroke="#000" strokeWidth="1" fill="none" />
            )}
          </g>

          {/* Nariz */}
          <path d="M 50 65 C 52 70 48 70 50 70" stroke="#c0a080" strokeWidth="1" fill="none" />

          {/* Boca */}
          <path d="M 40 80 C 45 85 55 85 60 80" stroke="#c05050" strokeWidth="1.5" fill="none" />

          {/* Mejillas */}
          <circle cx="30" cy="70" r="5" fill="#f8c0c0" opacity="0.3" />
          <circle cx="70" cy="70" r="5" fill="#f8c0c0" opacity="0.3" />
        </svg>
      </motion.div>
    </div>
  )
}

