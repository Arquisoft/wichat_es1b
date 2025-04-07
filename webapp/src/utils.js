export const getPlayerLevel = (totalQuestions) => {
    if (totalQuestions < 10) return { level: "Principiante", color: "#9E9E9E" }
    if (totalQuestions < 30) return { level: "Aprendiz", color: "#8BC34A" }
    if (totalQuestions < 60) return { level: "Intermedio", color: "#03A9F4" }
    if (totalQuestions < 100) return { level: "Avanzado", color: "#FF9800" }
    if (totalQuestions < 200) return { level: "Experto", color: "#F44336" }
    return { level: "Generalísimo", color: "#3c8841" }
}