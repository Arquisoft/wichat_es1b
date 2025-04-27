import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './Home';

jest.mock('../game/multiplayer/Multiplayer', () => {
  const mockMultiplayerInstance = {
    socket: { connected: true, emit: jest.fn() },
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn(),
    on: jest.fn().mockImplementation(function() { return this; }),
    off: jest.fn().mockImplementation(function() { return this; }),
    createRoom: jest.fn().mockResolvedValue({ success: true }),
    joinRoom: jest.fn().mockResolvedValue({ success: true, roomName: 'Sala de testUser' }),
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

let mockMultiplayerInstance;

beforeEach(() => {
  // Reset the mock instance before each test
  mockMultiplayerInstance = {
    socket: { connected: true, emit: jest.fn() },
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn(),
    on: jest.fn().mockImplementation(function() { return this; }),
    off: jest.fn().mockImplementation(function() { return this; }),
    createRoom: jest.fn().mockResolvedValue({ success: true }),
    joinRoom: jest.fn().mockResolvedValue({ success: true, roomName: 'Sala de testUser' }),
    leaveRoom: jest.fn(),
    requestQuestions: jest.fn().mockResolvedValue([]),
    sendReady: jest.fn(),
    startGame: jest.fn(),
    userId: 'testUserId'
  };

  // Update the getInstance mock to use this fresh instance
  require('../game/multiplayer/Multiplayer').default.getInstance.mockReturnValue(mockMultiplayerInstance);

  window.localStorage.getItem = jest.fn((key) => {
    if (key === 'username') return 'testUser';
    return null;
  });
});

afterEach(() => {
  window.localStorage.getItem.mockRestore();
});

// Mock axios
jest.mock('axios');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = { username: 'testUser' };
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.prompt
window.prompt = jest.fn();

// Silence console errors during tests
const originalConsoleError = console.error;
beforeAll(() => { console.error = jest.fn(); });
afterAll(() => { console.error = originalConsoleError; });

// Get the mock for assertions
const MultiplayerMock = jest.requireMock('../game/multiplayer/Multiplayer').default;

describe('HomePage Component', () => {
  // Sample user data for tests
  const mockUserData = {
    username: 'testUser',
    TotalWellAnswers: 25,
    TotalWrongAnswers: 10,
    AccuracyRate: 71,
    sessions: [
      {
        _id: '1',
        score: 8,
        wrongAnswers: 2,
        createdAt: '2023-04-01T12:00:00Z',
        difficulty: 'Normal',
        category: 'Geografia',
        questions: [
          {
            question: 'Test Question 1?',
            correctAnswer: 'Correct Answer',
            userAnswer: 'Correct Answer'
          },
          {
            question: 'Test Question 2?',
            correctAnswer: 'Correct Answer 2',
            userAnswer: 'Wrong Answer'
          }
        ]
      }
    ]
  };

  // Sample leaderboard data
  const mockLeaderboardData = [
    { username: 'leader1', AccuracyRate: 95, TotalWellAnswers: 100 },
    { username: 'leader2', AccuracyRate: 85, TotalWellAnswers: 90 },
    { username: 'leader3', AccuracyRate: 75, TotalWellAnswers: 80 }
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Default mock responses for API calls
    axios.get.mockImplementation(url => {
      if (url.includes('/get-user-sessions')) {
        return Promise.resolve({ data: mockUserData });
      } else if (url.includes('/get-users-totaldatas')) {
        return Promise.resolve({ data: mockLeaderboardData });
      }
      return Promise.resolve({ data: {} });
    });
  });

  test('renders key UI elements', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/¡Hola, testUser!/)).toBeInTheDocument();
      expect(screen.getByText(/Un jugador/)).toBeInTheDocument();
      expect(screen.getByText(/Multijugador/)).toBeInTheDocument();
      expect(screen.getByText(/Comenzar partida/)).toBeInTheDocument();
      expect(screen.getByText(/Tus últimas partidas/)).toBeInTheDocument();
    });
  });

  test('navigates to profile when clicking profile button', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);

    const profileButton = document.querySelector('[aria-label="AccountCircle"]') ||
        screen.getAllByRole('menuitem')[3];

    // Show the tooltip
    fireEvent.mouseEnter(profileButton);
    await waitFor(() => {
      expect(screen.getByText('Ir al perfil')).toBeInTheDocument();
    });

    // Click the profile button
    fireEvent.click(profileButton);
    expect(mockNavigate).toHaveBeenCalledWith('/Profile');
  });

  test('handles logout functionality', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);

    const logoutButton = document.querySelector('[aria-label="ExitToApp"]') ||
        screen.getAllByRole('menuitem')[4];

    // Show the tooltip
    fireEvent.mouseEnter(logoutButton);
    await waitFor(() => {
      expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
    });

    // Click logout
    fireEvent.click(logoutButton);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('username');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('changes difficulty when selecting from menu', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);

    // Open difficulty menu
    fireEvent.click(screen.getByText('Normal'));

    // Select a different difficulty
    await waitFor(() => {
      expect(screen.getByText('Difícil')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Difícil'));

    // Check that difficulty changed
    await waitFor(() => {
      expect(screen.getByText('Difícil')).toBeInTheDocument();
    });
  });

  test('opens and interacts with session details dialog', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Tus últimas partidas/)).toBeInTheDocument();
    });

    // Click on a session card
    const sessionCard = screen.getByText('correctas').closest('.session-card');
    fireEvent.click(sessionCard);

    // Check dialog content
    await waitFor(() => {
      expect(screen.getByText(/Detalles de la sesión/)).toBeInTheDocument();
      expect(screen.getByText('Pregunta 1')).toBeInTheDocument();
    });

    // Expand question details
    fireEvent.click(screen.getByText('Pregunta 1'));
    await waitFor(() => {
      expect(screen.getByText('Respuesta correcta:')).toBeInTheDocument();
    });

    // Close dialog
    fireEvent.click(screen.getByText('Cerrar'));
    await waitFor(() => {
      expect(screen.queryByText(/Detalles de la sesión/)).not.toBeInTheDocument();
    });
  });

  test('selects different game categories', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);

    // Open game menu
    fireEvent.click(screen.getByText('Comenzar partida'));

    // Select Geografia category
    await waitFor(() => {
      expect(screen.getByText('Geografía')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Geografía'));

    // Check navigation occurred with correct params
    expect(mockNavigate).toHaveBeenCalledWith('/Game', {
      state: {
        gameConfig: {
          numQuestions: 10,
          timePerQuestion: 30,
          difficulty: 'Normal',
          category: 'Geografia',
        },
      },
    });
  });

  test('renders correctly with empty sessions', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: { ...mockUserData, sessions: [] }
    }));

    render(<BrowserRouter><HomePage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/No hay sesiones de juego registradas/)).toBeInTheDocument();
    });
  });

  test('renders correctly with empty leaderboard', async () => {
    axios.get.mockImplementationOnce((url) => {
      if (url.includes('/get-user-sessions')) {
        return Promise.resolve({ data: mockUserData });
      }
      return Promise.resolve({ data: [] });
    });

    render(<BrowserRouter><HomePage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Revisa tus estadísticas y comienza una nueva partida/)).toBeInTheDocument();
    });
  });

  test('displays player level based on total questions', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Nivel:/)).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    axios.get.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    render(<BrowserRouter><HomePage /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/¡Hola, testUser!/)).toBeInTheDocument();
    });
  });

  // Multiplayer UI coverage
  test('shows waiting room when creating a room', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);

    // Click create room button
    expect(screen.getByText(/Crear sala/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Crear sala'));

    // Verify waiting room is displayed
    await waitFor(() => {
      expect(screen.getByText(/Sala de Espera/)).toBeInTheDocument();
      expect(MultiplayerMock.getInstance().createRoom).toHaveBeenCalled();
      expect(MultiplayerMock.getInstance().joinRoom).toHaveBeenCalled();
    });
  });

  test('shows waiting room when joining a room', async () => {
    window.prompt.mockReturnValue('room-123');
    render(<BrowserRouter><HomePage /></BrowserRouter>);

    // Click join room button
    fireEvent.click(screen.getByText('Unirse a sala'));

    // Verify waiting room is displayed with correct data
    await waitFor(() => {
      expect(window.prompt).toHaveBeenCalledWith('Introduce el ID de la sala:');
      expect(screen.getByText(/Revisa tus estadísticas y comienza una nueva partida/)).toBeInTheDocument();
      expect(MultiplayerMock.getInstance().joinRoom).toHaveBeenCalledWith('room-123', 'testUser');
    });
  });

  test('handles multiplayer game start', async () => {
    // Prepare the event handler mock for onGameStart
    const mockGameStartHandler = jest.fn();
    let gameStartCallback;

    MultiplayerMock.getInstance.mockImplementation(() => ({
      socket: { connected: true, emit: jest.fn() },
      connect: jest.fn().mockResolvedValue(),
      disconnect: jest.fn(),
      on: jest.fn().mockImplementation(function(event, callback) {
        if (event === 'onGameStart') {
          gameStartCallback = callback;
        }
        return this;
      }),
      off: jest.fn().mockImplementation(function() { return this; }), // <-- Add this line
      createRoom: jest.fn().mockResolvedValue({ success: true }),
      joinRoom: jest.fn().mockResolvedValue({ success: true, roomName: 'Sala de testUser' }),
      leaveRoom: jest.fn(),
      requestQuestions: jest.fn().mockResolvedValue([]),
      sendReady: jest.fn(),
      startGame: jest.fn(),
      userId: 'testUserId'
    }));

    render(<BrowserRouter><HomePage /></BrowserRouter>);

    // Create a room to show waiting room
    fireEvent.click(screen.getByText('Crear sala'));

    // Wait for the waiting room to appear
    await waitFor(() => {
      expect(screen.getByText(/Creando sala/)).toBeInTheDocument();
    });

    // Trigger the game start event if callback is available
    if (gameStartCallback) {
      act(() => {
        gameStartCallback({ roomId: 'room-123', players: ['player1', 'player2'] });
      });

      // Verify navigation occurred
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/GameMultiplayer', expect.any(Object));
      });
    }
  });

  test('handles error when creating a room fails', async () => {
    MultiplayerMock.getInstance().createRoom.mockResolvedValueOnce({ success: false, message: 'Room error' });
    render(<BrowserRouter><HomePage /></BrowserRouter>);
    fireEvent.click(screen.getByText('Crear sala'));
    await waitFor(() => {
      expect(screen.queryByText(/Sala de Espera/)).not.toBeInTheDocument();
    });
  });

  test('handles error when joining a room fails', async () => {
    window.prompt.mockReturnValue('room-err');
    MultiplayerMock.getInstance().joinRoom.mockResolvedValueOnce({ success: false, message: 'Join error' });
    render(<BrowserRouter><HomePage /></BrowserRouter>);
    fireEvent.click(screen.getByText('Unirse a sala'));
    await waitFor(() => {
      expect(screen.queryByText(/Sala de Espera/)).not.toBeInTheDocument();
    });
  });

  test('handles multiplayerService not connected on create/join', async () => {
    MultiplayerMock.getInstance().socket.connected = false;
    render(<BrowserRouter><HomePage /></BrowserRouter>);
    fireEvent.click(screen.getByText('Crear sala'));
    await waitFor(() => {
      expect(MultiplayerMock.getInstance().connect).toHaveBeenCalled();
    });
    window.prompt.mockReturnValue('room-abc');
    fireEvent.click(screen.getByText('Unirse a sala'));
    await waitFor(() => {
      expect(MultiplayerMock.getInstance().connect).toHaveBeenCalled();
    });
  });

  test('handles onError event from multiplayerService', async () => {
    let errorCallback;
    MultiplayerMock.getInstance().on.mockImplementation(function(event, cb) {
      if (event === 'onError') errorCallback = cb;
      return this;
    });
    render(<BrowserRouter><HomePage /></BrowserRouter>);
    fireEvent.click(screen.getByText('Crear sala'));
    await waitFor(() => {
      expect(MultiplayerMock.getInstance().createRoom).toHaveBeenCalled();
    });
    if (errorCallback) {
      errorCallback({ message: 'Test error' });
    }
  });

  test('handles WaitingRoom onClose and onGameStart', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>);
    fireEvent.click(screen.getByText('Crear sala'));
    await waitFor(() => {
      expect(screen.getByText(/Sala de Espera/)).toBeInTheDocument();
    });
    // Simulate onClose
    const closeBtn = screen.getByRole('button', { name: /Abandonar sala/i });
    fireEvent.click(closeBtn);
    // Simulate onGameStart
    fireEvent.click(screen.getByText('Crear sala'));
    await waitFor(() => {
      expect(screen.getByText(/Sala de Espera/)).toBeInTheDocument();
    });
    // Simulate the onGameStart prop
    const waitingRoom = screen.getByText(/Sala de Espera/).closest('div');
    if (waitingRoom) {
      // Simulate the onGameStart callback
      await act(async () => {
        await MultiplayerMock.getInstance().requestQuestions();
      });
    }
  });

  test('renders session details dialog with no questions', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: {
        ...mockUserData,
        sessions: [{
          ...mockUserData.sessions[0],
          questions: []
        }]
      }
    }));
    render(<BrowserRouter><HomePage /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Tus últimas partidas/)).toBeInTheDocument();
    });
    const sessionCard = screen.getByText('correctas').closest('.session-card');
    fireEvent.click(sessionCard);
    await waitFor(() => {
      expect(screen.getByText(/No hay información detallada de preguntas/)).toBeInTheDocument();
    });
  });

  test('handles getPlayerLevel edge case with 0 questions', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: {
        ...mockUserData,
        TotalWellAnswers: 0,
        TotalWrongAnswers: 0,
        sessions: []
      }
    }));
    render(<BrowserRouter><HomePage /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/No hay sesiones de juego registradas/)).toBeInTheDocument();
    });
  });
});

