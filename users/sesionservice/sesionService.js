const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 8005;

app.use(cors({
  origin: 'http://localhost:3000', // Permite solo este frontend
  methods: ['GET', 'POST'], // Métodos permitidos
  allowedHeaders: ['Content-Type'], // Cabeceras permitidas
}));

app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  createdAt: Date,
  sessions: [
    {      
      score: Number,
      wrongAnswers: Number,
      createdAt: {
        type: Date,
        default: Date.now, 
      }, 
    },
  ],
});

const User = mongoose.model('User', userSchema);

app.post('/api/save-session', async (req, res) => {
  const { userId, score, wrongAnswers } = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      user.sessions.push({score, wrongAnswers });
      await user.save();
      res.status(200).json({ message: 'Session saved successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error saving session' });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Session Service listening at http://localhost:${port}`);
});

server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server