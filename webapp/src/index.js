import React from 'react';
import ReactDOM from 'react-dom/client';
import {Route,  Routes,  MemoryRouter as Router} from "react-router-dom";
import './index.css';
import App from './App';
import HomePage from './components/home/Home';
import Game from './components/game/Game';
import GameMultiplayer from "./components/game/multiplayer/GameMultiplayer";
import MultiplayerResults from "./components/game/multiplayer/MultiplayerResults";
import Profile from './components/profile/Profile';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App/>}></Route>
        <Route path="/home" element={<HomePage />}> </Route>
        <Route path="/game" element={<Game />}> </Route>
        <Route path="/profile" element={<Profile />}> </Route>
        <Route path="/gameMultiplayer" element={<GameMultiplayer/>}> </Route>
        <Route path="/resultsMultiplayer" element={<MultiplayerResults />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
