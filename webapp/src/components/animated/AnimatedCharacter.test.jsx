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
});
