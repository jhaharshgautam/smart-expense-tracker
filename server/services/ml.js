const axios = require('axios');
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const predictNextMonth = async (userId) => {
  try {
    const res = await axios.get(`${ML_URL}/predict/${userId}`);
    return res.data;
  } catch (err) {
    return null;
  }
};

const categorizeExpense = async (text) => {
  try {
    const res = await axios.post(`${ML_URL}/categorize/`, { text });
    return res.data;
  } catch (err) {
    return { category: 'Others', confidence: 0 };
  }
};

module.exports = { predictNextMonth, categorizeExpense };
