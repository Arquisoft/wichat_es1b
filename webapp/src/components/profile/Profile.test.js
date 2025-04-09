import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter as Router } from 'react-router-dom';
import Profile from './Profile';

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

describe('Profile component', () => {
  beforeEach(() => {
    localStorage.setItem('username', 'TestUser');
    mockAxios.reset();
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
  
    const menuItems = await screen.findAllByRole('menuitem');
    const logoutBtn = menuItems.find(item => item.innerHTML.includes('ExitToAppIcon'));
  
    fireEvent.click(logoutBtn);
  
    await waitFor(() => {
      expect(localStorage.getItem('username')).toBeNull();
    });
  });
  
  it('permite volver al Home al hacer clic en el botón de Home', async () => {
    setupMockResponse({ sessions: [mockSession] });
  
    renderComponent();
  
    const menuItems = await screen.findAllByRole('menuitem');
    const homeBtn = menuItems.find(item => item.innerHTML.includes('HomeIcon'));
  
    fireEvent.click(homeBtn);
  
    // Podés mockear useNavigate y verificar que se llamó, si querés.
  });  
  
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn()
  }));
  
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
