Feature: Login fallido

Scenario: El usuario introduce credenciales inválidas
  Given Un usuario registrado con nombre "wichat" y contraseña "123456"
  When Rellena el formulario de login con contraseña incorecta y lo envía
  Then Debería ver el mensaje "Credenciales inválidas"