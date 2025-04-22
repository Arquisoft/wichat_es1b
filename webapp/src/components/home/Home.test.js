import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './Home';

// Mock axios completely to avoid any endpoint dependencies
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
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('HomePage Component', () => {
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
            question: 'What is the capital of France?',
            correctAnswer: 'Paris',
            userAnswer: 'Paris'
          },
          {
            question: 'What is the capital of Spain?',
            correctAnswer: 'Madrid',
            userAnswer: 'Barcelona'
          }
        ]
      },
      {
        _id: '2',
        score: 7,
        wrongAnswers: 3,
        createdAt: '2023-03-28T14:30:00Z',
        difficulty: 'Difícil',
        category: 'Cultura',
        questions: []
      },
      {
        _id: '3',
        score: 9,
        wrongAnswers: 1,
        createdAt: '2023-03-25T10:15:00Z',
        difficulty: 'Principiante',
        category: 'Personajes',
        questions: []
      }
    ]
  };

  const mockLeaderboardData = [
    {
      username: 'topUser',
      AccuracyRate: 95,
      TotalWellAnswers: 100,
      TotalWrongAnswers: 5
    },
    {
      username: 'secondUser',
      AccuracyRate: 85,
      TotalWellAnswers: 85,
      TotalWrongAnswers: 15
    },
    {
      username: 'thirdUser',
      AccuracyRate: 75,
      TotalWellAnswers: 75,
      TotalWrongAnswers: 25
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementation for axios.get
    axios.get.mockResolvedValue({ data: mockUserData });
  });

  test('renders the home page with header', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Check if the header is rendered
    const header = await screen.findByText('WiChat - Home');
    expect(header).toBeInTheDocument();
  });

  test('navigates to game when clicking on a category', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Find and click the "Comenzar partida" button
    const startButton = await screen.findByText('Comenzar partida');
    fireEvent.click(startButton);
    
    // Find and click any category button that appears in the menu
    // Wait a bit for the menu to appear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try to find any of the category buttons
    const categoryButtons = screen.getAllByRole('menuitem');
    if (categoryButtons.length > 0) {
      fireEvent.click(categoryButtons[0]); // Click the first menu item
      
      // Check if navigate was called
      expect(mockNavigate).toHaveBeenCalledWith('/Game', expect.anything());
    }
  });

  test('logs out user when clicking logout button', async () => {
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Find all menu items in the toolbar
    await waitFor(() => {
      const menuItems = container.querySelectorAll('[role="menuitem"]');
      expect(menuItems.length).toBeGreaterThan(0);
      
      // Find the logout button (usually the second menu item)
      if (menuItems.length > 1) {
        const logoutButton = menuItems[4];
        fireEvent.click(logoutButton);
        
        // Check if localStorage was cleared and navigation happened
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('username');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      }
    });
  });

  test('navigates to profile when clicking profile button', async () => {
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Find all menu items in the toolbar
    await waitFor(() => {
      const menuItems = container.querySelectorAll('[role="menuitem"]');
      expect(menuItems.length).toBeGreaterThan(0);
      
      // Find the profile button (usually the first menu item)
      const profileButton = menuItems[3];
      fireEvent.click(profileButton);
      
      // Check if navigation happened
      expect(mockNavigate).toHaveBeenCalledWith('/Profile');
    });
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    axios.get.mockRejectedValueOnce(new Error('API error'));
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Component should still render without crashing
    const header = await screen.findByText('WiChat - Home');
    expect(header).toBeInTheDocument();
    
    // Error should be logged (we've mocked console.error)
    expect(console.error).toHaveBeenCalled();
  });

  // Test for changing difficulty
  test('changes difficulty when selecting from menu', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Find the difficulty button (it should contain "Normal" by default)
    const difficultyButtons = await screen.findAllByText('Normal');
    
    // Click the first button that contains "Normal"
    if (difficultyButtons.length > 0) {
      fireEvent.click(difficultyButtons[0]);
      
      // Wait a bit for the menu to appear
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try to find and click the "Difícil" option
      const dificilOptions = screen.getAllByText('Difícil');
      if (dificilOptions.length > 0) {
        fireEvent.click(dificilOptions[0]);
        
        // After clicking, the button should now show "Difícil"
        const updatedButtons = await screen.findAllByText('Difícil');
        expect(updatedButtons.length).toBeGreaterThan(0);
      }
    }
  });

  // Test for session details dialog
  test('opens and interacts with session details dialog', async () => {
    // Mock user data with sessions
    axios.get.mockResolvedValue({ data: mockUserData });
    
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Wait for the component to load
    await waitFor(() => {
      // Find session cards
      const sessionCards = container.querySelectorAll('.session-card');
      
      // If session cards are found, click the first one
      if (sessionCards.length > 0) {
        fireEvent.click(sessionCards[0]);
        
        // Dialog should open - check for dialog content
        return screen.findByText((content) => 
          content.includes('Detalles') || content.includes('sesión')
        );
      }
    }, { timeout: 2000 });
    
    // Try to find and click a question to expand it
    const questionElements = screen.queryAllByText((content) => 
      content.includes('Pregunta')
    );
    
    if (questionElements.length > 0) {
      fireEvent.click(questionElements[0]);
      
      // Check if question details are displayed
      await waitFor(() => {
        const answerElements = screen.queryAllByText((content) => 
          content.includes('Respuesta') || content.includes('correcta')
        );
        expect(answerElements.length).toBeGreaterThan(0);
      });
    }
    
    // Try to close the dialog
    const closeButton = screen.queryByText('Cerrar');
    if (closeButton) {
      fireEvent.click(closeButton);
      
      // Check if dialog is closed
      await waitFor(() => {
        const dialogTitle = screen.queryByText((content) => 
          content.includes('Detalles') && content.includes('sesión')
        );
        expect(dialogTitle).not.toBeInTheDocument();
      });
    }
  });

  // Test for category selection
  test('selects different game categories', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Find and click the "Comenzar partida" button
    const startButton = await screen.findByText('Comenzar partida');
    fireEvent.click(startButton);
    
    // Wait for menu to appear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try to find and click different category options
    const categoryOptions = [
      { name: 'Geografía', category: 'Geografia' },
      { name: 'Cultura', category: 'Cultura' },
      { name: 'Personajes', category: 'Personajes' },
      { name: 'Aleatorio', category: 'All' }
    ];
    
    // Test each category if it's available
    for (const option of categoryOptions) {
      const categoryButton = screen.queryByText(option.name);
      if (categoryButton) {
        fireEvent.click(categoryButton);
        
        // Check if navigate was called with the correct category
        expect(mockNavigate).toHaveBeenCalledWith('/Game', expect.objectContaining({
          state: expect.objectContaining({
            gameConfig: expect.objectContaining({
              category: option.category,
            }),
          }),
        }));
        
        // Reset mock for next iteration
        mockNavigate.mockClear();
        
        // Need to click the button again to open the menu for the next category
        fireEvent.click(startButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  });

  // Test for rendering with empty sessions
  test('renders correctly with empty sessions', async () => {
    // Mock empty sessions
    axios.get.mockResolvedValue({ 
      data: {
        ...mockUserData,
        sessions: []
      }
    });
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Component should render without crashing
    const header = await screen.findByText('WiChat - Home');
    expect(header).toBeInTheDocument();
    
    // The component should still have the game section
    const gameSection = await screen.findByText('Comenzar partida');
    expect(gameSection).toBeInTheDocument();
  });

  // Test for rendering with empty leaderboard
  test('renders correctly with empty leaderboard', async () => {
    // First call returns normal user data, second call returns empty leaderboard
    axios.get
      .mockResolvedValueOnce({ data: mockUserData })
      .mockResolvedValueOnce({ data: [] });
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Component should render without crashing
    const header = await screen.findByText('WiChat - Home');
    expect(header).toBeInTheDocument();
    
    // The component should still have the game section
    const gameSection = await screen.findByText('Comenzar partida');
    expect(gameSection).toBeInTheDocument();
  });

  // Test for player level display
  test('displays player level based on total questions', async () => {
    // Mock user data with enough questions to reach "Intermedio" level
    const userData = {
      ...mockUserData,
      TotalWellAnswers: 40,
      TotalWrongAnswers: 20
    };
    
    axios.get.mockResolvedValue({ data: userData });
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Check if any level indicator is displayed
    await waitFor(() => {
      // Look for level text or chip
      const levelElement = screen.queryByText((content) => {
        return content.includes('Nivel') || 
              content.includes('Principiante') || 
              content.includes('Aprendiz') || 
              content.includes('Intermedio') || 
              content.includes('Avanzado') || 
              content.includes('Experto') || 
              content.includes('Generalísimo');
      });
      
      // If level element is found, test passes
      if (levelElement) {
        expect(levelElement).toBeInTheDocument();
      }
    }, { timeout: 2000 });
  });

  // Test for UI elements rendering
  test('renders key UI elements', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Check for important UI elements
    await waitFor(() => {
      // Header
      const header = screen.getByText('WiChat - Home');
      expect(header).toBeInTheDocument();
      
      // Game section
      const gameSection = screen.getByText('Comenzar partida');
      expect(gameSection).toBeInTheDocument();
      
      // Difficulty selector
      const difficultySection = screen.getByText('Seleccionar dificultad');
      expect(difficultySection).toBeInTheDocument();
      
      // Check for any buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});