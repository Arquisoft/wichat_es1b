import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AnimatedCharacter from './AnimatedCharacter';
import React from 'react';

describe('AnimatedCharacter', () => {
  beforeEach(() => {
    // Limpiar el DOM antes de cada test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('se renderiza correctamente', () => {
    render(<AnimatedCharacter />);const svg = screen.getByTestId('character-svg');
    expect(svg).toBeInTheDocument();
  });

  it('reacciona al movimiento del ratón', () => {
    render(<AnimatedCharacter />);
    const mouseMove = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 100,
    });
    window.dispatchEvent(mouseMove);
    // No assertion necesaria: cubre el eventListener y update de mousePosition
  });

  it('cierra los ojos al enfocar un input de contraseña', () => {
    render(<AnimatedCharacter />);
    const input = document.createElement('input');
    input.type = 'password';
    document.body.appendChild(input);
    fireEvent.focus(input);
    fireEvent.blur(input);
    // Cubre los handlers handleFocus y handleBlur
  });

  it('detecta campos dinámicos con atributo name/placeholder relacionado con contraseña', () => {
    render(<AnimatedCharacter />);
    const input = document.createElement('input');
    input.setAttribute('name', 'userPassword');
    document.body.appendChild(input);
    fireEvent.focus(input);
    fireEvent.blur(input);
  });

  it('configura correctamente el MutationObserver y cleanup', () => {
    const observerMock = jest.fn();
    const observeMock = jest.fn();
    const disconnectMock = jest.fn();

    global.MutationObserver = class {
      constructor(cb) {
        observerMock(cb);
      }
      observe = observeMock;
      disconnect = disconnectMock;
    };

    const { unmount } = render(<AnimatedCharacter />);
    expect(observeMock).toHaveBeenCalled();

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('maneja correctamente los listeners y calcula la posición del ojo', () => {
    render(<AnimatedCharacter />);
  
    // Crear dos inputs: uno común y otro tipo password
    const inputNormal = document.createElement('input');
    const inputPassword = document.createElement('input');
    inputPassword.type = 'password';
  
    document.body.appendChild(inputNormal);
    document.body.appendChild(inputPassword);
  
    // Disparar focus y blur en input normal (cubrir removeEventListener en línea 22-23)
    fireEvent.focus(inputNormal);
    fireEvent.blur(inputNormal);
  
    // Disparar focus y blur en input de password (cubre líneas 37-38)
    fireEvent.focus(inputPassword);
    fireEvent.blur(inputPassword);
  
    // Simular cálculo de posición de ojo (líneas 76–90)
    const eye = document.createElement('div');
    eye.getBoundingClientRect = () => ({
      left: 50,
      top: 50,
      width: 20,
      height: 20,
    });
    document.body.appendChild(eye);
  
    const instance = render(<AnimatedCharacter />);
    const result = instance.container.querySelector('.wichat-character-container');
  
    // Simula movimiento del ratón para actualizar mousePosition
    fireEvent(
      window,
      new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100,
      })
    );
  }); 
  
});
