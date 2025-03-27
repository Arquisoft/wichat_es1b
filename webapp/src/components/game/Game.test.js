import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useNavigate, BrowserRouter as Router } from "react-router-dom";
import Game from './Game';
import { red } from '@mui/material/colors';

// Configure Axios mock
const mockAxios = new MockAdapter(axios);

// Create mock navigation function
const mockNavigate = jest.fn();

const renderComponent = () => {
  return render(
    <Router>
      <Game />
    </Router>
  );
};

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      gameConfig: {
        numQuestions: 5,
        timePerQuestion: 30
      }
    }
  })
}));

// Mock for recharts components
jest.mock('recharts', () => ({
  PieChart: () => <div data-testid="pie-chart">PieChart</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>
}));

// Mock for the Chat component
jest.mock("../chatbot/chat", () => {
  return function Chat() {
    return <div data-testid="chat-component">Chat Component</div>;
  };
});

// Al principio del archivo Game.test.js

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


describe('Game Component', () => {
  const mockFirstQuestion = {
    questionObject: '¿Cuál es la capital de España?',
    questionImage: 'https://example.com/madrid.jpg',
    correctAnswer: 'Madrid',
    answerOptions: ['Londres', 'Lisboa', 'Madrid', 'Roma']
  };

  const mockNextQuestion = {
    questionObject: '¿Cuál es la capital de Francia?',
    questionImage: 'https://example.com/paris.jpg',
    correctAnswer: 'París',
    answerOptions: ['París', 'Varsovia', 'Atenas', 'Dublín']
  };


  beforeEach(() => {
    mockAxios.reset(); // Reset mocks before each test
    jest.useFakeTimers();

  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('el usuario responde correctamente a la primera pregunta', async () => {
    mockAxios.onPost('http://localhost:8000/startGame').reply(200, {
      message: 'Game started',
      category: 'All',
      firstQuestion: mockFirstQuestion
    });
  
    mockAxios.onGet('http://localhost:8000/nextQuestion').reply(200, mockNextQuestion);
  
    renderComponent();
  
    const question = await screen.findByTestId('question');
    expect(question).toHaveTextContent('¿Cuál es la capital de España?');
  
    const opciones = ['Londres', 'Lisboa', 'Madrid', 'Roma'];
    opciones.forEach((opcion) => {
      expect(screen.getByRole('button', { name: opcion })).toBeInTheDocument();
    });
  
    const correctBtn = screen.getByRole('button', { name: 'Madrid' });
    fireEvent.click(correctBtn);
  
    await waitFor(() => {
      expect(correctBtn).toHaveStyle({ backgroundColor: 'green' });
    });
  
    // Avanzar el tiempo en un bloque 'act' async
    await act(async () => {
      jest.advanceTimersByTime(3000); // Simula 3s en vez de 5s
    });
  
    await waitFor(() => {
      const updatedQuestion = screen.getByTestId('question');
      expect(updatedQuestion).toHaveTextContent('¿Cuál es la capital de Francia?');
    }, { timeout: 5000 });
  });

  it('vuelve al home al hacer clic en "Abandonar"', async () => {
    renderComponent();
    const abandonButton = screen.getByRole('button', { name: /Abandonar/i });
    fireEvent.click(abandonButton);
    expect(mockNavigate).toHaveBeenCalledWith('/Home');
  });
  
  it('muestra error si falla la carga de la siguiente pregunta', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Spy verdadero
  
    mockAxios.onPost('http://localhost:8000/startGame').reply(200, {
      message: 'Game started',
      category: 'All',
      firstQuestion: mockFirstQuestion
    });
  
    mockAxios.onGet('http://localhost:8000/nextQuestion').replyOnce(500); // Forzar error
  
    renderComponent();
  
    const question = await screen.findByTestId('question');
    fireEvent.click(screen.getByRole('button', { name: 'Madrid' }));
  
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
  
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching the next question:'),
        expect.any(Error)
      );
    });
  
    errorSpy.mockRestore(); // Limpieza
  });
  
  
});