Feature: Registro de usuario

Scenario: El usuario se registra exitosamente
  Given Un usuario no registrado
  When Rellena el formulario de registro y lo envía
  Then Debería ver un mensaje de de confirmación


Scenario: Las contraseñas del usuario no coinciden
  Given Un usuario no registrado
  When Rellena el formulario con contraseñas no coincidentes y lo intenta enviar
  Then Debería mostrarse un mensaje de error