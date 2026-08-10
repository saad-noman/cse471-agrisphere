const {
calculateFinancialAnalysis,
} = require('../services/financialAnalysisService');

// GET /api/financial-analysis
const getFinancialAnalysis = async (req, res) => {
try {
const analysis = await calculateFinancialAnalysis(
req.user.id
);

res.json(analysis);

} catch (err) {
console.error('Financial analysis error:', err);

res.status(500).json({
  message: 'Failed to generate financial analysis',
  error: err.message,
});

}
};

module.exports = {
getFinancialAnalysis,
};

