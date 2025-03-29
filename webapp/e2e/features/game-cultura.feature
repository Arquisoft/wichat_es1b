Feature: Juego en categoría "Cultura"

Scenario: El usuario responde correctamente una pregunta
  Given El usuario está jugando una partida en categoría "Cultura"
  When Selecciona la respuesta correcta
  Then La casilla se pone en verde y aumenta contador