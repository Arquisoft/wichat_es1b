Feature: Login de usuario

Scenario: El usuario inicia sesión correctamente
  Given Un usuario registrado con nombre "wichat" y contraseña "123456"
  When Rellena el formulario de login y lo envía
  Then Debería ver el mensaje "WiChat te espera"