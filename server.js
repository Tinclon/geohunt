import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'https://cnielsen.github.io', // GitHub Pages
  'https://tinclon.github.io' // GitHub Pages
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

// In-memory store for coordinates
const coordinatesStore = new Map();

// Store coordinates
app.post('/coordinates/:mode', (req, res) => {
  const { mode } = req.params;
  const coordinates = req.body;
  
  if (!coordinates || typeof coordinates.latitude !== 'number' || typeof coordinates.longitude !== 'number') {
    return res.status(400).json({ error: 'Invalid coordinates format' });
  }

  coordinatesStore.set(mode, coordinates);
  res.json({ success: true });
});

// Get coordinates
app.get('/coordinates/:mode', (req, res) => {
  const { mode } = req.params;
  const coordinates = coordinatesStore.get(mode);
  
  if (!coordinates) {
    return res.status(404).json({ error: 'Coordinates not found' });
  }

  // Return both coordinates and difficulty
  res.json({
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    difficulty: coordinates.difficulty
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 