const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express()
const port = 3000
require('dotenv').config();

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json()); 
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// MongoDB connection
const dblink = process.env.DATABASE_LINK
mongoose.connect(dblink, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Import user and technician models
const User = require('./model/user');
const Technician = require('./model/technician');

// Route to render index.ejs
app.get('/', (req, res) => {
  res.render('index');
});

// Serve login and registration pages
app.get('/user-login', (req, res) => {
  res.render('user-login');
});

app.get('/technician-login', (req, res) => {
  res.render('technician-login');
});

app.get('/user-register', (req, res) => {
  res.render('user-register');
});

app.get('/technician-register', (req, res) => {
  res.render('technician-register');
});

// Routes for user registration and login
app.post('/user-register', async (req, res) => {
  try {
    const { username, mobileNo, password } = req.body;
    const user = new User({ username, mobileNo, password });
    await user.save();
    // res.status(201).send('User registered successfully');
    res.redirect('/user-login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/user-login', async (req, res) => {
  try {
    const { mobileNo, password } = req.body;
    const user = await User.findOne({ mobileNo, password });
    if (user) {
      // Redirect to user dashboard upon successful login
      res.redirect('/user-dashboard');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Routes for technician registration and login
app.post('/technician-register', async (req, res) => {
  try {
    const { username, mobileNo, password } = req.body;
    const technician = new Technician({ username, mobileNo, password });
    await technician.save();
    // res.status(201).send('Technician registered successfully');
    res.redirect('/technician-login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/technician-login', async (req, res) => {
  try {
    const { mobileNo, password } = req.body;
    const technician = await Technician.findOne({ mobileNo, password });
    if (technician) {
      // Redirect to technician dashboard upon successful login
      res.redirect('/technician-dashboard');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to render user dashboard
app.get('/user-dashboard', (req, res) => {
  res.render('user-dashboard');
});

// Route to render technician dashboard
app.get('/technician-dashboard', (req, res) => {
  res.render('technician-dashboard');
});

//CHAT-BOT

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.post('/generate-story', async (req, res) => {
    const { prompt } = req.body;

    try {
        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        res.json({ story: text });
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({ error: 'Sorry , try again !' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})