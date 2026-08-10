const express = require('express');

const router = express.Router();

const {
  createExpense,
  getMyExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getCropFinancialAnalysis,
} = require('../controllers/expenseController');

const { protect } = require('../middleware/authMiddleware');


// ==========================================================
// EXPENSES
// ==========================================================

// Create expense
router.post('/', protect, createExpense);

// Get logged-in farmer's expenses
router.get('/', protect, getMyExpenses);

// IMPORTANT:
// Put analysis before /:id so "analysis" is not interpreted
// as an expense ID.
router.get(
  '/analysis/:cropId',
  protect,
  getCropFinancialAnalysis
);

// Get one expense
router.get('/:id', protect, getExpense);

// Update expense
router.put('/:id', protect, updateExpense);

// Delete expense
router.delete('/:id', protect, deleteExpense);


module.exports = router;
