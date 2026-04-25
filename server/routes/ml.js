const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { predictNextMonth, categorizeExpense } = require('../services/ml');

router.get('/predict', auth, async (req, res) => {
  const result = await predictNextMonth(req.userId);
  res.json(result || { predicted: null, message: 'ML service unavailable' });
});

router.post('/categorize', auth, async (req, res) => {
  const result = await categorizeExpense(req.body.text);
  res.json(result);
});

module.exports = router;
