// user-service.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user-model')

const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);



// Function to validate required fields in the request body
async function validateRequiredFields(req, requiredFields) {

    for (const field of requiredFields) {
        if (!(field in req.body)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    const user = req.body.username;
    if (!user || typeof user !== 'string') {
        throw new Error('Invalid username format');
    }

    const userTrim = user.trim();

    if (userTrim.length === 0 || userTrim.length > 50) {
        throw new Error('Invalid username');
    }

    const validUsernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!validUsernameRegex.test(userTrim)) {
        throw new Error('Invalid username format');
    }

    const existingUser = await User.findOne({ username: userTrim });
    if (existingUser) {
        throw new Error('Username already exists');
    }
}

app.post('/adduser', async (req, res) => {
    try {
        // Check if required fields are present in the request body
        await validateRequiredFields(req, ['username', 'password']);

        // Encrypt the password before saving it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
        });

        await newUser.save();
        res.json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }});

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server