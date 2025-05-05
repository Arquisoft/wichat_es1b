import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import Profile from './Profile';

// Suppress MUI warning about non-boolean attributes
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

// Mock react-router useNavigate to track calls
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockAxios = new MockAdapter(axios);

const renderComponent = () =>
  render(
    <Router>
      <Profile />
    </Router>
  );

const mockSession = {
  _id: 'session1',
  createdAt: new Date().toISOString(),
  score: 4,
  wrongAnswers: 1,
  difficulty: 'Fácil',
  category: 'Historia',
  questions: [
    { question: '¿Capital de Francia?', correctAnswer: 'París', userAnswer: 'París' },
    { question: '¿Capital de Alemania?', correctAnswer: 'Berlín', userAnswer: 'Madrid' },
  ],
};

describe('Profile Component', () => {
  beforeEach(() => {
    mockAxios.reset();
    localStorage.setItem('username', 'TestUser');
    mockNavigate.mockClear();
  });

  const mockResponse = (sessions) => {
    mockAxios.onGet(/get-user-sessions/).reply(200, { sessions });
  };

  it('shows loading skeletons initially', async () => {
    mockResponse([]);
    const { container } = renderComponent();
    const skeletons = container.getElementsByClassName('MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(screen.queryByText(/No hay datos de sesiones disponibles/i)).toBeInTheDocument();
    });
  });

  it('renders empty state when no sessions', async () => {
    mockResponse([]);
    renderComponent();
    expect(await screen.findByText(/No hay datos de sesiones disponibles/i)).toBeInTheDocument();
  });

  it('renders session list and details dialog', async () => {
    mockResponse([mockSession]);
    renderComponent();
    expect(await screen.findByText(/Sesión del/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Sesión del/i));
    expect(await screen.findByText(/Detalles de la sesión/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Pregunta 1/i));
    expect(await screen.findAllByText(/París/i)).toHaveLength(2);
    fireEvent.click(screen.getByText(/Pregunta 2/i));
    expect(await screen.findByText(/Berlín/i)).toBeInTheDocument();
    expect(await screen.findByText(/Madrid/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Detalles de la sesión/i)).not.toBeInTheDocument();
    });
  });

  it('displays greeting based on time of day', () => {
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor() {
        super();
        return new RealDate('2025-05-05T08:00:00Z');
      }
    };
    mockResponse([]);
    renderComponent();
    expect(screen.getByText(/¡Buenos días, TestUser/i)).toBeInTheDocument();

    global.Date = class extends RealDate {
      constructor() {
        super();
        return new RealDate('2025-05-05T14:00:00Z');
      }
    };
    renderComponent();
    expect(screen.getByText(/¡Buenas tardes, TestUser/i)).toBeInTheDocument();

    global.Date = class extends RealDate {
      constructor() {
        super();
        return new RealDate('2025-05-05T21:00:00Z');
      }
    };
    renderComponent();
    expect(screen.getByText(/¡Buenas noches, TestUser/i)).toBeInTheDocument();

    global.Date = RealDate;
  });

  it('shows player level for various total questions', async () => {
    const levels = [
      { total: 5, label: 'Principiante' },
      { total: 25, label: 'Aprendiz' },
      { total: 55, label: 'Intermedio' },
      { total: 95, label: 'Avanzado' },
      { total: 110, label: 'Experto' },
    ];
    for (const { total, label } of levels) {
      const session = { ...mockSession, score: total, wrongAnswers: 0, questions: [] };
      mockAxios.reset();
      mockResponse([session]);
      renderComponent();
      expect(await screen.findByText(new RegExp(`Nivel: ${label}`, 'i'))).toBeInTheDocument();
    }
  });

  it('allows sorting sessions by score and date', async () => {
    const s1 = { ...mockSession, _id: '1', score: 1, createdAt: '2025-01-01T00:00:00Z' };
    const s2 = { ...mockSession, _id: '2', score: 5, createdAt: '2025-06-01T00:00:00Z' };
    mockResponse([s1, s2]);
    renderComponent();
    const items = await screen.findAllByText(/Sesión del/);
    const expectedDate = new Date('2025-06-01T00:00:00Z').toLocaleDateString();
    expect(items[0].textContent).toContain(expectedDate);

    fireEvent.click(screen.getByText(/Ordenar por: Fecha/i));
    fireEvent.click(screen.getByText(/Puntuación/i));
    expect(screen.getByText(/Ordenar por: Puntuación/i)).toBeInTheDocument();
  });

  it('handles pagination correctly', async () => {
    const sessions = Array.from({ length: 8 }, (_, i) => ({
      ...mockSession,
      _id: `s${i}`,
      createdAt: `2025-05-0${i + 1}T00:00:00Z`,
    }));
    mockResponse(sessions);
    renderComponent();
    expect(await screen.findByText(/Página 1 de 2/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Siguiente/i));
    expect(await screen.findByText(/Página 2 de 2/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Anterior/i));
    expect(await screen.findByText(/Página 1 de 2/)).toBeInTheDocument();
  });

  it('logs out and navigates home', async () => {
    mockResponse([mockSession]);
    renderComponent();
    fireEvent.click(screen.getAllByRole('menuitem')[3]); // Home icon
    expect(mockNavigate.mock.calls[0][0]).toBe('/Home');

    fireEvent.click(screen.getAllByRole('menuitem')[4]); // Logout icon
    await waitFor(() => expect(localStorage.getItem('username')).toBeNull());
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows error state when fetching sessions fails', async () => {
    mockAxios.onGet(/get-user-sessions/).reply(500);
    renderComponent();
    expect(await screen.findByText(/No hay datos de sesiones disponibles/i)).toBeInTheDocument();
  });
});
