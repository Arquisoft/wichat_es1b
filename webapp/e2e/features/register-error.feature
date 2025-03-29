Feature: Validación de registro

Scenario: Las contraseñas del usuario no coinciden
  Given Un usuario no registrado
  When Rellena el formulario con contraseñas no coincidentes y lo intenta enviar
  Then Debería mostrarse un mensaje de error