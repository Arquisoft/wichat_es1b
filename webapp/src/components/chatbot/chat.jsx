
import React, { useState } from "react";
import ChatBot from "react-chatbotify";
import settings from "./chatSettings"
import axios from 'axios';


const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';


export default function Chat(props) {

    const correctAnswer = props.correctAnswer;
    const question = props.question;

    configure("Eres un chatbot que debe dar pistas no muy largas al usuario sobre la pregunta " + question + ", y su respuesta correcta es " + correctAnswer + ". Debes contestar siempre en Español perfecto, y dar pistas CORTAS al usuario. " +
        "Es extremadamente importante que bajo ningún concepto des al usuario la respuesta correcta en tu pista. Jamás debes escribir la respuesta correcta en la pista. Nunca puedes decir '" + correctAnswer + "'. " +
        "No pongas contexto como 'aquí va la pista', o 'te voy a decir una pista', debes dar la pista directamente.");

    const themes = [
        {id: "robotic", version: "0.1.0"}
    ]

    const [message, setMessage] = useState("¡Bienvenido! Soy Doraemon, el gato robot, y estoy aquí para ayudarte a descubrir qué representa la imagen que ves 🥳");

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
        const response = await axios.post(apiEndpoint+'/askllm', {
            question: message,
            apiKey: process.env.REACT_APP_LLM_API_KEY
        });
        return response.data.answer;
    } catch (error) {
        return "Error fetching message";
    }
}

async function configure(message) {
    try {
        await axios.post(apiEndpoint+'/configureAssistant', {
            moderation: message,
        });
    } catch (error) {
        return "Error fetching message";
    }
}
