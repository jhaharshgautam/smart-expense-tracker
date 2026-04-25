const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const insightsRoutes = require('./routes/insights');
const mlRoutes = require('./routes/ml');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/ml', mlRoutes);

app.get('/api/categories', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories');
  res.json(result.rows);
});

app.get('/', (req, res) => res.json({ message: 'Server is running!' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
