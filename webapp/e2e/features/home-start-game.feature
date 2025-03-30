Feature: Inicio de partida

Scenario: Usuario inicia partida desde Home
  Given Un usuario con sesión iniciada correctamente
  When Hace click sobre "Comenzar partida"
  Then Escoge categoría a jugar y se muestra la primera pregunta