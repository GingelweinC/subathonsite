const express = require('express');
const app = express();

// Middleware to parse JSON bodiess
app.use(express.raw({ type: 'application/json' }));
app.use(express.json());

const eventsub = require('./eventsub');

app.post('/api/eventsub', eventsub);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});