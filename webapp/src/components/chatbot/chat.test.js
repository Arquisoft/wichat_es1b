global.crypto = {
    getRandomValues: function(buffer) {
        return require('crypto').randomFillSync(buffer);
    }
};

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
        this.decodeAudioData = (arrayBuffer, successCallback, errorCallback) => {
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
jest.mock('./chat.png?react', () => 'chat_old.png', { virtual: true });

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import axios from 'axios';
import Chat from './chat';

jest.mock('axios');
jest.setTimeout(10000);

describe('Chat Component', () => {
    beforeEach(() => {
        axios.post.mockClear();
    });

    const renderChatComponent = async () => {
        render(<Chat>Test description</Chat>);
        await screen.findByText(/Estoy aquí para ayudarte!/i);
    };

    const openChatIfNecessary = async () => {
        const chatButton = document.querySelector('.rcb-toggle-button.rcb-button-show');
        if (chatButton) {
            fireEvent.click(chatButton);
            await new Promise(r => setTimeout(r, 300));
        }
    };

    const sendMessage = async (message) => {
        const inputField = document.querySelector('.rcb-chat-input-textarea');
        expect(inputField).not.toBeNull();
        inputField.value = message;

        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
        });

        fireEvent(inputField, enterEvent);
    };

    it('renders Chat component and displays initial message', async () => {
        await renderChatComponent();
        const initialMessage = await screen.findByText(/Estoy aquí para ayudarte!/i);
        expect(initialMessage).toBeInTheDocument();
    });

    it('sends a message and receives a response', async () => {
        axios.post.mockImplementation((url) => {
            if (url === 'http://localhost:8000/askllm') {
                return Promise.resolve({ data: { answer: 'llmanswer' } });
            } else if (url === 'http://localhost:8000/configureAssistant') {
                return Promise.resolve({ data: {} });
            }
        });

        await renderChatComponent();
        await openChatIfNecessary();
        await sendMessage('message');

        const response = await screen.findByText(/llmanswer/i, {}, { timeout: 5000 });
        expect(response).toBeInTheDocument();
    });

    it('handles error when fetching message', async () => {
        axios.post.mockImplementation((url) => {
            if (url === 'http://localhost:8000/askllm') {
                return Promise.reject(new Error('Error fetching message'));
            } else if (url === 'http://localhost:8000/configureAssistant') {
                return Promise.resolve({ data: {} });
            }
        });

        await renderChatComponent();
        await openChatIfNecessary();
        await sendMessage('message');

        const response = await screen.findByText(/Error fetching message/i, {}, { timeout: 5000 });
        expect(response).toBeInTheDocument();
    });
});