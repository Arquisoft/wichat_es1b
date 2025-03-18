import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter as Router } from "react-router-dom";
import Game from './Game';


// Configurar un mock de Axios
const mockAxios = new MockAdapter(axios);

describe('Game Component', () => {
  
  beforeEach(() => {
    mockAxios.reset(); // Reiniciar mocks antes de cada prueba

    // Mock de la API de preguntas para evitar llamadas reales
    mockAxios.onGet('http://localhost:8000/generateQuestion').reply(200, {
      responseQuestion: "¿Cuál es la capital de Francia?",
      responseAnswerOptions: ["Madrid", "París", "Londres", "Berlín"],
      responseCorrectAnswer: "París",
      responseQuestionImage: "https://example.com/image.jpg"
    });
  });

  it('debe mostrar la pregunta y las opciones correctamente', async () => {
    render(
      <Router>
        <Game />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText("¿Cuál es la capital de Francia?")).toBeInTheDocument();
      expect(screen.getByText("Madrid")).toBeInTheDocument();
      expect(screen.getByText("París")).toBeInTheDocument();
      expect(screen.getByText("Londres")).toBeInTheDocument();
      expect(screen.getByText("Berlín")).toBeInTheDocument();
    });
  });

  it('debe cambiar el color del botón al responder correctamente', async () => {
    render(
      <Router>
        <Game />
      </Router>
    );

    const correctButton = await screen.findByText("París");

    fireEvent.click(correctButton);

    await waitFor(() => {
      expect(correctButton).toHaveStyle('background-color: green'); // Respuesta correcta en verde
    });
  });

  it('debe cambiar el color del botón al responder incorrectamente', async () => {
    render(
      <Router>
        <Game />
      </Router>
    );

    const incorrectButton = await screen.findByText("Madrid");

    fireEvent.click(incorrectButton);

    await waitFor(() => {
      expect(incorrectButton).toHaveStyle('background-color: red'); // Respuesta incorrecta en rojo
    });
  });

  it('debe incrementar la puntuación cuando se responde correctamente', async () => {
    render(
      <Router>
        <Game />
      </Router>
    );

    const correctButton = await screen.findByText("París");

    fireEvent.click(correctButton);

    await waitFor(() => {
      expect(screen.getByText(/Puntuación: 1/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar y actualizar el temporizador correctamente', async() => {
    jest.useFakeTimers();

    render(
      <Router>
        <Game />
      </Router>
    );

    // Esperar a que la pregunta se cargue antes de verificar el temporizador
    await waitFor(() => {
      expect(screen.getByText("¿Cuál es la capital de Francia?")).toBeInTheDocument();
    });

    // Verificar que el tiempo inicial es 30s
    await waitFor(() => {
      expect(screen.getByText(/Tiempo restante: 30s/i)).toBeInTheDocument();
    })
    
    // Simular el paso de 10 segundos
    act(() => {
      jest.advanceTimersByTime(10000);
    })

    // Esperar a que el temporizador refleje el cambio (debe estar entre 20 y 29 segundos)
    await waitFor(() => {
      const tiempoRestante = screen.getByText(/Tiempo restante: \d+s/i).textContent;
      const tiempoNumerico = parseInt(tiempoRestante.match(/\d+/)[0], 10);
      expect(tiempoNumerico).toBeLessThanOrEqual(29);
      expect(tiempoNumerico).toBeGreaterThanOrEqual(20);
    });

    act(() => {
      jest.advanceTimersByTime(20000);
    })

    await waitFor(() => {
      expect(screen.getByText(/Tiempo restante: 0s/i)).toBeInTheDocument();
    });

    jest.useRealTimers();
  })

});
