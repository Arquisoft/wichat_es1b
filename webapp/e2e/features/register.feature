Feature: Resgistro de usuario

Scenario: El usuario se registra exitosamente
  Given Un usuario no registrado
  When Rellena el formulario de registro y lo envía
  Then Debería ver un mensaje de de confirmación