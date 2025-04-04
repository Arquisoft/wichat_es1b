Feature: Con estadísticas en el Home

Scenario: Usuario sin partidas ve estadísticas recientes
  Given Un usuario sin partidas jugadas
  When Accede al Home
  Then Debera mostrarse un mensaje de "No hay datos de sesiones disponibles"

Scenario: Usuario con partidas ve estadísticas recientes
  Given Un usuario con partidas jugadas
  When Accede al Home
  Then Debera mostrarse unas estadísticas de preguntas correctas e incorrectas

