const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const expenses = await pool.query(
      `SELECT e.*, c.name as category_name, c.icon, c.color
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.date DESC`,
      [req.userId]
    );
    res.json(expenses.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { amount, category_id, description, date } = req.body;
  try {
    const expense = await pool.query(
      `INSERT INTO expenses (user_id, category_id, amount, description, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, category_id, amount, description, date]
    );
    res.status(201).json(expense.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { amount, category_id, description, date } = req.body;
  try {
    const expense = await pool.query(
      `UPDATE expenses SET amount=$1, category_id=$2, description=$3, date=$4
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [amount, category_id, description, date, req.params.id, req.userId]
    );
    res.json(expense.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM expenses WHERE id=$1 AND user_id=$2',
      [req.params.id, req.userId]
    );
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const categoriesRouter = require('express').Router();
categoriesRouter.get('/', async (req, res) => {
  const result = await require('../db').query('SELECT * FROM categories');
  res.json(result.rows);
});
module.exports.categoriesRouter = categoriesRouter;
