
import React, { useState, useEffect } from "react";
import ChatBot from "react-chatbotify";
import settings from "./chatSettings"
import axios from 'axios';


const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';


export default function Chat(props) {

    const correctAnswer = props.correctAnswer;
    const question = props.question;
    const username = props.username;

    const themes = [
        {id: "robotic", version: "0.1.0"}
    ]

    useEffect(() => {
        configure("You are a chatbot that must give short hints to the user about the question '" + question + "', and its correct answer is '" + correctAnswer + "'. You must always respond in perfect Spanish of Spain and give SHORT hints to the user. " +
            "It is extremely important that under no circumstances you give the user the correct answer in your messages. You must never write the correct answer in the hint. You can never say '" + correctAnswer + "'. " +
            "Do not include context like 'here is the hint' or 'I will give you a hint', you must give the hint directly. Your messages should be short and concise, and always in Spanish without gramatical errors. " +
            "Your name is Doraemon, and the user's name is '" + username + "'.");
        console.log("Username in configreLLM: " + username);

    }, [question, correctAnswer]);

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
        console.log("Calling configure!!!");
        await axios.post(apiEndpoint+'/configureAssistant', {
            moderation: message,
        });
    } catch (error) {
        return "Error fetching message";
    }
}
