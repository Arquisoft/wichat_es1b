import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import Game from './Game';

// Configure Axios mock
const mockAxios = new MockAdapter(axios);

// Create mock navigation function
const mockNavigate = jest.fn();

// Mock localStorage
const localStorageMock = (function() {
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

describe('Game Component', () => {
  const mockFirstQuestion = {
    questionObject: "¿Cuál es la capital de Francia?",
    answerOptions: ["Madrid", "París", "Londres", "Berlín"],
    correctAnswer: "París",
    questionImage: "https://example.com/image.jpg"
  };

  const mockNextQuestion = {
    questionObject: "¿Cuál es la capital de España?",
    answerOptions: ["Madrid", "París", "Lisboa", "Roma"],
    correctAnswer: "Madrid",
    questionImage: "https://example.com/spain.jpg"
  };

  beforeEach(() => {
    mockAxios.reset(); // Reset mocks before each test
    jest.useFakeTimers();
    mockNavigate.mockClear();

    localStorage.setItem('username', 'testuser');

    // Mock startGame endpoint
    mockAxios.onPost('http://localhost:8004/startGame').reply(200, {
      firstQuestion: mockFirstQuestion
    });

    // Mock nextQuestion endpoint
    mockAxios.onGet('http://localhost:8004/nextQuestion').reply(200, mockNextQuestion);

    // Mock save-session endpoint
    mockAxios.onPost('http://localhost:8000/save-session').reply(200, {
      success: true
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('debe mostrar la pantalla de carga inicialmente', async () => {
    render(
        <BrowserRouter>
          <Game />
        </BrowserRouter>
    );

    expect(screen.getByText("Cargando preguntas...")).toBeInTheDocument();
  });

  it('debe mostrar correctamente el contador de preguntas restantes', async () => {
    render(
        <BrowserRouter>
          <Game />
        </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Cargando preguntas...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Preguntas restantes: 5")).toBeInTheDocument();
  });

  // it('debe mostrar la pregunta y las opciones correctamente después de cargar', async () => {
  //   render(
  //       <BrowserRouter>
  //         <Game />
  //       </BrowserRouter>
  //   );

  //   await waitFor(() => {
  //     expect(screen.queryByText("Cargando preguntas...")).not.toBeInTheDocument();
  //   });

  //   expect(screen.getByText("¿Cuál es la capital de Francia?")).toBeInTheDocument();
  //   expect(screen.getByText("Madrid")).toBeInTheDocument();
  //   expect(screen.getByText("París")).toBeInTheDocument();
  //   expect(screen.getByText("Londres")).toBeInTheDocument();
  //   expect(screen.getByText("Berlín")).toBeInTheDocument();
  // });

  // it('debe mostrar correctamente la imagen de la pregunta', async () => {
  //   render(
  //       <BrowserRouter>
  //         <Game />
  //       </BrowserRouter>
  //   );

  //   await waitFor(() => {
  //     expect(screen.queryByText("Cargando preguntas...")).not.toBeInTheDocument();
  //   });

  //   const image = screen.getByAltText("Imagen de la pregunta");
  //   expect(image).toBeInTheDocument();
  //   expect(image.src).toBe("https://example.com/image.jpg");
  // });

  // it('debe cambiar el color del botón al responder correctamente', async () => {
  //   render(
  //       <BrowserRouter>
  //         <Game />
  //       </BrowserRouter>
  //   );

  //   await waitFor(() => {
  //     expect(screen.queryByText("Cargando preguntas...")).not.toBeInTheDocument();
  //   });

  //   const correctButton = screen.getByText("París");
  //   fireEvent.click(correctButton);

  //   expect(correctButton).toHaveStyle('background-color: green');
  // });

  // it('debe cambiar el color del botón al responder incorrectamente', async () => {
  //   render(
  //       <BrowserRouter>
  //         <Game />
  //       </BrowserRouter>
  //   );

  //   await waitFor(() => {
  //     expect(screen.queryByText("Cargando preguntas...")).not.toBeInTheDocument();
  //   });

  //   const incorrectButton = screen.getByText("Madrid");
  //   fireEvent.click(incorrectButton);

  //   expect(incorrectButton).toHaveStyle('background-color: red');
  // });

  // it('debe incrementar la puntuación cuando se responde correctamente', async () => {
  //   render(
  //       <BrowserRouter>
  //         <Game />
  //       </BrowserRouter>
  //   );

  //   await waitFor(() => {
  //     expect(screen.queryByText("Cargando preguntas...")).not.toBeInTheDocument();
  //   });

  //   const correctButton = screen.getByText("París");
  //   fireEvent.click(correctButton);

  //   expect(screen.getByText("Puntuación: 1")).toBeInTheDocument();
  // });

  // it('debe pasar a la siguiente pregunta después de responder', async () => {
  //   render(
  //       <BrowserRouter>
  //         <Game />
  //       </BrowserRouter>
  //   );

  //   await waitFor(() => {
  //     expect(screen.queryByText("Cargando preguntas...")).not.toBeInTheDocument();
  //   });

  //   const correctButton = screen.getByText("París");
  //   fireEvent.click(correctButton);

  //   // Advance timers to execute setTimeout
  //   act(() => {
  //     jest.advanceTimersByTime(2000);
  //   });

  //   await waitFor(() => {
  //     expect(screen.getByText("¿Cuál es la capital de España?")).toBeInTheDocument();
  //   });
  // });


});