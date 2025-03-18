import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from "react-router-dom";
import App from './App';

test('renders welcome message', () => {
  render(
    <Router>
      <App />
    </Router>
  );
  const welcomeMessage = screen.getByText(/¡BIENVENIDOS A WICHAT!/i);
  expect(welcomeMessage).toBeInTheDocument();
});


