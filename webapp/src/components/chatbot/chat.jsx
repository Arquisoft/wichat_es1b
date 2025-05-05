
import React, { useState, useEffect } from "react";
import ChatBot from "react-chatbotify";
import settings from "./chatSettings"
import axios from 'axios';


const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

let pro=null;


export default function Chat(props) {

    const correctAnswer = props.correctAnswer;
    const question = props.question;
    const username = props.username;
    pro = props;

    const themes = [
        {id: "robotic", version: "0.1.0"}
    ]

    useEffect(() => {
        configure("The question is '" + question + "', and the correct answer is '" + correctAnswer + "'. Remember you can not say the correct answer, you have to help the user giving a hint in Spanish without grammatical faults." +
            " Be a helpful assistant, giving short hints, not long messages, and only one hint each time. Remember to never say '" + correctAnswer + "' explicitly.");
    }, [question, correctAnswer]);

    const [message, setMessage] = useState("¡Bienvenido! Soy Doraemon, el gato robot, y estoy aquí para ayudarte a descubrir qué representa la imagen que ves 🍀");

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
            moderation: "The question is '" + pro.question + "', and the correct answer is '" + pro.correctAnswer + "'. Remember you can not say the correct answer, you have to help the user giving a hint in Spanish without grammatical faults." +
                " Be a helpful assistant, giving short hints, not long messages, and only one hint each time. Remember to never say '" + pro.correctAnswer + "' explicitly.",
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
