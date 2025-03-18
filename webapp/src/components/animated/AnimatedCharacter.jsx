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
    const maxMovement = 3
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
        {/* SVG para Doraemon */}
        <svg viewBox="0 0 200 200" style={{ height: "100%", width: "100%" }}>
          {/* Sombra */}
          <ellipse cx="100" cy="190" rx="40" ry="8" fill="rgba(0,0,0,0.2)" />

          {/* Cuerpo */}
          <ellipse cx="100" cy="140" rx="35" ry="30" fill="#1a75ff" />

          {/* Barriga */}
          <ellipse cx="100" cy="145" rx="25" ry="20" fill="white" />

          {/* Bolsillo */}
          <path d="M 90 145 C 90 155 110 155 110 145 L 110 160 C 110 170 90 170 90 160 Z" fill="white" />

          {/* Cabeza */}
          <circle cx="100" cy="90" r="50" fill="#1a75ff" />

          {/* Cara */}
          <circle cx="100" cy="100" r="40" fill="white" />

          {/* Ojos */}
          <g id="leftEye">
            <ellipse cx="85" cy="85" rx="10" ry="12" fill="white" stroke="#000" strokeWidth="1" />
            {!eyesClosed ? (
              <>
                <motion.circle
                  cx="85"
                  cy="85"
                  r="4"
                  fill="black"
                  animate={{
                    cx: 85 + calculateEyePosition(document.getElementById("leftEye")).x,
                    cy: 85 + calculateEyePosition(document.getElementById("leftEye")).y,
                  }}
                />
                <motion.circle
                  cx="85"
                  cy="83"
                  r="1.5"
                  fill="white"
                  animate={{
                    cx: 85 + calculateEyePosition(document.getElementById("leftEye")).x + 1,
                    cy: 83 + calculateEyePosition(document.getElementById("leftEye")).y,
                  }}
                />
              </>
            ) : (
              <path d="M 75 85 C 80 80 90 80 95 85" stroke="#000" strokeWidth="1.5" fill="none" />
            )}
          </g>

          <g id="rightEye">
            <ellipse cx="115" cy="85" rx="10" ry="12" fill="white" stroke="#000" strokeWidth="1" />
            {!eyesClosed ? (
              <>
                <motion.circle
                  cx="115"
                  cy="85"
                  r="4"
                  fill="black"
                  animate={{
                    cx: 115 + calculateEyePosition(document.getElementById("rightEye")).x,
                    cy: 85 + calculateEyePosition(document.getElementById("rightEye")).y,
                  }}
                />
                <motion.circle
                  cx="115"
                  cy="83"
                  r="1.5"
                  fill="white"
                  animate={{
                    cx: 115 + calculateEyePosition(document.getElementById("rightEye")).x + 1,
                    cy: 83 + calculateEyePosition(document.getElementById("rightEye")).y,
                  }}
                />
              </>
            ) : (
              <path d="M 105 85 C 110 80 120 80 125 85" stroke="#000" strokeWidth="1.5" fill="none" />
            )}
          </g>

          {/* Nariz */}
          <circle cx="100" cy="100" r="7" fill="#ff3333" />
          <ellipse cx="100" cy="102" rx="3" ry="1" fill="#ff6666" />

          {/* Bigotes */}
          <line x1="70" y1="95" x2="90" y2="100" stroke="#000" strokeWidth="1" />
          <line x1="70" y1="105" x2="90" y2="105" stroke="#000" strokeWidth="1" />
          <line x1="70" y1="115" x2="90" y2="110" stroke="#000" strokeWidth="1" />

          <line x1="130" y1="95" x2="110" y2="100" stroke="#000" strokeWidth="1" />
          <line x1="130" y1="105" x2="110" y2="105" stroke="#000" strokeWidth="1" />
          <line x1="130" y1="115" x2="110" y2="110" stroke="#000" strokeWidth="1" />

          {/* Boca */}
          <path d="M 75 115 C 90 130 110 130 125 115" stroke="#000" strokeWidth="1.5" fill="none" />

          {/* Collar */}
          <path d="M 70 135 C 70 145 130 145 130 135" fill="#ff3333" />
          
          {/* Cascabel */}
          <circle cx="100" cy="140" r="7" fill="#ffcc00" />
          <ellipse cx="100" cy="140" rx="5" ry="1" fill="#ffdb4d" />
          <line x1="100" y1="133" x2="100" y2="147" stroke="#000" strokeWidth="0.5" />

        </svg>
      </motion.div>
    </div>
  )
}

