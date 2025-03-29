Feature: Con estadísticas en el Home

Scenario: Usuario con partidas ve estadisticas recientes
  Given Un usuario con partidas jugadas
  When Accede al Home
  Then Deberia mostrarse un gráfico de preguntas correctas e incorrectas