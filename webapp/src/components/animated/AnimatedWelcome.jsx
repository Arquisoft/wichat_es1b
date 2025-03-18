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
        style={{ marginBottom: "32px", height: "200px", width: "200px" }}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
      >
        {/* SVG para Doraemon */}
        <svg
          viewBox="0 0 200 200"
          style={{ height: "100%", width: "100%", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
        >
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
          <g>
            <ellipse cx="85" cy="85" rx="10" ry="12" fill="white" stroke="#000" strokeWidth="1" />
            <circle cx="85" cy="85" r="4" fill="black" />
            <circle cx="86" cy="83" r="1.5" fill="white" />
          </g>

          <g>
            <ellipse cx="115" cy="85" rx="10" ry="12" fill="white" stroke="#000" strokeWidth="1" />
            <circle cx="115" cy="85" r="4" fill="black" />
            <circle cx="116" cy="83" r="1.5" fill="white" />
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

          {/* Boca - sonriendo ampliamente */}
          <path d="M 75 115 C 90 135 110 135 125 115" stroke="#000" strokeWidth="1.5" fill="none" />

          {/* Collar */}
          <path d="M 70 135 C 70 145 130 145 130 135" fill="#ff3333" />
          
          {/* Cascabel */}
          <circle cx="100" cy="140" r="7" fill="#ffcc00" />
          <ellipse cx="100" cy="140" rx="5" ry="1" fill="#ffdb4d" />
          <line x1="100" y1="133" x2="100" y2="147" stroke="#000" strokeWidth="0.5" />

          {/* Manos saludando */}
          <motion.path
            d="M 60 140 C 50 130 45 120 50 110"
            fill="none"
            stroke="#1a75ff"
            strokeWidth="8"
            strokeLinecap="round"
            animate={{
              d: [
                "M 60 140 C 50 130 45 120 50 110",
                "M 60 140 C 50 120 45 100 50 90",
                "M 60 140 C 50 130 45 120 50 110",
              ],
            }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, repeatType: "reverse" }}
          />

          <motion.path
            d="M 140 140 C 150 130 155 120 150 110"
            fill="none"
            stroke="#1a75ff"
            strokeWidth="8"
            strokeLinecap="round"
            animate={{
              d: [
                "M 140 140 C 150 130 155 120 150 110",
                "M 140 140 C 150 120 155 100 150 90",
                "M 140 140 C 150 130 155 120 150 110",
              ],
            }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, repeatType: "reverse", delay: 0.5 }}
          />
        </svg>
      </motion.div>

      <motion.div
        style={{
          background: "linear-gradient(to right, #1a75ff, #0052cc)",
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

