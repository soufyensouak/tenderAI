require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*' }));
app.use(express.json());

// Import des routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/aos', require('./routes/aos'));
app.use('/api/claude', require('./routes/claude'));
app.use('/api/pipeline', require('./routes/pipeline'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/notifications', require('./routes/notifications'));

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend TenderAI démarré sur le port ${PORT}`);
});