const Expense = require('../models/Expense');
const Crop = require('../models/Crop');
const ProductionRecord = require('../models/ProductionRecord');


// ==========================================================
// CREATE EXPENSE
// POST /api/expenses
// ==========================================================

const createExpense = async (req, res) => {
  try {
    const { cropId, category, amount, date } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({
        message: 'Category and amount are required',
      });
    }

    if (amount < 0) {
      return res.status(400).json({
        message: 'Amount cannot be negative',
      });
    }

    // If a crop is supplied, make sure it exists
    // and belongs to the logged-in farmer.
    if (cropId) {
      const crop = await Crop.findById(cropId);

      if (!crop) {
        return res.status(404).json({
          message: 'Crop not found',
        });
      }

      if (
        req.user.role === 'farmer' &&
        crop.farmer.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: 'Not authorized to add expense to this crop',
        });
      }
    }

    const expense = await Expense.create({
      farmer: req.user.id,
      crop: cropId || null,
      category,
      amount,
      date: date || new Date(),
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================================
// GET MY EXPENSES
// GET /api/expenses
// ==========================================================

const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      farmer: req.user.id,
    })
      .populate('crop', 'name cropType variety')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================================
// GET EXPENSE BY ID
// GET /api/expenses/:id
// ==========================================================

const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('crop', 'name cropType variety');

    if (!expense) {
      return res.status(404).json({
        message: 'Expense not found',
      });
    }

    if (
      req.user.role === 'farmer' &&
      expense.farmer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    res.json(expense);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================================
// UPDATE EXPENSE
// PUT /api/expenses/:id
// ==========================================================

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: 'Expense not found',
      });
    }

    if (
      req.user.role === 'farmer' &&
      expense.farmer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    const { cropId, category, amount, date } = req.body;

    if (cropId !== undefined) {
      const crop = await Crop.findById(cropId);

      if (!crop) {
        return res.status(404).json({
          message: 'Crop not found',
        });
      }

      if (
        req.user.role === 'farmer' &&
        crop.farmer.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: 'Not authorized for this crop',
        });
      }

      expense.crop = cropId;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (amount !== undefined) {
      if (amount < 0) {
        return res.status(400).json({
          message: 'Amount cannot be negative',
        });
      }

      expense.amount = amount;
    }

    if (date !== undefined) {
      expense.date = date;
    }

    await expense.save();

    res.json(expense);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ==========================================================

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: 'Expense not found',
      });
    }

    if (
      req.user.role === 'farmer' &&
      expense.farmer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    await expense.deleteOne();

    res.json({
      message: 'Expense deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ==========================================================
// CROP FINANCIAL ANALYSIS
// GET /api/expenses/analysis/:cropId
// ==========================================================

const getCropFinancialAnalysis = async (req, res) => {
  try {
    const { cropId } = req.params;

    // ------------------------------------------------------
    // 1. Find crop
    // ------------------------------------------------------

    const crop = await Crop.findById(cropId);

    if (!crop) {
      return res.status(404).json({
        message: 'Crop not found',
      });
    }

    // ------------------------------------------------------
    // 2. Check ownership
    // ------------------------------------------------------

    if (
      req.user.role === 'farmer' &&
      crop.farmer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'Not authorized',
      });
    }

    // ------------------------------------------------------
    // 3. Get production records
    // ------------------------------------------------------

    const productionRecords = await ProductionRecord.find({
      crop: crop._id,
    });

    const totalProduction = productionRecords.reduce(
      (total, record) => total + Number(record.quantity || 0),
      0
    );

    // ------------------------------------------------------
    // 4. Get crop expenses
    // ------------------------------------------------------

    const expenses = await Expense.find({
      farmer: crop.farmer,
      crop: crop._id,
    }).sort({
      date: -1,
    });

    const totalCost = expenses.reduce(
      (total, expense) => total + Number(expense.amount || 0),
      0
    );

    // ------------------------------------------------------
    // 5. Cost summary by category
    // ------------------------------------------------------

    const byCategory = {};

    expenses.forEach((expense) => {
      const category = expense.category || 'Other';

      if (!byCategory[category]) {
        byCategory[category] = 0;
      }

      byCategory[category] += Number(expense.amount || 0);
    });

    // ------------------------------------------------------
    // 6. Return analysis
    //
    // Revenue will be calculated separately using the
    // external commodity price API.
    // ------------------------------------------------------

    res.json({
      crop: {
        id: crop._id,
        name: crop.name,
        cropType: crop.cropType,
        variety: crop.variety,
        season: crop.season,
        area: crop.area,
        areaUnit: crop.areaUnit,
        status: crop.status,
      },

      production: {
        totalQuantity: totalProduction,
        unit: productionRecords[0]?.unit || 'kg',
        recordCount: productionRecords.length,
      },

      costs: {
        total: totalCost,
        currency: 'USD',
        byCategory,
        expenseCount: expenses.length,
      },

      financial: {
        revenue: null,
        totalCost,
        profit: null,
        profitMargin: null,
        currency: 'USD',
      },

      note:
        'Revenue and profit require a supported external market-price symbol for this crop.',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


module.exports = {
  createExpense,
  getMyExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getCropFinancialAnalysis,
};