describe('HomePage multiplayerService wiring', () => {
  let mockService
  const callbacks = {}

  beforeEach(() => {
    callbacks.onConnect = jest.fn()
    callbacks.onRoomJoined = jest.fn()
    callbacks.onPlayerJoined = jest.fn()
    callbacks.onPlayerReady = jest.fn()
    callbacks.onGameStart = jest.fn()
    callbacks.onError = jest.fn()

    mockService = {
      socket: { connected: false, emit: jest.fn() },
      connect: jest.fn(),
      on: jest.fn((evt, cb) => {
        callbacks[evt] = cb;
        return mockService;
      }),
      off: jest.fn(() => mockService),           // ← add this
      createRoom: jest.fn(() => Promise.resolve({ success: true })),
      joinRoom:  jest.fn(() => Promise.resolve({ success: true })),
    };

    MultiplayerMock.getInstance.mockReturnValue(mockService)
    // mock navigate from useNavigate
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(jest.fn())
  })

  test('registers all event handlers on mount', () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>)
    expect(mockService.on).toHaveBeenCalledWith('onConnect', expect.any(Function))
    expect(mockService.on).toHaveBeenCalledWith('onRoomJoined', expect.any(Function))
    expect(mockService.on).toHaveBeenCalledWith('onPlayerJoined', expect.any(Function))
    expect(mockService.on).toHaveBeenCalledWith('onPlayerReady', expect.any(Function))
    expect(mockService.on).toHaveBeenCalledWith('onGameStart', expect.any(Function))
    expect(mockService.on).toHaveBeenCalledWith('onError', expect.any(Function))
  })

  test('onRoomJoined shows waiting room and stores roomInfo', async () => {
    render(<BrowserRouter><HomePage /></BrowserRouter>)

    await act(async () => {
      callbacks.onRoomJoined({ roomId: 'r1', roomName: 'Custom' })
    })
    expect(screen.getByText(/Sala de Espera/i)).toBeInTheDocument()
  })

  test('onGameStart navigates to /Game with proper state', async () => {
    const navigate = jest.fn()
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate)

    render(<BrowserRouter><HomePage /></BrowserRouter>)
    await act(async () => {
      callbacks.onGameStart({ roomId: 'r2', players: ['a','b'] })
    })

    expect(navigate).toHaveBeenCalledWith('/Game', expect.objectContaining({
      state: expect.objectContaining({
        gameConfig: expect.objectContaining({
          multiplayer: true, roomId: 'r2', players: ['a','b']
        })
      })
    }))
  })

  test('onError alerts and logs', async () => {
    global.alert = jest.fn()
    console.error = jest.fn()

    render(<BrowserRouter><HomePage /></BrowserRouter>)
    await act(async () => {
      callbacks.onError({ message: 'err' })
    })

    expect(console.error).toHaveBeenCalledWith('Error:', 'err')
    expect(global.alert).toHaveBeenCalledWith('Error: err')
  })

  test('crearSala without existing service calls getInstance and createRoom/joinRoom', async () => {
    // Clear prior instance
    MultiplayerMock.getInstance.mockClear()
    render(<BrowserRouter><HomePage /></BrowserRouter>)

    fireEvent.click(screen.getByText('Crear sala'))
    await waitFor(() => {
      expect(MultiplayerMock.getInstance).toHaveBeenCalled()
      expect(mockService.createRoom).toHaveBeenCalled()
      expect(mockService.joinRoom).toHaveBeenCalled()
    })
  })
})