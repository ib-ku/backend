// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema with Role
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  creationDate: { type: Date, default: Date.now },
  role: { type: String, default: 'user' }  // 'user' or 'admin'
});

const User = mongoose.model('User', userSchema);

// Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Middleware to Check Authentication
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login.html');
};

// Middleware to Check Admin Role
// Middleware to Check Admin Role
const isAdmin = (req, res, next) => {
    console.log('Session User:', req.session.user);  // Debugging line
    if (req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    res.status(403).send('Access Denied: Admins Only');
  };
  
// Registration Route
// Registration Route
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const existingUser = await User.findOne({ username });
  
    if (existingUser) {
      return res.send('Username already taken. Please choose another one.');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      password: hashedPassword, 
      role: role || 'user'  // Default to 'user' if no role is provided
    });
    await newUser.save();
  
    // Don't store the user in the session
    // req.session.user = newUser;
  
    // Redirect to login page after registration
    res.redirect('/login.html?success=Registration successful. Please log in.');
  });
  

// Login Route
// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
  
    if (user && await bcrypt.compare(password, user.password)) {
      // Store only relevant info in the session
      req.session.user = {
        _id: user._id,
        username: user.username,
        role: user.role
      };
      res.redirect('/main.html');
    } else {
      res.redirect('/login.html?error=Invalid credentials');
    }
  });
  

// Protect main.html
app.get('/main.html', isAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/public/main.html');
});

// Index Route (Only Logged-In Users)
app.get('/index', (req, res) => {
  if (req.session.user) {
    res.sendFile(__dirname + '/public/index.html');
  } else {
    res.redirect('/login.html');
  }
});

// Root Route - Redirect to Login Page
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Admin Route (Only Admins Can Access)
app.get('/admin', isAdmin, (req, res) => {
    res.sendFile(__dirname + '/public/admin.html');
  });
  
  app.get('/api/users', isAdmin, async (req, res) => {
    const users = await User.find({}, 'username role creationDate');
    res.json(users);
  });
  // Get User by ID
    app.get('/api/users/:id', isAdmin, async (req, res) => {
        try {
        const user = await User.findById(req.params.id, 'username role creationDate');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
        } catch (err) {
        res.status(500).json({ message: 'Server error' });
        }
    });
  
  app.delete('/api/users/:id', isAdmin, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  });
  
  app.put('/api/users/:id', isAdmin, async (req, res) => {
    const { role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: 'User role updated' });
  });
  

        
// Additional Routes for Links in main.html
app.get('/qr', (req, res) => {
  res.send('<h2>Home Page</h2><p>This is the Home page.</p>');
});

app.get('/mail', (req, res) => {
  res.send('<h2>Profile Page</h2><p>This is your Profile page.</p>');
});

app.get('/bmi', (req, res) => {
  res.send('<h2>Settings Page</h2><p>This is the Settings page.</p>');
});

app.get('/api', (req, res) => {
  res.send('<h2>About Us</h2><p>Information about us.</p>');
});

app.get('/crud', (req, res) => {
  res.send('<h2>Contact Us</h2><p>Contact information.</p>');
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/login.html');
  });
});

// Start the Server
app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
