import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { BrowserRouter as Router } from "react-router-dom";
import AddUser from './AddUser';

const mockAxios = new MockAdapter(axios);

describe('AddUser component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('añade usuario correctamente', async () => {
    render(
        <Router>
          <AddUser />
        </Router>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);
    const addUserButton = screen.getByRole('button', { name: /Crear usuario/i });

    // Mock the axios.post request to simulate a successful response
    mockAxios.onPost(/adduser/).reply(200);
    mockAxios.onPost(/login/).reply(200);

    // Simulate user input
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'testPassword' } });

    // Trigger the add user button click
    fireEvent.click(addUserButton);

    // Wait for the Snackbar to be open
    await waitFor(() => {
      expect(screen.getByText(/Usuario añadido correctamente/i)).toBeInTheDocument();
    });
  });

  it('muestra error si las contraseñas no coinciden', async () => {
    render(
      <Router>
        <AddUser />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testUser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: '456' } });
    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });

  it('muestra error si la petición falla', async () => {
    render(
        <Router>
          <AddUser />
        </Router>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirmar Contraseña/i);
    const addUserButton = screen.getByRole('button', { name: /Crear usuario/i });

    // Mock the axios.post request to simulate an error response
    mockAxios.onPost('/adduser').reply(500, { error: 'Internal Server Error' });

    // Simulate user input
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'testPassword' } });

    // Trigger the add user button click
    fireEvent.click(addUserButton);

    // Wait for the error Snackbar to be open
    await waitFor(() => {
      expect(screen.getByText(/Error al crear el nuevo usuario/i)).toBeInTheDocument();
    });
  });
});