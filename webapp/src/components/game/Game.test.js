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
jest.mock('../chatbot/chat', () => {
  return function DummyChat() {
    return <div data-testid="chat-component">Chat Component</div>;
  };
});
jest.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell"></div>,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}));

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
  });

  afterEach(() => {
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
});