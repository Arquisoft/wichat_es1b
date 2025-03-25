import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from './Home';

const mockAxios = new MockAdapter(axios);

const renderComponent = () => {
  return render(
    <Router>
      <Home />
    </Router>
  );
};

describe('Home component', () => {
  const mockSession = {
    _id: 'session1',
    createdAt: new Date().toISOString(),
    score: 4,
    wrongAnswers: 1,
    questions: [
      {
        question: '¿Capital de Francia?',
        correctAnswer: 'París',
        userAnswer: 'París'
      },
      {
        question: '¿Capital de Alemania?',
        correctAnswer: 'Berlín',
        userAnswer: 'Berlín'
      }
    ]
  };

  beforeEach(() => {
    localStorage.setItem('username', 'TestUser');
    mockAxios.reset();
  });

  it('renderiza correctamente sin sesiones', async () => {
    mockAxios.onGet(/get-sessions/).reply(200, []);

    renderComponent();

    expect(await screen.findByText(/WiChat te espera/i)).toBeInTheDocument();

    expect(await screen.findByText(/No hay datos de sesiones disponibles/i)).toBeInTheDocument();
  });

  it('renderiza con sesiones y permite ver detalles de una sesión', async () => {
    mockAxios.onGet(/get-sessions/).reply(200, [mockSession]);

    renderComponent();

    // Espera a que se cargue la sesión
    expect(await screen.findByText(/Sesión del/i)).toBeInTheDocument();

    // Click para abrir el diálogo
    fireEvent.click(screen.getByText(/Sesión del/i));

    // Espera el contenido del diálogo
    await waitFor(() => {
      expect(screen.getByText(/Respuestas correctas/i)).toBeInTheDocument();
    });

    // Expandir pregunta
    fireEvent.click(screen.getByText(/Pregunta 1/i));
    const parisElements = await screen.findAllByText(/París/i);
    expect(parisElements.length).toBeGreaterThan(0);

    // Cerrar diálogo
    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }));
  });

  it('permite iniciar partidas por cada categoría', async () => {
    const categorias = ['Geografía', 'Cultura', 'Personajes', 'Aleatorio'];

    for (const categoria of categorias) {
      mockAxios.resetHandlers(); // limpiar mocks anteriores
      mockAxios.onGet(/get-sessions/).reply(200, []);

      renderComponent(); // nuevo render para cada categoría

      const mainButton = await screen.findAllByRole('button', { name: /comenzar partida/i });
      expect(mainButton.length).toBeGreaterThan(0);
      fireEvent.click(mainButton[0]); // usar el primero

      const menuItem = await screen.findByRole('menuitem', { name: new RegExp(categoria, 'i') });
      expect(menuItem).toBeInTheDocument();
      fireEvent.click(menuItem);
    }
  });

  it('muestra correctamente el nivel de jugador para diferentes cantidades de preguntas', async () => {
    const niveles = [
      { level: 'Principiante', data: [{ score: 2, wrongAnswers: 3 }] }, // totalQuestions: 5
      { level: 'Aprendiz', data: [{ score: 15, wrongAnswers: 10 }] },   // totalQuestions: 25
      { level: 'Intermedio', data: [{ score: 35, wrongAnswers: 20 }] }, // totalQuestions: 55
      { level: 'Avanzado', data: [{ score: 50, wrongAnswers: 45 }] },   // totalQuestions: 95
      { level: 'Experto', data: [{ score: 100, wrongAnswers: 10 }] },   // totalQuestions: 110
    ];

    for (const { level, data } of niveles) {
      mockAxios.resetHandlers();
      mockAxios.onGet(/get-sessions/).reply(200, data);

      renderComponent();

      const chip = await screen.findByText(new RegExp(`Nivel: ${level}`, 'i'));
      expect(chip).toBeInTheDocument();
    }
  });

});
