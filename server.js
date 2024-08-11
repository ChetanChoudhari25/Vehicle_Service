const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express()
const port = 3000
require('dotenv').config();


// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, }
}));

function ensureAdmin(req, res, next) {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin-login');
  }
}



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
const Admin = require('./model/admin'); // Import the Admin model

// Configure multer to store files in the 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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
      // Save user information in session
      req.session.userId = user._id;
      req.session.username = user.username;
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
app.post('/technician-register', upload.fields([{ name: 'certifications' }, { name: 'governmentId' }]), async (req, res) => {
  try {
    const { username, mobileNo, password, businessName, garageAddress, experience } = req.body;
    const certifications = req.files['certifications'][0].filename;
    const governmentId = req.files['governmentId'][0].filename;

    const technician = new Technician({
      username,
      mobileNo,
      password,
      businessName,
      garageAddress,
      experience,
      certifications,
      governmentId
    });
    
    await technician.save();
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
      // Save technician information in session
      req.session.technicianId = technician._id;
      req.session.technicianUsername = technician.username;
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
  if (!req.session.userId) {
    return res.redirect('/user-login'); // Redirect to login if not authenticated
  }

  res.render('user-dashboard', { username: req.session.username });
});


// Route to render technician dashboard
app.get('/technician-dashboard', (req, res) => {
  if (!req.session.technicianId) {
    return res.redirect('/technician-login'); // Redirect to login if not authenticated
  }
  
  // Pass technician username to the view
  res.render('technician-dashboard', { username: req.session.technicianUsername });
});

// Route to render the registration page
app.get('/admin-register', (req, res) => {
  res.render('admin-register'); // Renders admin-register.ejs
});

app.post('/admin-register', async (req, res) => {
  try {
    const { username, password } = req.body;
    // You should hash the password before saving
    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).send('Admin registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Admin login logout
// Route to render the admin dashboard
app.get('/admin-dashboard', (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect('/admin-login'); // Redirect to login if not authenticated as admin
  }
  res.render('admin-dashboard'); // Render the admin dashboard view
});

app.get('/admin-login', (req, res) => {
  res.render('admin-login'); // Render the admin login page
});

app.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the admin by username
    const admin = await Admin.findOne({ username });

    // Check if admin exists and password matches
    if (admin && admin.password === password) { // Passwords should be hashed and compared securely
      req.session.isAdmin = true;
      res.redirect('/admin-dashboard');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/admin-dashboard', ensureAdmin, (req, res) => {
  res.render('admin-dashboard');
});

app.get('/admin-logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/admin-login');
  });
});


// Route to get all technicians
app.get('/admin/technicians', async (req, res) => {
  try {
      const technicians = await Technician.find({ approved: false }); // Assuming 'approved' field
      res.json(technicians);
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
});

// Route to approve a technician
app.post('/admin/technicians/:id/approve', async (req, res) => {
  try {
      await Technician.findByIdAndUpdate(req.params.id, { approved: true });
      res.sendStatus(200);
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
});

// Route to reject a technician
app.post('/admin/technicians/:id/reject', async (req, res) => {
  try {
      await Technician.findByIdAndDelete(req.params.id);
      res.sendStatus(200);
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
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