Feature: Sin estadísticas en el Home

Scenario: Usuario sin partidas ve estadisticas recientes
  Given Un usuario sin partidas jugadas
  When Accede al Home
  Then Deberia mostrarse un mensaje de "No hay datos de sesiones disponibles"