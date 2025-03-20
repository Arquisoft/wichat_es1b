const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 8005;

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/save-session', async (req, res) => {
  const {userid, score, wrongAnswers } = req.body;
  
  try {
    const user = await User.findOne({username: userid});
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

app.get('/get-sessions/:username', async (req, res) => {
    const { username } = req.params;
    try {
      const user = await User.findOne({username:username});
      if (user) {
        res.json(user.sessions);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error getting sessions' });
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