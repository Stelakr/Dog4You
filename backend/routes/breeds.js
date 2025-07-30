const express = require('express');
const router = express.Router();
const Breed = require('../models/Breed');


const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'name', ...filters } = req.query;

    const query = {};

    // 1. ✅ Numeric trait filters (e.g., energyLevel=4)
    const numericTraits = [
      'energyLevel', 'trainability', 'droolingLevel', 'opennessToStrangers',
      'protectiveNature', 'playfulnessLevel', 'adaptabilityLevel',
      'affectionateWithFamily', 'goodWithYoungChildren', 'goodWithOtherDogs'
    ];

    numericTraits.forEach(trait => {
      const val = safeNumber(filters[trait]);
      if (val !== undefined) {
        query[trait] = val;
      }
    });

    // 2. ✅ Range fields (e.g., weight.min=10&weight.max=25)
    const rangeFields = ['weight', 'height', 'lifeExpectancy'];
    rangeFields.forEach(field => {
      const min = safeNumber(filters[`${field}.min`]);
      const max = safeNumber(filters[`${field}.max`]);

      if (min !== undefined || max !== undefined) {
        query[`${field}.min`] = undefined; // cleanup fallback
        query[`${field}.max`] = undefined;

        query[field] = {};
        if (min !== undefined) query[field].min = { $gte: min };
        if (max !== undefined) query[field].max = { $lte: max };
      }
    });

    // 3. ✅ Enum & array fields
    if (filters.livingEnvironment) {
      query.livingEnvironment = filters.livingEnvironment;
    }

    if (filters.coatType) {
      query.coatType = filters.coatType;
    }

    if (filters.coatLength) {
      query.coatLength = filters.coatLength;
    }

    // 4. ✅ Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 5. ✅ Sorting
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    // 6. ✅ Query MongoDB
    const breeds = await Breed.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Breed.countDocuments(query);

    // 7. ✅ Final response
    res.json({
      success: true,
      count: breeds.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: breeds
    });

  } catch (error) {
    console.error('❌ Error filtering breeds:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while filtering breeds.'
    });
  }
});

module.exports = router;
