const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    const thisYear = now.getFullYear();
    const lastYear = thisMonth === 1 ? thisYear - 1 : thisYear;

    const thisQ = await pool.query(
      `SELECT c.name as category, SUM(e.amount) as total
       FROM expenses e JOIN categories c ON e.category_id = c.id
       WHERE e.user_id=$1 AND EXTRACT(MONTH FROM e.date)=$2 AND EXTRACT(YEAR FROM e.date)=$3
       GROUP BY c.name`, [userId, thisMonth, thisYear]
    );

    const lastQ = await pool.query(
      `SELECT c.name as category, SUM(e.amount) as total
       FROM expenses e JOIN categories c ON e.category_id = c.id
       WHERE e.user_id=$1 AND EXTRACT(MONTH FROM e.date)=$2 AND EXTRACT(YEAR FROM e.date)=$3
       GROUP BY c.name`, [userId, lastMonth, lastYear]
    );

    const dailyQ = await pool.query(
      `SELECT DATE(date) as day, SUM(amount) as total
       FROM expenses WHERE user_id=$1 AND date >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(date) ORDER BY day`, [userId]
    );

    const topQ = await pool.query(
      `SELECT c.name as category, SUM(e.amount) as total
       FROM expenses e JOIN categories c ON e.category_id = c.id
       WHERE e.user_id=$1 GROUP BY c.name ORDER BY total DESC LIMIT 1`, [userId]
    );

    const totalQ = await pool.query(
      `SELECT SUM(amount) as total FROM expenses WHERE user_id=$1`, [userId]
    );

    const thisMap = {};
    thisQ.rows.forEach(r => thisMap[r.category] = parseFloat(r.total));
    const lastMap = {};
    lastQ.rows.forEach(r => lastMap[r.category] = parseFloat(r.total));

    const insights = [];

    // Compare this month vs last month per category
    Object.entries(thisMap).forEach(([cat, thisAmt]) => {
      const lastAmt = lastMap[cat] || 0;
      if (lastAmt > 0) {
        const pct = Math.round(((thisAmt - lastAmt) / lastAmt) * 100);
        if (pct > 20) insights.push({ type: 'warning', icon: '📈', text: `Your ${cat} spending increased by ${pct}% this month` });
        else if (pct < -15) insights.push({ type: 'success', icon: '📉', text: `Great! Your ${cat} spending dropped by ${Math.abs(pct)}% this month` });
      }
    });

    // Daily average
    if (dailyQ.rows.length > 0) {
      const dailyAvg = dailyQ.rows.reduce((s,r) => s + parseFloat(r.total), 0) / dailyQ.rows.length;
      insights.push({ type: 'info', icon: '📊', text: `Your daily average spend is ₹${Math.round(dailyAvg)} over the last 30 days` });
    }

    // Top category
    if (topQ.rows.length > 0) {
      const topTotal = parseFloat(totalQ.rows[0]?.total || 0);
      const topCatTotal = parseFloat(topQ.rows[0].total);
      const pct = Math.round((topCatTotal / topTotal) * 100);
      insights.push({ type: 'info', icon: '🏆', text: `${topQ.rows[0].category} is your biggest expense — ${pct}% of total spending` });
    }

    // Weekend vs weekday
    const weekendQ = await pool.query(
      `SELECT SUM(amount) as total FROM expenses WHERE user_id=$1 AND EXTRACT(DOW FROM date) IN (0,6)`, [userId]
    );
    const weekdayQ = await pool.query(
      `SELECT SUM(amount) as total FROM expenses WHERE user_id=$1 AND EXTRACT(DOW FROM date) NOT IN (0,6)`, [userId]
    );
    const wknd = parseFloat(weekendQ.rows[0]?.total || 0);
    const wkdy = parseFloat(weekdayQ.rows[0]?.total || 0);
    if (wknd > wkdy * 0.4) insights.push({ type: 'warning', icon: '🎉', text: `You spend more on weekends — ₹${Math.round(wknd)} vs ₹${Math.round(wkdy)} on weekdays` });

    if (insights.length === 0) insights.push({ type: 'info', icon: '💡', text: 'Add more expenses to unlock personalized insights!' });

    res.json({ insights, dailyData: dailyQ.rows });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
