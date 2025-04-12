Feature:Jugar una partida

Scenario: Jugador entra en partida
  Given Un usuario, estando en el menu
  When Inicia una partida
  Then debera mostrarse la pantalla de preguntas

Scenario: Jugador responde correctamente a una pregunta
    Given Un usuario, estando en la pantalla de preguntas
    When Responde correctamente a una pregunta
    Then debera mostrarse la respuesta en verde

Scenario: Jugador responde incorrectamente a una pregunta
    Given Un usuario, estando en la pantalla de preguntas
    When Responde incorrectamente a una pregunta
    Then debera mostrarse respuesta en rojo y en verde la correcta

Scenario: Jugador no responde a la pregunta
    Given Un usuario, estando en la pantalla de preguntas
    When No responde a la pregunta
    Then debera mostrarse la respuesta correcta en verde

Scenario: Jugador usa pista
    Given Un usuario, estando en la pantalla de preguntas
    When Usa una pista
    Then debera quedarse en la misma pantalla de preguntas

