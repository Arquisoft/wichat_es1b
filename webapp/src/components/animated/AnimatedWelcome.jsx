"use client"
import { motion } from "framer-motion"
import { Typography } from "@mui/material"

export default function AnimatedWelcome() {
  return (
    <motion.div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        style={{ marginBottom: "32px", height: "180px", width: "180px" }}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
      >
        <svg
          viewBox="0 0 100 120"
          style={{ height: "100%", width: "100%", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
        >
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

          {/* Cejas - levantadas para expresión feliz */}
          <path d="M 35 48 C 38 45 42 45 45 48" stroke="#5b3c11" strokeWidth="1.5" fill="none" />
          <path d="M 55 48 C 58 45 62 45 65 48" stroke="#5b3c11" strokeWidth="1.5" fill="none" />

          {/* Ojos - brillantes y expresivos */}
          <g>
            <ellipse cx="40" cy="60" rx="5" ry="6" fill="white" stroke="#000" strokeWidth="0.5" />
            <ellipse cx="40" cy="60" rx="2.5" ry="3" fill="#4b5563" />
            <ellipse cx="41" cy="59" rx="1" ry="1" fill="white" />
          </g>

          <g>
            <ellipse cx="60" cy="60" rx="5" ry="6" fill="white" stroke="#000" strokeWidth="0.5" />
            <ellipse cx="60" cy="60" rx="2.5" ry="3" fill="#4b5563" />
            <ellipse cx="61" cy="59" rx="1" ry="1" fill="white" />
          </g>

          {/* Nariz */}
          <path d="M 50 65 C 52 70 48 70 50 70" stroke="#c0a080" strokeWidth="1" fill="none" />

          {/* Boca - sonriendo ampliamente */}
          <path d="M 35 75 C 45 90 55 90 65 75" stroke="#c05050" strokeWidth="1.5" fill="none" />
          <path d="M 40 82 C 45 85 55 85 60 82" fill="#a04040" opacity="0.2" />

          {/* Mejillas */}
          <circle cx="30" cy="70" r="5" fill="#f8c0c0" opacity="0.5" />
          <circle cx="70" cy="70" r="5" fill="#f8c0c0" opacity="0.5" />
        </svg>
      </motion.div>

      <motion.div
        style={{
          background: "linear-gradient(to right, #3f51b5, #7e57c2)",
          borderRadius: "12px",
          padding: "16px 32px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          ¡BIENVENIDOS A WICHAT!
        </Typography>
      </motion.div>
    </motion.div>
  )
}

