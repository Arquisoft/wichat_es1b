const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoserver;
let userservice;
let authservice;
let llmservice;
let gatewayservice;
let sessionservice;
let questionservice;

async function startServer() {
    console.log('Starting MongoDB memory server...');
    mongoserver = await MongoMemoryServer.create({instance:{
        port: 27017
        }});
    const mongoUri = mongoserver.getUri();
    console.log(mongoUri);
    process.env.MONGODB_URI = mongoUri;
    process.env.REACT_APP_API_ENDPOINT = "http://localhost:8000";
    userservice = await require("../../users/userservice/user-service");
    authservice = await require("../../users/authservice/auth-service");
    sessionservice = await require("../../users/sesionservice/sesionService");
    questionservice = await require("../../questionservice/question-service");
    llmservice = await require("../../llmservice/llm-service");
    gatewayservice = await require("../../gatewayservice/gateway-service");
}

startServer();
