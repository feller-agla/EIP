require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js'); // Import Supabase client

const app = express();
const port = 4000;
const cors = require('cors');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware
app.use(cors());
app.use(express.json());



// Import and use authentication routes
const authRoutes = require('./routes/auth')(supabase); // Pass supabase client
app.use('/api/auth', authRoutes);

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all route to serve index.html for any unhandled routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(port, () => {
  console.log(`EIP backend listening at http://localhost:${port}`);
  console.log(`Supabase URL: ${supabaseUrl ? 'Configured' : 'NOT CONFIGURED'}`);
});
