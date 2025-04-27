jest.mock('../../components/game/multiplayer/Multiplayer', () => {
  const mockMultiplayerInstance = {
    socket: { connected: true, emit: jest.fn() },
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn(),
    on: jest.fn().mockImplementation(function() { return this; }),
    off: jest.fn().mockImplementation(function() { return this; }),
    createRoom: jest.fn().mockResolvedValue({ success: true }),
    joinRoom: jest.fn().mockResolvedValue({ success: true }),
    leaveRoom: jest.fn(),
    requestQuestions: jest.fn().mockResolvedValue([]),
    sendReady: jest.fn(),
    startGame: jest.fn(),
    userId: 'testUserId'
  };

  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => mockMultiplayerInstance)
    }
  };
});

// webapp/src/components/profile/Profile.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter, BrowserRouter as Router } from 'react-router-dom';
import Profile from './Profile';

// Mock window.alert to avoid JSDOM errors
beforeAll(() => {
  window.alert = jest.fn();
  jest.spyOn(console, 'error').mockImplementation(() => {}); // Silence errors
});
afterAll(() => {
  window.alert.mockRestore();
  console.error.mockRestore();
});

const mockAxios = new MockAdapter(axios);

const renderComponent = () => {
  return render(
      <Router>
        <Profile />
      </Router>
  );
};

const mockSession = {
  _id: 'session1',
  createdAt: new Date().toISOString(),
  score: 4,
  wrongAnswers: 1,
  difficulty: 'Fácil',
  category: 'Historia',
  questions: [
    {
      question: '¿Capital de Francia?',
      correctAnswer: 'París',
      userAnswer: 'París',
    },
    {
      question: '¿Capital de Alemania?',
      correctAnswer: 'Berlín',
      userAnswer: 'Madrid',
    }
  ]
};

// Mock useNavigate globally
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Profile component', () => {
  beforeEach(() => {
    localStorage.setItem('username', 'TestUser');
    mockAxios.reset();
    mockNavigate.mockClear();
  });

  const setupMockResponse = (response) => {
    mockAxios.onGet(new RegExp(`/get-user-sessions/`)).reply(200, response);
  };

  it('renderiza correctamente sin sesiones', async () => {
    setupMockResponse({ sessions: [] });

    renderComponent();

    expect(await screen.findByText(/WiChat - Perfil/i)).toBeInTheDocument();
    expect(await screen.findByText(/Estas son las estadísticas de tu perfil/i)).toBeInTheDocument();
    expect(await screen.findByText(/No hay datos de sesiones disponibles/i)).toBeInTheDocument();
  });

  it('renderiza con sesiones y permite ver detalles de una sesión', async () => {
    setupMockResponse({ sessions: [mockSession] });

    renderComponent();

    expect(await screen.findByText(/Sesión del/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Sesión del/i));

    await waitFor(() => {
      expect(screen.getByText(/Detalles de la sesión/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Pregunta 1/i));
    const parisElements = await screen.findAllByText(/París/i);
    expect(parisElements.length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText(/Pregunta 2/i));
    expect(await screen.findByText(/Berlín/i)).toBeInTheDocument();
    expect(await screen.findByText(/Madrid/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }));
  });

  it('muestra mensaje de bienvenida y estadísticas', async () => {
    setupMockResponse({ sessions: [mockSession] });

    renderComponent();

    expect(await screen.findByText(/WiChat - Perfil/i)).toBeInTheDocument();

    expect(await screen.findAllByText(/Correctas/i)).not.toHaveLength(0);
    expect(await screen.findAllByText(/Incorrectas/i)).not.toHaveLength(0);
    expect(await screen.findAllByText(/Tasa de acierto/i)).not.toHaveLength(0);
  });

  it('muestra correctamente el nivel de jugador para diferentes cantidades de preguntas', async () => {
    const niveles = [
      { level: 'Principiante', data: [{ score: 2, wrongAnswers: 3 }] },
      { level: 'Aprendiz', data: [{ score: 15, wrongAnswers: 10 }] },
      { level: 'Intermedio', data: [{ score: 35, wrongAnswers: 20 }] },
      { level: 'Avanzado', data: [{ score: 50, wrongAnswers: 45 }] },
      { level: 'Experto', data: [{ score: 100, wrongAnswers: 10 }] },
    ];

    for (const { level, data } of niveles) {
      mockAxios.resetHandlers();
      setupMockResponse({ sessions: data });

      renderComponent();

      const chip = await screen.findByText(new RegExp(`Nivel: ${level}`, 'i'));
      expect(chip).toBeInTheDocument();
    }
  });

  it('permite cambiar el orden de las sesiones', async () => {
    setupMockResponse({ sessions: [mockSession] });

    renderComponent();

    const sortButton = await screen.findByText(/Ordenar por/i);
    fireEvent.click(sortButton);

    const scoreOption = await screen.findByText(/Puntuación/i);
    fireEvent.click(scoreOption);

    expect(screen.getByText(/Ordenar por: Puntuación/i)).toBeInTheDocument();
  });

  it('permite cerrar sesión y redirige al inicio', async () => {
    setupMockResponse({ sessions: [mockSession] });

    renderComponent();

    // Find the logout button
    const menuItems = await screen.findAllByRole('menuitem');
    const logoutBtn = menuItems[4];

    // Click the logout button
    fireEvent.click(logoutBtn);

    // Check that localStorage was cleared and navigate was called
    await waitFor(() => {
      expect(localStorage.getItem('username')).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('permite volver al Home al hacer clic en el botón de Home', async () => {
    setupMockResponse({ sessions: [mockSession] });

    renderComponent();

    const menuItems = await screen.findAllByRole('menuitem');
    const homeBtn = menuItems.find(item => item.innerHTML.includes('HomeIcon'));

    fireEvent.click(homeBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/Home');
  });

  it('permite navegar entre páginas de sesiones', async () => {
    const sessions = Array.from({ length: 8 }, (_, i) => ({
      ...mockSession,
      _id: `session${i}`,
      createdAt: new Date().toISOString(),
    }));

    setupMockResponse({ sessions });

    renderComponent();

    expect(await screen.findByText(/Página 1 de 2/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Siguiente/i));
    expect(await screen.findByText(/Página 2 de 2/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Anterior/i));
    expect(await screen.findByText(/Página 1 de 2/)).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay preguntas detalladas en una sesión', async () => {
    const sessionWithoutQuestions = { ...mockSession, questions: [] };
    setupMockResponse({ sessions: [sessionWithoutQuestions] });

    renderComponent();

    fireEvent.click(await screen.findByText(/Sesión del/i));

    expect(await screen.findByText(/No hay información detallada de preguntas/i)).toBeInTheDocument();
  });
});