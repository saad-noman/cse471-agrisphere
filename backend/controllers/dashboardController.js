const Crop = require('../models/Crop');
const ProductionRecord = require('../models/ProductionRecord');
const FertilizerRecord = require('../models/FertilizerRecord');
const PesticideRecord = require('../models/PesticideRecord');
const Expense = require('../models/Expense');
const DiseaseCase = require('../models/DiseaseCase');
const Tag = require('../models/Tag');


// GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // ---------------------------------------------------------
    // 1. GET FARMER'S CROPS
    // ---------------------------------------------------------

    const crops = await Crop.find({
      farmer: farmerId,
    }).sort({
      plantingDate: -1,
    });

    const cropIds = crops.map((crop) => crop._id);


    // ---------------------------------------------------------
    // 2. CROP HEALTH
    // ---------------------------------------------------------

    const diseaseCases = await DiseaseCase.find({
      farmer: farmerId,
    })
      .populate('symptoms', 'name type')
      .populate('farmingConditions', 'name type')
      .sort({ createdAt: -1 });


    const diseaseStatus = {
      total: diseaseCases.length,
      pending: diseaseCases.filter(
        (item) => item.status === 'pending'
      ).length,
      resolved: diseaseCases.filter(
        (item) => item.status === 'resolved'
      ).length,
      active: diseaseCases.filter(
        (item) => item.status !== 'resolved'
      ).length,
    };


    // ---------------------------------------------------------
    // 3. FARMING ANALYTICS
    // ---------------------------------------------------------

    const [
      productionRecords,
      fertilizerRecords,
      pesticideRecords,
      expenseRecords,
    ] = await Promise.all([
      ProductionRecord.find({
        crop: { $in: cropIds },
      }),

      FertilizerRecord.find({
        crop: { $in: cropIds },
      }).populate('fertilizer', 'name category'),

      PesticideRecord.find({
        crop: { $in: cropIds },
      }).populate('pesticide', 'name category'),

      Expense.find({
        farmer: farmerId,
      }),
    ]);


    // ---------------------------------------------------------
    // 4. BUILD ANALYTICS PER CROP
    // ---------------------------------------------------------

    const cropAnalytics = crops.map((crop) => {
      const cropId = crop._id.toString();

      const cropProduction = productionRecords.filter(
        (record) => record.crop.toString() === cropId
      );

      const cropFertilizers = fertilizerRecords.filter(
        (record) => record.crop.toString() === cropId
      );

      const cropPesticides = pesticideRecords.filter(
        (record) => record.crop.toString() === cropId
      );

      const cropExpenses = expenseRecords.filter(
        (expense) =>
          expense.crop &&
          expense.crop.toString() === cropId
      );


      const totalProduction = cropProduction.reduce(
        (sum, record) => sum + (record.quantity || 0),
        0
      );

      const totalFertilizer = cropFertilizers.reduce(
        (sum, record) => sum + (record.amount || 0),
        0
      );

      const totalPesticide = cropPesticides.reduce(
        (sum, record) => sum + (record.amount || 0),
        0
      );

      const totalExpenses = cropExpenses.reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0
      );


      // -------------------------------------------------------
      // FARMING CYCLE
      // plantingDate -> expectedHarvestDate
      // -------------------------------------------------------

      let cycleDays = null;

      if (crop.plantingDate && crop.expectedHarvestDate) {
        const start = new Date(crop.plantingDate);
        const end = new Date(crop.expectedHarvestDate);

        cycleDays = Math.max(
          0,
          Math.ceil(
            (end - start) / (1000 * 60 * 60 * 24)
          )
        );
      }


      // -------------------------------------------------------
      // YIELD PER ACRE
      // -------------------------------------------------------

      let yieldPerAcre = null;

      if (crop.area && crop.area > 0) {
        yieldPerAcre = totalProduction / crop.area;
      }


      return {
        crop: {
          id: crop._id,
          name: crop.name,
          cropType: crop.cropType,
          variety: crop.variety,
          area: crop.area,
          areaUnit: crop.areaUnit,
          status: crop.status,
        },

        farmingCycle: {
          plantingDate: crop.plantingDate,
          expectedHarvestDate: crop.expectedHarvestDate,
          cycleDays,
        },

        production: {
          totalQuantity: totalProduction,
          unit: cropProduction[0]?.unit || 'kg',
          recordCount: cropProduction.length,
          yieldPerAcre,
        },

        fertilizer: {
          totalAmount: totalFertilizer,
          unit: cropFertilizers[0]?.unit || 'kg',
          applicationCount: cropFertilizers.length,
        },

        pesticide: {
          totalAmount: totalPesticide,
          unit: cropPesticides[0]?.unit || 'L',
          applicationCount: cropPesticides.length,
        },

        expenses: {
          total: totalExpenses,
          recordCount: cropExpenses.length,
        },
      };
    });


    // ---------------------------------------------------------
    // 5. FARM-WIDE TOTALS
    // ---------------------------------------------------------

    const totalProduction = productionRecords.reduce(
      (sum, record) => sum + (record.quantity || 0),
      0
    );

    const totalFertilizer = fertilizerRecords.reduce(
      (sum, record) => sum + (record.amount || 0),
      0
    );

    const totalPesticide = pesticideRecords.reduce(
      (sum, record) => sum + (record.amount || 0),
      0
    );

    const totalExpenses = expenseRecords.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );


    // ---------------------------------------------------------
    // 6. RECENT DIAGNOSIS UPDATES
    // ---------------------------------------------------------

    const recentDiagnosisUpdates = diseaseCases
      .slice(0, 10)
      .map((diseaseCase) => ({
        id: diseaseCase._id,

        crop: {
          type: diseaseCase.crop?.type,
          variety: diseaseCase.crop?.variety,
          growthStage: diseaseCase.crop?.growthStage,
          age: diseaseCase.crop?.age,
        },

        symptoms: (diseaseCase.symptoms || []).map(
          (symptom) => ({
            id: symptom._id,
            name: symptom.name,
          })
        ),

        status: diseaseCase.status,

        description: diseaseCase.description,

        createdAt: diseaseCase.createdAt,
        updatedAt: diseaseCase.updatedAt,
      }));


    // ---------------------------------------------------------
    // 7. RECOMMENDATION SUMMARY
    // ---------------------------------------------------------
    //
    // TODO:
    // Replace this static data with real Recommendation model
    // aggregation when recommendation functionality is ready.
    //

    const recommendationSummary = {
      total: 3,

      pending: 1,

      completed: 2,

      recent: [
        {
          title: 'Monitor crop health',
          description:
            'Continue monitoring the crop for visible symptoms.',
          status: 'active',
        },

        {
          title: 'Fertilizer application',
          description:
            'Review fertilizer application schedule.',
          status: 'completed',
        },

        {
          title: 'Pest monitoring',
          description:
            'Monitor the field for signs of pest activity.',
          status: 'completed',
        },
      ],
    };


    // ---------------------------------------------------------
    // 8. CONSULTATION SUMMARY
    // ---------------------------------------------------------
    //
    // TODO:
    // Replace this static data with real consultation/
    // appointment aggregation when consultation dashboard
    // functionality is implemented.
    //

    const consultationSummary = {
      total: 2,

      pending: 1,

      completed: 1,

      recent: [
        {
          topic: 'Crop health consultation',
          status: 'completed',
          date: '2026-08-10',
        },

        {
          topic: 'Pest management consultation',
          status: 'pending',
          date: '2026-08-15',
        },
      ],
    };


    // ---------------------------------------------------------
    // 9. RESPONSE
    // ---------------------------------------------------------

    res.json({
      farmer: farmerId,

      cropHealth: {
        cropCount: crops.length,

        activeCrops: crops.filter(
          (crop) => crop.status === 'active'
        ).length,

        diseaseCases: diseaseStatus,

        recentDiagnosisUpdates,
      },

      farmingAnalytics: {
        totals: {
          production: totalProduction,
          productionUnit:
            productionRecords[0]?.unit || 'kg',

          fertilizer: totalFertilizer,
          fertilizerUnit:
            fertilizerRecords[0]?.unit || 'kg',

          pesticide: totalPesticide,
          pesticideUnit:
            pesticideRecords[0]?.unit || 'L',

          expenses: totalExpenses,
        },

        crops: cropAnalytics,
      },

      recommendationSummary,

      consultationSummary,

      generatedAt: new Date(),
    });

  } catch (err) {
    console.error('Dashboard error:', err);

    res.status(500).json({
      message: 'Failed to load dashboard',
      error: err.message,
    });
  }
};


module.exports = {
  getDashboard,
};
