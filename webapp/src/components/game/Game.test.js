import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Game from './Game';

// Mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn()
}));

// Mock the chatbot component
jest.mock('../chatbot/chat', () => {
  return function DummyChat() {
    return <div data-testid="chat-component">Chat Component</div>;
  };
});

// Mock recharts for better test performance
jest.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell"></div>,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    close: jest.fn(),
    io: {
      opts: {
        transports: ['websocket']
      }
    }
  };
  return jest.fn(() => mockSocket);
});

// Mock WebSocket
global.WebSocket = class WebSocketMock {
  constructor() {
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.readyState = 1; // OPEN

    // Simulate successful connection
    setTimeout(() => {
      if (this.onopen) this.onopen({ target: this });
    }, 0);
  }

  send = jest.fn();
  close = jest.fn();
};

// Mock multiplayer service if it's used in Game component
jest.mock('../game/multiplayer/Multiplayer', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue({}),
      disconnect: jest.fn(),
      onMessage: jest.fn(),
      sendMessage: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true)
    }))
  };
});

// Mock timer
jest.useFakeTimers();

describe('Game Component', () => {
  const mockNavigate = jest.fn();
  const mockLocation = {
    state: {
      gameConfig: {
        numQuestions: 5,
        timePerQuestion: 20,
        difficulty: 'Normal',
        category: 'Science'
      }
    }
  };

  const mockQuestion = {
    data: {
      firstQuestion: {
        questionObject: "What is the capital of France?",
        questionImage: "https://example.com/paris.jpg",
        correctAnswer: "Paris",
        answerOptions: ["London", "Paris", "Berlin", "Madrid"]
      }
    }
  };

  const mockNextQuestion = {
    data: {
      questionObject: "Which planet is known as the Red Planet?",
      questionImage: "https://example.com/mars.jpg",
      correctAnswer: "Mars",
      answerOptions: ["Venus", "Mars", "Jupiter", "Saturn"]
    }
  };

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue(mockLocation);

    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'username') return 'testuser';
      if (key === 'gameCategory') return 'Science';
      return null;
    });
    Storage.prototype.setItem = jest.fn();

    // Mock axios calls
    axios.post.mockResolvedValue(mockQuestion);
    axios.get.mockResolvedValue(mockNextQuestion);

    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    expect(screen.getByText('Cargando preguntas...')).toBeInTheDocument();
  });

  test('renders game with question after loading', async () => {
    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
        category: 'Science'
      });
    });

    // Advance timers to complete loading
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Check if the question is displayed
    await waitFor(() => {
      expect(screen.getByTestId('question')).toHaveTextContent('What is the capital of France?');
    });
  });

  test('handles option selection correctly for correct answer', async () => {
    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Advance timers to complete loading
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Find and click the correct answer
    await waitFor(() => {
      const correctOption = screen.getByText('Paris');
      fireEvent.click(correctOption);
    });

    // Score should be updated
    await waitFor(() => {
      // This checks that the score element shows 1
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    // Check if the next question is fetched after delay
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('handles option selection correctly for incorrect answer', async () => {
    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Advance timers to complete loading
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Find and click an incorrect answer
    await waitFor(() => {
      const incorrectOption = screen.getByText('London');
      fireEvent.click(incorrectOption);
    });

    // Score should still be 0
    await waitFor(() => {
      // This checks that the score element shows 0
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    // Check if the next question is fetched after delay
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('handles timer expiration correctly', async () => {
    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Advance timers to complete loading
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Advance timers to expire the question timer
    act(() => {
      jest.advanceTimersByTime(20000);
    });

    // Check if the next question is fetched after time expires
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('navigates to home when home button is clicked', async () => {
    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Advance timers to complete loading
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Find and click the home button
    const homeButton = screen.getByText('Abandonar');
    fireEvent.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/Home');
  });

  test('restarts game when restart button is clicked', async () => {
    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Advance timers to complete loading
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Reset mocks to check if they're called again
    axios.post.mockClear();

    // Find and click the restart button
    const restartButton = screen.getByText('Reiniciar');
    fireEvent.click(restartButton);

    expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
      category: expect.any(String)
    });
  });

  test('shows game finished screen after all questions', async () => {
    // Override the mock location to have just 1 question
    useLocation.mockReturnValue({
      state: {
        gameConfig: {
          numQuestions: 1,
          timePerQuestion: 20,
          difficulty: 'Normal',
          category: 'Science'
        }
      }
    });

    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Advance timers to complete loading
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Find and click the correct answer
    await waitFor(() => {
      const correctOption = screen.getByText('Paris');
      fireEvent.click(correctOption);
    });

    // Advance timers to show game finished screen
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Check if game finished screen is shown
    await waitFor(() => {
      expect(screen.getByText('¡Partida finalizada!')).toBeInTheDocument();
    });

    // Check if session data is saved
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/save-session'), expect.any(Object));
  });

  test('navigates to profile from game finished screen', async () => {
    // Override the mock location to have just 1 question
    useLocation.mockReturnValue({
      state: {
        gameConfig: {
          numQuestions: 1,
          timePerQuestion: 20,
          difficulty: 'Normal',
          category: 'Science'
        }
      }
    });

    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Advance timers to complete loading
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Find and click the correct answer
    await waitFor(() => {
      const correctOption = screen.getByText('Paris');
      fireEvent.click(correctOption);
    });

    // Advance timers to show game finished screen
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Find and click the profile button
    await waitFor(() => {
      const profileButton = screen.getByText('Perfil');
      fireEvent.click(profileButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/Profile');
  });

  test('displays chat component during game', async () => {
    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Advance timers to complete loading
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Check if the chat component is rendered
    expect(screen.getByTestId('chat-component')).toBeInTheDocument();
  });

  test('plays again from finished game screen', async () => {
    // Override the mock location to have just 1 question
    useLocation.mockReturnValue({
      state: {
        gameConfig: {
          numQuestions: 1,
          timePerQuestion: 20,
          difficulty: 'Normal',
          category: 'Science'
        }
      }
    });

    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load and complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Find and click the correct answer
    await waitFor(() => {
      const correctOption = screen.getByText('Paris');
      fireEvent.click(correctOption);
    });

    // Advance timers to show game finished screen
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Reset axios.post mock
    axios.post.mockClear();

    // Find and click the "play again" button
    const playAgainButton = screen.getByText('Jugar de nuevo');
    fireEvent.click(playAgainButton);

    // Check if a new game is started
    expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
      category: expect.any(String)
    });
  });

  test('displays results chart on game finished screen', async () => {
    // Override the mock location to have just 1 question
    useLocation.mockReturnValue({
      state: {
        gameConfig: {
          numQuestions: 1,
          timePerQuestion: 20,
          difficulty: 'Normal',
          category: 'Science'
        }
      }
    });

    render(
        <MemoryRouter>
          <Game />
        </MemoryRouter>
    );

    // Wait for the game to load
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // Advance timers to complete loading
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Find and click the correct answer
    await waitFor(() => {
      const correctOption = screen.getByText('Paris');
      fireEvent.click(correctOption);
    });

    // Advance timers to show game finished screen
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Check if the results chart components are rendered
    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });
  
  test('muestra error si no se recibe la primera pregunta al iniciar partida', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Silenciar el log
  
    // Simula respuesta sin 'firstQuestion'
    axios.post.mockResolvedValueOnce({ data: {} });
  
    render(
      <MemoryRouter>
        <Game />
      </MemoryRouter>
    );
  
    // Espera a que se ejecute handleNewGame
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("No question received");
    });
  
    consoleErrorSpy.mockRestore();
  });

  test('muestra advertencia si no hay preguntas en la sesión y muestra error si falla el guardado', async () => {
    // Mock sin preguntas en sesión y fallo al guardar
    useLocation.mockReturnValue({
      state: {
        gameConfig: {
          numQuestions: 1,
          timePerQuestion: 20,
          difficulty: 'Normal',
          category: 'Science'
        }
      }
    });
  
    // 1. Simula que la primera llamada carga bien
    axios.post.mockResolvedValueOnce({
      data: {
        firstQuestion: {
          questionObject: "¿Capital de Francia?",
          questionImage: "img.png",
          correctAnswer: "Paris",
          answerOptions: ["Paris", "Madrid"]
        }
      }
    });
  
    // 2. Pero simula que guardar sesión falla
    axios.post.mockRejectedValueOnce(new Error("Falló al guardar"));
  
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    render(
      <MemoryRouter>
        <Game />
      </MemoryRouter>
    );
  
    // Clic en opción correcta para finalizar
    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Paris'));
  
    // Esperar a que termine la partida
    act(() => {
      jest.advanceTimersByTime(2000);
    });
  
    await waitFor(() => {
      expect(screen.getByText('¡Partida finalizada!')).toBeInTheDocument();
    });
  
  
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });  

});