import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
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

  res.json(coordinates);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 