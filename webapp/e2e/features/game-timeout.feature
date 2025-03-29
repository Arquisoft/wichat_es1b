Feature: Juego en categoría "Cultura"

Scenario: El usuario no responde a tiempo
  Given El usuario está jugando una partida en categoría "Cultura"
  When Deja que el tiempo se acabe sin responder
  Then Se pasa a la siguiente pregunta