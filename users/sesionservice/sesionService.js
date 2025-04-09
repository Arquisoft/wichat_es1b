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
  TotalWrongAnswers: Number,
  TotalWellAnswers: Number,
  AccuracyRate: Number,
  sessions: [
    {      
      questions: [
        {
          question: String,
          correctAnswer: String,
          userAnswer: String,          
        }],
      score: Number,
      wrongAnswers: Number,
      difficulty: String,
      category: String,
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
  const { userid, score, wrongAnswers, questions, difficulty, category } = req.body; // Agregar 'questions'

  // Sanitize userid input
  if (!userid || typeof userid !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  // Trim whitespace and limit length
  let useridTrim = userid.trim();
  if (useridTrim.length === 0 || useridTrim.length > 50) {
    return res.status(400).json({ error: 'User ID must be between 1 and 50 characters' });
  }

  // Only allow alphanumeric characters and some common symbols
  const validUsernameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!validUsernameRegex.test(userid)) {
    return res.status(400).json({ error: 'User ID contains invalid characters' });
  }

    try {
      const user = await User.findOne({ username: userid });
  
      if (user) {
        // Actualizar los totales
        user.TotalWrongAnswers = (user.TotalWrongAnswers || 0) + wrongAnswers;
        user.TotalWellAnswers = (user.TotalWellAnswers || 0) + score;
  
        // Recalcular AccuracyRate
        const totalAnswers = user.TotalWrongAnswers + user.TotalWellAnswers;
        user.AccuracyRate = totalAnswers > 0 ? (user.TotalWellAnswers / totalAnswers) * 100 : 0;
  
        // Agregar la nueva sesión
        user.sessions.push({ 
          score, 
          wrongAnswers, 
          questions,
          difficulty,
          category
        });
  
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