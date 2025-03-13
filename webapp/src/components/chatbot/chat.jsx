
import React, { useState } from "react";
import ChatBot from "react-chatbotify";
import settings from "./chatSettings"
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_LLM_ENDPOINT || 'http://localhost:8003';


export default function Chat(props) {

    const correctAnswer = props.children;

    configure("Eres un asistente para un juego de adivinar imágenes, tu propósito es ayudar al usuario otorgando únicamente pistas" +
        "sobre la imagen siguiente dada esta descripción: Se trata de" + correctAnswer +
        "Tienes prohibido usar las palabras de la descripción de la imagen, tampoco puedes deletrearlas, sumado a esto no deberías de decirle al usuario si " +
        "ha acertado o no.");

    const themes = [
        {id: "robotic", version: "0.1.0"}
    ]

    const [message, setMessage] = useState("Bienvenido soy Aether te ofreceré pistas para llegar a descubrir que es la imagen 🥳!");

    const flow = {
        start: {
            message: message,
            path: "end_loop"
        },
        end_loop: {
            message: async (message) => {
                const receivedMessage = await getMessage(message.userInput);
                setMessage(receivedMessage);
                return receivedMessage;
            },
            path: "end_loop"
        }
    };
    return (
        <ChatBot  settings={settings} flow={flow}/>
    );
}

async function getMessage(message) {
    try {
        const response = await axios.post(apiEndpoint+'/ask', {
            question: message,
            apiKey: process.env.REACT_APP_LLM_API_KEY
        });
        return response.data.answer;
    } catch (error) {
        console.error("Error fetching message:", error);
        return "Error fetching message";
    }
}

async function configure(message) {
    try {
        await axios.post(apiEndpoint+'/configureAssistant', {
            moderation: message,
        });
    } catch (error) {
        console.error("Error fetching message:", error);
        return "Error fetching message";
    }
}
