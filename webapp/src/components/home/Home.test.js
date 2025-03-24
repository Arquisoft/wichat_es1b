import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from './Home';

const mockAxios = new MockAdapter(axios);

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

    render(
      <Router>
        <Home />
      </Router>
    );

    expect(await screen.findByText(/WiChat te espera/i)).toBeInTheDocument();

    // Esperar al mensaje de no sesiones
    expect(await screen.findByText(/No hay datos de sesiones disponibles/i)).toBeInTheDocument();
  });

  it('renderiza con sesiones y permite ver detalles de una sesión', async () => {
    mockAxios.onGet(/get-sessions/).reply(200, [mockSession]);

    render(
      <Router>
        <Home />
      </Router>
    );

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

  it('permite iniciar partidas por categoría Geografía', async () => {
    mockAxios.onGet(/get-sessions/).reply(200, []);

    render(
      <Router>
        <Home />
      </Router>
    );      

    const mainButton = await screen.findByRole('button', { name: /comenzar partida/i });
    fireEvent.click(mainButton);

    const btn = await screen.findByRole('menuitem', { name: new RegExp('Geografía', 'i') });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
  
    // const categorias = [ 'Cultura', 'Geografía', 'Personajes', 'Aleatorio'];
    // for (const cat of categorias) {
    //   const btn = await screen.findByRole('menuitem', { name: new RegExp(cat, 'i') });
    //   expect(btn).toBeInTheDocument();
    //   fireEvent.click(btn);
    // }
  });

  it('permite iniciar partidas por categoría Cultura', async () => {
    mockAxios.onGet(/get-sessions/).reply(200, []);

    render(
      <Router>
        <Home />
      </Router>
    );      
    
    const mainButton = await screen.findByRole('button', { name: /comenzar partida/i });
    fireEvent.click(mainButton);

    const btn = await screen.findByRole('menuitem', { name: new RegExp('Cultura', 'i') });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
  });

  it('permite iniciar partidas por categoría Personajes', async () => {
    mockAxios.onGet(/get-sessions/).reply(200, []);

    render(
      <Router>
        <Home />
      </Router>
    );      

    const mainButton = await screen.findByRole('button', { name: /comenzar partida/i });
    fireEvent.click(mainButton);

    const btn = await screen.findByRole('menuitem', { name: new RegExp('Personajes', 'i') });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
  });

  it('permite iniciar partidas por categoría Aleatorio', async () => {
    mockAxios.onGet(/get-sessions/).reply(200, []);

    render(
      <Router>
        <Home />
      </Router>
    );      

    const mainButton = await screen.findByRole('button', { name: /comenzar partida/i });
    fireEvent.click(mainButton);

    const btn = await screen.findByRole('menuitem', { name: new RegExp('Aleatorio', 'i') });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
  });

});
