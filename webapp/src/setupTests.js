// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';


import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

// Mock de crypto.getRandomValues para Jest
global.crypto = {
    getRandomValues: function(buffer) {
        return require('crypto').randomFillSync(buffer);
    }
};

// Mock de ResizeObserver para evitar errores en Jest
global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  

// Mock de AudioContext para evitar errores en Jest
global.AudioContext = class MockAudioContext {
    constructor() {
        this.state = 'running';
        this.destination = {};
        this.createGain = () => ({
            connect: () => {},
            gain: { value: 1 }
        });
        this.createOscillator = () => ({
            connect: () => {},
            start: () => {},
            stop: () => {},
            frequency: { value: 0 },
            type: 'sine'
        });
        this.decodeAudioData = (arrayBuffer, successCallback) => {
            const audioBuffer = {
                length: 100,
                duration: 1,
                sampleRate: 44100,
                numberOfChannels: 2,
                getChannelData: () => new Float32Array(100)
            };

            if (successCallback) {
                successCallback(audioBuffer);
            }

            return Promise.resolve(audioBuffer);
        };
    }
    close() {}
};

global.webkitAudioContext = global.AudioContext;
global.BaseAudioContext = global.AudioContext;

// Mock de axios para Jest
const mockAxios = new MockAdapter(axios);

// Mockear la API de configuración del asistente para evitar errores 404
mockAxios.onPost('http://localhost:8003/configureAssistant').reply(200, { message: "Mocked response" });

// Mock de chat_old.png?react para evitar errores en Jest
jest.mock('./chat.png?react', () => 'chat.png', { virtual: true });

console.log("setupTests.js cargado correctamente");
