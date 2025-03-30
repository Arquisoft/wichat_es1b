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

describe('Profile component', () => {
    const mockSession = {
      _id: 'session1',
      createdAt: new Date().toISOString(),
      score: 4,
      wrongAnswers: 1,
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
  
    beforeEach(() => {
      localStorage.setItem('username', 'TestUser');
      mockAxios.reset();
    });
  
    it('renderiza correctamente sin sesiones', async () => {
      mockAxios.onGet(/get-sessions/).reply(200, []);
  
      renderComponent();
  
      expect(await screen.findByText(/WiChat - Perfil/i)).toBeInTheDocument();
      expect(await screen.findByText(/Estas son las estadísticas de tu perfil/i)).toBeInTheDocument();
      expect(await screen.findByText(/No hay datos de sesiones disponibles/i)).toBeInTheDocument();
    });
  
    it('renderiza con sesiones y permite ver detalles de una sesión', async () => {
      mockAxios.onGet(/get-sessions/).reply(200, [mockSession]);
  
      renderComponent();
  
      // Espera a que se cargue la sesión
      expect(await screen.findByText(/Sesión del/i)).toBeInTheDocument();

      // Abrir la sesión
      fireEvent.click(screen.getByText(/Sesión del/i));
  
      // Contenido de la sesión
      await waitFor(() => {
        expect(screen.getByText(/Detalles de la sesión/i)).toBeInTheDocument();
      });
  
      // Expandir pregunta 1 de la sesión
      fireEvent.click(screen.getByText(/Pregunta 1/i));
      const parisElements = await screen.findAllByText(/París/i);
      expect(parisElements.length).toBeGreaterThan(0);

      // Expandir pregunta 2 de la sesión
      fireEvent.click(screen.getByText(/Pregunta 2/i));
      expect(await screen.findByText(/Berlín/i)).toBeInTheDocument();
      expect(await screen.findByText(/Madrid/i)).toBeInTheDocument();
  
      // Cerrar contenido de la sesión
      fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }));
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
        mockAxios.onGet(/get-sessions/).reply(200, data);
  
        renderComponent();
  
        const chip = await screen.findByText(new RegExp(`Nivel: ${level}`, 'i'));
        expect(chip).toBeInTheDocument();
      }
    });
  
    it('permite cambiar el orden de las sesiones', async () => {
      mockAxios.onGet(/get-sessions/).reply(200, [mockSession]);
  
      renderComponent();
  
      const sortButton = await screen.findByText(/Ordenar por/i);
      fireEvent.click(sortButton);
  
      const scoreOption = await screen.findByText(/Puntuación/i);
      fireEvent.click(scoreOption);
  
      expect(screen.getByText(/Ordenar por: Puntuación/i)).toBeInTheDocument();
    });
  });